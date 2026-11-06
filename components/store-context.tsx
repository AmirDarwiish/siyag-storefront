"use client";

import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from "react";
import {api,ApiError,type Language,type Cart,type Product,type Variant,name} from "@/lib/store";
import {readLocal,writeLocal} from "@/lib/browser-storage";

const EMPTY:Cart={lines:[],subtotalMinor:0,currency:"EGP"};
type BagNotice={text:string;kind:"success"|"error"};
type Store = {
  lang:Language; ar:boolean; tr:(en:string,ar:string)=>string; toggleLanguage:()=>void; demo:boolean;
  cart:Cart; cartOpen:boolean; setCartOpen:(open:boolean)=>void; busy:boolean; token:()=>string;
  add:(product:Product,variant:Variant,quantity:number)=>Promise<boolean>; setQuantity:(id:string,quantity:number)=>Promise<boolean>;
  bagNotice:BagNotice|null; saved:string[]; toggleSaved:(slug:string)=>void; clearCart:()=>void;
};
const Context=createContext<Store|null>(null);
export const useStore=()=>useContext(Context)!;

export function StoreProvider({children,demo}:{children:ReactNode;demo:boolean}) {
  const [lang,setLang]=useState<Language>("en");
  const [cart,setCart]=useState<Cart>(EMPTY);
  const [cartOpen,setCartOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [saved,setSaved]=useState<string[]>([]);
  const [bagNotice,setBagNotice]=useState<BagNotice|null>(null);
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
    writeLocal("siyag-cart",value||null);
  };
  useEffect(()=>{
    if(readLocal("siyag-lang")==="ar") setLang("ar");
    function restoreSaved(){
      try{
        const items:unknown=JSON.parse(readLocal("siyag-saved")||"[]");
        setSaved(Array.isArray(items)?items.filter((item):item is string=>typeof item==="string"&&/^[a-z0-9-]+$/.test(item)):[]);
      }catch{setSaved([])}
    }
    restoreSaved();
    function syncSaved(event:StorageEvent){
      if(event.key==="siyag-saved"||event.key===null)restoreSaved();
    }
    window.addEventListener("storage",syncSaved);
    const cleanup=()=>window.removeEventListener("storage",syncSaved);
    if(demo){
      try {
        const preview=JSON.parse(sessionStorage.getItem("siyag-demo-cart")||"null") as Cart|null;
        if(preview?.currency==="EGP"&&Array.isArray(preview.lines)&&Number.isFinite(preview.subtotalMinor))set(preview);
      } catch {}
      return cleanup;
    }
    const old=readLocal("siyag-cart");
    if(old){
      tokenRef.current=old;
      inProgress.current=true;setBusy(true);
      api<Cart>("store/cart",{token:old}).then(set).catch(error=>{
        if(error instanceof ApiError && [404,409].includes(error.status)) saveToken("");
      }).finally(()=>{inProgress.current=false;setBusy(false)});
    }
    return cleanup;
  },[demo,set]);
  useEffect(()=>{document.documentElement.lang=lang;document.documentElement.dir=lang==="ar"?"rtl":"ltr"},[lang]);
  useEffect(()=>{if(!bagNotice)return;const timeout=setTimeout(()=>setBagNotice(null),4000);return()=>clearTimeout(timeout)},[bagNotice]);
  function openBag(open:boolean){if(!open)setBagNotice(null);setCartOpen(open)}
  async function update(id:string,quantity:number,product?:Product,variant?:Variant){
    if(inProgress.current) return false;
    if(quantity>20){setBagNotice({kind:"error",text:tr("Maximum 20 per size.","الحد الأقصى ٢٠ قطعة للمقاس.")});return false}
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
      if(product){setBagNotice({kind:"success",text:tr(`${name(product,lang)} added to bag`,"اتضاف العطر للحقيبة")});setCartOpen(true)}
      return true;
    }catch(error){setBagNotice({kind:"error",text:lang==="ar"?"تعذر تحديث الحقيبة. راجع توافر المقاس وحاول مرة أخرى.":error instanceof Error?error.message:"Could not update your bag."});return false}
    finally{inProgress.current=false;setBusy(false)}
  }
  const value:Store={lang,ar:lang==="ar",tr,demo,cart,cartOpen,setCartOpen:openBag,busy,bagNotice,token:()=>tokenRef.current,
    toggleLanguage:()=>{const next=lang==="ar"?"en":"ar";writeLocal("siyag-lang",next);setLang(next)},
    add:(p,v,q)=>update(v.id,(cartRef.current.lines.find(l=>l.variantId===v.id)?.quantity??0)+q,p,v),
    setQuantity:update,
    saved,toggleSaved:(slug)=>setSaved(old=>{const next=old.includes(slug)?old.filter(s=>s!==slug):[...old,slug];writeLocal("siyag-saved",JSON.stringify(next));return next}),
    clearCart:()=>{saveToken("");set(EMPTY)},
  };
  return <Context.Provider value={value}>{children}<div className="toast-live" aria-live="polite">{!cartOpen&&bagNotice&&<div>{bagNotice.text}</div>}</div></Context.Provider>;
}
