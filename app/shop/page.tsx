import {storeMetadata} from "@/lib/metadata";
import {Suspense} from "react";
import {Shop} from "@/components/shop";
export const metadata=storeMetadata("The Collection","Explore SIYAG fragrances by scent family, size and concentration.","/shop");
export default function Page(){return <Suspense fallback={<main className="container section"><div className="skeleton"/></main>}><Shop/></Suspense>}
