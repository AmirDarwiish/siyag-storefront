import {Eye,EyeOff,PackageCheck,PackageOpen} from "lucide-react";
import {office,type AdminProduct,type AdminCollection,type AdminOrder} from "@/lib/admin";
import type {Shipping} from "@/lib/store";
import type {BulkAction} from "./shared";

export function productActions():BulkAction[]{
  return [true,false].map(published=>({id:published?"publish":"draft",label:published?"نشر المنتجات":"تحويل لمسودة",icon:published?Eye:EyeOff,run:async(id:string)=>{
    const product=await office<AdminProduct>("products/"+id);
    if(published&&!product.variants.some(v=>v.active))throw new Error(`${product.nameAr}: أضف حجمًا مفعّلًا قبل النشر`);
    await office("products/"+id,{method:"PUT",data:{...product,published}});
  }}));
}
export function collectionActions():BulkAction[]{
  return [true,false].map(published=>({id:published?"publish":"draft",label:published?"نشر الأقسام":"إخفاء الأقسام",icon:published?Eye:EyeOff,run:async(id:string)=>{
    const collection=(await office<AdminCollection[]>("collections")).find(item=>item.slug===id);
    if(!collection)throw new Error("القسم لم يعد متاحًا");
    await office("collections/"+encodeURIComponent(id),{method:"PUT",data:{...collection,published}});
  }}));
}
export function shippingActions():BulkAction[]{
  return [true,false].map(active=>({id:active?"activate":"deactivate",label:active?"تفعيل التوصيل":"إيقاف التوصيل",icon:active?Eye:EyeOff,run:async(id:string)=>{
    const option=(await office<(Shipping&{active:boolean;freeFromMinor?:number|null})[]>("shipping")).find(item=>item.code===id);
    if(!option)throw new Error("طريقة التوصيل لم تعد متاحة");
    await office("shipping/"+encodeURIComponent(id),{method:"PUT",data:{...option,active}});
  }}));
}
export function orderActions():BulkAction[]{
  return [{id:"confirm",label:"تأكيد الطلبات الجديدة",icon:PackageCheck,from:"pending",to:"confirmed"},{id:"pack",label:"بدء تجهيز المؤكد",icon:PackageOpen,from:"confirmed",to:"packing"}].map(action=>({...action,run:async(id:string)=>{
    const order=await office<AdminOrder>("orders/"+id);
    if(order.status!==action.from)throw new Error(`${id}: الحالة الحالية لا تسمح بهذا الإجراء`);
    await office("orders/"+id+"/status",{method:"PUT",data:{status:action.to}});
  }}));
}
