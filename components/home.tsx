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

function HouseCampaign() {
  const {tr, ar}=useStore();
  return <section className="home-cover" aria-labelledby="house-campaign-title">
    <StoreImage className="home-cover-image" sizes={imageSizes.campaign} src="/brand/hero.webp" alt="" width={1536} height={1024} fetchPriority="high"/>
    <div className="home-cover-layout container"><div className="home-cover-copy" dir={ar?"rtl":"ltr"}>
      <span className="eyebrow">{tr("SIYAG · AN EGYPTIAN FRAGRANCE HOUSE", "SIYAG · دار عطور مصرية")}</span>
      <h1 id="house-campaign-title">{tr("Some things stay with you.", "بعض الحضور… لا يُنسى")}</h1>
      <p>{tr("A note. A memory. A scent that becomes your own. Discover your next signature in the world of SIYAG.", "نفحة تستوقفك. ذكرى تعود إليك. وعطر يصبح جزءًا منك. ادخل عالم SIYAG واختر حضورك القادم.")}</p>
      <div className="home-cover-actions"><Link href="/shop" className="action gold">{tr("Discover the fragrances", "اكتشف العطور")}</Link><Link href="/shop?format=decant" className="home-cover-link">{tr("Start with a discovery size", "ابدأ بحجم التجربة")}</Link></div>
    </div></div>
  </section>;
}

type FeatureProps={tone:"discovery"|"house"; eyebrow:string; title:string; copy:string; image:string; href:string; action:string; caption:string};
function EditorialFeature({tone,eyebrow,title,copy,image,href,action,caption}:FeatureProps) {
  return <section className="home-feature container" data-tone={tone} data-reveal>
    <div className="home-feature-visual"><StoreImage sizes={imageSizes.half} src={image} alt="" width={1280} height={960} loading="lazy"/></div>
    <div className="home-feature-copy"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{copy}</p><Link href={href} className="action ink">{action}</Link><span className="home-feature-caption">{caption}</span></div>
  </section>;
}

