"use client";

import Link from "next/link";
import {track} from "@/lib/analytics";
import {useRouter,useSearchParams} from "next/navigation";
import {useEffect,useState} from "react";
import {ArrowLeft,ArrowRight,ArrowUpRight,Heart,Search,SlidersHorizontal} from "lucide-react";
import {api,imageUrl,concentrations,families,formats,name,money,type Collection,type Page,type Product,type Content} from "@/lib/store";
import {useStore} from "./store-context";
import {ProductCard} from "./product";
import {Modal} from "./shell";
import {StoreImage} from "./store-image";
import {bannerHref} from "@/lib/banners";

type CatalogResult = {page: Page<Product>; catalogEmpty: boolean};
const filters=["q","collection","family","concentration","format","sizeMl","maxPriceMinor","inStock","sort","pageNumber"] as const;

export function Shop(){
  const {tr,ar,lang,saved}=useStore();
  const query=useSearchParams();
  const router=useRouter();
  const queryString=query.toString();
  const savedOnly=query.get("saved")==="1";
  const savedKey=saved.join("|");
  const [result,setResult]=useState<CatalogResult>();
  const [catalogAvailable,setCatalogAvailable]=useState(false);
  const [retry,setRetry]=useState(0);
  const page=result?.page;
  const [banner,setBanner]=useState<Content>();
  const [collections,setCollections]=useState<Collection[]>([]);
  const [error,setError]=useState(false);
  const [mobileFilters,setMobileFilters]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();
    api<Content[]>("store/content?area=catalog-banner",{signal:controller.signal}).then(items=>setBanner(items[0])).catch(()=>{});
    api<Collection[]>("store/collections",{signal:controller.signal}).then(setCollections).catch(()=>{});
    return()=>controller.abort();
  },[]);
  useEffect(()=>{
    const controller=new AbortController();
    const current=new URLSearchParams(queryString);
    const data=new URLSearchParams({pageSize:"12"});
    for(const key of filters){const value=current.get(key);if(value)data.set(key,value)}
    setResult(undefined);setError(false);
    const options={signal:controller.signal};
    const request=current.get("saved")==="1"
      ? Promise.allSettled(savedKey.split("|").filter(Boolean).map(slug=>api<Product>("store/products/"+encodeURIComponent(slug),options))).then(items=>{
        if(items.some(x=>x.status==="rejected"&&(!("status" in Object(x.reason))||x.reason.status!==404))) throw new Error("Wishlist unavailable");
        const data=items.flatMap(result=>result.status==="fulfilled"?[result.value]:[]);
        return {data,totalCount:data.length,totalPages:1,pageNumber:1,pageSize:data.length};
      })
      : api<Page<Product>>("store/products?"+data,options);
    request.then(async page=>{
      const narrowed=filters.some(key=>key!=="sort"&&current.has(key));
      const catalogEmpty=!savedOnly&&page.totalCount===0&&(!narrowed||
        (await api<Page<Product>>("store/products?pageSize=1",options)).totalCount===0);
      if(!controller.signal.aborted){setResult({page,catalogEmpty});if(!savedOnly)setCatalogAvailable(!catalogEmpty)}
    }).catch(()=>{if(!controller.signal.aborted)setError(true)});
    return()=>controller.abort();
  },[queryString,savedKey,savedOnly,retry]);
  useEffect(()=>{if(result?.page.data.length)track("view_item_list",{list_id:savedOnly?"wishlist":"collection",items:result.page.data.map(p=>({item_id:p.variants[0]?.id??p.id,item_name:p.nameEn,item_category:p.family}))})},[result,savedOnly]);
  const collection=collections.find(c=>c.slug===query.get("collection"));
  const term=query.get("q")?.trim();
  const title=query.get("sort")==="newest"?tr("New arrivals","وصل حديثًا"):savedOnly?tr("Your favourites","عطورك المفضّلة"):collection?name(collection,lang):term?tr("Search results","نتائج البحث"):tr("The fragrance collection","مجموعة SIYAG");
  const activeFilters=filters.filter(key=>!["sort","pageNumber"].includes(key)&&!(key==="collection"&&!term)&&query.has(key)).map(key=>{
    const value=query.get(key)!;
    const label=key==="collection"?name(collections.find(c=>c.slug===value)??{nameEn:value,nameAr:value},lang):key==="family"?(families[value]?.[ar?1:0]??value):key==="concentration"?(concentrations[value]?.[ar?1:0]??value):key==="format"?(formats[value as keyof typeof formats]?.[ar?1:0]??value):key==="sizeMl"?`${value} ${tr("ml","مل")}`:key==="maxPriceMinor"?tr(`Up to ${money(Number(value),lang)}`,`حتى ${money(Number(value),lang)}`):key==="inStock"?tr("In stock","متوفر"):value;
    return {key,label};
  });
  const hasTools=!savedOnly&&catalogAvailable&&!error;
  const status=error?"error":result?.catalogEmpty?"launch":savedOnly?"wishlist":"filtered";
  const showState=error||Boolean(page&&!page.data.length);
  function change(key:string,value:string){
    const params=new URLSearchParams(queryString);
    if(value)params.set(key,value);else params.delete(key);
    if(key!=="pageNumber")params.delete("pageNumber");
    router.replace("/shop"+(params.size?"?"+params:""),{scroll:false});
  }
  function select(key:string,label:string,options:[string,string][]){
    return <label className="filter-control">{label}<select value={query.get(key)??""} onChange={e=>change(key,e.target.value)}><option value="">{tr("All","الكل")}</option>{options.map(([value,text])=><option key={value} value={value}>{text}</option>)}</select></label>;
  }
  function filterControls(){return <><div className="filter-title"><strong>{tr("Filters","التصفية")}</strong><Link href="/shop">{tr("Reset","إعادة ضبط")}</Link></div>
          {select("collection",tr("Collection","التشكيلة"),collections.map(c=>[c.slug,name(c,lang)]))}
          {select("family",tr("Fragrance family","العائلة العطرية"),Object.entries(families).map(([k,v])=>[k,v[ar?1:0]]))}
          {select("concentration",tr("Concentration","التركيز"),Object.entries(concentrations).map(([k,v])=>[k,v[ar?1:0]]))}
          {select("format",tr("Format","نوع العبوة"),Object.entries(formats).map(([k,v])=>[k,v[ar?1:0]]))}
          <form key={query.get("sizeMl")??"size"} onSubmit={e=>{e.preventDefault();change("sizeMl",String(new FormData(e.currentTarget).get("size")||""))}}><label className="filter-control">{tr("Size in ml","الحجم بالمل")}<input type="number" name="size" min={1} defaultValue={query.get("sizeMl")??""} placeholder={tr("Any size","أي حجم")}/></label><button type="submit" className="text-link">{tr("Apply","تطبيق")}</button></form>
          <form key={query.get("maxPriceMinor")??"price"} onSubmit={e=>{e.preventDefault();const value=String(new FormData(e.currentTarget).get("price")||"");change("maxPriceMinor",value?String(Math.round(Number(value)*100)):"")}}><label className="filter-control">{tr("Maximum price · EGP","أقصى سعر · جنيه")}<input type="number" name="price" min={0} step="0.01" defaultValue={query.has("maxPriceMinor")?Number(query.get("maxPriceMinor"))/100:""} placeholder={tr("Any price","أي سعر")}/></label><button type="submit" className="text-link">{tr("Apply","تطبيق")}</button></form>
          <label className="stock-filter"><input type="checkbox" checked={query.get("inStock")==="true"} onChange={e=>change("inStock",e.target.checked?"true":"")}/>{tr("In stock only","المتوفر فقط")}</label></>}
  return <main className="shop-page">
    {savedOnly||term?<div className="shop-intro"><div className="container"><div className="crumb"><Link href="/">{tr("Home","الرئيسية")}</Link><span>/</span>{tr("The collection","التشكيلة")}</div><span className="eyebrow">SIYAG PARFUMS</span><h1>{title}</h1><p>{term?tr(`Search for “${term}”`,`البحث عن «${term}»`):savedOnly?tr("A place for the fragrances you’d like to revisit.","مساحة للعطور التي تودّ العودة إليها."):tr("Explore by scent family, concentration and size.","تصفّح العطور بحسب العائلة العطرية والتركيز والحجم.")}</p></div></div>:<h1 className="sr-only">{title}</h1>}
    <div className="container shop-content">
 {!savedOnly&&!term&&<>{banner?.imageUrl&&<section className="catalog-banner" aria-label={tr("SIYAG highlights","مختارات SIYAG")}>{bannerHref(banner.actionUrl)?<Link href={bannerHref(banner.actionUrl)!} aria-label={(ar?banner.titleAr:banner.titleEn)||tr("Explore SIYAG","اكتشف SIYAG")}><StoreImage src={imageUrl(banner.imageUrl)} alt={(ar?banner.titleAr:banner.titleEn)||"SIYAG"} width={1600} height={540} sizes="(max-width:767px) 100vw,90vw" fetchPriority="high"/></Link>:<StoreImage src={imageUrl(banner.imageUrl)} alt={(ar?banner.titleAr:banner.titleEn)||"SIYAG"} width={1600} height={540} sizes="(max-width:767px) 100vw,90vw" fetchPriority="high"/>}</section>}<nav className="catalog-links" aria-label={tr("Shop edits","أقسام المتجر")}><Link href="/shop" aria-current={!query.has("collection")?"page":undefined}>{tr("All fragrances","كل العطور")}</Link>{collections.map(collection=><Link key={collection.slug} aria-current={query.get("collection")===collection.slug?"page":undefined} href={"/shop?collection="+encodeURIComponent(collection.slug)}>{name(collection,lang)}</Link>)}</nav></>}
        {hasTools&&<div className="shop-tools">
        <div><button type="button" className="filter-toggle" onClick={()=>setMobileFilters(!mobileFilters)} aria-expanded={mobileFilters}><SlidersHorizontal size={17}/>{tr("Filters","التصفية")}</button><select className="sort-control" aria-label={tr("Sort","الترتيب")} value={query.get("sort")??""} onChange={e=>change("sort",e.target.value)}><option value="">{tr("Newest","الأحدث")}</option><option value="price-asc">{tr("Price, low to high","السعر من الأقل")}</option><option value="price-desc">{tr("Price, high to low","السعر من الأعلى")}</option></select></div>
      </div>}
      {!savedOnly&&activeFilters.length>0&&<nav className="active-filters" aria-label={tr("Active filters","التصفية الحالية")}>{activeFilters.map(({key,label})=><button type="button" key={key} aria-label={tr(`Remove filter: ${label}`,`إزالة التصفية: ${label}`)} onClick={()=>change(key,"")}><span>{label}</span><span aria-hidden="true">×</span></button>)}<Link href="/shop">{tr("Clear all","مسح الكل")}</Link></nav>}
      <div className={`shop-layout ${hasTools?"":"saved-layout"}`}>
        {hasTools&&<aside className="filters">{filterControls()}</aside>}
        <div className="shop-results" aria-live="polite">
          {!!page?.totalCount&&<p className="results-count">{page.totalCount} {tr(page.totalCount===1?"fragrance":"fragrances","عطر")}</p>}
          {showState?<CatalogNotice status={status} onRetry={()=>setRetry(value=>value+1)}/>:!page?
            <div className="product-grid" aria-busy="true">{[1,2,3].map(x=><div className="skeleton" key={x}/>)}</div>:
            <div className="product-grid">{page.data.map(p=><ProductCard key={p.id+queryString} product={p} preferred={p.variants.find(v=>(!query.get("format")||v.format===query.get("format"))&&(!query.get("sizeMl")||v.sizeMl===Number(query.get("sizeMl")))&&v.inStock)?.id}/>)}</div>}
          {page&&page.totalPages>1&&<div className="pagination"><button type="button" aria-label={tr("Previous page","الصفحة السابقة")} disabled={page.pageNumber<=1} onClick={()=>change("pageNumber",String(page.pageNumber-1))}><ArrowLeft size={17}/></button><span>{page.pageNumber} / {page.totalPages}</span><button type="button" aria-label={tr("Next page","الصفحة التالية")} disabled={page.pageNumber>=page.totalPages} onClick={()=>change("pageNumber",String(page.pageNumber+1))}><ArrowRight size={17}/></button></div>}
        </div>
      </div>
    </div>
    <Modal open={mobileFilters} onOpenChange={setMobileFilters} title={tr("Filters","التصفية")} className="filter-modal">
      <header><span className="eyebrow">SIYAG PARFUMS</span><h2>{tr("Find your fragrance","اختار عطرك")}</h2></header>
      <div className="filter-modal-body">{filterControls()}</div>
      <footer><button className="action ink" type="button" onClick={()=>setMobileFilters(false)}>{tr("Show fragrances","عرض العطور")}{page&&<span>({page.totalCount})</span>}</button></footer>
    </Modal>
  </main>;
}

