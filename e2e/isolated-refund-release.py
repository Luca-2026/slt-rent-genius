import asyncio,json
from pathlib import Path
from urllib.parse import urlparse
from playwright.async_api import async_playwright
ROOT=Path('/tmp/browser/refund-release')
HTML='''<html><head></head><body><div id="root"></div><script type="module">
import RefreshRuntime from '/@react-refresh';RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>(type)=>type;window.__vite_plugin_react_preamble_installed__=true;
import React from '/node_modules/.vite/deps/react.js';import {createRoot} from '/node_modules/.vite/deps/react-dom_client.js';import '/src/index.css';
const {OrderRefundOverview}=await import('/src/components/b2b/inquiries/OrderRefundOverview.tsx');
window.calls=[];window.fixture={basis:false,settled:false,pending:false,rentUsed:0,depositUsed:0};
const inquiry={id:'isolated-order',order_code:'TEST01',status:'accepted',offer_total_gross:193.92,offer_payload:{deposit:500},payments:[{amount:713.32,label:'Banküberweisung',date:'2026-11-27'}]};
createRoot(document.getElementById('root')).render(React.createElement(OrderRefundOverview,{inquiry,onChanged:()=>{},onPrepareRentalBasis:()=>{window.prepared=true}}));</script></body></html>'''
DB='''export const supabase={rpc:async()=>({error:{message:'writes forbidden'}}),from:(table)=>{const result=()=>({data:table==='deposit_settlements'?(window.fixture.settled?{balance:500,paid_amount:713.32,rent_amount:193.92,deposit_held:500,rental_credit:19.4,deductions:[],settled_at:'2026-11-28T12:00:00Z',payout_status:'paid',payout_method:'transfer'}:null):table==='rental_refund_bases'?(window.fixture.basis?{id:'basis'}:null):[],error:null});const q={select:()=>q,eq:()=>q,in:()=>q,not:()=>q,gt:()=>q,order:()=>q,limit:()=>q,maybeSingle:async()=>result(),single:async()=>result(),then:(r)=>Promise.resolve(result()).then(r)};return q;}};'''
INVOKE='''export async function invokeWithAuth(name,body){window.calls.push(body.action);const f=window.fixture;if(body.action==='order_refund_info')return {data:{success:true,execution_available:false,paid_cents:71332,deposit_available:50000-f.depositUsed,rent_available:f.basis?1940-f.rentUsed:0,deposit_used:f.depositUsed,rent_used:f.rentUsed,pending:f.pending,can_refund_rent:true,requests:[]}};if(body.action==='order_credit_info')return {data:f.basis?{success:true,amount_cents:1940,status:f.pending?'creating':f.rentUsed?'succeeded':'available',payout_method:'transfer'}:{success:false,error:'Zuerst die Rechnungsvorschau mit dem endgültigen Rabatt prüfen.'}};if(body.action==='refund_order_credit'){f.pending=true;return {data:{success:true,amount_cents:1940,status:'creating',payout_method:'transfer'}};}if(body.action==='confirm_order_credit_transfer'){f.pending=false;f.rentUsed=1940;return {data:{success:true,amount_cents:1940,status:'succeeded',payout_method:'transfer'}};}throw Error('forbidden fixture action');}'''
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  results=[]
  for width,height in [(390,844),(1280,1800)]:
   ctx=await browser.new_context(viewport={'width':width,'height':height},service_workers='block');blocked=[];errors=[]
   await ctx.route_web_socket('**/*',lambda ws:ws.close())
   async def route(r):
    u=urlparse(r.request.url)
    if u.hostname!='localhost':blocked.append(u.hostname);return await r.abort()
    path=u.path
    if path=='/__refund_fixture':return await r.fulfill(content_type='text/html',body=HTML)
    stubs={'/src/integrations/supabase/client.ts':DB,'/src/lib/invokeWithAuth.ts':INVOKE,'/src/hooks/useStaffAccess.ts':"export const useStaffAccess=()=>({canManageInventory:true,displayName:'Fixture'});",'/src/hooks/use-toast.ts':"export const useToast=()=>({toast:()=>{}});"}
    if path in stubs:return await r.fulfill(content_type='application/javascript',body=stubs[path])
    if r.request.method not in ['GET','HEAD']:raise Exception('Unexpected local write')
    await r.continue_()
   await ctx.route('**/*',route);page=await ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
   await page.goto('http://localhost:8080/__refund_fixture');await page.get_by_role('button',name='Erstattung bearbeiten',exact=True).click()
   dialog=page.get_by_role('dialog');await dialog.get_by_role('button',name='Mietguthaben / Erstattung',exact=True).wait_for()
   assert 'Belegbasis fehlt' in await dialog.inner_text()
   assert '519,40' not in await dialog.inner_text()
   await dialog.get_by_role('button',name='Mietguthaben / Erstattung',exact=True).click()
   await dialog.get_by_text('Zuerst die Rechnungsvorschau mit dem endgültigen Rabatt prüfen.',exact=True).wait_for()
   await dialog.screenshot(path=str(ROOT/f'{width}-missing-basis.png'))
   await dialog.get_by_role('button',name='Endgültige Rechnungsvorschau öffnen',exact=True).click();assert await page.evaluate('window.prepared')
   # Isolated saved basis fixture, no real invoice preview or database action.
   await page.evaluate('window.fixture.basis=true;window.fixture.settled=true;window.fixture.depositUsed=50000')
   await page.get_by_role('button',name='Erstattung bearbeiten',exact=True).click()
   await page.get_by_role('dialog').get_by_role('button',name='Mietguthaben / Erstattung',exact=True).click()
   await page.get_by_role('button',name='Überweisungsauftrag vorbereiten',exact=True).click()
   confirm=page.get_by_role('button',name='Ausgeführte Überweisung bestätigen',exact=True);assert not await confirm.is_enabled()
   await page.get_by_role('textbox',name='Banknachweis',exact=True).fill('ISOLATED-EVIDENCE')
   await confirm.click();await page.get_by_text('Erstattung bestätigt',exact=True).wait_for()
   await page.get_by_role('dialog').last.screenshot(path=str(ROOT/f'{width}-confirmed-rent.png'))
   calls=await page.evaluate('window.calls');assert calls.count('refund_order_credit')==1;assert calls.count('confirm_order_credit_transfer')==1
   assert not errors,errors
   results.append({'width':width,'flow':'missing basis -> existing preview action -> isolated bank preparation -> evidence -> confirmed 19.40','result':'PASS','calls':calls,'externalBlocked':blocked,'errors':errors})
   await ctx.close()
  (ROOT/'results.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2));await browser.close()
asyncio.run(main())
