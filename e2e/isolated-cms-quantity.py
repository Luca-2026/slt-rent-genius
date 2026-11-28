"""Real separate PostgreSQL connections; synthetic fixtures only.

Needs an already running isolated local PG instance. Never uses managed PG env.
Run with python3 e2e/isolated-cms-quantity.py --socket /tmp/... --port 55432.
The local schema and target SQL must have been applied by the test setup.
"""
import argparse
import concurrent.futures
import json
import threading
from pathlib import Path
import psycopg2

parser = argparse.ArgumentParser()
parser.add_argument('--socket', required=True)
parser.add_argument('--port', type=int, required=True)
args = parser.parse_args()
if not args.socket.startswith('/tmp/') or args.port != 55432:
    raise RuntimeError('Only the explicitly isolated local test instance is allowed')

P='22222222-0000-0000-0000-000000000001'
P2='22222222-0000-0000-0000-000000000002'
A='11111111-0000-0000-0000-000000000001'
B='11111111-0000-0000-0000-000000000002'
R='33333333-0000-0000-0000-000000000001'
results=[]
def connection():
    c=psycopg2.connect(host=args.socket,port=args.port,user='nobody',dbname='postgres')
    c.set_client_encoding('UTF8')
    return c
def execute(sql,params=None):
    with connection() as c:
        with c.cursor() as cur:
            cur.execute(sql,params)
            return cur.fetchall() if cur.description else []
def item(s='2026-12-04',e='2026-12-04',quantity=1,slug='baumaschinen-3500'):
    return dict(product_slug=slug,articles=quantity,rental_start=s,rental_end=e)
def inquiry(id=A,status='offer_sent',items=None,location='Bonn'):
    execute('INSERT INTO rental_inquiries(id,status,location,start_date,end_date,start_time,end_time,offer_payload) VALUES(%s,%s,%s,%s,%s,%s,%s,%s)',(id,status,location,'2026-12-04','2026-12-04','08:30','16:30',json.dumps(dict(items=items if items is not None else [item()]))))
def reset():
    execute('TRUNCATE rental_inquiries,b2b_reservations,b2b_product_instances,b2b_instance_allocations,b2b_transport_orders,rental_inquiry_events,b2b_managed_products; UPDATE allowed SET ok=true')
    execute('INSERT INTO b2b_managed_products VALUES(%s,%s,%s,%s),(%s,%s,%s,%s)',(P,'baumaschinen-3500','3500 kg Baumaschinenanhänger','{"bonn":1,"krefeld":2,"muelheim":0}',P2,'second-tool','Second tool','{"bonn":1,"krefeld":2,"muelheim":0}'))
def rejection(fn,code='23514'):
    try:fn()
    except psycopg2.Error as error:
        assert error.pgcode==code,(error.pgcode,str(error))
        return
    raise AssertionError('Expected rejection, but transaction succeeded')
def case(name,fn):
    reset();fn();results.append(name);print('PASS',name)
def confirm_transaction(id,barrier=None,items=None):
    try:
        with connection() as c:
            with c.cursor() as cur:
                if barrier:barrier.wait(timeout=10)
                cur.execute("UPDATE rental_inquiries SET status='accepted' WHERE id=%s",(id,))
                cur.execute("SELECT confirm_order(%s,'{\"mode\":\"confirm\",\"items\":{}}')",(id,))
        return 'success'
    except psycopg2.Error as error:return error.pgcode
def race():
    inquiry(A);inquiry(B);barrier=threading.Barrier(2)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        futures=[pool.submit(confirm_transaction,id,barrier) for id in (A,B)]
        outcome=[f.result(timeout=20) for f in futures]
    assert sorted(outcome)==['23514','success'],outcome
    assert execute("SELECT count(*) FROM rental_inquiries WHERE order_confirmed_at IS NOT NULL")[0][0]==1
case('two independent connections, last Bonn article: exactly one accepted+confirmed',race)
def double():
    inquiry(items=[item(),item()]);assert confirm_transaction(A)=='23514'
    assert execute('SELECT status FROM rental_inquiries')[0][0]=='offer_sent'
case('duplicate current lines reject and roll back all changes',double)
def nonoverlap():
    inquiry(items=[item('2026-12-04','2026-12-04'),item('2026-12-05','2026-12-05')]);assert confirm_transaction(A)=='success'
