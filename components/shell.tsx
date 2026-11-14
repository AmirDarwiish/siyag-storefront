"use client";

import Link from "next/link";
import {track} from "@/lib/analytics";
import {useRouter,usePathname} from "next/navigation";
import {useEffect,useRef,useState,type ReactNode} from "react";
import {ArrowDownLeft,ArrowRight,ArrowUpRight,Heart,Menu,Minus,Plus,Search,ShoppingBag,X} from "lucide-react";
import {Dialog,DialogContent,DialogTitle,DialogDescription} from "@/components/ui/dialog";
import {api,imageUrl,money,name,productUrl,variantFor,type Page,type Product,type Content,type Collection} from "@/lib/store";
import {useStore} from "./store-context";

export function Wordmark(){return <span className="wordmark"><span>SIYAG</span><small>PARFUMS</small></span>}

export function Modal({open,onOpenChange,title,description,className,placement,children}:{open:boolean;onOpenChange:(v:boolean)=>void;title:string;description?:string;className?:string;placement?:"center"|"side";children:ReactNode}){
  const {tr,dismissNotice}=useStore();
  useEffect(()=>{if(open)dismissNotice()},[open,dismissNotice]);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className={`store-modal ${className??""}`} showCloseButton={false} placement={placement??(className==="impression-modal"||className==="filter-modal"?"side":"center")}>
    <DialogTitle className="sr-only">{title}</DialogTitle><DialogDescription className="sr-only">{description??title}</DialogDescription>
    <button type="button" className="icon modal-close" aria-label={tr("Close","إغلاق")} onClick={()=>onOpenChange(false)}><X size={20}/></button>{children}
  </DialogContent></Dialog>;
}

function campaignMessage(value:string){
  try {
    const parsed=JSON.parse(value) as {description?:string;tiers?:{value:string;label:string}[];footnote?:string};
    if(parsed && typeof parsed.description==="string" && Array.isArray(parsed.tiers))
      return {description:parsed.description,tiers:parsed.tiers.slice(0,3).filter(t=>t && typeof t.value==="string" && typeof t.label==="string"),footnote:typeof parsed.footnote==="string"?parsed.footnote:""};
  } catch {}
  return {description:value,tiers:[],footnote:""};
}

function Campaign(){
  const {tr,ar,demo}=useStore();
  const [offer,setOffer]=useState<Content>();
  const [open,setOpen]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();
    let timer:ReturnType<typeof setTimeout>|undefined;
    api<Content[]>("store/content?area=campaign",{signal:controller.signal}).then(([item])=>{
      if(!item)return;
      setOffer(item);

    }).catch(()=>{});
    return()=>{controller.abort();clearTimeout(timer)};
  },[]);
  if(!offer)return null;
  const action=offer.actionUrl?.startsWith("/")&&!offer.actionUrl.startsWith("//")?offer.actionUrl:"/shop";
  const message=campaignMessage(ar?offer.textAr:offer.textEn);
  return <>
    <Link className="campaign-strip" href={action}>{ar?offer.titleAr:offer.titleEn}<ArrowUpRight size={12}/></Link>
    <Modal open={open} onOpenChange={setOpen} title={ar?offer.titleAr:offer.titleEn} className="campaign-modal">
      <Wordmark/><div className="campaign-rule"/><div className="eyebrow">{demo?tr("CAMPAIGN PREVIEW","معاينة الحملة"):tr("THE SIYAG EDIT","مختارات سياج")}</div>
      <h2>{ar?offer.titleAr:offer.titleEn}</h2><p>{message.description}</p>
      {message.tiers.length>0&&<div className="campaign-tiers">{message.tiers.map(t=><div key={t.value+t.label}><strong>{t.value}</strong><small>{t.label}</small></div>)}</div>}
      {message.footnote&&<small className="campaign-note">{message.footnote}</small>}
      <Link href={action} className="action gold" onClick={()=>setOpen(false)}>{(ar?offer.actionAr:offer.actionEn)||tr("Explore the collection","استكشف التشكيلة")}<ArrowUpRight size={16}/></Link>
    </Modal>
  </>;
}

