"use client";

import Link from "next/link";
import {useRouter,useSearchParams} from "next/navigation";
import {useEffect,useState} from "react";
import {ArrowLeft,ArrowRight,Search,SlidersHorizontal} from "lucide-react";
import {api,concentrations,families,formats,name,type Collection,type Page,type Product} from "@/lib/store";
import {useStore} from "./store-context";
import {ProductCard} from "./product";

const filters=["q","collection","family","concentration","format","sizeMl","maxPriceMinor","inStock","sort","pageNumber"] as const;

export function Shop(){
  const {tr,ar,lang,saved}=useStore();
  const query=useSearchParams();
  const router=useRouter();
  const queryString=query.toString();
  const savedOnly=query.get("saved")==="1";
  const savedKey=saved.join("|");
  const [page,setPage]=useState<Page<Product>>();
  const [collections,setCollections]=useState<Collection[]>([]);
  const [error,setError]=useState(false);
  const [mobileFilters,setMobileFilters]=useState(false);
  const [search,setSearch]=useState(query.get("q")??"");
  useEffect(()=>setSearch(new URLSearchParams(queryString).get("q")??""),[queryString]);
  useEffect(()=>{
    const controller=new AbortController();
    api<Collection[]>("store/collections",{signal:controller.signal}).then(setCollections).catch(()=>{});
    return()=>controller.abort();
  },[]);
  useEffect(()=>{
    const controller=new AbortController();
    const current=new URLSearchParams(queryString);
    const data=new URLSearchParams({pageSize:"12"});
    for(const key of filters){const value=current.get(key);if(value)data.set(key,value)}
    setPage(undefined);setError(false);
    const options={signal:controller.signal};
    const request=current.get("saved")==="1"
      ? Promise.allSettled(savedKey.split("|").filter(Boolean).map(slug=>api<Product>("store/products/"+encodeURIComponent(slug),options))).then(items=>{
        if(items.some(x=>x.status==="rejected"&&(!("status" in Object(x.reason))||x.reason.status!==404))) throw new Error("Wishlist unavailable");
        const data=items.flatMap(result=>result.status==="fulfilled"?[result.value]:[]);
        return {data,totalCount:data.length,totalPages:1,pageNumber:1,pageSize:data.length};
      })
      : api<Page<Product>>("store/products?"+data,options);
    request.then(result=>{if(!controller.signal.aborted)setPage(result)}).catch(()=>{if(!controller.signal.aborted)setError(true)});
    return()=>controller.abort();
  },[queryString,savedKey]);
  const collection=collections.find(c=>c.slug===query.get("collection"));
  const title=savedOnly?tr("Your wishlist.","مفضلتك."):collection?name(collection,lang):tr("The collection.","تشكيلة سياج.");
  function change(key:string,value:string){
    const params=new URLSearchParams(queryString);
    if(value)params.set(key,value);else params.delete(key);
    if(key!=="pageNumber")params.delete("pageNumber");
    router.replace("/shop"+(params.size?"?"+params:""),{scroll:false});
  }
  function select(key:string,label:string,options:[string,string][]){
    return <label className="filter-control">{label}<select value={query.get(key)??""} onChange={e=>change(key,e.target.value)}><option value="">{tr("All","الكل")}</option>{options.map(([value,text])=><option key={value} value={value}>{text}</option>)}</select></label>;
  }
  return <main className="shop-page">
    <div className="shop-intro"><div className="container"><div className="crumb"><Link href="/">{tr("Home","الرئيسية")}</Link><span>/</span>{tr("The collection","التشكيلة")}</div><span className="eyebrow">SIYAG PARFUMS</span><h1>{title}</h1><p>{tr("Explore by scent, concentration and size.","اختار حسب العائلة العطرية والتركيز والحجم.")}</p></div></div>
    <div className="container shop-content">
      {!savedOnly&&<div className="shop-tools">
        <form onSubmit={e=>{e.preventDefault();change("q",search.trim())}}><label className="search-field"><Search size={18}/><input type="search" value={search} onChange={e=>setSearch(e.target.value)} maxLength={100} placeholder={tr("Search the collection","ابحث في التشكيلة")} aria-label={tr("Search the collection","ابحث في التشكيلة")}/></label></form>
        <div><button type="button" className="filter-toggle" onClick={()=>setMobileFilters(!mobileFilters)} aria-expanded={mobileFilters}><SlidersHorizontal size={17}/>{tr("Filters","الفلاتر")}</button><select className="sort-control" aria-label={tr("Sort","الترتيب")} value={query.get("sort")??""} onChange={e=>change("sort",e.target.value)}><option value="">{tr("Newest","الأحدث")}</option><option value="price-asc">{tr("Price, low to high","السعر من الأقل")}</option><option value="price-desc">{tr("Price, high to low","السعر من الأعلى")}</option></select></div>
      </div>}
      <div className={`shop-layout ${savedOnly?"saved-layout":""}`}>
        {!savedOnly&&<aside className={`filters ${mobileFilters?"filters-open":""}`}><div className="filter-title"><strong>{tr("Filters","الفلاتر")}</strong><Link href="/shop">{tr("Clear","مسح")}</Link></div>
          {select("collection",tr("Collection","التشكيلة"),collections.map(c=>[c.slug,name(c,lang)]))}
          {select("family",tr("Fragrance family","العائلة العطرية"),Object.entries(families).map(([k,v])=>[k,v[ar?1:0]]))}
          {select("concentration",tr("Concentration","التركيز"),Object.entries(concentrations).map(([k,v])=>[k,v[ar?1:0]]))}
          {select("format",tr("Format","نوع العبوة"),Object.entries(formats).map(([k,v])=>[k,v[ar?1:0]]))}
          <form key={query.get("sizeMl")??"size"} onSubmit={e=>{e.preventDefault();change("sizeMl",String(new FormData(e.currentTarget).get("size")||""))}}><label className="filter-control">{tr("Size in ml","الحجم بالمل")}<input type="number" name="size" min={1} defaultValue={query.get("sizeMl")??""} placeholder={tr("Any size","أي حجم")}/></label><button type="submit" className="text-link">{tr("Apply","تطبيق")}</button></form>
          <form key={query.get("maxPriceMinor")??"price"} onSubmit={e=>{e.preventDefault();const value=String(new FormData(e.currentTarget).get("price")||"");change("maxPriceMinor",value?String(Math.round(Number(value)*100)):"")}}><label className="filter-control">{tr("Maximum price · EGP","أقصى سعر · جنيه")}<input type="number" name="price" min={0} step="0.01" defaultValue={query.has("maxPriceMinor")?Number(query.get("maxPriceMinor"))/100:""} placeholder={tr("Any price","أي سعر")}/></label><button type="submit" className="text-link">{tr("Apply","تطبيق")}</button></form>
          <label className="stock-filter"><input type="checkbox" checked={query.get("inStock")==="true"} onChange={e=>change("inStock",e.target.checked?"true":"")}/>{tr("In stock only","المتوفر فقط")}</label>
        </aside>}
        <div className="shop-results" aria-live="polite">
          {page&&<p className="results-count">{page.totalCount} {tr("fragrances","عطر")}</p>}
          {error?<p className="empty-state">{tr("The collection is temporarily unavailable. Refresh to try again.","التشكيلة غير متاحة مؤقتًا. جرّب تحديث الصفحة.")}</p>:!page?<div className="product-grid">{[1,2,3].map(x=><div className="skeleton" key={x}/>)}</div>:!page.data.length?
            <div className="empty-state">{tr("No fragrances found.","مفيش عطور مطابقة.")} <Link href="/shop" className="text-link">{tr("Explore all","اعرض الكل")}</Link></div>:
            <div className="product-grid">{page.data.map(p=><ProductCard key={p.id+queryString} product={p} preferred={p.variants.find(v=>(!query.get("format")||v.format===query.get("format"))&&(!query.get("sizeMl")||v.sizeMl===Number(query.get("sizeMl")))&&v.inStock)?.id}/>)}</div>}
          {page&&page.totalPages>1&&<div className="pagination"><button type="button" aria-label={tr("Previous page","الصفحة السابقة")} disabled={page.pageNumber<=1} onClick={()=>change("pageNumber",String(page.pageNumber-1))}><ArrowLeft size={17}/></button><span>{page.pageNumber} / {page.totalPages}</span><button type="button" aria-label={tr("Next page","الصفحة التالية")} disabled={page.pageNumber>=page.totalPages} onClick={()=>change("pageNumber",String(page.pageNumber+1))}><ArrowRight size={17}/></button></div>}
        </div>
      </div>
    </div>
  </main>;
}
