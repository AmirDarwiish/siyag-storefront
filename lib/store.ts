export type Language = "en" | "ar";
export type Variant = { id: string; sku: string; sizeMl: number; format: "fullBottle" | "decant" | "sample"; priceMinor: number; compareAtMinor?: number | null; inStock: boolean };
export type Product = { id: string; slug: string; nameEn: string; nameAr: string; descriptionEn: string; descriptionAr: string; brand: string; family: string; concentration: string; audience: string; topNotes: string[]; heartNotes: string[]; baseNotes: string[]; images: string[]; featured: boolean; variants: Variant[]; collections: string[]; seo?: {titleEn?:string; descriptionEn?:string} };
export type Collection = {slug:string; nameEn:string; nameAr:string; imageUrl?:string};
export type Content = {slug:string; titleEn:string;titleAr:string;textEn:string;textAr:string;imageUrl?:string;actionUrl?:string;actionEn?:string;actionAr?:string};
export type Page<T> = {data:T[]; totalCount:number; pageNumber:number; pageSize:number; totalPages:number};
export type Settings = {name:string; acceptOrders:boolean; paymentMethods:string[]; supportEmail?:string};
export type Shipping = {code:string; nameEn:string; nameAr:string; governorate:string; feeMinor:number};
export type Cart = {lines:{variantId:string; slug:string; nameEn:string; nameAr:string; image?:string; sizeMl:number; format:Variant["format"]; quantity:number; unitPriceMinor:number; available:boolean}[]; subtotalMinor:number; currency:string};
export type Quote = {subtotalMinor:number;discountMinor:number;shippingMinor:number;taxMinor:number;taxIncluded:boolean;totalMinor:number;promotionCode?:string};
export type Receipt = {number:string;trackingToken:string;paymentMethod:string;total:Quote};
export type Tracking = {number:string;status:string;paymentStatus:string;paymentMethod:string;carrierTrackingUrl?:string;carrierReference?:string;total:Quote;events:{at:string;status:string}[]};
export const name = (item:{nameEn:string;nameAr:string}, lang:Language) => lang==="ar" ? item.nameAr || item.nameEn : item.nameEn || item.nameAr;
export const money = (minor:number, lang:Language="en") => new Intl.NumberFormat(lang==="ar" ? "ar-EG" : "en-EG",{style:"currency",currency:"EGP",maximumFractionDigits:minor%100?2:0,minimumFractionDigits:minor%100?2:0}).format(minor/100);
export const imageUrl = (value?:string) => !value ? "/brand/fallback.svg" : value.startsWith("/media/") ? "/api/siyag"+value : value;
export const variantFor = (product:Product, id?:string|null) => product.variants.find(v=>v.id===id) ?? product.variants.find(v=>v.inStock) ?? product.variants[0];
export const productUrl = (product:Product, variant?:Variant) => "/products/"+encodeURIComponent(product.slug)+(variant?"?variant="+encodeURIComponent(variant.id):"");
export const formats = {fullBottle:["Full bottle","زجاجة كاملة"],decant:["Decant","عيّنة معبّأة"],sample:["Sample","عيّنة"]} as const;
export const families: Record<string,[string,string]>={woody:["Woody","خشبي"],amber:["Amber","عنبري"],floral:["Floral","زهري"],fresh:["Fresh","منعش"],gourmand:["Gourmand","جورماند"],oriental:["Oriental","شرقي"],other:["Other","أخرى"]};
export const concentrations: Record<string,[string,string]>={parfum:["Parfum","بارفان"],eauDeParfum:["Eau de Parfum","أو دو بارفان"],eauDeToilette:["Eau de Toilette","أو دو تواليت"],oil:["Perfume oil","زيت عطري"],other:["Other","أخرى"]};

export class ApiError extends Error {
  constructor(public status:number, message:string, public code?:string) { super(message); }
}
export async function api<T>(path:string, options:{method?:string; data?:unknown; token?:string; signal?:AbortSignal}={}):Promise<T> {
  const res=await fetch("/api/siyag/"+path, {
    method:options.method ?? "GET", signal:options.signal, cache:"no-store",
    headers:{...(options.data===undefined?{}:{"Content-Type":"application/json"}),...(options.token?{"X-Cart-Token":options.token}:{})},
    body: options.data===undefined ? undefined : JSON.stringify(options.data),
  });
  if(res.status===204) return undefined as T;
  const value=await res.json().catch(()=>null);
  if(!res.ok) throw new ApiError(res.status,value?.detail ?? value?.title ?? "The store is temporarily unavailable.",value?.code);
  return value as T;
}
