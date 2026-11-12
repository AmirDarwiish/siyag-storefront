"use client";
export type OfficeSnapshot<T=unknown>={data:T|undefined;error:string;loading:boolean;verifiedAt:number;invalidated:boolean};
type Loader=(signal:AbortSignal)=>Promise<unknown>;
type Entry={snapshot:OfficeSnapshot;listeners:Set<()=>void>;loader?:Loader;promise?:Promise<unknown>;controller?:AbortController;epoch:number;lastAttempt:number};
const empty:OfficeSnapshot={data:undefined,error:"",loading:false,verifiedAt:0,invalidated:false};
const entries=new Map<string,Entry>(),healthListeners=new Set<()=>void>();
let version=0;
export function officePolicy(key:string){
 const critical=/^(orders|inventory|reports\/summary|catalog-details|products\/)/.test(key);
 return {critical,ttl:critical?5000:/^(catalog|collections|shipping|staff)/.test(key)?60000:30000,poll:critical?15000:key.startsWith("reports/")?60000:60000};
}
function entry(key:string){
 let value=entries.get(key);
 if(!value){value={snapshot:empty,listeners:new Set(),epoch:0,lastAttempt:0};entries.set(key,value);
  if(entries.size>200)for(const [id,item] of entries){if(id!==key&&!item.listeners.size&&!item.promise){entries.delete(id);if(entries.size<=180)break}}
 }
 return value;
}
function emit(value?:Entry){if(value)for(const listener of value.listeners)listener();version++;for(const listener of healthListeners)listener()}
export function officeSnapshot<T>(key:string):OfficeSnapshot<T>{return entry(key).snapshot as OfficeSnapshot<T>}
export const officeServerSnapshot=()=>empty;
export function subscribeOffice(key:string,listener:()=>void){const value=entry(key);value.listeners.add(listener);emit();return()=>{value.listeners.delete(listener);emit()}}
export function subscribeOfficeHealth(listener:()=>void){healthListeners.add(listener);return()=>{healthListeners.delete(listener)}}
export const officeHealthVersion=()=>version;
export function officeHealth(){
 const active=[...entries].filter(([key,value])=>value.listeners.size&&officePolicy(key).critical).map(([,value])=>value.snapshot);
 return {refreshing:active.some(s=>s.loading),failed:active.some(s=>!!s.error),verifiedAt:active.length?Math.min(...active.map(s=>s.verifiedAt)):0,stale:active.some(s=>s.invalidated)};
}
export function loadOffice<T>(key:string,loader:(signal:AbortSignal)=>Promise<T>,force=false):Promise<T>{
 const value=entry(key);value.loader=loader;
 if(value.promise)return value.promise as Promise<T>;
 if(!force&&!value.snapshot.invalidated&&value.snapshot.data!==undefined&&Date.now()-value.snapshot.verifiedAt<officePolicy(key).ttl)return Promise.resolve(value.snapshot.data as T);
 const controller=new AbortController(),epoch=value.epoch;value.controller=controller;value.lastAttempt=Date.now();
 value.snapshot={...value.snapshot,loading:true,error:""};emit(value);
 const promise=Promise.resolve().then(()=>loader(controller.signal)).then(data=>{
  if(value.epoch===epoch){value.snapshot={data,error:"",loading:false,verifiedAt:Date.now(),invalidated:false};emit(value)}return data;
 },error=>{
  if(value.epoch===epoch&&!controller.signal.aborted){value.snapshot={...value.snapshot,error:error instanceof Error?error.message:"تعذّر تحديث البيانات.",loading:false,invalidated:true};emit(value)}throw error;
 }).finally(()=>{if(value.promise===promise){value.promise=undefined;value.controller=undefined}});
 value.promise=promise;return promise;
}
export function invalidateOffice(prefixes:string[]){
 for(const [key,value] of entries){if(!prefixes.some(prefix=>key.startsWith(prefix)))continue;
  value.epoch++;value.controller?.abort();value.promise=undefined;value.snapshot={...value.snapshot,loading:false,invalidated:true};emit(value);
  if(value.listeners.size&&value.loader)void loadOffice(key,value.loader,true).catch(()=>{});
 }
}
export function invalidateOfficeMutation(path:string){
 const root=path.split('/')[0];
 const domains:Record<string,string[]>={products:["products","catalog","inventory","reports/summary"],variants:["products","catalog-details","inventory","reports/summary"],collections:["collections","catalog"],orders:["orders","reports","inventory","catalog-details","notifications"],shipping:["shipping","integrations/shipping"],staff:["staff"],reviews:["reviews"],integrations:["integrations"],notifications:["notifications"]};
 invalidateOffice(domains[root]??[root]);
}
export function resetOfficeCache(){for(const value of entries.values()){value.epoch++;value.controller?.abort();value.promise=undefined;value.snapshot=empty;emit(value)}entries.clear();emit()}
export function connectOfficeCache(){
 const changed=()=>invalidateOffice(["orders","inventory","reports","catalog-details","notifications"]);
 const refocus=()=>{if(document.hidden)return;for(const [key,value] of entries)if(value.listeners.size&&value.loader&&(value.snapshot.invalidated||Date.now()-value.snapshot.verifiedAt>=officePolicy(key).ttl)&&Date.now()-value.lastAttempt>3000)void loadOffice(key,value.loader).catch(()=>{})};
 window.addEventListener("siyag-office-changed",changed);window.addEventListener("focus",refocus);window.addEventListener("online",changed);document.addEventListener("visibilitychange",refocus);
 return()=>{window.removeEventListener("siyag-office-changed",changed);window.removeEventListener("focus",refocus);window.removeEventListener("online",changed);document.removeEventListener("visibilitychange",refocus)};
}