function CatalogNotice({status,onRetry}:{status:"launch"|"wishlist"|"filtered"|"error";onRetry:()=>void}){
  const {tr}=useStore();
  if(status==="launch")return <article className="catalog-launch">
    <img src="/brand/olive-hero.webp" alt="" width={1280} height={960}/>
    <div>
      <span className="eyebrow">{tr("A NEW CHAPTER","فصل جديد")}</span>
      <h2>{tr("The collection is in preparation","مجموعة SIYAG قيد التحضير")}</h2>
      <p>{tr("Meet the house and discover the woods, amber and citrus that inspire our fragrances.",
        "تعرّف إلى دار SIYAG، واكتشف الأخشاب والعنبر والحمضيات التي تُلهم عطورنا.")}</p>
      <Link className="action ink" href="/#maison">{tr("Discover the house","تعرّف إلى دار SIYAG")}<ArrowUpRight size={16}/></Link>
    </div>
  </article>;

  const wishlist=status==="wishlist";
  const error=status==="error";
  return <section className="catalog-notice">
    <span className="notice-icon">{wishlist?<Heart size={23}/>:<Search size={23}/>}</span>
    <h2>{error?tr("We couldn’t load the collection","تعذّر عرض المجموعة"):
      wishlist?tr("Make this collection yours","عطورك المفضّلة، في مكان واحد"):tr("No matches for these filters","لا توجد نتائج بهذه الخيارات")}</h2>
    <p>{error?tr("Try again in a moment.","يمكنك إعادة المحاولة بعد لحظات."):
      wishlist?tr("Save a fragrance using the heart on its card. It will be here when you return.","اضغط على القلب بجانب العطر الذي يعجبك لتجده هنا عند العودة."):
      tr("Try a different fragrance name, or reset the filters to see the full collection.","جرّب اسم عطر آخر، أو أعد ضبط خيارات التصفية لعرض المجموعة كاملة.")}</p>
    {error?<button className="action ink" type="button" onClick={onRetry}>{tr("Try again","إعادة المحاولة")}</button>:
      <Link className="action ink" href="/shop">{wishlist?tr("Browse fragrances","تصفّح العطور"):tr("Reset filters","إعادة ضبط التصفية")}<ArrowUpRight size={16}/></Link>}
  </section>;
}
