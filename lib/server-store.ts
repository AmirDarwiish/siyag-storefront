import type { Product } from "./store";

// Storefront previews and production both use the actual store API.
export const DEMO = false;
const origin = process.env.SIYAG_API_ORIGIN || "https://siyag.runasp.net";

export async function requestStore(path:string, query="", init?:RequestInit) {
  const base = new URL(origin);
  const url = new URL(path, base.origin);
  url.search = query;
  return fetch(url,{...init,cache:"no-store",signal:AbortSignal.timeout(12000),redirect:"error"});
}

export async function loadProduct(slug:string):Promise<Product|null> {
  const response=await requestStore("/api/v1/store/products/"+encodeURIComponent(slug));
  if(response.status===404) return null;
  if(!response.ok) throw new Error("Catalog is unavailable");
  return response.json();
}
