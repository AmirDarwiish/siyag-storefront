import {storeMetadata} from "@/lib/metadata";
import {Reviews} from "@/components/reviews";

export const metadata=storeMetadata("Customer Experiences","Read customer experiences and share your review of SIYAG Parfums.","/reviews");
export default function Page(){return <main><Reviews/></main>}
