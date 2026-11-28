/** A bounded successful-result cache with a single shared in-flight request; failures never renew old inventory. */
export function createCatalogLoader<T>(load:()=>Promise<T>,policy:{ttlMs:number;retryMs:number},now:()=>number=Date.now){
 let cached:{value:T;expires:number}|undefined,inflight:Promise<T>|undefined,retryAt=0;
 return function get():Promise<T>{
  if(cached&&now()<cached.expires)return Promise.resolve(cached.value);
  if(inflight)return inflight;
  if(now()<retryAt)return Promise.reject(new Error('Inventory temporarily unavailable'));
  inflight=Promise.resolve().then(load).then(value=>{cached={value,expires:now()+policy.ttlMs};retryAt=0;return value},error=>{cached=undefined;retryAt=now()+policy.retryMs;throw error}).finally(()=>{inflight=undefined});
  return inflight;
 };
}
