"use client";

import Link from "next/link";
import {useEffect, useRef, useState} from "react";
import {Sun, Leaf, Flower2, Moon} from "lucide-react";
import {api, imageUrl, name, type Collection, type Page, type Product} from "@/lib/store";
import {useStore} from "./store-context";
import {ProductCard} from "./product";
import {StoreReviewsLink} from "./reviews";

function HeroSlider() {
  const {tr, ar} = useStore();
  const [active, setActive] = useState(0);
  const [playing,setPlaying]=useState(false);
  const [interacting,setInteracting]=useState(false);
  useEffect(()=>{const reduced=matchMedia('(prefers-reduced-motion: reduce)');setPlaying(!reduced.matches);const change=()=>setPlaying(!reduced.matches);reduced.addEventListener('change',change);return()=>reduced.removeEventListener('change',change)},[]);
  useEffect(()=>{if(!playing||interacting)return;const tick=setInterval(()=>{if(document.visibilityState==='visible')setActive(index=>(index+1)%3)},6500);return()=>clearInterval(tick)},[playing,interacting,active]);
  const touchStart = useRef<{x:number;y:number} | null>(null);
  const slides = [
    {title: tr("Make it your signature", "حضور يشبهك"), label: tr("THE SIYAG COLLECTION", "تشكيلة SIYAG"), copy: tr("Find the scent that feels like you. Then make it yours.", "من أول انطباع لآخر أثر… اختار العطر اللي يعبّر عنك."), image: "/brand/olive-hero.webp", href: "/shop", action: tr("Explore the collection", "استكشف التشكيلة")},
    {title: tr("The notes behind the scent", "ما وراء الرائحة"), label: tr("SCENT FAMILIES", "العائلات العطرية"), copy: tr("Explore the ingredients behind each fragrance.", "تعرّف إلى النوتات التي تمنح كل عطر طابعه."), image: "/brand/olive-notes.webp", href: "/#maison", action: tr("Explore the house", "اكتشف دار SIYAG")},
    {title: tr("Discover in smaller sizes", "اكتشف العطر بحجم أصغر"), label: tr("DISCOVERY SIZES", "أحجام التجربة"), copy: tr("Try a smaller size before choosing your full bottle.", "تجربة تتيح لك اختيار عطرك قبل اقتناء الزجاجة الكاملة."), image: "/brand/eclat.webp", href: "/shop?format=decant", action: tr("Explore discovery sizes", "استكشف أحجام التجربة")},
  ];
  const slide = slides[active];
  const move = (step: number) => {setPlaying(false);setActive(index => (index + step + slides.length) % slides.length)};

  return <section className="container hero-carousel" data-slide={active} aria-label={tr("Featured collections", "أبرز التشكيلات")} aria-roledescription="carousel" data-playing={playing&&!interacting} onMouseEnter={()=>setInteracting(true)} onMouseLeave={()=>setInteracting(false)} onFocusCapture={()=>setInteracting(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setInteracting(false)}}>
    <div className="hero"
      onTouchStart={event=>{touchStart.current={x:event.touches[0].clientX,y:event.touches[0].clientY}}}
      onTouchEnd={event=>{
        if(touchStart.current===null)return;
        const distance=event.changedTouches[0].clientX-touchStart.current.x;
        const vertical=event.changedTouches[0].clientY-touchStart.current.y;
        touchStart.current=null;
        if(Math.abs(distance)>55&&Math.abs(distance)>Math.abs(vertical))move((distance<0?1:-1)*(ar?-1:1));
      }}
      onTouchCancel={()=>{touchStart.current=null}}>
      <figure className="hero-visual" key={slide.image}><img src={slide.image} alt="" width={1280} height={960} fetchPriority={active===0?"high":"auto"}/></figure>
      <div className="hero-content" key={slide.title} aria-live={playing?"off":"polite"}>
        <div className="hero-kicker"><span/>{slide.label}</div>
        <span className="hero-edition">{tr("AN EGYPTIAN FRAGRANCE HOUSE", "دار عطور مصرية")}</span><h1>{slide.title}</h1>
        <p>{slide.copy}</p>
        <Link href={slide.href} className="action gold">{slide.action}</Link>
      </div>
    </div>

  </section>;
}

