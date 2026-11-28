"use client";

import Link from "next/link";
import {StoreImage} from "./store-image";
import {imageSizes} from "@/lib/image-sizes";
import {useEffect, useMemo, useRef, useState} from "react";
import {PackageCheck, Search} from "lucide-react";
import {api, imageUrl, name, type Page, type Product} from "@/lib/store";
import {useStore} from "./store-context";
import {HomeProductRail} from "./home-product-rail";
import {track} from "@/lib/analytics";
import {StoreReviewsLink} from "./reviews";
import {HomeBanners} from "./home-banners";
import {homeSections,sectionProducts,giftSelections,homeCatalogPolicy} from "@/lib/home-catalog";
import {ShopByCategory} from "./shop-by-category";

type FeatureProps={tone:"discovery"|"house"; eyebrow:string; title:string; copy:string; image:string; href:string; action:string};
function EditorialFeature({tone,eyebrow,title,copy,image,href,action}:FeatureProps) {
  return <section className="home-feature" data-tone={tone} aria-labelledby={`home-feature-${tone}`} data-reveal>
    <div className="home-feature-visual"><StoreImage sizes={imageSizes.half} src={image} alt="" width={1280} height={960} loading="lazy"/></div>
    <div className="home-feature-copy"><span className="eyebrow">{eyebrow}</span><h2 id={`home-feature-${tone}`}>{title}</h2><p>{copy}</p><Link href={href} className="action ink">{action}</Link></div>
  </section>;
}

function HomeCollection({group,catalog,first}:{group:typeof homeSections[number];catalog:Product[];first:boolean}){
 const {tr,lang}=useStore(),region=useRef<HTMLElement>(null);
 const [visible,setVisible]=useState(first);
 const products=useMemo(()=>sectionProducts(catalog,group.collection),[catalog,group.collection]);
 useEffect(()=>{
  if(visible)return;
  if(typeof IntersectionObserver==='undefined'){setVisible(true);return}
  const node=region.current;if(!node)return;
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){setVisible(true);observer.disconnect()}},{rootMargin:homeCatalogPolicy.revealMargin});
  observer.observe(node);return()=>observer.disconnect();
 },[visible]);
 useEffect(()=>{if(visible&&products.length)track("view_item_list",{list_id:"home-"+group.key,items:products.map(p=>({item_id:p.variants[0]?.id??p.id,item_name:p.nameEn,item_category:p.family}))})},[visible,products,group.key]);
 return <section ref={region} className="catalog-home" aria-labelledby={'home-'+group.key}><div className="container section">
  <div className="section-head"><div><span className="eyebrow">SIYAG</span><h2 id={'home-'+group.key}>{name(group,lang)}</h2></div><Link className="text-link" href={group.href}>{tr("View all","عرض الكل")}</Link></div>
  {visible?<HomeProductRail products={products}/>:<div className="product-grid home-rail-loading" aria-hidden="true">{products.slice(0,3).map(p=><div className="skeleton" key={p.id}/>)}</div>}
 </div></section>;
}

function HomeGifts({catalog}:{catalog:Product[]}){
 const {tr,lang}=useStore();
 return <section className="catalog-home" aria-labelledby="home-gifts"><div className="container section">
  <div className="section-head"><div><span className="eyebrow">SIYAG4</span><h2 id="home-gifts">{tr("Bundles & gifts","باقات وهدايا")}</h2></div></div>
  <div className="home-gift-grid">{giftSelections.map(selection=><article className="home-gift-card" key={selection.sizeMl}>
   <Link href={selection.href} className="home-gift-visual" aria-label={tr(`Choose four ${selection.sizeMl} ml perfumes`,`اختار ٤ عطور بحجم ${selection.sizeMl} مل`)}>{selection.slugs.map(slug=>{
    const product=catalog.find(p=>p.slug===slug);if(!product)return null;
    return <StoreImage key={slug} src={product.images[1]||product.images[0]} alt={name(product,lang)} width={300} height={300} sizes="(max-width:767px) 22vw,11vw" loading="lazy"/>;
   })}</Link>
   <div className="home-gift-copy"><h3>{name(selection,lang)}</h3><p>{tr("Choose 4 perfumes. Pay for just 3.","اختار ٤ عطور وهتدفع تمن ٣ بس.")}</p><p>{tr("For gifting, sharing, or finding a new favourite.","للهدايا، للمشاركة، أو لاكتشاف عطرك المفضل.")}</p><Link href={selection.href} className="text-link">{tr("Choose your four","اختار ٤ عطور")}</Link></div>
  </article>)}</div>
 </div></section>;
}

