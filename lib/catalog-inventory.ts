import type {Product} from './store';
/** Preserve curated presentation; never invent operational prices, inventory or purchasable IDs. */
export function mergeCatalogInventory(publishedProducts:Product[],live:Product[]):Product[]{
 return publishedProducts.map(product=>{
  const current=live.find(row=>row.id===product.id);
  return {...product,inventoryStatus:current?.slug===product.slug&&current?.nameEn===product.nameEn?"ready":"unavailable",variants:product.variants.map(variant=>{
   const actual=current?.variants.find(row=>row.sizeMl===variant.sizeMl&&row.format===variant.format);
   // Before the approved backend import, old Naxos prices/stock must not be sold as the new catalogue.
   const imported=current?.slug===product.slug&&current?.nameEn===product.nameEn;
   return imported&&actual?{...variant,id:actual.id,priceMinor:actual.priceMinor,compareAtMinor:actual.compareAtMinor,inStock:actual.inStock}:{...variant,inStock:false};
  })};
 });
}
