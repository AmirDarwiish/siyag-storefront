import {notFound} from "next/navigation";
import {CarePage} from "@/components/care-page";
import {carePages,type CarePageKey} from "@/lib/store-pages";
import {storeMetadata} from "@/lib/metadata";
const keys=["shipping","returns","privacy","terms"];
export function generateStaticParams(){return keys.map(policy=>({policy}))}
export async function generateMetadata({params}:{params:Promise<{policy:string}>}){const {policy}=await params;return keys.includes(policy)?storeMetadata(carePages[policy as CarePageKey].title[0],carePages[policy as CarePageKey].intro[0],"/policies/"+policy):{title:"Page unavailable",robots:{index:false,follow:false}}}
export default async function Page({params}:{params:Promise<{policy:string}>}){const {policy}=await params;if(!keys.includes(policy))notFound();return <CarePage page={policy as CarePageKey}/>}
