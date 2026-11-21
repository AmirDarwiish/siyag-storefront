import {redirect} from "next/navigation";
import {commerce} from "@/lib/commerce";
import {Checkout} from "@/components/checkout";
export const metadata={title:"Checkout",robots:{index:false,follow:false}};
export default function Page(){if(!commerce.purchasingEnabled)redirect("/shop");return <Checkout/>}
