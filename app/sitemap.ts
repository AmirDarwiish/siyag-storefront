import {publishedProducts} from "@/lib/published-catalog";
import type {MetadataRoute} from "next";
import {siteUrl} from "@/lib/metadata";
import {carePages,carePath,type CarePageKey} from "@/lib/store-pages";
import {requestStore,DEMO} from "@/lib/server-store";
import type {Page,Product} from "@/lib/store";
export const dynamic="force-dynamic";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 if(DEMO)return [];
 const entries:MetadataRoute.Sitemap=["/","/shop","/reviews",...(Object.keys(carePages) as CarePageKey[]).map(carePath)].map(path=>({url:new URL(path,siteUrl).href}));
 entries.push(...publishedProducts.map(p=>({url:new URL("/products/"+p.slug,siteUrl).href})));
 return entries;
}
