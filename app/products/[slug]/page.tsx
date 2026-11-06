import {cache} from "react";
import {notFound} from "next/navigation";
import {loadProduct} from "@/lib/server-store";
import {ProductDetail} from "@/components/product";

export const dynamic="force-dynamic";
const find=cache(loadProduct);
type Props={params:Promise<{slug:string}>;searchParams:Promise<{variant?:string}>};
export async function generateMetadata({params}:Props){
  const p=await find((await params).slug).catch(()=>null);
  return {title:p?.seo?.titleEn||p?.nameEn||"Fragrance",description:p?.seo?.descriptionEn||p?.descriptionEn};
}
export default async function Page({params,searchParams}:Props){
  const p=await find((await params).slug);
  if(!p)notFound();
  const {variant}=await searchParams;
  return <ProductDetail key={p.id} product={p} variantId={variant}/>;
}
