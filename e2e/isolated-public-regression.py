import asyncio, json, base64
from pathlib import Path
from urllib.parse import urlparse
from playwright.async_api import async_playwright
PROJECT=Path(__file__).resolve().parents[1]
ROOT=Path('/tmp/browser/paket1b1-regression')
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
  seen=[]; forbidden=[]; errors=[]
  await context.route_web_socket('**/*',lambda ws: ws.close())
  async def intercept(route):
   req=route.request; u=urlparse(req.url)
   if u.hostname=='localhost': return await route.continue_()
   if '/rest/v1/' in u.path:
    table=u.path.split('/rest/v1/')[1]
    seen.append([req.method,table])
    if req.method not in ['GET','HEAD']: forbidden.append(req.url); return await route.abort()
    data=PRODUCTS if table in ['managed_products_public','b2b_managed_products'] else PRICES if table in ['public_product_prices','b2b_managed_product_location_prices'] else []
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
  for width in [390,1280]:
   await page.set_viewport_size(dict(width=width,height=844 if width==390 else 1800))
   for loc in LOCATIONS:
    await page.goto('http://localhost:8080/tools/aushubrechner/?standort='+loc+'&aushub='+encoded(STATE))
    await page.evaluate("localStorage.removeItem('slt.rental-cart.v1')")
    await page.reload()
    if await page.get_by_role('button',name='Ablehnen',exact=True).count(): await page.get_by_role('button',name='Ablehnen',exact=True).click()
    await page.get_by_test_id('calc-total').wait_for()
    assert await page.get_by_label('Fläche (m²)',exact=True).input_value()=='40'
    for value in ['12,0','14,4','19,2']: assert value in await page.locator('section[aria-labelledby="exc-calc"]').inner_text()
    for slug in ['minibagger-1t','kettendumper-rmd800']:
     row=page.get_by_test_id('exc-machine-'+slug).first
     assert await row.locator('img').evaluate('(i)=>i.complete && i.naturalWidth>0')
     assert '/mieten/'+loc+'/erdbewegung/'+slug in await row.locator('a').get_attribute('href')
    await capture(f'{width}-{loc}-calculator')
    before=await page.get_by_test_id('calc-total').inner_text()
    # Standalone report: same inputs, same fixture prices, no site frame.
    report=await context.new_page()
    await report.goto('http://localhost:8080/tools/aushubrechner/bericht?standort='+loc+'&vorschau=1&aushub='+encoded(STATE))
    await report.locator('[data-ready="1"]').wait_for()
    amount=await report.get_by_test_id('report-total').inner_text()
    assert amount in before,(amount,before)
    assert await report.locator('nav,footer').count()==0
    assert await report.get_by_role('img',name='SLT Rental',exact=True).evaluate('(i)=>i.naturalWidth>0')
    if width==1280:
     await report.pdf(path=str(ROOT/(loc+'-report.pdf')),format='A4',prefer_css_page_size=True,print_background=True)
    await report.close()
    results.append(dict(test=f'{width}-{loc}-report-price-logo',result='PASS',amount=amount))
    # Narrow gate still shows E10Z but must not include unverified equipment.
    await page.get_by_label('Schmalste Zufahrt (cm, optional)').fill('80')
    assert 'Potenziell passend' in await page.get_by_test_id('exc-machine-minibagger-1t').first.inner_text()
    assert await page.get_by_role('button',name='2 Geräte in den Warenkorb legen:',exact=False).count()==0
    await page.get_by_label('Schmalste Zufahrt (cm, optional)').fill('40')
    assert 'Passt nicht durch Zufahrt' in await page.get_by_test_id('exc-machine-minibagger-1t').first.inner_text()
    await page.get_by_label('Schmalste Zufahrt (cm, optional)').fill('100')
    # One actual package button and one confirmed shared period.
    await page.get_by_role('button',name='2 Geräte in den Warenkorb legen:',exact=False).click()
    await page.get_by_role('button',name='Nächstes Wochenende wählen',exact=True).click()
    await page.get_by_role('button',name='In den Warenkorb legen',exact=True).click()
    await page.get_by_role('button',name='Mietanfrage abschließen',exact=True).wait_for()
    saved=await cart(); assert len(saved['items'])==2
    assert {i['product_slug'] for i in saved['items']}=={'minibagger-1t','kettendumper-rmd800'}
    assert all(i['location']==loc for i in saved['items'])
    assert len({(i['start_date'],i['end_date'],i['start_time'],i['end_time']) for i in saved['items']})==1
    await page.get_by_label('Anzahl',exact=True).first.fill('2')
    assert next(i for i in (await cart())['items'] if i['product_slug']=='minibagger-1t')['quantity']==2
    await capture(f'{width}-{loc}-cart')
    await close_dialog(); await page.reload()
    assert len((await cart())['items'])==2
    # Adding the same package does not overwrite quantity or duplicate it.
    await page.get_by_role('button',name='2 Geräte in den Warenkorb legen:',exact=False).click()
    # A valid existing period commits immediately.
    await page.get_by_role('button',name='Mietanfrage abschließen',exact=True).wait_for()
    assert len((await cart())['items'])==2
    assert next(i for i in (await cart())['items'] if i['product_slug']=='minibagger-1t')['quantity']==2
    await page.get_by_role('button',name='Mietanfrage abschließen',exact=True).click()
    await page.get_by_role('button',name='Weiter zu Versicherungen',exact=True).click()
    await page.get_by_role('button',name='Weiter zum nächsten Artikel',exact=True).click()
    await page.get_by_role('button',name='Weiter zu Versicherungen',exact=True).click()
    await page.get_by_role('button',name='Weiter zu Kontaktdaten',exact=True).click()
    await page.get_by_role('button',name='Mietanfrage senden',exact=True).wait_for()
    await capture(f'{width}-{loc}-before-submit')
    await close_dialog()
   # Standorte behalten Aushubparameter; Expertenwerte ebenso.
   await page.get_by_role('radio',name='Bonn',exact=True).click()
   assert await page.get_by_label('Fläche (m²)',exact=True).input_value()=='40'
   assert await page.get_by_label('Dichte (t/m³)',exact=True).input_value()=='1,6'
   results.append(dict(test=f'{width}-location-switch-expert',result='PASS'))
   for path in ['/','/mieten/bonn/','/mieten/bonn/erdbewegung/','/mieten/bonn/erdbewegung/minibagger-1t/','/tools/','/kontakt/']:
    await page.goto('http://localhost:8080'+path)
    await page.locator('h1').first.wait_for()
    await capture(str(width)+'-page-'+path.strip('/').replace('/','-'))
   await page.goto('http://localhost:8080/tools/bautrockner-rechner/?standort=bonn')
   await page.get_by_label('Raumlänge (m)').fill('5');await page.get_by_label('Raumbreite (m)').fill('4')
   assert 'KT200 Testartikel' in await page.locator('section[aria-labelledby="drying-calc"]').inner_text()
   await capture(f'{width}-drying')
   await page.goto('http://localhost:8080/tools/baustromrechner/?standort=bonn')
   await page.get_by_label('Leistung (kW)',exact=True).first.fill('2,2')
   await page.get_by_label('Entfernung zum Anschluss (m)').fill('60')
   await page.get_by_label('Mietdauer (Tage)').fill('7')
   assert await page.get_by_label('Entfernung zum Anschluss (m)').input_value()=='60'
   assert await page.get_by_label('Mietdauer (Tage)').input_value()=='7'
   await capture(f'{width}-power')
  assert not forbidden,forbidden
  assert not errors,errors
  (ROOT/'results.json').write_text(json.dumps(dict(results=results,requests=seen,forbidden=forbidden,errors=errors),ensure_ascii=False,indent=2))
  print('PASS',len(results),'checks; no real writes, no mail/payments; page errors',errors)
  await browser.close()
asyncio.run(main())
