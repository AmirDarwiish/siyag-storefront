"use client";

import Link from "next/link";
import {StoreImage} from "./store-image";
import {imageSizes} from "@/lib/image-sizes";
import {useEffect, useRef, useState} from "react";
import {PackageCheck, Search, FlaskConical} from "lucide-react";
import {api, imageUrl, name, type Collection, type Page, type Product} from "@/lib/store";
import {useStore} from "./store-context";
import {HomeProductRail} from "./home-product-rail";
import {track} from "@/lib/analytics";
import {StoreReviewsLink} from "./reviews";
import {HomeBanners} from "./home-banners";
import {ShopByCategory} from "./shop-by-category";

type FeatureProps={tone:"discovery"|"house"; eyebrow:string; title:string; copy:string; image:string; href:string; action:string};
function EditorialFeature({tone,eyebrow,title,copy,image,href,action}:FeatureProps) {
  return <section className="home-feature" data-tone={tone} aria-labelledby={`home-feature-${tone}`} data-reveal>
    <div className="home-feature-visual"><StoreImage sizes={imageSizes.half} src={image} alt="" width={1280} height={960} loading="lazy"/></div>
    <div className="home-feature-copy"><span className="eyebrow">{eyebrow}</span><h2 id={`home-feature-${tone}`}>{title}</h2><p>{copy}</p><Link href={href} className="action ink">{action}</Link></div>
  </section>;
}

function HomeCollection({collection}:{collection:Collection}) {
  const {tr,lang}=useStore();
  const [products,setProducts]=useState<Product[]>([]);
  const [status,setStatus]=useState<"loading"|"ready"|"error">("loading");
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    setStatus("loading");
    api<Page<Product>>("store/products?collection="+encodeURIComponent(collection.slug)+"&pageSize=8",{signal:controller.signal})
      .then(page=>{setProducts(page.data);setStatus("ready")})
      .catch(()=>{if(!controller.signal.aborted)setStatus("error")});
    return()=>controller.abort();
  },[collection.slug,attempt]);
  useEffect(()=>{if(products.length)track("view_item_list",{list_id:"home-"+collection.slug,items:products.map(p=>({item_id:p.variants[0]?.id??p.id,item_name:p.nameEn,item_category:p.family}))})},[products,collection.slug]);
  if(status==="ready"&&!products.length)return null;
  return <section className="catalog-home"><div className="container section">
    <div className="section-head"><div><span className="eyebrow">SIYAG</span><h2>{name(collection,lang)}</h2></div><Link className="text-link" href={"/shop?collection="+encodeURIComponent(collection.slug)}>{tr("View all","عرض الكل")}</Link></div>
    {status==="loading"?<div className="product-grid home-rail-loading" aria-busy="true" aria-label={tr("Loading fragrances","جاري تحميل العطور")}>{[1,2,3,4].map(i=><div className="skeleton" key={i}/>)}</div>:status==="error"?<p role="status">{tr("Unable to load this collection.","تعذر تحميل القسم.")} <button className="text-link" onClick={()=>setAttempt(value=>value+1)}>{tr("Try again","إعادة المحاولة")}</button></p>:<HomeProductRail products={products}/>}
  </div></section>;
}

