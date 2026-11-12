"use client";
import {office,type AdminProduct,type ProductSummary} from "./admin";
import type {Page} from "./store";
export async function loadCatalogIndex(signal:AbortSignal){
 const first=await office<Page<ProductSummary>>("products?pageSize=100&pageNumber=1",{signal}),rows=[...first.data];
 for(let start=2;start<=first.totalPages;start+=4){const pages=await Promise.all(Array.from({length:Math.min(4,first.totalPages-start+1)},(_,i)=>office<Page<ProductSummary>>(`products?pageSize=100&pageNumber=${start+i}`,{signal})));for(const page of pages)rows.push(...page.data)}return rows;
}
export async function loadCatalogDetails(ids:string[],signal:AbortSignal){
 const products:Record<string,AdminProduct>={};let failed=0;
 for(let start=0;start<ids.length;start+=4){const batch=await Promise.allSettled(ids.slice(start,start+4).map(id=>office<AdminProduct>("products/"+id,{signal})));for(const result of batch)if(result.status==="fulfilled")products[result.value.id]=result.value;else failed++}
 if(signal.aborted)throw new DOMException("Aborted","AbortError");return {products,failed};
}
