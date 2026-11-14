import {defaultVariantImages} from './variant-image-defaults';
import {requestStore} from './server-store';
import {availableFirst,applyVariantImages,isDiscovery,parseVariantImages,type VariantImages} from './catalog-experience';
import type {Product,Page,Content,Cart} from './store';

export async function loadVariantImages():Promise<VariantImages>{
 try{const response=await requestStore('/api/v1/store/content','area=variant-media');if(response.ok)return {...defaultVariantImages,...parseVariantImages(await response.json() as Content[])}}catch{}
 return {...defaultVariantImages};
}
/** Sort the full matching result before slicing, so stocked products never hide on later pages. */
export async function catalogPage(query:URLSearchParams){
 const number=(key:string,fallback:number,max:number)=>Math.max(1,Math.min(max,Math.floor(Number(query.get(key)))||fallback));
 const pageNumber=number('pageNumber',1,100000),pageSize=number('pageSize',12,100);
 const upstream=new URLSearchParams(query);upstream.set('pageSize','100');upstream.set('pageNumber','1');
 const [response,images]=await Promise.all([requestStore('/api/v1/store/products',upstream.toString()),loadVariantImages()]);
 if(!response.ok)return response;
 const first=await response.json() as Page<Product>;
 const products=[...first.data];
 for(let start=2;start<=first.totalPages;start+=4){
  const pages=await Promise.all(Array.from({length:Math.min(4,first.totalPages-start+1)},async(_,offset)=>{
   const params=new URLSearchParams(upstream);params.set('pageNumber',String(start+offset));
   const next=await requestStore('/api/v1/store/products',params.toString());
   if(!next.ok)throw new Error('Catalog page unavailable');
   return (await next.json() as Page<Product>).data;
  }));products.push(...pages.flat());
 }
 const unique=[...new Map(products.map(p=>[p.id,p])).values()];
 const matching=query.get('collection')==='discovery'?unique.filter(p=>p.variants.some(isDiscovery)):unique;
 const ordered=availableFirst(matching,query);
 return Response.json({data:ordered.slice((pageNumber-1)*pageSize,pageNumber*pageSize).map(p=>applyVariantImages(p,images)),totalCount:ordered.length,totalPages:Math.ceil(ordered.length/pageSize),pageSize,pageNumber} satisfies Page<Product>,{headers:{'Cache-Control':'no-store'}});
}
export async function catalogProduct(response:Response){
 if(!response.ok)return response;
 const [product,images]=await Promise.all([response.json() as Promise<Product>,loadVariantImages()]);
 return Response.json(applyVariantImages(product,images),{headers:{'Cache-Control':'no-store'}});
}
export async function cartImages(response:Response){
 if(!response.ok||response.status===204)return response;
 const [cart,images]=await Promise.all([response.json() as Promise<Cart>,loadVariantImages()]);
 return Response.json({...cart,lines:cart.lines.map(line=>({...line,image:images[line.variantId]||line.image}))},{headers:{'Cache-Control':'no-store'}});
}