case('separate days may use same article',nonoverlap)
def accepted_hold():
    inquiry(A,'accepted');inquiry(B);assert confirm_transaction(B)=='23514'
case('accepted without AB retains conservative hold',accepted_hold)
def pool():
    inquiry(A,location='Krefeld');inquiry(B,location='krefeld');assert confirm_transaction(A)=='success';assert confirm_transaction(B)=='success'
    assert execute("SELECT count(*) FROM rental_inquiries WHERE order_confirmed_at IS NOT NULL")[0][0]==2
case('same normalized Krefeld pool accepts exactly existing quantity two',pool)
def separate():
    inquiry(A,location='Bonn');inquiry(B,location='Krefeld');assert confirm_transaction(A)=='success';assert confirm_transaction(B)=='success'
case('Bonn and Krefeld remain independent physical pools',separate)
def muelheim():
    inquiry(location='Mülheim an der Ruhr');assert confirm_transaction(A)=='23514'
case('live slt_stock_location leaves Muelheim pool separate and stock zero',muelheim)
def reservation(link=None,status='pending',quantity=1):
    execute('INSERT INTO b2b_reservations(id,status,location,product_id,product_name,start_date,end_date,quantity,inquiry_id) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s)',(R,status,'Bonn','baumaschinen-3500','3500 kg Baumaschinenanhänger','2026-12-04','2026-12-04',quantity,link))
def hold():
    reservation();inquiry();assert confirm_transaction(A)=='23514'
case('B2B pending reservation blocks competing inquiry',hold)
def linked():
    inquiry();reservation(A);assert confirm_transaction(A)=='success'
    inquiry(B);assert confirm_transaction(B)=='23514'
case('linked B2B representation counts same booking once, other booking rejected',linked)
def release():
    reservation();execute("UPDATE b2b_reservations SET status='cancelled'");inquiry();assert confirm_transaction(A)=='success'
case('cancelled B2B hold releases capacity',release)
def cancel():
    inquiry(A);assert confirm_transaction(A)=='success';execute("UPDATE rental_inquiries SET status='cancelled' WHERE id=%s",(A,));inquiry(B);assert confirm_transaction(B)=='success'
case('cancelled inquiry releases capacity',cancel)
def done():
    inquiry(A);assert confirm_transaction(A)=='success';execute("UPDATE rental_inquiries SET status='done' WHERE id=%s",(A,));inquiry(B);assert confirm_transaction(B)=='23514'
case('done with AB still owns its contractual days',done)
def extension():
    inquiry(A,'accepted',items=[item('2026-12-03','2026-12-03')]);inquiry(B,'accepted')
    rejection(lambda:execute('UPDATE rental_inquiries SET offer_payload=%s WHERE id=%s',(json.dumps(dict(items=[item('2026-12-03','2026-12-04')])),A)))
    assert execute('SELECT offer_payload FROM rental_inquiries WHERE id=%s',(A,))[0][0]['items'][0]['rental_end']=='2026-12-03'
case('direct amendment/extension cannot bypass stock guard',extension)
def legacy():
    execute("ALTER TABLE rental_inquiries DISABLE TRIGGER cms_quantity_insert")
    inquiry(A,'accepted');inquiry(B,'accepted');execute('ALTER TABLE rental_inquiries ENABLE TRIGGER cms_quantity_insert')
    execute("UPDATE rental_inquiries SET offer_payload=jsonb_set(offer_payload,'{note}','\"price-only\"')")
    execute("UPDATE rental_inquiries SET status='cancelled' WHERE id=%s",(B,))
case('legacy overbooking does not block price-only edits or releases',legacy)
def stale():
    inquiry()
    def run():
        with connection() as c:
            c.set_session(isolation_level='REPEATABLE READ')
            with c.cursor() as cur:cur.execute("UPDATE rental_inquiries SET status='accepted'")
    rejection(run,'40001')
case('higher transaction isolation fails safely instead of stale-snapshot promise',stale)
def permissions():
    inquiry();execute('UPDATE allowed SET ok=false')
    rejection(lambda:execute("SELECT confirm_order(%s,'{}')",(A,)),'P0001')
