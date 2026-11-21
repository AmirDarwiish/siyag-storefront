import type { Product } from "./store";
import {publishedProduct} from "./published-catalog";

// Published numbered fragrances are shared by product pages and the public catalog.
export const DEMO = false;
const origin = process.env.SIYAG_API_ORIGIN || "https://siyag.runasp.net";

export async function requestStore(path:string, query="", init?:RequestInit) {
  const base = new URL(origin);
  const url = new URL(path, base.origin);
  url.search = query;
  return fetch(url,{...init,cache:"no-store",signal:AbortSignal.timeout(12000),redirect:"error"});
}

export async function loadProduct(slug:string):Promise<Product|null> {
  return publishedProduct(slug);
}