export function Header(){
  const {tr,ar,toggleLanguage,cart,cartOpen,setCartOpen,demo}=useStore();
  const router=useRouter();
  const path=usePathname();
  const [navigationCollections,setNavigationCollections]=useState<Collection[]>([]);
  useEffect(()=>{const controller=new AbortController();api<Collection[]>("store/collections",{signal:controller.signal}).then(items=>setNavigationCollections(items.filter(item=>["bestsellers","new-arrivals"].includes(item.slug)))).catch(()=>{});return()=>controller.abort()},[]);
  const checkoutRoute=path==="/checkout"||path==="/payment/result";
  const headerRef=useRef<HTMLElement>(null);
  useEffect(()=>{const element=headerRef.current;if(!element)return;const update=()=>document.documentElement.style.setProperty("--store-header-height",`${element.getBoundingClientRect().height}px`);update();const observer=new ResizeObserver(update);observer.observe(element);return()=>{observer.disconnect();document.documentElement.style.removeProperty("--store-header-height")}},[]);
  const [search,setSearch]=useState(false);
  const [menu,setMenu]=useState(false);
  const [hidden,setHidden]=useState(false);
  useEffect(()=>{
    setHidden(false);
    if(menu||search||cartOpen||checkoutRoute)return;
    let anchor=Math.max(0,window.scrollY),frame=0;
    const update=()=>{frame=0;const y=Math.max(0,window.scrollY);const delta=y-anchor;
      const focused=headerRef.current?.contains(document.activeElement)&&document.activeElement?.matches(":focus-visible");
      if(y<80||focused){setHidden(false);anchor=y;return}
      if(Math.abs(delta)<8)return;
      setHidden(delta>0&&y>(headerRef.current?.offsetHeight??120)+80);anchor=y;
    };
    const scroll=()=>{if(!frame)frame=requestAnimationFrame(update)};
    window.addEventListener("scroll",scroll,{passive:true});
    return()=>{window.removeEventListener("scroll",scroll);cancelAnimationFrame(frame)};
  },[path,menu,search,cartOpen,checkoutRoute]);
  useEffect(()=>{document.documentElement.dataset.headerHidden=String(hidden);return()=>{delete document.documentElement.dataset.headerHidden}},[hidden]);
  const [query,setQuery]=useState("");
  const [results,setResults]=useState<Product[]>([]);
  const [searchState,setSearchState]=useState<"idle"|"loading"|"done"|"error">("idle");
  const resultsUrl="/shop?q="+encodeURIComponent(query.trim());
  useEffect(()=>{
    if(!search||query.trim().length<2)return;
    const controller=new AbortController();
    const timer=setTimeout(()=>{
      setSearchState("loading");
      api<Page<Product>>("store/products?"+new URLSearchParams({q:query.trim(),pageSize:"5"}),{signal:controller.signal})
        .then(data=>{setResults(data.data);setSearchState("done")})
        .catch(()=>{if(!controller.signal.aborted)setSearchState("error")});
    },250);
    return()=>{controller.abort();clearTimeout(timer)};
  },[query,search]);
  const quantity=cart.lines.reduce((sum,line)=>sum+line.quantity,0);
  return <header ref={headerRef} className="site-header" data-hidden={hidden} data-checkout={checkoutRoute} onFocusCapture={()=>setHidden(false)}>
    {demo&&<div className="preview-notice">{tr("PRIVATE DESIGN PREVIEW · SAMPLE PRODUCTS","معاينة خاصة · منتجات تجريبية")}</div>}
    <Campaign/>
    <div className="nav-wrap">
      <button type="button" className="icon mobile-menu" aria-label={tr("Menu","القائمة")} onClick={()=>setMenu(true)}><Menu size={22}/></button>
      <Link href="/" className="nav-brand" aria-label="SIYAG"><Wordmark/></Link>
      <nav aria-label={tr("Store navigation","تصفح المتجر")}><Link href="/shop">{tr("All fragrances","كل العطور")}</Link>{navigationCollections.map(collection=><Link key={collection.slug} href={"/shop?collection="+encodeURIComponent(collection.slug)}>{name(collection,ar?"ar":"en")}</Link>)}<Link href="/shop?collection=discovery">{tr("Discovery sizes","أحجام التجربة")}</Link>
      </nav>
      <div className="nav-tools">
        <button type="button" className="language-switch" onClick={toggleLanguage} aria-label={tr("Switch to Arabic","التبديل للإنجليزية")}>{ar?"EN":"العربية"}</button>
        <Link className="icon desktop-heart" href="/shop?saved=1" aria-label={tr("Wishlist","المفضلة")}><Heart size={19}/></Link>
        <button type="button" className="icon bag-icon" aria-label={tr(`Bag, ${quantity} items`,`الحقيبة، ${quantity} منتجات`)} onClick={()=>setCartOpen(true)}><ShoppingBag size={20}/>{quantity>0&&<span>{quantity}</span>}</button>
      </div>
    </div>
    <Modal open={menu} onOpenChange={setMenu} title={tr("Menu","القائمة")} className="nav-modal" placement="side">
      <Wordmark/>{navigationCollections.map(collection=><Link key={collection.slug} href={"/shop?collection="+encodeURIComponent(collection.slug)} onClick={()=>setMenu(false)}>{name(collection,ar?"ar":"en")}</Link>)}<Link href="/shop" onClick={()=>setMenu(false)}>{tr("Fragrances","العطور")}</Link><Link href="/shop?collection=discovery" onClick={()=>setMenu(false)}>{tr("Discovery sizes","أحجام التجربة")}</Link><Link href="/about" onClick={()=>setMenu(false)}>{tr("The house","دار SIYAG")}</Link><Link href="/shop?saved=1" onClick={()=>setMenu(false)}>{tr("Wishlist","المفضلة")}</Link><Link href="/track" onClick={()=>setMenu(false)}>{tr("Track your order","تتبّع طلبك")}</Link><Link href="/contact" onClick={()=>setMenu(false)}>{tr("Client care","خدمة العملاء")}</Link>
    </Modal>
    <div className="container header-search" onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setSearch(false)}}
      onKeyDown={event=>{if(event.key==="Escape")setSearch(false)}}>
      <form className="header-search-form" role="search" onSubmit={event=>{
        event.preventDefault();
        setSearch(false);track("search",{result:query.trim()?"submitted":"empty"});
        router.push(query.trim()?resultsUrl:"/shop");
      }}>
        <Search size={19} aria-hidden="true"/>
        <input type="search" enterKeyHint="search" maxLength={100} placeholder={tr("Search fragrances","ابحث عن عطر")}
          aria-label={tr("Search fragrances","البحث في العطور")} value={query} onFocus={()=>setSearch(true)}
          onChange={event=>{setQuery(event.target.value);setSearch(true);setResults([]);setSearchState("idle")}}/>
        <button type="submit" aria-label={tr("Search","بحث")}><ArrowRight size={19}/></button>
      </form>
      {search&&query.trim().length>=2&&<div className="header-suggestions">
        <div className="search-results" aria-live="polite">
          {(searchState==="loading"||searchState==="idle")&&<p>{tr("Searching…","جاري البحث…")}</p>}
          {searchState==="error"&&<p>{tr("Search is temporarily unavailable.","البحث غير متاح مؤقتًا.")}</p>}
          {searchState==="done"&&!results.length&&<p>{tr("No fragrances found.","لا توجد نتائج. جرّب اسم عطر آخر.")}</p>}
          {results.map(product=>{
            const variant=variantFor(product);
            return <Link key={product.id} href={productUrl(product,variant)} onClick={()=>setSearch(false)}>
              <img src={imageUrl(product.images[0])} alt=""/><span>{name(product,ar?"ar":"en")}</span>
              {variant&&<small>{money(variant.priceMinor,ar?"ar":"en")}</small>}
            </Link>;
          })}
        </div>
        {results.length>0&&<Link className="text-link" href={resultsUrl} onClick={()=>setSearch(false)}>{tr("View all results","عرض كل النتائج")}<ArrowUpRight size={14}/></Link>}
      </div>}
    </div>
  </header>;
}

