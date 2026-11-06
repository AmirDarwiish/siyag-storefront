import {Suspense} from "react";
import {Shop} from "@/components/shop";
export const metadata={title:"The Collection"};
export default function Page(){return <Suspense fallback={<main className="container section"><div className="skeleton"/></main>}><Shop/></Suspense>}