export function Home() {
  const {tr, lang} = useStore();
  const homeRef=useRef<HTMLElement>(null);
  useEffect(()=>{const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){(entry.target as HTMLElement).dataset.revealed='true';observer.unobserve(entry.target)}},{threshold:.12});homeRef.current?.querySelectorAll('[data-reveal]').forEach(el=>observer.observe(el));return()=>observer.disconnect()},[]);
  const scentFamilies=[
    {family:"fresh",title:tr("A brighter beginning","إشراقة أولى"),copy:tr("Fresh fragrances","عطور منعشة"),image:"/brand/eclat.webp"},
    {family:"woody",title:tr("Quiet confidence","حضور بلا ضجيج"),copy:tr("Woody fragrances","عطور خشبية"),image:"/brand/noir.webp"},
    {family:"oriental",title:tr("After the sun sets","حين يحل المساء"),copy:tr("Oriental fragrances","عطور شرقية"),image:"/brand/royal.webp"},
    {family:"amber",title:tr("Stay a little longer","أثر يبقى"),copy:tr("Amber fragrances","عطور عنبرية"),image:"/brand/oud.webp"},
  ];
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

  const fallbackCategories = [
    {href: "/shop?format=fullBottle", title: tr("Your signature, bottled", "عطرك، بتوقيعك"), copy:tr("Explore full bottles","اكتشف الزجاجات الكاملة"), image: "/brand/noir.webp"},
    {href: "/shop?family=amber", title: tr("The warmth of amber", "دفء العنبر"), copy:tr("A richer side of scent","طابع عطري أكثر دفئًا"), image: "/brand/oud.webp"},
    {href: "/shop?format=decant", title: tr("A first encounter", "بداية الحكاية"), copy:tr("Discover in smaller sizes","اكتشف أحجام التجربة"), image: "/brand/eclat.webp"},
  ];
  const categories = collections.length
    ? collections.slice(0, 3).map((collection, index) => ({
        href: "/shop?collection=" + encodeURIComponent(collection.slug),
        title: name(collection, lang),
        copy:tr("Explore the collection","اكتشف المجموعة"),
        image: imageUrl(collection.imageUrl || fallbackCategories[index].image),
      }))
    : [];

  return <main className="home-experience" ref={homeRef}>
    <HouseCampaign/>

    {categories.length>0 && <section className="container section home-edits" id="collections" data-reveal>
      <div className="section-head">
        <div>
          <span className="eyebrow">{tr("THE SIYAG EDIT", "مختارات SIYAG")}</span>
          <h2>{tr("A world to make your own", "عالم تختار منه ما يشبهك")}</h2>
        </div>
        <Link className="text-link" href="/shop">
          {tr("Explore all fragrances", "كل العطور")}
        </Link>
      </div>
      <div className="home-edits-grid">
        {categories.map((category) => <Link className="home-edit" href={category.href} key={category.href}>
          <div className="home-edit-visual">
            <StoreImage sizes={imageSizes.edit} src={category.image} alt="" width={600} height={600} loading="lazy"/>
          </div>
          <div className="home-edit-caption">
            <h3>{category.title}</h3><span>{category.copy}</span>
          </div>
        </Link>)}
      </div>
    </section>}

    {(loading||products.length>0) && <section className="catalog-home" data-reveal><div className="container section">
      <div className="section-head">
        <div><span className="eyebrow">{tr("FROM THE HOUSE", "من دار SIYAG")}</span><h2>{tr("Meet your signature", "عطر يترك أثرًا")}</h2></div>
        <Link className="text-link" href="/shop">{tr("View the collection", "تصفّح المجموعة")}</Link>
      </div>
      <p className="home-rail-caption">{tr("Explore the notes. Choose your size. Make it yours.","اكتشف النوتات، اختر حجمك، واجعل العطر جزءًا من حكايتك.")}</p>
      {loading?<div className="product-grid home-rail-loading" aria-busy="true" aria-label={tr("Loading fragrances","جارٍ تحميل العطور")}>{[1,2,3,4].map(i=><div className="skeleton" key={i}/>)}</div>:<HomeProductRail products={products}/>}
    </div></section>}


    <EditorialFeature tone="house" eyebrow={tr("INSIDE THE HOUSE","من عالم SIYAG")} title={tr("Before the fragrance, there is a feeling.","قبل أن يصبح عطرًا… يبدأ بإحساس")} copy={tr("The brightness of citrus. The depth of woods. The warmth that lingers. Step into the world of notes and discover a more personal way to choose your fragrance.","إشراقة الحمضيات، وعمق الأخشاب، ودفء يبقى في الذاكرة. اقترب من عالم النوتات واكتشف طريقة أكثر خصوصية لاختيار عطرك.")} image="/brand/olive-notes.webp" href="/about" action={tr("Discover the house","اكتشف دار SIYAG")} caption={tr("SIYAG PARFUMS · EGYPT","SIYAG PARFUMS · مصر")}/>
    {products.length>0 && <section className="container section home-families" data-reveal>
      <div className="section-head"><div><span className="eyebrow">{tr("A LANGUAGE OF NOTES","لغة من النوتات")}</span><h2>{tr("Every mood has a scent","لكل إحساس… عطر")}</h2></div><p>{tr("Follow the notes that draw you in.","اتبع النوتات التي تستوقفك.")}</p></div>
      <div className="home-families-grid">{scentFamilies.filter(family=>products.some(product=>product.family===family.family)).map(family=><Link href={"/shop?family="+family.family} className="home-family" key={family.family}>
        <div className="home-family-visual"><StoreImage sizes={imageSizes.family} src={imageUrl(products.find(product=>product.family===family.family)?.images[0])} alt="" width={600} height={600} loading="lazy"/></div>
        <span className="eyebrow">{family.copy}</span><h3>{family.title}</h3><span className="text-link">{tr("Discover","اكتشف")}</span>
      </Link>)}</div>
    </section>}

    {products.some(product=>product.variants.some(variant=>variant.format!=="fullBottle")) && <EditorialFeature tone="discovery" eyebrow={tr("THE ART OF DISCOVERY","متعة الاكتشاف")} title={tr("A little curiosity. A new favourite.","ابدأ بفضول… واكتشف عطرك")} copy={tr("A new scent deserves a little time. Explore the available discovery sizes and find the one you want to return to.","بعض العطور تحتاج لقاءً أقرب. اكتشف أحجام التجربة المتاحة، وامنح نفسك فرصة لتجد العطر الذي تحب العودة إليه.")} image="/brand/olive-hero.webp" href="/shop?format=decant" action={tr("Explore discovery sizes","اكتشف أحجام التجربة")} caption={tr("Available sizes and prices on each product","الأحجام والأسعار المتاحة داخل كل منتج")}/>}
    <StoreReviewsLink/>
    <nav className="home-care container" aria-label={tr("Shopping assistance","مساعدة التسوق")}>
      <Link href="/shop?format=decant"><FlaskConical aria-hidden="true"/><span><strong>{tr("Discover at your pace","اكتشف على مهل")}</strong><small>{tr("Explore smaller sizes","تصفّح أحجام التجربة")}</small></span></Link>
      <Link href="/track"><PackageCheck aria-hidden="true"/><span><strong>{tr("Stay close to your order","تابع رحلة طلبك")}</strong><small>{tr("Track with your phone number","تتبّع برقم هاتفك")}</small></span></Link>
      <Link href="/contact"><Search aria-hidden="true"/><span><strong>{tr("A little help choosing","اختيارك يهمّنا")}</strong><small>{tr("Talk to the house","تواصل مع دار SIYAG")}</small></span></Link>
    </nav>
  </main>;
}
