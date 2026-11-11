import type {Cart,Product,Variant} from './store';
import {readLocal,writeLocal} from './browser-storage';
export const eventNames=['page_view','view_item_list','select_item','view_item','search','add_to_wishlist','add_to_cart','remove_from_cart','view_cart','begin_checkout','add_shipping_info','add_payment_info','purchase','buy_now','coupon_apply','select_variant','checkout_validation','checkout_exit','order_placed'] as const;
export type EventName=typeof eventNames[number];
type Item={item_id:string;item_name?:string;item_category?:string;item_variant?:string;price?:number;quantity?:number};
export type EventData={items?:Item[];value?:number;item_count?:number;step?:string;payment_type?:string;transaction_id?:string;result?:string;list_id?:string};
type Journey={visitorId:string;sessionId:string;source:string;medium:string;campaign:string;returning:boolean};
export function allowed(){return typeof window!=='undefined'&&readLocal('siyag-measurement')==='yes'}
export function consent(value:boolean){
 const w=window as unknown as {gtag?:(...args:unknown[])=>void;fbq?:(...args:unknown[])=>void};
 w.gtag?.('consent','update',{analytics_storage:value?'granted':'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
 w.fbq?.('consent',value?'grant':'revoke');
 writeLocal('siyag-measurement',value?'yes':'no');if(!value){writeLocal('siyag-visitor',null);try{sessionStorage.removeItem('siyag-journey')}catch{}}window.dispatchEvent(new Event('siyag-consent'))}
function tag(value:string|null){return value&&/^[a-zA-Z0-9_. -]{1,80}$/.test(value)?value:'(none)'}
export function journey():Journey|undefined{
 if(!allowed())return;
 try{
  const now=Date.now();const old=JSON.parse(sessionStorage.getItem('siyag-journey')||'null');
  if(old&&now-old.last<1800000){old.last=now;sessionStorage.setItem('siyag-journey',JSON.stringify(old));return old.data}
  const existing=readLocal('siyag-visitor');const visitorId=existing||crypto.randomUUID();writeLocal('siyag-visitor',visitorId);
  const params=new URLSearchParams(location.search);
  let ref='(direct)';try{const host=new URL(document.referrer).hostname;if(host!==location.hostname)ref=host}catch{}
  const data:Journey={visitorId,sessionId:crypto.randomUUID(),source:tag(params.get('utm_source'))==='(none)'?ref:tag(params.get('utm_source')),medium:tag(params.get('utm_medium')),campaign:tag(params.get('utm_campaign')),returning:Boolean(existing)};
  sessionStorage.setItem('siyag-journey',JSON.stringify({last:now,data}));return data;
 }catch{return}
}
let previousPage='';
export function track(event:EventName,data:EventData={},proof?:{number:string;token:string}){
 const identity=journey();if(!identity)return;
 // Paths and fixed categories only: query strings, free-text search, forms and referrer paths never leave the browser.
 const path=/^\/products\/[a-z0-9-]+$/.test(location.pathname)?location.pathname:['/','/shop','/checkout','/reviews','/track','/payment/result'].includes(location.pathname)?location.pathname:'/other';
 const payload={id:crypto.randomUUID(),event,at:new Date().toISOString(),...identity,path,previousPage,device:innerWidth<768?'mobile':innerWidth<1100?'tablet':'desktop',width:innerWidth,...data,proof};
 if(event==='page_view')previousPage=path;
 const send=async(attempt=0):Promise<void>=>{
  if(!allowed())return;
  try{
   const response=await fetch('/api/siyag/store/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true});
   if(!response.ok){if(response.status>=500&&attempt<2)setTimeout(()=>void send(attempt+1),1500*(attempt+1));return}
   const result=await response.json();
   if(event==='purchase'&&result.recorded&&!result.duplicate&&allowed()){
    const w=window as unknown as {gtag?:(...args:unknown[])=>void;fbq?:(...args:unknown[])=>void};
    w.gtag?.('event','purchase',{currency:'EGP',transaction_id:proof?.number,value:result.value,page_location:location.origin+path});
    w.fbq?.('track','Purchase',{currency:'EGP',value:result.value},{eventID:result.eventId});
   }
  }catch{if(attempt<2)setTimeout(()=>void send(attempt+1),1500*(attempt+1))}
 };
 void send();
 // Integrations are loaded only after opt-in. No automatic page views or automatic form collection.
 const w=window as unknown as {gtag?:(...args:unknown[])=>void;fbq?:(...args:unknown[])=>void};
 if(event!=='purchase'&&event!=='order_placed'){
  w.gtag?.('event',event,{...data,currency:'EGP',page_location:location.origin+path});
  const mapped:Partial<Record<EventName,string>>={view_item:'ViewContent',add_to_cart:'AddToCart',add_to_wishlist:'AddToWishlist',begin_checkout:'InitiateCheckout',add_payment_info:'AddPaymentInfo'};
  if(mapped[event])w.fbq?.('track',mapped[event],{currency:'EGP',value:data.value,content_ids:data.items?.map(i=>i.item_id),content_type:'product'},{eventID:payload.id});
 }
}
export function itemData(p:Product,v:Variant,q=1):EventData{return {items:[{item_id:p.id,item_name:p.nameEn,item_category:p.family,item_variant:v.id,price:v.priceMinor/100,quantity:q}],value:v.priceMinor*q/100}}
export function cartData(cart:Cart):EventData{return {items:cart.lines.map(l=>({item_id:l.variantId,item_name:l.nameEn,item_variant:String(l.sizeMl),price:l.unitPriceMinor/100,quantity:l.quantity})),value:cart.subtotalMinor/100,item_count:cart.lines.reduce((n,l)=>n+l.quantity,0)}}