export function BagContents({page=false}:{page?:boolean}){
  const {cart,setCartOpen,busy,setQuantity,tr,lang,demo,bagNotice}=useStore();
  return <div className={page?"cart-content":"bag-content"}>
    <div className="bag-heading"><div className="eyebrow">SIYAG</div>{page?<h1>{tr("Your bag","حقيبتك")}</h1>:<h2>{tr("Your bag","حقيبتك")}</h2>}<div role="status">{bagNotice&&<p className="bag-notice" data-kind={bagNotice.kind}>{bagNotice.text}</p>}</div></div>
    {!cart.lines.length?<div className="bag-empty"><ShoppingBag size={28}/><p>{tr("Your chosen fragrances will appear here.","ستظهر هنا العطور التي تضيفها إلى حقيبتك.")}</p><Link href="/shop" className="action ink" onClick={()=>setCartOpen(false)}>{tr("Explore the collection","استكشف التشكيلة")}</Link></div>:<>
      <div className="bag-lines" aria-busy={busy}>{cart.lines.map(line=><div className="bag-line" key={line.variantId}>
        <Link href={"/products/"+line.slug+"?variant="+line.variantId} onClick={()=>setCartOpen(false)}><img src={imageUrl(line.image)} alt=""/></Link>
        <div><strong>{name(line,lang)}</strong><small>{line.sizeMl} {tr("ml","مل")}</small>{!line.available&&<small className="form-error">{tr("Currently unavailable. Remove this item to continue.","غير متاح حاليًا. احذف المنتج عشان تكمل الطلب.")}</small>}
          <div className="quantity"><button type="button" disabled={busy} onClick={()=>setQuantity(line.variantId,line.quantity-1)} aria-label={tr("Decrease quantity","تقليل الكمية")}><Minus size={15}/></button><span>{line.quantity}</span><button type="button" disabled={busy||line.quantity>=20||!line.available} onClick={()=>setQuantity(line.variantId,line.quantity+1)} aria-label={tr("Increase quantity","زيادة الكمية")}><Plus size={15}/></button></div>
        </div>
        <div><strong>{money(line.quantity*line.unitPriceMinor,lang)}</strong><button className="text-link remove" type="button" disabled={busy} onClick={()=>setQuantity(line.variantId,0)}>{tr("Remove","حذف")}</button></div>
      </div>)}</div>
      <div className="bag-footer"><div className="bag-total"><span>{tr("Subtotal","المجموع الفرعي")}</span><strong>{money(cart.subtotalMinor,lang)}</strong></div>
      <p className="muted">{demo?tr("Sample products are for design review.","المنتجات التجريبية لمراجعة التصميم."):tr("Shipping and eligible offers are calculated at checkout.","تُحسب رسوم التوصيل والعروض المتاحة عند إتمام الطلب.")}</p>
      <Link href="/checkout" className="action ink" onClick={()=>setCartOpen(false)}>{demo?tr("Preview checkout","عاين إتمام الطلب"):tr("Checkout","إتمام الطلب")}<ArrowRight size={16}/></Link>
      {!page&&<Link className="text-link" href="/cart" onClick={()=>setCartOpen(false)}>{tr("View full bag","عرض الحقيبة كاملة")}</Link>}
      </div>
    </>}
  </div>;
}

