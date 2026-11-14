import type {Product,Variant,Content} from './store';
export const DISCOVERY_HREF='/shop?collection=discovery';
export const collectionHref=(slug:string)=>slug==='discovery'?DISCOVERY_HREF:'/shop?collection='+encodeURIComponent(slug);
export const isDiscovery=(variant:Variant)=>variant.format!=='fullBottle';
export function discoveryProduct(product:Product){return {...product,variants:product.variants.filter(isDiscovery)}}
export function available(product:Product,query?:URLSearchParams){
 return product.variants.some(v=>v.inStock&&(!query?.get('format')||v.format===query.get('format'))&&(!query?.get('sizeMl')||v.sizeMl===Number(query.get('sizeMl')))&&(!query?.get('maxPriceMinor')||v.priceMinor<=Number(query.get('maxPriceMinor')))&&(query?.get('collection')!=='discovery'||isDiscovery(v)));
}
/** Stable partition preserves the customer's chosen price/newest order within each group. */
export function availableFirst(products:Product[],query?:URLSearchParams){return [...products.filter(p=>available(p,query)),...products.filter(p=>!available(p,query))]}
export function recommendations(product:Product,candidates:Product[]){
 const notes=new Set([...product.topNotes,...product.heartNotes,...product.baseNotes].map(x=>x.toLowerCase()));
 const score=(p:Product)=>(p.family===product.family?10:0)+p.collections.filter(c=>c!=='discovery'&&product.collections.includes(c)).length*3+[...p.topNotes,...p.heartNotes,...p.baseNotes].filter(x=>notes.has(x.toLowerCase())).length;
 return [...new Map(candidates.filter(p=>p.id!==product.id&&available(p)).map(p=>[p.id,p])).values()].sort((a,b)=>score(b)-score(a)).slice(0,4);
}
export const variantImage=(product:Product,variant?:Variant)=>variant?.imageUrl||product.images[0];
export type VariantImages=Record<string,string>;
export function validImage(value:unknown):value is string{
 if(typeof value!=='string'||value.length>1000)return false;
 return /^\/media\/[a-f0-9]{64}\.(jpg|png|webp)$/.test(value)||/^\/brand\/[a-z0-9/._-]+$/.test(value)||/^https:\/\/[^\s]+$/i.test(value);
}
export function parseVariantImages(content:Content[]){
 const result:VariantImages={};
 for(const row of content){try{const values:unknown=JSON.parse(row.textEn);if(!values||typeof values!=='object'||Array.isArray(values))continue;for(const [key,value] of Object.entries(values)){if(/^[a-f0-9-]{36}$/i.test(key)&&validImage(value))result[key]=value}}catch{}}
 return result;
}
export function applyVariantImages(product:Product,images:VariantImages):Product{return {...product,variants:product.variants.map(v=>({...v,imageUrl:images[v.id]||v.imageUrl}))}}
