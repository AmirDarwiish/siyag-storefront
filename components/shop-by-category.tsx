"use client";
import Link from "next/link";
import {StoreImage} from "./store-image";
import {useStore} from "./store-context";

// Discovery shortcuts only: these moods do not add collections or product sections.
const moods=[
 {family:"amber",nameEn:"Warm & soft",nameAr:"دافي وناعم",image:"warm-soft"},
 {family:"gourmand",nameEn:"Sweet & rich",nameAr:"حلو وغني",image:"sweet-rich"},
 {family:"woody",nameEn:"Fresh & woody",nameAr:"منعش وخشبي",image:"fresh-woody"},
];
export function ShopByCategory(){
 const {tr}=useStore();
 return <section className="container category-discovery" aria-labelledby="category-discovery-title">
  <header className="category-discovery-heading"><span className="eyebrow">{tr("THE WORLD OF SIYAG","عالم SIYAG")}</span><h2 id="category-discovery-title">{tr("Find your mood","اختار إحساسك")}</h2></header>
  <nav className="category-discovery-list" aria-label={tr("Shop by feeling","تسوّق حسب الإحساس")}>
   {moods.map(mood=><Link className="category-discovery-item" key={mood.family} href={"/shop?family="+mood.family}>
    <span className="category-discovery-visual"><StoreImage src={"/brand/categories/"+mood.image+".webp"} alt="" width={320} height={320} sizes="(max-width:767px) 96px,150px" loading="lazy"/></span>
    <span className="category-discovery-name">{tr(mood.nameEn,mood.nameAr)}</span>
   </Link>)}
  </nav>
 </section>;
}
