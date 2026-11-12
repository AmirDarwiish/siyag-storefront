import type {MetadataRoute} from "next";
import {siteUrl} from "@/lib/metadata";
import {carePages,carePath,type CarePageKey} from "@/lib/store-pages";
import {requestStore,DEMO} from "@/lib/server-store";
import type {Page,Product} from "@/lib/store";
export const dynamic="force-dynamic";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 if(DEMO)return [];
 const entries:MetadataRoute.Sitemap=["/","/shop","/reviews",...(Object.keys(carePages) as CarePageKey[]).map(carePath)].map(path=>({url:new URL(path,siteUrl).href}));
 for(let page=1;page<=100;page++){try{const response=await requestStore("/api/v1/store/products",`pageSize=100&pageNumber=${page}`);if(!response.ok)break;const result:Page<Product>=await response.json();entries.push(...result.data.map(p=>({url:new URL("/products/"+encodeURIComponent(p.slug),siteUrl).href})));if(page>=result.totalPages)break}catch{break}}
 return entries;
}
