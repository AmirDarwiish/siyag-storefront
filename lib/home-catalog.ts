import type {Product} from './store';
/** Shared catalogue audience labels and homepage performance limits. */
export const homeCatalogPolicy={railLimit:8,revealMargin:'500px 0px',inventoryTtlMs:15000,inventoryRetryMs:3000,inventoryTimeoutMs:8000,clientTimeoutMs:10000};
export const audienceGroups=[
 {audience:'men',nameEn:'Men’s perfumes',nameAr:'عطور رجالي'},
 {audience:'women',nameEn:'Women’s perfumes',nameAr:'عطور نسائي'},
 {audience:'unisex',nameEn:'Unisex perfumes',nameAr:'عطور للجميع'},
] as const;
/** Presentation is safe to prerender; only the live commerce response can enable a purchase. */
export function pendingCatalog(products:Product[]):Product[]{return products.map(p=>({...p,inventoryStatus:'pending',variants:p.variants.map(v=>({...v,inStock:false}))}))}

/** Homepage merchandising is independent of gender; audience remains a catalogue filter. */
export const homeSections=[
 {key:'bestsellers',collection:'bestsellers',nameEn:'Best sellers',nameAr:'الأكثر مبيعًا',href:'/shop?collection=bestsellers'},
 {key:'fragrances',collection:'signature',nameEn:'The SIYAG collection',nameAr:'عطور SIYAG',href:'/shop'},
] as const;
export function sectionProducts(products:Product[],collection:string){return products.filter(p=>p.collections.includes(collection)).sort((a,b)=>Number(a.slug.slice(6))-Number(b.slug.slice(6))).slice(0,homeCatalogPolicy.railLimit)}
export const giftSelections=[
 {sizeMl:30,nameEn:'The 30 ml selection',nameAr:'باقة ٣٠ مل',slugs:['siyag-1','siyag-3','siyag-6','siyag-7'],href:'/shop?sizeMl=30'},
 {sizeMl:50,nameEn:'The 50 ml selection',nameAr:'باقة ٥٠ مل',slugs:['siyag-21','siyag-5','siyag-13','siyag-18'],href:'/shop?sizeMl=50'},
] as const;
