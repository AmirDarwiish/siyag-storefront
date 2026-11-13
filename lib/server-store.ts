import { demoProducts, collections } from "./fixtures";
import type { Product, Page } from "./store";

export const DEMO = process.env.SIYAG_DEMO === "1" ||
  (process.env.SIYAG_DEMO === undefined && process.env.VERCEL_ENV === "preview");
const origin = process.env.SIYAG_API_ORIGIN || "https://siyag.runasp.net";

export async function requestStore(path:string, query="", init?:RequestInit) {
  const base = new URL(origin);
  const url = new URL(path, base.origin);
  url.search = query;
  return fetch(url,{...init,cache:"no-store",signal:AbortSignal.timeout(12000),redirect:"error"});
}

export function demoGet(path:string, query:URLSearchParams) {
  if(path==="store/products") {
    const q=query.get("q")?.toLowerCase().normalize("NFD").replace(/\p{M}/gu,"");
    const list=demoProducts.filter(product=>
      (!q || [product.nameEn,product.nameAr,product.descriptionEn].some(x=>x.toLowerCase().normalize("NFD").replace(/\p{M}/gu,"").includes(q))) &&
      (query.get("featured")!=="true"||product.featured) &&
      (!query.get("collection") || product.collections.includes(query.get("collection")!)) &&
      (!query.get("family") || product.family===query.get("family")) &&
      (!query.get("concentration") || product.concentration===query.get("concentration")) &&
      product.variants.some(v=>(!query.get("format")||v.format===query.get("format"))&&
        (!query.get("sizeMl")||v.sizeMl===Number(query.get("sizeMl")))&&
        (!query.get("inStock")||v.inStock)&&(!query.get("maxPriceMinor")||v.priceMinor<=Number(query.get("maxPriceMinor"))))
    );
    const sort=query.get("sort");
    if(sort==="price-asc"||sort==="price-desc") list.sort((a,b)=>(a.variants[0].priceMinor-b.variants[0].priceMinor)*(sort==="price-asc"?1:-1));
    const pageNumber=Math.max(1,Number(query.get("pageNumber"))||1);
    const pageSize=Math.max(1,Math.min(100,Number(query.get("pageSize"))||12));
    return {data:list.slice((pageNumber-1)*pageSize,pageNumber*pageSize),totalCount:list.length,pageNumber,pageSize,totalPages:Math.ceil(list.length/pageSize)} satisfies Page<Product>;
  }
  if(path.startsWith("store/products/")) return demoProducts.find(p=>p.slug===path.split("/")[2]);
  if(path==="store/collections") return collections;
  if(path==="store/settings") return {name:"SIYAG Perfumes",acceptOrders:false,paymentMethods:[],supportEmail:null};
  if(path==="store/content"&&query.get("area")==="catalog-banner") return [{slug:"preview-catalog-cover",titleEn:"Discover the SIYAG collection",titleAr:"اكتشف مجموعة SIYAG",textEn:"Preview",textAr:"معاينة",imageUrl:"/brand/catalog-cover.webp",actionUrl:"/shop?format=decant"}];
  if(path==="store/content"&&query.get("area")==="home-hero") return [
    {slug:"preview-house",titleEn:"Explore SIYAG fragrances",titleAr:"اكتشف عطور SIYAG",textEn:"Preview",textAr:"معاينة",imageUrl:"/brand/hero-v2.webp",actionUrl:"/shop"},
    {slug:"preview-discovery",titleEn:"Explore discovery sizes",titleAr:"اكتشف أحجام التجربة",textEn:"Preview",textAr:"معاينة",imageUrl:"/brand/discovery-vials.webp",actionUrl:"/shop?format=decant"},
  ];
  if(path==="store/content") return query.get("area")==="campaign" ? [{
    slug:"private-preview",titleEn:"The Black Friday Edit",titleAr:"اختيارات بلاك فرايداي",
    textEn:JSON.stringify({description:"A first look at the SIYAG collection.",tiers:[{value:"10%",label:"Any order"},{value:"15%",label:"From EGP 1,000"},{value:"20%",label:"From EGP 2,000"}],footnote:"Illustrative offers for the design preview."}),
    textAr:JSON.stringify({description:"نظرة أولى على تشكيلة SIYAG.",tiers:[{value:"١٠٪",label:"على أي طلب"},{value:"١٥٪",label:"من ١٬٠٠٠ جنيه"},{value:"٢٠٪",label:"من ٢٬٠٠٠ جنيه"}],footnote:"نسب توضيحية لمعاينة التصميم."}),
    actionUrl:"/shop",actionEn:"Explore the edit",actionAr:"استكشف التشكيلة",
  }] : [];
  return undefined;
}

export async function loadProduct(slug:string):Promise<Product|null> {
  if(DEMO) return demoProducts.find(p=>p.slug===slug) ?? null;
  const response=await requestStore("/api/v1/store/products/"+encodeURIComponent(slug));
  if(response.status===404) return null;
  if(!response.ok) throw new Error("Catalog is unavailable");
  return response.json();
}
