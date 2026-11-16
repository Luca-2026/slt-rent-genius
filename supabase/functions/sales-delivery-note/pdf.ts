import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { drawUnifiedFooter, resolvePdfLocation, FOOTER_TOP } from "../_shared/pdf-footer.ts";
import { SLT_COMPANY } from "../_shared/company.ts";
export async function salesDeliveryPdf(snapshot: any, number: string, receipt?: { name: string; at: string; signature: string }) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const safe = (v: string) => v.replace(/[^\x20-\x7e\xa0-\xff]/g, " ");
  let page = doc.addPage([595.28, 841.89]), y = 780;
  const line = (value: string, strong = false, size = 10) => {
    const words = safe(value).split(/\s+/); let current = "";
    const draw = (s: string) => { if(y < FOOTER_TOP + 30) { page=doc.addPage([595.28,841.89]); y=780; } page.drawText(s,{x:42,y,size,font:strong?bold:font,color:rgb(0.1,0.1,0.1)}); y-=size+7; };
    for (const word of words) { const next = current ? `${current} ${word}` : word; if(font.widthOfTextAtSize(next,size)>510 && current) {draw(current);current=word;} else current=next; }
    draw(current);
  };
  line("Lieferschein · Verkauf",true,20); line(number,true,12);
  line(`Auftrag #${snapshot.order_code} · Angebot ${snapshot.offer_number}`);
  if(snapshot.order_confirmation_number) line(`Auftragsbestätigung ${snapshot.order_confirmation_number}`);
  line(`Erstellt: ${new Date(snapshot.created_at).toLocaleString("de-DE",{timeZone:"Europe/Berlin"})}`);
  y-=12; line(snapshot.customer,true); line(snapshot.address || "");
  if(snapshot.delivery_address) {line("Lieferadresse",true);line(snapshot.delivery_address);}
  y-=12; line("Gelieferte Verkaufsartikel",true,12);
  snapshot.items.forEach((i: any,n: number) => {line(`${n+1}. ${i.quantity} ${i.unit} · ${i.name}`,true);if(i.description) line(i.description);});
  y-=16; line("Empfangsbestätigung",true,12);
  line("Ich bestätige den Erhalt der oben aufgeführten gekauften Ware. Abweichungen oder fehlende Artikel werden nachfolgend dokumentiert.");
  line(`Bemerkungen: ${snapshot.notes || "________________________________________________"}`);
  if(receipt) {
    line(`Empfänger: ${receipt.name}`);line(`Empfang bestätigt: ${new Date(receipt.at).toLocaleString("de-DE",{timeZone:"Europe/Berlin"})}`);
    if(y<FOOTER_TOP+100) {page=doc.addPage([595.28,841.89]);y=780;}
    const image=await doc.embedPng(receipt.signature);const dims=image.scaleToFit(240,65);page.drawImage(image,{x:42,y:y-70,width:dims.width,height:dims.height});
  } else {line("Name des Empfängers: ________________________________________");line("Ort / Datum: _________________________________________________"); y-=25;line("Unterschrift Empfänger: _______________________________________");}
  drawUnifiedFooter({doc,font,company:SLT_COMPANY,location:resolvePdfLocation(snapshot.location),W:595.28,ML:42,MR:42,safe,showPageNo:()=>true});
  return doc.save();
}