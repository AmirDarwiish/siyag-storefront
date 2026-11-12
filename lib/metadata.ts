import type {Metadata} from "next";
export const siteUrl=new URL(process.env.NEXT_PUBLIC_SITE_URL||"https://siyag-two.vercel.app");
export const brandDescription="Discover SIYAG, an Egyptian fragrance house. Find your signature scent, explore discovery sizes and shop the collection.";
export function storeMetadata(title:string,description=brandDescription,path="/",image="/brand/olive-hero.webp"):Metadata{
 const url=new URL(path,siteUrl).href;
 return {title,description,alternates:{canonical:url},openGraph:{type:"website",siteName:"SIYAG Parfums",title,description,url,locale:"en_EG",alternateLocale:["ar_EG"],images:[{url:new URL(image,siteUrl).href,...(image==="/brand/olive-hero.webp"?{width:1280,height:960}:{}),alt:title==="SIYAG Parfums | Egyptian Fragrance House"?"SIYAG Parfums fragrance in olive sunlight":title}]},twitter:{card:"summary_large_image",title,description,images:[new URL(image,siteUrl).href]}};
}
