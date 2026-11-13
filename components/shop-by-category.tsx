"use client";
import Link from "next/link";
import {StoreImage} from "./store-image";
import {imageUrl,name,type Collection} from "@/lib/store";
import {useStore} from "./store-context";

export function ShopByCategory({collections}:{collections:Collection[]}){
 const {tr,lang}=useStore();
 if(!collections.length)return null;
 return <section className="container category-discovery" aria-labelledby="category-discovery-title"><header className="category-discovery-heading"><span className="eyebrow">{tr("THE WORLD OF SIYAG","عالم SIYAG")}</span><h2 id="category-discovery-title">{tr("Shop by category","تسوّق حسب القسم")}</h2></header><nav className="category-discovery-list" aria-label={tr("Shop by category","تسوّق حسب القسم")}>{collections.map(collection=><Link className="category-discovery-item" key={collection.slug} href={"/shop?collection="+encodeURIComponent(collection.slug)}><span className="category-discovery-visual">{collection.imageUrl?<StoreImage src={imageUrl(collection.imageUrl)} alt="" width={320} height={320} sizes="(max-width:767px) 96px,160px" loading="lazy"/>:<span className="category-discovery-monogram" aria-hidden="true">S</span>}</span><span className="category-discovery-name">{name(collection,lang)}</span></Link>)}</nav></section>;
}
