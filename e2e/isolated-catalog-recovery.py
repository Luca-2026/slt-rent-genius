import asyncio, json, base64
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.async_api import async_playwright
PROJECT=Path(__file__).resolve().parents[1]
ROOT=Path('/tmp/browser/paket1c')
ROOT.mkdir(parents=True,exist_ok=True)
LOCATIONS=['krefeld','bonn','muelheim']
def product(slug,name,subcategory,image,specs,price):
 return dict(id=slug,slug=slug,name=name,model_name=name,category='erdbewegung',subcategory=subcategory,available_locations=LOCATIONS,images=[image],specifications=specs,features=[],tags=[],rental_notes=[],rentware_code={},on_request=False,seo_faqs=[],seo_local_content={},video_urls=[],addon_options=[],is_published=True,pricing_scheme='bau',prices_same_all_locations=False,price_from_1_rd=price,price_from_3_rd=price*.9,price_from_10_rd=price*.8,price_from_20_rd=price*.6,price_weekend_num=price*1.5)
# Isolated test prices, not SLT offers or inventory. Only the E10Z specs are verified project facts.
PRODUCTS=[product('minibagger-1t','E10Z Testartikel','minibagger','/product-images/erdbewegung/bobcat-e10z-1.jpg',{'Betriebsgewicht':'1176 kg','Gesamtbreite':'1100 mm einfahrbar auf 710 mm','Grabtiefe':'1820 mm'},100),product('kettendumper-rmd800','Dumper Testartikel','dumper','/product-images/erdbewegung/kettendumper-rmd800-1.jpeg',{'Breite':'80 cm','Muldenvolumen':'200 l','Nutzlast':'800 kg'},50)]
PRODUCTS.append({**product('bautrockner-kt200','KT200 Testartikel','bautrockner','/product-images/allegra-bautrockner-kt200-1.webp',{'Leistungsaufnahme':'0,26 kW'},10),'category':'bautrocknung'})
PRICES=[dict(managed_product_id=p['id'],location=l,price_from_1_rd=p['price_from_1_rd']+(10 if l=='bonn' else 20 if l=='muelheim' else 0),price_from_3_rd=p['price_from_3_rd'],price_from_10_rd=p['price_from_10_rd'],price_from_20_rd=p['price_from_20_rd'],price_weekend_num=p['price_weekend_num']) for p in PRODUCTS for l in LOCATIONS]
STATE=dict(project=0,shapes=[dict(kind='area',v=dict(a='40',c='30'))],soil='unbekannt',access='100',days='3',expert=True,density='1,6',loosening='20',fill='85')
def encoded(s):
 # JS encodeURIComponent keeps ASCII punctuation except certain characters; no non-ASCII here.
 from urllib.parse import quote
 return base64.b64encode(quote(json.dumps(s,separators=(',',':')),safe="~()*!.'-").encode()).decode()
async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True)
  context=await browser.new_context(viewport={'width':390,'height':844},service_workers='block')
  seen=[]; forbidden=[]; errors=[]; mode={'value':'healthy'}
  await context.route_web_socket('**/*',lambda ws: ws.close())
  async def intercept(route):
   req=route.request; u=urlparse(req.url)
   if u.hostname=='localhost': return await route.continue_()
   if '/rest/v1/' in u.path:
    table=u.path.split('/rest/v1/')[1]
    seen.append([req.method,table])
    if req.method not in ['GET','HEAD']: forbidden.append(req.url); return await route.abort()
    data=PRODUCTS if table in ['managed_products_public','b2b_managed_products'] else PRICES if table in ['public_product_prices','b2b_managed_product_location_prices'] else []
    params=parse_qs(u.query)
    if table=='managed_products_public':
     if mode['value']=='outage': return await route.fulfill(status=503,content_type='application/json',body='{}')
     if mode['value']=='empty': data=[]
     data=sorted(data,key=lambda p:p['id'])
     cursor=params.get('id',[''])[0]
     if cursor.startswith('gt.'): data=[p for p in data if p['id']>cursor[3:]]
     total=len(data)
     data=data[:int(params.get('limit',['500'])[0])]
     return await route.fulfill(status=200,content_type='application/json',headers={'content-range':f'0-{max(0,len(data)-1)}/{total}','access-control-expose-headers':'content-range'},body=json.dumps(data))
    return await route.fulfill(status=200,content_type='application/json',body=json.dumps(data))
   if '/functions/v1/' in u.path:
    name=u.path.split('/functions/v1/')[1]; seen.append([req.method,name])
    if name=='public-rental-quote':
     proc=await asyncio.create_subprocess_exec('bun',str(PROJECT/'e2e/isolated-public-quote.ts'),stdin=asyncio.subprocess.PIPE,stdout=asyncio.subprocess.PIPE)
     output,_=await proc.communicate(json.dumps(dict(products=PRODUCTS,prices=PRICES,items=req.post_data_json.get('items',[]))).encode())
     return await route.fulfill(status=400 if 'error' in json.loads(output) else 200,content_type='application/json',body=output.decode())
    forbidden.append(name); return await route.abort()
   # Auth, payments, mail, analytics and every other external request never leave this browser.
   return await route.fulfill(status=200,content_type='application/json',body='{}')
  await context.route('**/*',intercept)
  page=await context.new_page(); page.on('pageerror',lambda e: errors.append(str(e)))
  results=[]
  async def capture(label):
   await page.screenshot(path=str(ROOT/(label+'.png')))
   overflow=await page.evaluate('document.documentElement.scrollWidth>innerWidth')
   assert not overflow,label+' overflow'
   results.append(dict(test=label,result='PASS',url=page.url))
  async def close_dialog():
   await page.get_by_role('dialog').get_by_role('button',name='Close',exact=True).click()
  async def cart():
   return await page.evaluate("JSON.parse(localStorage.getItem('slt.rental-cart.v1'))")
  checks=[]
  for loc in LOCATIONS:
   await page.goto('http://localhost:8080/mieten/'+loc+'/erdbewegung/minibagger-1t/')
   await page.wait_for_timeout(1000); print('HEADINGS',await page.locator('h1').all_text_contents()); assert await page.get_by_role('heading',name='Produkt nicht gefunden',exact=True).count()==0
   checks.append(loc+'-healthy')
   mode['value']='outage'
   await page.reload()
   await page.get_by_role('heading',name='Artikeldaten gerade nicht abrufbar',exact=True).wait_for()
   assert await page.get_by_role('link',name='Zum Standort',exact=True).count()==1
   assert await page.locator('meta[name=robots][content*=noindex]').count()==0
   await page.get_by_role('heading',name='Artikeldaten gerade nicht abrufbar',exact=True).screenshot(path=str(ROOT/(loc+'-outage.png')))
   checks.append(loc+'-outage-contact-no-noindex')
   mode['value']='empty'
   await page.reload()
   await page.get_by_role('heading',name='Produkt nicht gefunden',exact=True).wait_for()
   assert await page.locator('meta[name=robots][content*=noindex]').count()>0
   checks.append(loc+'-confirmed-empty-no-revival')
   mode['value']='healthy'
   await page.reload()
   await page.wait_for_timeout(1000); print('HEADINGS',await page.locator('h1').all_text_contents()); assert await page.get_by_role('heading',name='Produkt nicht gefunden',exact=True).count()==0
   checks.append(loc+'-recovery')
  assert not forbidden,forbidden
  (ROOT/'fallback-results.json').write_text(json.dumps(checks,indent=2))
  print('PASS',len(checks),'fallback/recovery checks; external writes blocked; page errors',errors)
  await browser.close()
asyncio.run(main())
