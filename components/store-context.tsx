"use client";

import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from "react";
import {api,ApiError,type Language,type Cart,type Product,type Variant,name} from "@/lib/store";

const EMPTY:Cart={lines:[],subtotalMinor:0,currency:"EGP"};
type Store = {
  lang:Language; ar:boolean; tr:(en:string,ar:string)=>string; toggleLanguage:()=>void; demo:boolean;
  cart:Cart; cartOpen:boolean; setCartOpen:(open:boolean)=>void; busy:boolean; token:()=>string;
  add:(product:Product,variant:Variant,quantity:number)=>Promise<boolean>; setQuantity:(id:string,quantity:number)=>Promise<boolean>;
  saved:string[]; toggleSaved:(slug:string)=>void; clearCart:()=>void;
};
const Context=createContext<Store|null>(null);
export const useStore=()=>useContext(Context)!;

export function StoreProvider({children,demo}:{children:ReactNode;demo:boolean}) {
  const [lang,setLang]=useState<Language>("en");
  const [cart,setCart]=useState<Cart>(EMPTY);
  const [cartOpen,setCartOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [saved,setSaved]=useState<string[]>([]);
  const [message,setMessage]=useState("");
  const cartRef=useRef(EMPTY);
  const tokenRef=useRef("");
  const inProgress=useRef(false);
  const set=useCallback((value:Cart)=>{
    cartRef.current=value;
    setCart(value);
    if(demo) {
      try {sessionStorage.setItem("siyag-demo-cart",JSON.stringify(value))} catch {}
    }
  },[demo]);
  const tr=(en:string,ar:string)=>lang==="ar"?ar:en;
  const saveToken=(value:string)=>{
    tokenRef.current=value;
    if(value) localStorage.setItem("siyag-cart",value); else localStorage.removeItem("siyag-cart");
  };
  useEffect(()=>{
    if(localStorage.getItem("siyag-lang")==="ar") setLang("ar");
    try {const items=JSON.parse(localStorage.getItem("siyag-saved")||"[]");if(Array.isArray(items))setSaved(items)} catch {}
    if(demo){
      try {
        const preview=JSON.parse(sessionStorage.getItem("siyag-demo-cart")||"null") as Cart|null;
        if(preview?.currency==="EGP"&&Array.isArray(preview.lines)&&Number.isFinite(preview.subtotalMinor))set(preview);
      } catch {}
      return;
    }
    const old=localStorage.getItem("siyag-cart");
    if(old){
      tokenRef.current=old;
      inProgress.current=true;setBusy(true);
      api<Cart>("store/cart",{token:old}).then(set).catch(error=>{
        if(error instanceof ApiError && [404,409].includes(error.status)) saveToken("");
      }).finally(()=>{inProgress.current=false;setBusy(false)});
    }
  },[demo,set]);
  useEffect(()=>{document.documentElement.lang=lang;document.documentElement.dir=lang==="ar"?"rtl":"ltr"},[lang]);
  useEffect(()=>{if(!message)return; const timeout=setTimeout(()=>setMessage(""),4000);return()=>clearTimeout(timeout)},[message]);
  async function update(id:string,quantity:number,product?:Product,variant?:Variant){
    if(inProgress.current) return false;
    if(quantity>20){setMessage(tr("Maximum 20 per size.","الحد الأقصى ٢٠ قطعة للمقاس."));return false}
    inProgress.current=true;setBusy(true);
    try{
      if(demo){
        const lines=cartRef.current.lines.filter(l=>l.variantId!==id);
        const previous=cartRef.current.lines.find(l=>l.variantId===id);
        if(quantity>0 && previous) lines.push({...previous,quantity});
        else if(quantity>0 && product && variant) lines.push({variantId:id,slug:product.slug,nameEn:product.nameEn,nameAr:product.nameAr,image:product.images[0],sizeMl:variant.sizeMl,format:variant.format,quantity,unitPriceMinor:variant.priceMinor,available:variant.inStock});
        set({...EMPTY,lines,subtotalMinor:lines.reduce((sum,line)=>sum+line.quantity*line.unitPriceMinor,0)});
      }else{
        const create=async()=>{
          const result=await api<{token:string;cart:Cart}>("store/carts",{method:"POST"});
          saveToken(result.token);
        };
        if(!tokenRef.current) await create();
        const send=()=>api<Cart>("store/cart/lines/"+id,{method:"PUT",token:tokenRef.current,data:{quantity}});
        try{set(await send())}catch(error){
          if(!(error instanceof ApiError)||!["cart-checked-out","not-found"].includes(error.code??""))throw error;
          await create();set(await send());
        }
      }
      if(product){setMessage(tr(`${name(product,lang)} added to bag`,"اتضاف العطر للحقيبة"));setCartOpen(true)}
      return true;
    }catch(error){setMessage(lang==="ar"?"تعذر تحديث الحقيبة. راجع توافر المقاس وحاول مرة أخرى.":error instanceof Error?error.message:"Could not update your bag.");return false}
    finally{inProgress.current=false;setBusy(false)}
  }
  const value:Store={lang,ar:lang==="ar",tr,demo,cart,cartOpen,setCartOpen,busy,token:()=>tokenRef.current,
    toggleLanguage:()=>{const next=lang==="ar"?"en":"ar";localStorage.setItem("siyag-lang",next);setLang(next)},
    add:(p,v,q)=>update(v.id,(cartRef.current.lines.find(l=>l.variantId===v.id)?.quantity??0)+q,p,v),
    setQuantity:update,
    saved,toggleSaved:(slug)=>setSaved(old=>{const next=old.includes(slug)?old.filter(s=>s!==slug):[...old,slug];localStorage.setItem("siyag-saved",JSON.stringify(next));return next}),
    clearCart:()=>{saveToken("");set(EMPTY)},
  };
  return <Context.Provider value={value}>{children}<div className="toast-live" aria-live="polite">{message&&<div>{message}</div>}</div></Context.Provider>;
}
