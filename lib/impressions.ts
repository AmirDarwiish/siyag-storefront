import {readLocal,writeLocal} from './browser-storage';
export type ImpressionSelection={seasons:string[];times:string[];notes:string[];rating:number|null};
export type ImpressionCount={value:string;count:number};
export type ImpressionView={summary:{participants:number;ratingCount:number;averageRating:number|null;seasons:ImpressionCount[];times:ImpressionCount[];notes:ImpressionCount[]};selection:ImpressionSelection|null};
export const emptyImpression=():ImpressionSelection=>({seasons:[],times:[],notes:[],rating:null});
export async function impressions(slug:string,method:'GET'|'PUT'|'DELETE'='GET',selection?:ImpressionSelection,signal?:AbortSignal):Promise<ImpressionView>{
 let key=readLocal('siyag-impression-key');
 if(method==='PUT'&&!key){key=Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');writeLocal('siyag-impression-key',key);if(readLocal('siyag-impression-key')!==key)throw new Error('storage-unavailable')}
 const response=await fetch('/api/siyag/store/products/'+encodeURIComponent(slug)+'/impressions',{method,cache:'no-store',signal,headers:{...(key?{'X-Impression-Token':key}:{}),...(selection?{'Content-Type':'application/json'}:{})},body:selection?JSON.stringify(selection):undefined});
 if(!response.ok)throw new Error(response.status===429?'rate-limited':'unavailable');
 return response.json();
}