case('existing protected confirm permission unchanged',permissions)
def transfer():
    execute('INSERT INTO b2b_product_instances(managed_product_id,location,status) VALUES(%s,%s,%s)',(P,'krefeld','available'))
    inquiry(A,'accepted')
    value=execute("SELECT confirm_order(%s,%s)",(A,json.dumps(dict(mode='confirm',items={'0':dict(action='order_from',source='krefeld',transport_cost=25,cost_charged=True)}))))[0][0]
    assert value['transports']==1 and value['allocations']==1
    assert execute('SELECT location FROM b2b_product_instances')[0][0]=='bonn'
    assert execute('SELECT transport_cost FROM b2b_transport_orders')[0][0]==25
case('tracked device transfer and transport costs unchanged',transfer)
def quantity_transfer():
    inquiry(A,'accepted',location='Muelheim')
case('quantity zero remains unavailable even with another location stock',lambda:rejection(quantity_transfer))
def multirow():
    inquiry(A,items=[item(slug='baumaschinen-3500'),item(slug='second-tool')]);inquiry(B,items=[item(slug='second-tool'),item(slug='baumaschinen-3500')]);barrier=threading.Barrier(2)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        fs=[pool.submit(confirm_transaction,id,barrier) for id in (A,B)];outcome=[f.result(timeout=20) for f in fs]
    assert sorted(outcome)==['23514','success'],outcome
case('reverse line order: deterministic multi-product locks, no deadlock',multirow)
def missing():
    inquiry();execute('UPDATE rental_inquiries SET start_date=NULL,end_date=NULL,offer_payload=%s',(json.dumps(dict(items=[dict(product_slug='baumaschinen-3500',articles=1)])),))
    assert confirm_transaction(A)=='23514'
case('missing dated booking evidence never reports free',missing)
def bonn():
    inquiry(A,'accepted');inquiry(B,items=[item('2026-11-30','2026-11-30'),item('2026-11-30','2026-11-30')]);execute("UPDATE rental_inquiries SET start_date='2026-11-02',end_date='2026-12-04' WHERE id=%s",(B,))
    r=execute('SELECT check_availability(%s)',(A,))[0][0]
    assert r['items'][0]['free']==1 and r['items'][0]['available'] is True
case('synthetic NWHAP2/CYPWN5: Bonn free one, self excluded',bonn)
def b2b_race():
    inquiry();barrier=threading.Barrier(2)
    def reserve():
        barrier.wait(timeout=10)
        try:reservation();return 'success'
        except psycopg2.Error as error:return error.pgcode
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        f=pool.submit(confirm_transaction,A,barrier);g=pool.submit(reserve)
        outcome=[f.result(timeout=20),g.result(timeout=20)]
    assert sorted(outcome)==['23514','success'],outcome
case('B2B hold versus confirmation race: exactly one succeeds',b2b_race)
def amendment_race():
    inquiry(A,'accepted',items=[item('2026-12-03','2026-12-03')]);inquiry(B,'accepted',items=[item('2026-12-05','2026-12-05')]);barrier=threading.Barrier(2)
    def extend(id,s,e):
        barrier.wait(timeout=10)
        try:execute('UPDATE rental_inquiries SET offer_payload=%s WHERE id=%s',(json.dumps(dict(items=[item(s,e)])),id));return 'success'
        except psycopg2.Error as error:return error.pgcode
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        fs=[pool.submit(extend,A,'2026-12-03','2026-12-04'),pool.submit(extend,B,'2026-12-04','2026-12-05')]
        outcome=[f.result(timeout=20) for f in fs]
    assert sorted(outcome)==['23514','success'],outcome
case('concurrent extensions competing for last day: exactly one succeeds',amendment_race)
def repeated():
    inquiry(A,'accepted');value=execute("SELECT confirm_order(%s,'{}')",(A,))[0][0];value2=execute("SELECT confirm_order(%s,'{}')",(A,))[0][0]
    assert value['allocations']==0 and value2['allocations']==0
    assert execute('SELECT count(*) FROM b2b_instance_allocations')[0][0]==0
case('CMS confirmation retry never fabricates devices or allocations',repeated)
Path('/tmp/release-activation/postgres-results.json').write_text(json.dumps(dict(passed=len(results),cases=results,engine='PostgreSQL 17, independent psycopg2 connections, no managed env'),indent=2))
print('ALL',len(results),'PASS')