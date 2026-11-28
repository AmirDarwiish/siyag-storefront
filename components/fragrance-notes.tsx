"use client";
import {Apple,Cherry,Citrus,Flower2,Flame,Leaf,TreePine,Waves,Wheat,Bean,Milk,Droplets,Sunrise,Heart,Layers, type LucideIcon} from "lucide-react";
import type {Product} from "@/lib/store";
import {noteName} from "@/lib/scent-profile";
import {useStore} from "./store-context";

const noteVisuals:{match:RegExp;icon:LucideIcon;tone:string}[]=[
  {match:/bergamot|lemon|orange|mandarin|tangerine|citrus|neroli/,icon:Citrus,tone:"citrus"},
  {match:/apple|pear|peach|fruit|lychee/,icon:Apple,tone:"fruit"},
  {match:/berry|currant|cherry/,icon:Cherry,tone:"fruit"},
  {match:/rose|jasmine|flower|lavender|magnolia|blossom|iris/,icon:Flower2,tone:"floral"},
  {match:/vanilla|coconut|milk|cream/,icon:Milk,tone:"sweet"},
  {match:/tonka|coffee|cardamom|chestnut/,icon:Bean,tone:"spice"},
  {match:/pepper|cinnamon|saffron|ginger|spice/,icon:Flame,tone:"spice"},
  {match:/wood|cedar|sandal|oud|vetiver|cashmer|teak/,icon:TreePine,tone:"wood"},
  {match:/patchouli|sage|green|mint|tobacco|leaf/,icon:Leaf,tone:"green"},
  {match:/musk|ambergris|aquatic/,icon:Waves,tone:"musk"},
  {match:/honey|amber|resin|benzoin|incense|frankincense|myrrh|labdanum/,icon:Droplets,tone:"sweet"},
  {match:/leather|suede|hay/,icon:Wheat,tone:"wood"},
];
function NoteChip({note,ar}:{note:string;ar:boolean}){
  const {icon:Icon,tone}=noteVisuals.find(visual=>visual.match.test(noteName(note,false).toLowerCase()))??{icon:Leaf,tone:"green"};
  return <span className="note-chip" data-tone={tone}><Icon aria-hidden="true"/><span dir="auto">{noteName(note,ar)}</span></span>;
}
export function FragranceNotes({product}:{product:Product}){
  const {tr,ar}=useStore();
  const keyNotesOnly=!product.topNotes.length&&!product.heartNotes.length;
  const layers=[
    {id:"opening",icon:Sunrise,title:tr("Opening","الافتتاحية"),notes:product.topNotes},
    {id:"heart",icon:Heart,title:tr("Heart","القلب"),notes:product.heartNotes},
    {id:"base",icon:Layers,title:keyNotesOnly?tr("Key notes","النوتات الأساسية"):tr("Base","القاعدة"),notes:product.baseNotes},
  ].filter(layer=>layer.notes.length);
  if(!layers.length)return null;
  return <section className="profile-notes" aria-labelledby="profile-notes-title">
    <h2 id="profile-notes-title">{tr("Fragrance notes","النوتات العطرية")}</h2>
    <dl>{layers.map(({id,title,notes,icon:Icon})=><div key={id} data-layer={id}>
      <dt><Icon aria-hidden="true"/>{title}</dt><dd>{notes.map(note=><NoteChip key={note} note={note} ar={ar}/>)}</dd>
    </div>)}</dl>
  </section>;
}
