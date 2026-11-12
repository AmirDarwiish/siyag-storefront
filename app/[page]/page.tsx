import {notFound} from "next/navigation";
import {CarePage} from "@/components/care-page";
import {carePages,type CarePageKey} from "@/lib/store-pages";
import {storeMetadata} from "@/lib/metadata";
const keys=["about","contact","faq"];
export function generateStaticParams(){return keys.map(page=>({page}))}
export async function generateMetadata({params}:{params:Promise<{page:string}>}){const {page}=await params;return keys.includes(page)?storeMetadata(carePages[page as CarePageKey].title[0],carePages[page as CarePageKey].intro[0],"/"+page):{title:"Page unavailable",robots:{index:false,follow:false}}}
export default async function Page({params}:{params:Promise<{page:string}>}){const {page}=await params;if(!keys.includes(page))notFound();return <CarePage page={page as CarePageKey}/>}