export function Home({initialProducts}:{initialProducts:Product[]}) {
  const {tr} = useStore();
  const homeRef=useRef<HTMLElement>(null);
  useEffect(()=>{const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){(entry.target as HTMLElement).dataset.revealed='true';observer.unobserve(entry.target)}},{threshold:.12});homeRef.current?.querySelectorAll('[data-reveal]').forEach(el=>observer.observe(el));return()=>observer.disconnect()},[]);
  const [products,setProducts]=useState(initialProducts);
  const [failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    const signal=AbortSignal.any([controller.signal,AbortSignal.timeout(homeCatalogPolicy.clientTimeoutMs)]);
    setFailed(false);
    api<Page<Product>>("store/products?pageSize=100",{signal}).then(data=>{
      setProducts(data.data);setFailed(data.data.some(p=>p.inventoryStatus==='unavailable'));
    }).catch(()=>{if(!controller.signal.aborted){setFailed(true);setProducts(current=>current.map(p=>({...p,inventoryStatus:'unavailable',variants:p.variants.map(v=>({...v,inStock:false}))})))}});
    return()=>controller.abort();
  },[attempt]);

  return <main className="home-experience" ref={homeRef}>
    <HomeBanners/>
    <ShopByCategory/>

    <div id="collections">
      {failed&&<div className="container"><p role="status">{tr("Availability is temporarily unavailable. Your fragrance collection is still here.","تعذّر تحديث التوفر مؤقتًا؛ تقدر تتصفح العطور.")} <button className="text-link" onClick={()=>setAttempt(value=>value+1)}>{tr("Try again","إعادة المحاولة")}</button></p></div>}
      {homeSections.map((group,index)=><HomeCollection key={group.key} group={group} catalog={products} first={index===0}/>)}
      <HomeGifts catalog={products}/>
    </div>

    <div className="home-stories container">
    <EditorialFeature tone="house" eyebrow={tr("INSIDE THE HOUSE","من عالم SIYAG")} title={tr("Find the notes that feel like you.","عطرك يبدأ من نوتة تحبّها")} copy={tr("Bright citrus, warm woods, soft amber. Discover the notes behind your next signature.","حمضيات منعشة، أخشاب دافئة ولمسات عنبر. اكتشف عالم النوتات، واقترب من العطر اللي يشبهك.")} image="/brand/fragrance-ingredients.webp" href="/about" action={tr("Discover the house","اكتشف دار SIYAG")}/>
    </div>
    <section className="home-confidence container" aria-labelledby="home-confidence-title">
    <StoreReviewsLink/>
    <nav className="home-care" aria-label={tr("Shopping assistance","مساعدة التسوق")}>
      <Link href="/track"><span className="home-care-icon"><PackageCheck aria-hidden="true"/></span><span><strong>{tr("Stay close to your order","تابع رحلة طلبك")}</strong><small>{tr("Track with your phone number","تتبّع برقم هاتفك")}</small></span></Link>
      <Link href="/contact"><span className="home-care-icon"><Search aria-hidden="true"/></span><span><strong>{tr("A little help choosing","اختيارك يهمّنا")}</strong><small>{tr("Talk to the house","تواصل مع دار SIYAG")}</small></span></Link>
    </nav>
    </section>
  </main>;
}