export function Home() {
  const {tr, lang} = useStore();
  const homeRef=useRef<HTMLElement>(null);
  useEffect(()=>{const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){(entry.target as HTMLElement).dataset.revealed='true';observer.unobserve(entry.target)}},{threshold:.12});homeRef.current?.querySelectorAll('[data-reveal]').forEach(el=>observer.observe(el));return()=>observer.disconnect()},[]);
  const moods=[{family:'fresh',title:tr('A fresh start','بداية منعشة'),copy:tr('Citrus & light','حمضيات وانتعاش'),icon:Sun},{family:'woody',title:tr('A deeper side','عمق مختلف'),copy:tr('Woods & character','أخشاب بطابع خاص'),icon:Leaf},{family:'floral',title:tr('A softer touch','لمسة ناعمة'),copy:tr('Petals & elegance','زهور وأناقة'),icon:Flower2},{family:'amber',title:tr('A little warmth','دفء أقرب'),copy:tr('Amber & spice','عنبر وتوابل'),icon:Moon}];
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

  return <main className="home-experience" ref={homeRef}>
    <HeroSlider/>

    <nav className="scent-shortcuts container" aria-label={tr('Discover your scent','اكتشف طابعك')}>{moods.map(({family,title,icon:Icon})=><Link href={'/shop?family='+family} key={family}><Icon size={18} strokeWidth={1.3}/>{title}</Link>)}</nav>
    <section className="container section collections-section" id="collections" data-reveal>
      <div className="section-head">
        <div>
          <span className="eyebrow">{tr("SIYAG PARFUMS", "دار SIYAG للعطور")}</span>
          <h2>{tr("Find your next obsession", "كل عطر… حكاية")}</h2>
        </div>
        <Link className="text-link" href="/shop">
          {tr("Explore all fragrances", "كل العطور")}
        </Link>
      </div>
      <div className="collections-grid home-collection-mosaic">
        {categories.map((category, index) => <Link className="collection-card" href={category.href} key={category.href}>
          <div className="collection-visual">
            <img src={category.image} alt="" width={600} height={600} loading="lazy"/>
          </div>
          <div className="collection-caption">
            <span className="collection-index">THE SIYAG EDIT / 0{index + 1}</span>
            <h3>{category.title}</h3>
          </div>
        </Link>)}
      </div>
    </section>

    {(loading||products.length>0) && <section className="catalog-home" data-reveal><div className="container section">
      <div className="section-head">
        <div><span className="eyebrow">{tr("FROM THE HOUSE", "من دار SIYAG")}</span><h2>{tr("Meet your signature", "ممكن يكون ده عطرك")}</h2></div>
        <Link className="text-link" href="/shop">{tr("View the collection", "تصفّح المجموعة")}</Link>
      </div>
      <p className="home-rail-caption">{tr('A scent for every side of you.','لكل جانب فيك… عطر.')}</p>
      <div className="product-grid home-product-rail" tabIndex={0} aria-label={tr("Selected fragrances","مختارات العطور")} aria-busy={loading}>{loading?[1,2,3,4].map(i=><div className="skeleton" key={i}/>):products.map(product => <ProductCard product={product} key={product.id}/>)}</div>
    </div></section>}

    <section className="scent-pathways container section" data-reveal><div className="section-head"><div><span className="eyebrow">{tr('FOLLOW YOUR INSTINCT','اتبع إحساسك')}</span><h2>{tr('What’s your mood?','مزاجك إيه النهارده؟')}</h2></div><p>{tr('Explore a different side of scent.','اكتشف جانب جديد من عالم العطور.')}</p></div><div className="mood-grid">{moods.map(({family,title,copy,icon:Icon},index)=><Link href={'/shop?family='+family} className="mood-card" data-family={family} key={family}><span className="mood-number">0{index+1}</span><Icon size={38} strokeWidth={1}/><h3>{title}</h3><p>{copy}</p><span className="mood-action">{tr('Explore','اكتشف')}</span></Link>)}</div></section>
    <section className="story" id="maison" data-reveal>
      <img src="/brand/olive-notes.webp" alt="" width={1140} height={855} loading="lazy"/>
      <div>
        <span className="eyebrow">{tr("THE HOUSE OF SIYAG", "دار SIYAG")}</span>
        <h2>{tr("More than a fragrance. A feeling.", "مش مجرد عطر… إحساس")}</h2>
        <p>{tr("A fragrance unfolds in stages. Citrus is often the first impression, followed by the heart and the woods that linger on skin.", "يتكشّف العطر على مراحل. تبدأ الحمضيات غالبًا، ثم يظهر قلب العطر، وتبقى الأخشاب على البشرة.")}</p>
        <Link href="/shop" className="action ink">{tr("Discover the scents", "اكتشف العطور")}</Link>
      </div>
    </section>
    <StoreReviewsLink/>
  </main>;
}
