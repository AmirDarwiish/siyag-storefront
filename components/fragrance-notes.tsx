"use client";
import type {Product} from "@/lib/store";
import {noteName} from "@/lib/scent-profile";
import {useStore} from "./store-context";

export function FragranceNotes({product}:{product:Product}){
  const {tr,ar}=useStore();
  const keyNotesOnly=!product.topNotes.length&&!product.heartNotes.length;
  const layers=[
    {id:"opening",title:tr("Opening","الافتتاحية"),notes:product.topNotes},
    {id:"heart",title:tr("Heart","القلب"),notes:product.heartNotes},
    {id:"base",title:keyNotesOnly?tr("Key notes","النوتات الأساسية"):tr("Base","القاعدة"),notes:product.baseNotes},
  ].filter(layer=>layer.notes.length);
  if(!layers.length)return null;
  return <section className="profile-notes" aria-labelledby="profile-notes-title">
    <h2 id="profile-notes-title">{tr("Fragrance notes","النوتات العطرية")}</h2>
    <dl>{layers.map(({id,title,notes})=><div key={id} data-layer={id}>
      <dt>{title}</dt><dd>{notes.map(note=><span key={note} dir="auto">{noteName(note,ar)}</span>)}</dd>
    </div>)}</dl>
  </section>;
}
