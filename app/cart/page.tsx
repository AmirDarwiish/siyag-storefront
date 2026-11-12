import {CartPage} from "@/components/shell";
import {storeMetadata} from "@/lib/metadata";
export const metadata={...storeMetadata("Your Bag",undefined,"/cart"),robots:{index:false,follow:false}};
export default function Page(){return <CartPage/>}
