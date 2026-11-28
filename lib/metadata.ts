import type {Metadata} from "next";
export const siteUrl=new URL(process.env.NEXT_PUBLIC_SITE_URL||"https://siyag-two.vercel.app");
export const brandDescription="Discover SIYAG, an Egyptian fragrance house. Find your signature scent, explore our fragrances and shop the collection.";
export function storeMetadata(title:string,description=brandDescription,path="/",image="/brand/share/notes-v2/siyag-1.jpg"):Metadata{
 const url=new URL(path,siteUrl).href;
 return {title,description,alternates:{canonical:url},openGraph:{type:"website",siteName:"SIYAG Parfums",title,description,url,locale:"en_EG",alternateLocale:["ar_EG"],images:[{url:new URL(image,siteUrl).href,...(image.startsWith("/brand/share/")?{width:1200,height:1200,type:"image/jpeg"}:{}),alt:title==="SIYAG Parfums | Egyptian Fragrance House"?"SIYAG 1 · 50 ml":title}]},twitter:{card:"summary_large_image",title,description,images:[new URL(image,siteUrl).href]}};
}
