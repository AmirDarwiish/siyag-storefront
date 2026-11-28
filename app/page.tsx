import {Home} from "@/components/home";
import {publishedProducts} from "@/lib/published-catalog";
import {pendingCatalog} from "@/lib/home-catalog";
export default function Page(){return <Home initialProducts={pendingCatalog(publishedProducts)}/>}
