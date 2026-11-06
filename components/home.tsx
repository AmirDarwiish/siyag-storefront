"use client";

import Link from "next/link";
import {useEffect,useState} from "react";
import {ArrowDown,ArrowUpRight,Box,FlaskConical,Sparkles} from "lucide-react";
import {api,type Collection,type Page,type Product,imageUrl,name} from "@/lib/store";
import {useStore} from "./store-context";
import {ProductCard} from "./product";

export function Home(){
  const {tr,lang}=useStore();
  const [products,setProducts]=useState<Product[]>();
  const [collections,setCollections]=useState<Collection[]>([]);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();
    const options={signal:controller.signal};
    api<Page<Product>>("store/products?featured=true&pageSize=4",options).then(data=>data.data.length?data:api<Page<Product>>("store/products?pageSize=4",options)).then(data=>setProducts(data.data)).catch(()=>{if(!controller.signal.aborted)setFailed(true)});
    api<Collection[]>("store/collections",options).then(setCollections).catch(()=>{});
    return()=>controller.abort();
  },[]);
  const categories=collections.length?collections.slice(0,3).map((c,i)=>({href:"/shop?collection="+c.slug,title:name(c,lang),image:imageUrl(c.imageUrl||["/brand/noir.webp","/brand/oud.webp","/brand/eclat.webp"][i])})):[
    {href:"/shop?format=fullBottle",title:tr("Full bottles","الزجاجات الكاملة"),image:"/brand/noir.webp"},
    {href:"/shop?family=amber",title:tr("Amber fragrances","عطور عنبرية"),image:"/brand/oud.webp"},
    {href:"/shop?format=decant",title:tr("Discovery sizes","أحجام التجربة"),image:"/brand/eclat.webp"},
  ];
  return <main>
    <section className="hero">
      <img src="/brand/hero.webp" alt="" className="hero-image" fetchPriority="high"/>
      <div className="hero-shade"/>
      <div className="hero-content">
        <div className="hero-kicker"><span/>{tr("AN EGYPTIAN FRAGRANCE HOUSE","دار عطور مصرية")}</div>
        <h1>{tr("A scent that","عطر يسيب")}<br/><em>{tr("stays with you.","أثر.")}</em></h1>
        <p>{tr("Explore SIYAG’s collection of warm woods, luminous amber and fresh citrus.","اكتشف تشكيلة سياج من الأخشاب الدافئة والعنبر والحمضيات المنعشة.")}</p>
        <Link href="/shop" className="action gold">{tr("Explore the collection","استكشف التشكيلة")}<ArrowUpRight size={17}/></Link>
      </div>
      <div className="hero-index"><span>01</span><span className="index-line"/><span>SIYAG PARFUMS</span></div>
      <a className="hero-down" href="#collections" aria-label={tr("Scroll to collections","اذهب للتشكيلات")}><ArrowDown size={19}/></a>
    </section>
    <div className="brand-strip">
      <div><FlaskConical size={18}/>{tr("Eau de Parfum","أو دو بارفان")}</div>
      <div><Sparkles size={18}/>{tr("Explore by fragrance family","تسوّق حسب العائلة العطرية")}</div>
      <div><Box size={18}/>{tr("Delivery across Egypt","توصيل داخل مصر")}</div>
    </div>
    <section className="container section collections-section" id="collections">
      <div className="section-head"><div><span className="eyebrow">{tr("01 / THE COLLECTIONS","٠١ / التشكيلات")}</span><h2>{tr("Find your signature.","اختار عطرك المميز.")}</h2></div><Link className="text-link" href="/shop">{tr("Explore all fragrances","كل العطور")}<ArrowUpRight size={16}/></Link></div>
      <div className="collections-grid">{categories.map((c,i)=><Link className="collection-card" href={c.href} key={c.href}>
        <img src={c.image} alt="" width={600} height={600}/><div className="collection-caption"><span>0{i+1} / SIYAG</span><h3>{c.title}</h3><span className="circle-arrow"><ArrowUpRight size={20}/></span></div>
      </Link>)}</div>
    </section>
    <section className="catalog-home"><div className="container section">
      <div className="section-head"><div><span className="eyebrow">{tr("02 / FROM THE HOUSE","٠٢ / من دار سياج")}</span><h2>{tr("The SIYAG edit.","مختارات سياج.")}</h2></div><Link className="text-link" href="/shop">{tr("View the collection","شوف التشكيلة")}<ArrowUpRight size={16}/></Link></div>
      {failed?<p className="empty-state">{tr("The collection is temporarily unavailable.","التشكيلة غير متاحة مؤقتًا.")}</p>:!products?<div className="product-grid">{[1,2,3,4].map(n=><div className="skeleton" key={n}/>)}</div>:products.length?
        <div className="product-grid">{products.map(p=><ProductCard product={p} key={p.id}/>)}</div>:<p className="empty-state">{tr("The collection will be available here when it launches.","هتلاقي التشكيلة هنا أول ما تنزل.")}</p>}
    </div></section>
    <section className="story">
      <img src="/brand/oud-detail.webp" alt="" width={627} height={627} loading="lazy"/>
      <div><span className="eyebrow">{tr("03 / THE HOUSE","٠٣ / دار سياج")}</span><h2>{tr("From the first note.","من أول نوتة.")}</h2><p>{tr("Get to know the opening, heart and base of each fragrance before choosing the one you’ll wear.","تعرّف على افتتاحية كل عطر وقلبه وقاعدته قبل ما تختار العطر المناسب لك.")}</p><Link href="/shop" className="action outline-light">{tr("Discover the scents","اكتشف العطور")}<ArrowUpRight size={16}/></Link></div>
    </section>
  </main>;
}
