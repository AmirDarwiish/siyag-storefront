import {invalidateOfficeMutation,resetOfficeCache} from "./admin-cache";
import type {Product, Variant} from "./store";

export type Role="Owner"|"Catalog"|"Fulfillment";
export type StaffUser={id:string;name:string;email:string;role:Role;active:boolean;mustChangePassword:boolean};
export const roleNames:Record<Role,string>={Owner:"مالك المتجر",Catalog:"إدارة الكتالوج",Fulfillment:"تنفيذ الطلبات"};
export type ProductSummary=Pick<Product,"id"|"slug"|"nameAr"|"nameEn"|"featured">&{published:boolean};
export type AdminVariant=Omit<Variant,"inStock">&{stock:number;active:boolean};
export type AdminProduct=Omit<Product,"variants"|"seo">&{published:boolean;variants:AdminVariant[];seo?:Record<string,string|null>};
export type AdminCollection={supportsMultipleProducts?:boolean;slug:string;nameAr:string;nameEn:string;imageUrl?:string|null;published:boolean;sortOrder:number};
export type OrderRow={number:string;status:string;paymentStatus:string;createdAt:string;totalMinor:number};
export type AdminOrder=OrderRow&{
  customerName:string;phone:string;email?:string;governorate:string;city:string;address:string;deliveryNotes?:string;
  paymentMethod:string;carrier?:string;carrierReference?:string;carrierTrackingUrl?:string;
  subtotalMinor:number;shippingMinor:number;discountMinor:number;taxMinor:number;taxIncluded:boolean;returnRequestedAt?:string;returnRejectionReason?:string;
  lines:{id:string;nameAr:string;nameEn:string;sku:string;sizeMl:number;quantity:number;unitPriceMinor:number}[];
  events:{id:string;at:string;status:string;actor:string}[];
};

export const statusNames:Record<string,string>={
  pending:"جديد",confirmed:"مؤكد",packing:"قيد التجهيز",shipped:"تم الشحن",delivered:"تم التسليم",
  cancelled:"ملغى",returned:"مرتجع",deliveryFailed:"تعذّر التسليم",
};
export const paymentNames:Record<string,string>={unpaid:"غير محصّل",collected:"محصّل",refunded:"مسترد",partiallyRefunded:"مسترد جزئيًا"};
export const orderDate=(value:string)=>new Intl.DateTimeFormat("ar-EG",{dateStyle:"medium",timeStyle:"short",timeZone:"Africa/Cairo"}).format(new Date(value));

export class OfficeError extends Error {
  constructor(public status:number,message:string){super(message)}
}

export async function office<T>(path:string,{method="GET",data,signal}:{method?:string;data?:unknown;signal?:AbortSignal}={}):Promise<T>{
  const form=data instanceof FormData;
  const res=await fetch("/api/office/"+path,{method,signal,cache:"no-store",
    headers:data===undefined||form?undefined:{"Content-Type":"application/json"},
    body:data===undefined?undefined:form?data:JSON.stringify(data),
  });
  if(res.status===204){if(method!=="GET"){if(path==="session")resetOfficeCache();else invalidateOfficeMutation(path)}return undefined as T;}
  const body=await res.json().catch(()=>null);
  if(!res.ok){
    if(res.status===401&&path!=="session"){resetOfficeCache();window.dispatchEvent(new Event("siyag-office-expired"));}
    const validation=body?.errors&&Object.values(body.errors).flat().filter(value=>typeof value==="string").join(" · ");
    throw new OfficeError(res.status,validation||body?.detail||"تعذّر إكمال الطلب.");
  }
  if(method!=="GET"){if(path==="session")resetOfficeCache();else if(path!=="realtime/ticket")invalidateOfficeMutation(path)}
  return body as T;
}