export function Home() {
  const {tr, lang} = useStore();
  const homeRef=useRef<HTMLElement>(null);
  useEffect(()=>{const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){(entry.target as HTMLElement).dataset.revealed='true';observer.unobserve(entry.target)}},{threshold:.12});homeRef.current?.querySelectorAll('[data-reveal]').forEach(el=>observer.observe(el));return()=>observer.disconnect()},[]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,setLoading]=useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const options = {signal: controller.signal};
    api<Page<Product>>("store/products?featured=true&pageSize=4", options)
      .then(data => data.data.length ? data : api<Page<Product>>("store/products?pageSize=4", options))
      .then(data => setProducts(data.data))
      .catch(() => {}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});
    api<Collection[]>("store/collections", options).then(setCollections).catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(()=>{if(products.length)track("view_item_list",{list_id:"home-selected",items:products.map(p=>({item_id:p.variants[0]?.id??p.id,item_name:p.nameEn,item_category:p.family}))})},[products]);

  return <main className="home-experience" ref={homeRef}>
    <HomeBanners/>
    <ShopByCategory collections={collections}/>

    <div id="collections">{collections.map(collection=><HomeCollection key={collection.slug} collection={collection}/>)}</div>

    {collections.length===0 && (loading||products.length>0) && <section className="catalog-home" data-reveal><div className="container section">
      <div className="section-head">
        <div><span className="eyebrow">{tr("FROM THE HOUSE", "من دار SIYAG")}</span><h2>{tr("Meet your signature", "عطر يترك أثرًا")}</h2></div>
        <Link className="text-link" href="/shop">{tr("View the collection", "تصفّح المجموعة")}</Link>
      </div>
      <p className="home-rail-caption">{tr("Explore the notes. Choose your size. Make it yours.","اكتشف النوتات، اختر حجمك، واجعل العطر جزءًا من حكايتك.")}</p>
      {loading?<div className="product-grid home-rail-loading" aria-busy="true" aria-label={tr("Loading fragrances","جارٍ تحميل العطور")}>{[1,2,3,4].map(i=><div className="skeleton" key={i}/>)}</div>:<HomeProductRail products={products}/>}
    </div></section>}


    <div className="home-stories container">
    <EditorialFeature tone="house" eyebrow={tr("INSIDE THE HOUSE","من عالم SIYAG")} title={tr("Find the notes that feel like you.","عطرك يبدأ من نوتة تحبّها")} copy={tr("Bright citrus, warm woods, soft amber. Discover the notes behind your next signature.","حمضيات منعشة، أخشاب دافئة ولمسات عنبر. اكتشف عالم النوتات، واقترب من العطر اللي يشبهك.")} image="/brand/fragrance-ingredients.webp" href="/about" action={tr("Discover the house","اكتشف دار SIYAG")}/>
    {products.some(product=>product.variants.some(variant=>variant.format!=="fullBottle")) && <EditorialFeature tone="discovery" eyebrow={tr("THE ART OF DISCOVERY","متعة الاكتشاف")} title={tr("Try a little. Find your favourite.","جرّب على مهلك، واختار عطرك")} copy={tr("Meet your next scent in a smaller size. Wear it, live with it, and choose at your own pace.","ابدأ بحجم صغير، وعيش مع العطر يومك. أحجام التجربة تديك وقتك قبل ما تختار المفضّل.")} image="/brand/discovery-vials.webp" href="/shop?format=decant" action={tr("Explore discovery sizes","اكتشف أحجام التجربة")}/>}
    </div>
    <section className="home-confidence container" aria-labelledby="home-confidence-title">
    <StoreReviewsLink/>
    <nav className="home-care" aria-label={tr("Shopping assistance","مساعدة التسوق")}>
      <Link href="/shop?format=decant"><span className="home-care-icon"><FlaskConical aria-hidden="true"/></span><span><strong>{tr("Discover at your pace","اكتشف على مهل")}</strong><small>{tr("Explore smaller sizes","تصفّح أحجام التجربة")}</small></span></Link>
      <Link href="/track"><span className="home-care-icon"><PackageCheck aria-hidden="true"/></span><span><strong>{tr("Stay close to your order","تابع رحلة طلبك")}</strong><small>{tr("Track with your phone number","تتبّع برقم هاتفك")}</small></span></Link>
      <Link href="/contact"><span className="home-care-icon"><Search aria-hidden="true"/></span><span><strong>{tr("A little help choosing","اختيارك يهمّنا")}</strong><small>{tr("Talk to the house","تواصل مع دار SIYAG")}</small></span></Link>
    </nav>
    </section>
  </main>;
}
