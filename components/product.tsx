"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {track,itemData} from "@/lib/analytics";
import {useEffect,useRef,useState} from "react";
import {ArrowUpRight,Heart,Minus,Plus,ShoppingBag} from "lucide-react";
import {Accordion,AccordionContent,AccordionItem,AccordionTrigger} from "@/components/ui/accordion";
import {api,concentrations,families,formats,imageUrl,money,name,productUrl,variantFor,type Page,type Product,type Variant} from "@/lib/store";
import {useStore} from "./store-context";
import {Modal} from "./shell";
import {Reviews} from "./reviews";
import {noteName} from "@/lib/scent-profile";
import {ScentSignature} from "./scent-signature";

function Price({variant}:{variant:Variant}){
  const {lang}=useStore();
  return <span className="price"><strong>{money(variant.priceMinor,lang)}</strong>
    {variant.compareAtMinor&&variant.compareAtMinor>variant.priceMinor?<del>{money(variant.compareAtMinor,lang)}</del>:null}
  </span>;
}

const previewProduct=(product:Product)=>product.variants.length>0&&product.variants.every(v=>v.sku.startsWith("PREVIEW-")&&!v.inStock);

function Sizes({product,selected,onSelect,compact=false}:{product:Product;selected:Variant;onSelect:(v:Variant)=>void;compact?:boolean}){
  const {ar,tr}=useStore();
  const preview=previewProduct(product);
  if(compact&&product.variants.length>3)return <select className="size-select" aria-label={tr("Choose a size","اختر الحجم")} value={selected.id}
    onChange={event=>{const choice=product.variants.find(variant=>variant.id===event.target.value);if(choice&&(preview||choice.inStock))onSelect(choice)}}>
    {product.variants.map(variant=><option key={variant.id} value={variant.id} disabled={!preview&&!variant.inStock}>{variant.sizeMl} {tr("ml","مل")} · {formats[variant.format][ar?1:0]}</option>)}
  </select>;
  return <div className="sizes" role="group" aria-label={tr("Choose a size","اختر الحجم")}>
    {product.variants.map(v=><button type="button" aria-pressed={v.id===selected.id}
      disabled={!preview&&!v.inStock} title={formats[v.format][ar?1:0]} key={v.id} onClick={()=>{track("select_variant",itemData(product,v));onSelect(v)}}>
      {v.sizeMl} {tr("ml","مل")}{product.variants.some(other=>other.id!==v.id&&other.sizeMl===v.sizeMl)?<small>{formats[v.format][ar?1:0]}</small>:null}
    </button>)}
  </div>;
}

export function ProductCard({product,preferred}:{product:Product;preferred?:string}){
  const {lang,ar,tr,pendingVariants,add,saved,toggleSaved}=useStore();
  const busy=product.variants.some(v=>pendingVariants.includes(v.id));
  const initial=variantFor(product,preferred);
  const [selection,setSelection]=useState(initial?.id);
  const [quick,setQuick]=useState(false);
  const v=variantFor(product,selection);
  if(!v)return null;
  const title=name(product,lang);
  const preview=previewProduct(product);
  const availability=preview?tr("For preview only","للمعاينة فقط"):tr("Sold out","نفد المخزون");
  const liked=saved.includes(product.slug);
  return <article className="product-card">
    <div className="product-visual">
      <Link onClick={()=>track("select_item",itemData(product,v))} href={productUrl(product,v)} className="product-photo" aria-label={title}>
        <img src={imageUrl(product.images[0])} alt={title} loading="lazy" width={520} height={560}/>
        {product.images[1]&&<img className="product-hover" src={imageUrl(product.images[1])} alt="" loading="lazy" width={520} height={560}/>}
      </Link>
      <div className="product-labels">{!v.inStock?<span className="product-badge" data-state="unavailable">{availability}</span>:(v.compareAtMinor??0)>v.priceMinor?<span className="product-badge" data-state="sale"><strong>{tr(`${Math.round((1-v.priceMinor/v.compareAtMinor!)*100)}% off`,`خصم ${Math.round((1-v.priceMinor/v.compareAtMinor!)*100)}٪`)}</strong></span>:product.featured?<span className="product-badge" data-state="featured">{tr('SIYAG edit','مختاراتنا')}</span>:null}</div>
      <button type="button" className="icon favorite" aria-pressed={liked} aria-label={liked?tr("Remove from wishlist","إزالة من المفضلة"):tr("Save to wishlist","حفظ في المفضلة")} onClick={()=>toggleSaved(product.slug)}><Heart size={17} fill={liked?"currentColor":"none"}/></button>
      {(preview||v.inStock)&&<button type="button" className="photo-quick" onClick={()=>setQuick(true)}>{tr("Quick view","عرض سريع")}</button>}
    </div>
    <div className="product-card-body">
      <div className="product-meta"><span className="family-tag" data-family={product.family}>{families[product.family]?.[ar?1:0]??product.family}</span><span>{concentrations[product.concentration]?.[ar?1:0]??product.concentration}</span></div>
      <div className="product-title"><Link onClick={()=>track("select_item",itemData(product,v))} href={productUrl(product,v)}>{title}</Link><Price variant={v}/></div>
      <p className="product-card-notes">{(product.topNotes.length?product.topNotes.slice(0,3).map(note=>noteName(note,ar)).join(" · "):(ar?product.descriptionAr:product.descriptionEn))||" "}</p>
      <div className="card-options">
        <span>{tr("Choose a size","اختر الحجم")}</span>
        <Sizes product={product} selected={v} onSelect={choice=>setSelection(choice.id)} compact/>
      </div>
      <button className="card-add" type="button" aria-busy={busy} disabled={busy||!v.inStock} onClick={()=>add(product,v,1)}><ShoppingBag size={15}/>{busy?tr("Adding…","جاري الإضافة…"):v.inStock?tr("Add to bag","أضف للحقيبة"):availability}</button>
    </div>
    <Modal open={quick} onOpenChange={setQuick} title={title} className="quick-modal">
      <img className="quick-image" src={imageUrl(product.images[0])} alt={title}/>
      <div className="quick-copy"><div className="eyebrow">SIYAG PARFUMS</div><h2>{title}</h2><Price variant={v}/>
        <p>{ar?product.descriptionAr:product.descriptionEn}</p>
        <Sizes product={product} selected={v} onSelect={choice=>setSelection(choice.id)}/>
        <button className="action ink" type="button" aria-busy={busy} disabled={busy||!v.inStock} onClick={async()=>{setQuick(false);await add(product,v,1)}}><ShoppingBag size={16}/>{busy?tr("Adding…","جاري الإضافة…"):v.inStock?tr("Add to bag","أضف للحقيبة"):availability}</button>
        <Link className="text-link" href={productUrl(product,v)} onClick={()=>setQuick(false)}>{tr("View fragrance details","تفاصيل العطر")}<ArrowUpRight size={15}/></Link>
      </div>
    </Modal>
  </article>;
}

