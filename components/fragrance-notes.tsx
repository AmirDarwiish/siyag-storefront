"use client";
import type {Product} from "@/lib/store";
import {families,name} from "@/lib/store";
import {noteName} from "@/lib/scent-profile";
import {useStore} from "./store-context";
import {StoreImage} from "./store-image";

export function FragranceNotes({product}:{product:Product}){
 const {tr,ar,lang}=useStore();
 const layers=[{title:tr("Opening","الافتتاحية"),notes:product.topNotes},{title:tr("Heart","القلب"),notes:product.heartNotes},{title:tr("Base","القاعدة"),notes:product.baseNotes}].filter(layer=>layer.notes.length);
 const keyNotesOnly=!product.topNotes.length&&!product.heartNotes.length;
 return <section className="container scent-signature" aria-labelledby="fragrance-notes-title">
  <header className="signature-heading"><div><span className="eyebrow">{tr("THE SIYAG SIGNATURE","بصمة SIYAG")}</span><h2 id="fragrance-notes-title">{tr("Inside the fragrance","داخل العطر")}</h2><p>{tr(`Discover the notes behind ${name(product,lang)}.`,`اكتشف نوتات ${name(product,lang)}.`)}</p></div><span className="signature-family">{families[product.family]?.[ar?1:0]}</span></header>
  <div className="signature-overview">
   <div className="composition-story"><h3>{tr("The notes","النوتات العطرية")}</h3><p>{tr("From the first impression to the final trace.","من أول انطباع لآخر أثر.")}</p><dl className="composition-layers">{layers.map(layer=><div key={layer.title}><dt>{keyNotesOnly?tr("Key notes","النوتات الأساسية"):layer.title}</dt><dd>{layer.notes.map(note=><span key={note} dir="auto">{noteName(note,ar)}</span>)}</dd></div>)}</dl></div>
   {product.notesImageUrl&&<StoreImage className="fragrance-notes-photo" src={product.notesImageUrl} alt={tr(`${product.nameEn} with its fragrance notes`,`${product.nameAr} مع نوتاته العطرية`)} width={1254} height={1254} sizes="(max-width:767px) 100vw,36vw" loading="lazy"/>}
  </div>
 </section>;
}
