"use client";

import Link from "next/link";
import {useEffect, useRef, useState} from "react";
import {ArrowUpRight, Box, ChevronLeft, ChevronRight, FlaskConical, Sparkles} from "lucide-react";
import {api, imageUrl, name, type Collection, type Page, type Product} from "@/lib/store";
import {useStore} from "./store-context";
import {ProductCard} from "./product";

function HeroSlider() {
  const {tr, ar} = useStore();
  const [active, setActive] = useState(0);
  const touchStart = useRef<{x:number;y:number} | null>(null);
  const slides = [
    {title: tr("A scent that stays.", "عطر يسيب أثر."), label: tr("THE SIYAG COLLECTION", "تشكيلة سياج"), copy: tr("Warm woods, luminous amber and fresh citrus.", "أخشاب دافئة وعنبر وحمضيات منعشة."), image: "/brand/olive-hero.webp", href: "/shop", action: tr("Explore the collection", "استكشف التشكيلة")},
    {title: tr("Find your notes.", "اكتشف نوتاتك."), label: tr("SCENT FAMILIES", "العائلات العطرية"), copy: tr("Explore the ingredients behind each fragrance.", "تعرّف على النوتات اللي بتميّز كل عطر."), image: "/brand/olive-notes.webp", href: "/#maison", action: tr("Explore the house", "اكتشف دار سياج")},
    {title: tr("Start with a sample.", "ابدأ بعينة."), label: tr("DISCOVERY SIZES", "أحجام التجربة"), copy: tr("Try a smaller size before choosing your full bottle.", "جرّب حجم أصغر قبل ما تختار الزجاجة الكاملة."), image: "/brand/eclat.webp", href: "/shop?format=decant", action: tr("Explore discovery sizes", "شوف أحجام التجربة")},
  ];
  const slide = slides[active];
  const move = (step: number) => setActive(index => (index + step + slides.length) % slides.length);
  const PreviousIcon = ar ? ChevronRight : ChevronLeft;
  const NextIcon = ar ? ChevronLeft : ChevronRight;

  return <section className="container hero-carousel" aria-label={tr("Featured collections", "أبرز التشكيلات")} aria-roledescription="carousel">
    <div className="hero" data-slide={active}
      onTouchStart={event=>{touchStart.current={x:event.touches[0].clientX,y:event.touches[0].clientY}}}
      onTouchEnd={event=>{
        if(touchStart.current===null)return;
        const distance=event.changedTouches[0].clientX-touchStart.current.x;
        const vertical=event.changedTouches[0].clientY-touchStart.current.y;
        touchStart.current=null;
        if(Math.abs(distance)>55&&Math.abs(distance)>Math.abs(vertical))move((distance<0?1:-1)*(ar?-1:1));
      }}
      onTouchCancel={()=>{touchStart.current=null}}>
      <div className="hero-content" aria-live="polite">
        <div className="hero-kicker"><span/>{slide.label}</div>
        <h1>{slide.title}</h1>
        <p>{slide.copy}</p>
        <Link href={slide.href} className="action gold">{slide.action}<ArrowUpRight size={17}/></Link>
      </div>
      <figure className="hero-visual"><img src={slide.image} alt="" width={1280} height={960} fetchPriority={active===0?"high":"auto"}/></figure>
    </div>
    <div className="hero-controls">
      <button type="button" className="slider-arrow" aria-label={tr("Previous slide", "الشريحة السابقة")} onClick={()=>move(-1)}><PreviousIcon size={20}/></button>
      <div className="slider-dots" role="group" aria-label={tr("Choose a slide", "اختار شريحة")}>
        {slides.map((item,index)=><button type="button" key={item.href} aria-label={item.label} aria-current={active===index?"true":undefined} onClick={()=>setActive(index)}/>)}
      </div>
      <button type="button" className="slider-arrow" aria-label={tr("Next slide", "الشريحة التالية")} onClick={()=>move(1)}><NextIcon size={20}/></button>
    </div>
  </section>;
}