export function ProductDetail({product,variantId}:{product:Product;variantId?:string}){
  const {tr,ar,lang,add,buyNow,pendingVariants,saved,toggleSaved}=useStore();
  const busy=product.variants.some(v=>pendingVariants.includes(v.id));
  const router=useRouter();
  async function express(){if(v&&await buyNow(product,v,quantity))router.push("/checkout?express=1")}
  useEffect(()=>{const selected=variantFor(product,variantId);if(selected)track("view_item",itemData(product,selected))},[product,variantId]);
  const initial=variantFor(product,variantId);
  const [selection,setSelection]=useState(initial?.id);
  const [activeImage,setActiveImage]=useState(0);
  const [quantity,setQuantity]=useState(1);
  const [sticky,setSticky]=useState(true);
  const [related,setRelated]=useState<Product[]>([]);
  const buy=useRef<HTMLButtonElement>(null);
  const v=variantFor(product,selection);
  useEffect(()=>{
    if(!buy.current)return;
    const observer=new IntersectionObserver(([entry])=>setSticky(entry.intersectionRatio<.98),{threshold:[0,1],rootMargin:"0px 0px -12px 0px"});
    observer.observe(buy.current);
    return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    const controller=new AbortController();
    const options={signal:controller.signal};
    api<Page<Product>>("store/products?"+new URLSearchParams({family:product.family,pageSize:"5"}),options)
      .then(async data=>{
        const matches=data.data.filter(p=>p.id!==product.id);
        if(matches.length||!product.collections.length)return matches;
        const collection=new URLSearchParams({collection:product.collections[0],pageSize:"5"});
        return (await api<Page<Product>>("store/products?"+collection,options)).data.filter(p=>p.id!==product.id);
      }).then(matches=>setRelated(matches.slice(0,4))).catch(()=>{});
    return()=>controller.abort();
  },[product.family,product.id,product.collections]);
  if(!v)return null;
  const title=name(product,lang);
  const preview=previewProduct(product);
  const availability=preview?tr("For preview only","للمعاينة فقط"):tr("Sold out","نفد المخزون");
  function choose(value:Variant){
    setSelection(value.id);
    const url=new URL(window.location.href);
    url.searchParams.set("variant",value.id);
    window.history.replaceState(window.history.state,"",url);
  }
  return <main className="product-detail-main">
    <div className="container product-page">
      <div className="crumb"><Link href="/">{tr("Home","الرئيسية")}</Link><span>/</span><Link href="/shop">{tr("Fragrances","العطور")}</Link><span>/</span><span>{title}</span></div>
      <div className="product-layout">
        <div className="gallery">
          <div className="gallery-main"><img src={imageUrl(product.images[activeImage])} alt={title} width={800} height={840} fetchPriority="high"/></div>
          {product.images.length>1&&<div className="gallery-thumbs">{product.images.map((src,i)=><button type="button" key={src+i} aria-pressed={i===activeImage} aria-label={tr(`Show image ${i+1}`,`اعرض صورة ${i+1}`)} onClick={()=>setActiveImage(i)}><img src={imageUrl(src)} alt="" width={64} height={70}/></button>)}</div>}
        </div>
        <div className="product-info">
          <div className="eyebrow">SIYAG PARFUMS</div><h1>{title}</h1>
          <div className="product-detail-meta">{concentrations[product.concentration]?.[ar?1:0]} <span>·</span> {families[product.family]?.[ar?1:0]}</div>
          <Price variant={v}/>
          <p>{ar?product.descriptionAr:product.descriptionEn}</p>
          <div className="buy-zone">
            <div className="variant-label">{tr("Select size","اختر الحجم")} <span>{formats[v.format][ar?1:0]}</span></div>
            <Sizes product={product} selected={v} onSelect={choose}/>
            {v.format!=="fullBottle"&&<p className="muted">{tr("A smaller format for discovering the fragrance.","حجم أصغر لتجربة العطر.")}</p>}
            <div className="buy-row">
              <div className="quantity"><button type="button" aria-label={tr("Decrease quantity","تقليل الكمية")} disabled={quantity===1} onClick={()=>setQuantity(quantity-1)}><Minus size={16}/></button><span>{quantity}</span><button type="button" aria-label={tr("Increase quantity","زيادة الكمية")} disabled={quantity===20} onClick={()=>setQuantity(quantity+1)}><Plus size={16}/></button></div>
              <button ref={buy} type="button" className="action ink" aria-busy={busy} disabled={busy||!v.inStock} onClick={()=>add(product,v,quantity)}><ShoppingBag size={17}/>{busy?tr("Adding…","جاري الإضافة…"):v.inStock?tr("Add to bag","أضف إلى الحقيبة"):availability}</button>
              <button type="button" className="icon detail-heart" aria-label={tr("Toggle wishlist","تغيير حالة المفضلة")} aria-pressed={saved.includes(product.slug)} onClick={()=>toggleSaved(product.slug)}><Heart size={20} fill={saved.includes(product.slug)?"currentColor":"none"}/></button>
            </div>
            <button type="button" className="action buy-now" aria-busy={busy} disabled={busy||!v.inStock} onClick={express}>{busy?tr("Please wait…","لحظة…"):tr("Buy now","اشتري الآن")}<ArrowUpRight size={17}/></button>
            <p className="purchase-note">{tr("Guest checkout · delivery calculated before you order","اطلب بدون حساب · تكلفة التوصيل بتظهر قبل التأكيد")}</p>
          </div>
          <Accordion type="multiple" className="product-accordion">
            <AccordionItem value="shipping"><AccordionTrigger>{tr("Shipping & delivery","الشحن والتوصيل")}</AccordionTrigger><AccordionContent>{tr("Available delivery options and charges are shown at checkout for your governorate.","خيارات التوصيل وتكلفته بتظهر عند إتمام الطلب حسب محافظتك.")}</AccordionContent></AccordionItem>
            <AccordionItem value="returns"><AccordionTrigger>{tr("Returns","الاسترجاع")}</AccordionTrigger><AccordionContent>{tr("Review the returns information, then use your secure receipt to request a review when eligible.","راجع معلومات الاسترجاع، واستخدم إيصالك الآمن لطلب المراجعة لو الطلب مؤهل.")}<Link className="text-link" href="/policies/returns">{tr("Returns information","معلومات الاسترجاع")}</Link></AccordionContent></AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
    <ScentSignature key={product.slug+"-signature"} product={product}/>
    <Reviews key={product.slug} product={product.slug}/>
    {related.length>0&&<section className="container section"><div className="section-head"><div><span className="eyebrow">SIYAG PARFUMS</span><h2>{tr("Explore related fragrances","اكتشف عطور ذات طابع مشابه")}</h2></div></div><div className="product-grid">{related.map(p=><ProductCard key={p.id} product={p}/>)}</div></section>}
    {sticky&&<section className="product-purchase-dock" aria-label={tr("Purchase options","خيارات الشراء")}>
      <div className="dock-selection"><strong>{title}</strong><small>{v.sizeMl} {tr("ml","مل")} · {money(v.priceMinor,lang)}</small></div>
      <button type="button" className="dock-add" aria-busy={busy} disabled={busy||!v.inStock} onClick={()=>add(product,v,quantity)}><ShoppingBag size={16}/>{busy?tr("Adding…","جاري الإضافة…"):v.inStock?tr("Add to bag","أضف للحقيبة"):availability}</button>
      {v.inStock&&<button type="button" className="dock-buy" disabled={busy} onClick={express}>{tr("Buy now","اشتري الآن")}<ArrowUpRight size={15}/></button>}
    </section>}
  </main>;
}
