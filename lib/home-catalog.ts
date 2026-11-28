import type {Product} from './store';
/** Shared homepage grouping, links and performance limits. */
export const homeCatalogPolicy={railLimit:8,revealMargin:'500px 0px',inventoryTtlMs:15000,inventoryRetryMs:3000,inventoryTimeoutMs:8000,clientTimeoutMs:10000};
export const audienceGroups=[
 {audience:'men',nameEn:'Men’s perfumes',nameAr:'عطور رجالي'},
 {audience:'women',nameEn:'Women’s perfumes',nameAr:'عطور نسائي'},
 {audience:'unisex',nameEn:'Unisex perfumes',nameAr:'عطور للجميع'},
] as const;
export function audienceHref(audience:string){return '/shop?audience='+encodeURIComponent(audience)}
export function audienceProducts(products:Product[],audience:string){return products.filter(p=>p.audience===audience).sort((a,b)=>Number(a.slug.slice(6))-Number(b.slug.slice(6))).slice(0,homeCatalogPolicy.railLimit)}
/** Presentation is safe to prerender; only the live commerce response can enable a purchase. */
export function pendingCatalog(products:Product[]):Product[]{return products.map(p=>({...p,inventoryStatus:'pending',variants:p.variants.map(v=>({...v,inStock:false}))}))}
