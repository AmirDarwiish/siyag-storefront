import {mergeCatalogInventory} from './catalog-inventory';
import {publishedPage,publishedProducts} from './published-catalog';
import {defaultVariantImages} from './variant-image-defaults';
import {requestStore} from './server-store';
import {storefrontProduct,applyVariantImages,parseVariantImages,type VariantImages} from './catalog-experience';
import type {Product,Content,Cart} from './store';
import {unstable_cache} from 'next/cache';
import {productInspirations,type ProductInspiration} from './product-inspiration';

const cachedCatalogPresentation=unstable_cache(async()=>{
 const response=await requestStore('/api/v1/store/content');
 if(!response.ok)throw new Error('Variant media unavailable');
 const rows=await response.json() as Content[];
 return {images:{...defaultVariantImages,...parseVariantImages(rows.filter(row=>row.slug.startsWith('variant-media-')))},inspirations:productInspirations(rows)};
},['store-catalog-presentation'],{revalidate:60,tags:['store-variant-media']});
export async function loadCatalogPresentation():Promise<{images:VariantImages;inspirations:Record<string,ProductInspiration>}>{
 try{return await cachedCatalogPresentation()}catch{return {images:{...defaultVariantImages},inspirations:{}}}
}
export async function loadVariantImages():Promise<VariantImages>{
 return (await loadCatalogPresentation()).images;
}
/** Sort the full matching result before slicing, so stocked products never hide on later pages. */
export async function catalogPage(query:URLSearchParams){
 return Response.json(publishedPage(query,await livePublishedProducts()),{headers:{'Cache-Control':'no-store'}});
}
export async function catalogProduct(response:Response){
 if(!response.ok)return response;
 const [raw,images]=await Promise.all([response.json() as Promise<Product>,loadVariantImages()]);
 const product=storefrontProduct(raw);
 if(!product.variants.length)return Response.json({detail:"Product not found."},{status:404});
 return Response.json(applyVariantImages(product,images),{headers:{'Cache-Control':'no-store'}});
}
export async function cartImages(response:Response){
 if(!response.ok||response.status===204)return response;
 const [cart,images]=await Promise.all([response.json() as Promise<Cart>,loadVariantImages()]);
 return Response.json({...cart,lines:cart.lines.map(line=>({...line,image:publishedProducts.find(p=>p.variants.some(v=>v.id===line.variantId))?.images[0]||images[line.variantId]||line.image}))},{headers:{'Cache-Control':'no-store'}});
}

/** Published copy/media remain curated; live IDs, prices and inventory always come from commerce. */
export async function livePublishedProducts():Promise<Product[]>{
 try{
  const response=await requestStore('/api/v1/store/products','pageSize=100');
  if(response.ok)return mergeCatalogInventory(publishedProducts,(await response.json()).data);
 }catch{}
 return mergeCatalogInventory(publishedProducts,[]);
}