export function Bag(){const {cartOpen,setCartOpen,tr}=useStore();return <Modal open={cartOpen} onOpenChange={setCartOpen} title={tr("Your bag","حقيبتك")} className="bag-modal" placement="side"><BagContents/></Modal>}
export function CartPage(){return <main className="container section cart-page"><BagContents page/></main>}

function FooterGroup({id,title,children}:{id:string;title:string;children:ReactNode}){
  return <section className="footer-group"><h3 id={id+"-title"}>{title}</h3><nav id={id} aria-labelledby={id+"-title"}>{children}</nav></section>;
}

export function Footer(){
  const {tr}=useStore();
  return <footer className="site-footer"><div className="footer-inner">
    <div className="footer-brand"><Link href="/" aria-label="SIYAG"><Wordmark/></Link><p>{tr("An Egyptian fragrance house.","دار عطور مصرية.")}</p></div>
    <FooterGroup id="footer-explore" title={tr("Explore","استكشف")}><Link href="/shop">{tr("The collection","التشكيلة")}</Link><Link href="/shop?collection=discovery">{tr("Discovery sizes","أحجام التجربة")}</Link><Link href="/about">{tr("The house of SIYAG","دار SIYAG")}</Link><Link href="/cart">{tr("Your bag","حقيبتك")}</Link></FooterGroup>
    <FooterGroup id="footer-care" title={tr("Client care","خدمة العملاء")}><Link href="/track">{tr("Track your order","تتبّع طلبك")}</Link><Link href="/reviews">{tr("Store reviews","تقييمات المتجر")}</Link><Link href="/shop?saved=1">{tr("Your wishlist","مفضلتك")}</Link><Link href="/contact">{tr("Contact us","تواصل معنا")}</Link><Link href="/faq">{tr("FAQ","الأسئلة الشائعة")}</Link></FooterGroup>
    <FooterGroup id="footer-information" title={tr("The details","المعلومات")}><Link href="/policies/shipping">{tr("Shipping & delivery","الشحن والتوصيل")}</Link><Link href="/policies/returns">{tr("Returns & refunds","الاسترجاع")}</Link><Link href="/policies/privacy">{tr("Privacy","الخصوصية")}</Link><Link href="/policies/terms">{tr("Terms","شروط التسوق")}</Link></FooterGroup>
  </div><div className="footer-end"><span>© {new Date().getFullYear()} SIYAG PARFUMS</span><span>{tr("EGYPT · EGP","مصر · جنيه مصري")}</span><button className="footer-privacy" type="button" onClick={()=>window.dispatchEvent(new Event("siyag-open-privacy"))}>{tr("Privacy preferences","إعدادات الخصوصية")}</button><button type="button" className="back-to-top" aria-label={tr("Back to top","العودة لأعلى")} onClick={()=>window.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"})}><ArrowDownLeft size={17}/></button></div></footer>;
}