export function Home() {
  const {tr, lang} = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const options = {signal: controller.signal};
    api<Page<Product>>("store/products?featured=true&pageSize=4", options)
      .then(data => data.data.length ? data : api<Page<Product>>("store/products?pageSize=4", options))
      .then(data => setProducts(data.data))
      .catch(() => {});
    api<Collection[]>("store/collections", options).then(setCollections).catch(() => {});
    return () => controller.abort();
  }, []);

  const fallbackCategories = [
    {href: "/shop?format=fullBottle", title: tr("Full bottles", "الزجاجات الكاملة"), image: "/brand/noir.webp"},
    {href: "/shop?family=amber", title: tr("Amber fragrances", "عطور عنبرية"), image: "/brand/oud.webp"},
    {href: "/shop?format=decant", title: tr("Discovery sizes", "أحجام التجربة"), image: "/brand/eclat.webp"},
  ];
  const categories = collections.length
    ? collections.slice(0, 3).map((collection, index) => ({
        href: "/shop?collection=" + collection.slug,
        title: name(collection, lang),
        image: imageUrl(collection.imageUrl || fallbackCategories[index].image),
      }))
    : fallbackCategories;

  return <main>
    <HeroSlider/>

    <div className="brand-strip">
      <div><FlaskConical size={16}/>{tr("Eau de Parfum", "أو دو بارفان")}</div>
      <div><Sparkles size={16}/>{tr("Explore by fragrance family", "تسوّق حسب العائلة العطرية")}</div>
      <div><Box size={16}/>{tr("Delivery across Egypt", "توصيل داخل مصر")}</div>
    </div>

    <section className="container section collections-section" id="collections">
      <div className="section-head">
        <div>
          <span className="eyebrow">{tr("THE COLLECTIONS", "التشكيلات")}</span>
          <h2>{tr("Find your signature.", "اختار عطرك المميز.")}</h2>
        </div>
        <Link className="text-link" href="/shop">
          {tr("Explore all fragrances", "كل العطور")}<ArrowUpRight size={16}/>
        </Link>
      </div>
      <div className="collections-grid">
        {categories.map((category, index) => <Link className="collection-card" href={category.href} key={category.href}>
          <div className="collection-visual">
            <img src={category.image} alt="" width={600} height={600} loading="lazy"/>
          </div>
          <div className="collection-caption">
            <span>0{index + 1}</span>
            <h3>{category.title}</h3>
            <span className="circle-arrow"><ArrowUpRight size={19}/></span>
          </div>
        </Link>)}
      </div>
    </section>

    {products.length > 0 && <section className="catalog-home"><div className="container section">
      <div className="section-head">
        <div><span className="eyebrow">{tr("FROM THE HOUSE", "من دار سياج")}</span><h2>{tr("The SIYAG edit.", "مختارات سياج.")}</h2></div>
        <Link className="text-link" href="/shop">{tr("View the collection", "شوف التشكيلة")}<ArrowUpRight size={16}/></Link>
      </div>
      <div className="product-grid">{products.map(product => <ProductCard product={product} key={product.id}/>)}</div>
    </div></section>}

    <section className="story" id="maison">
      <img src="/brand/olive-notes.webp" alt="" width={1140} height={855} loading="lazy"/>
      <div>
        <span className="eyebrow">{tr("THE HOUSE OF SIYAG", "دار سياج")}</span>
        <h2>{tr("From the first note.", "من أول نوتة.")}</h2>
        <p>{tr("Get to know the opening, heart and base of each fragrance before choosing the one you’ll wear.", "تعرّف على افتتاحية كل عطر وقلبه وقاعدته قبل ما تختار العطر المناسب لك.")}</p>
        <Link href="/shop" className="action ink">{tr("Discover the scents", "اكتشف العطور")}<ArrowUpRight size={16}/></Link>
      </div>
    </section>
  </main>;
}
