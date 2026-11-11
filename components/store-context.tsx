"use client";

import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from "react";
import {api,ApiError,type Language,type Cart,type Product,type Variant,name} from "@/lib/store";
import Link from "next/link";
import {track,itemData,cartData} from "@/lib/analytics";
import {readLocal,writeLocal} from "@/lib/browser-storage";

const EMPTY:Cart={lines:[],subtotalMinor:0,currency:"EGP"};
type BagNotice={text:string;kind:"success"|"error"};
type Store = {
  lang:Language; ar:boolean; tr:(en:string,ar:string)=>string; toggleLanguage:()=>void; demo:boolean;
  cart:Cart; cartOpen:boolean; setCartOpen:(open:boolean)=>void; busy:boolean; token:()=>string;
  add:(product:Product,variant:Variant,quantity:number)=>Promise<boolean>; setQuantity:(id:string,quantity:number)=>Promise<boolean>;
  buyNow:(product:Product,variant:Variant,quantity:number)=>Promise<boolean>; dismissNotice:()=>void; bagNotice:BagNotice|null; saved:string[]; toggleSaved:(slug:string)=>void; clearCart:()=>void;
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
  useEffect(()=>{if(!bagNotice)return;const timeout=setTimeout(()=>setBagNotice(null),10000);return()=>clearTimeout(timeout)},[bagNotice]);
  function openBag(open:boolean){setBagNotice(null);if(open)track("view_cart",cartData(cartRef.current));setCartOpen(open)}
  async function update(id:string,quantity:number,product?:Product,variant?:Variant){
    if(inProgress.current) return false;
    if(quantity>20){setBagNotice({kind:"error",text:tr("Maximum 20 per size.","الحد الأقصى ٢٠ قطعة للمقاس.")});return false}
    inProgress.current=true;setBusy(true);
    try{
      const previous=cartRef.current.lines.find(l=>l.variantId===id);
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
      if(!product&&previous&&quantity<previous.quantity)track("remove_from_cart",{items:[{item_id:id,item_name:previous.nameEn,item_variant:String(previous.sizeMl),price:previous.unitPriceMinor/100,quantity:previous.quantity-quantity}],value:previous.unitPriceMinor*(previous.quantity-quantity)/100});
      if(product&&variant){setBagNotice({kind:"success",text:tr(`${name(product,lang)} added to bag`,"اتضاف العطر للحقيبة")});track("add_to_cart",itemData(product,variant,quantity-(previous?.quantity??0)))}
      return true;
    }catch(error){setBagNotice({kind:"error",text:lang==="ar"?"تعذر تحديث الحقيبة. راجع توافر المقاس وحاول مرة أخرى.":error instanceof Error?error.message:"Could not update your bag."});return false}
    finally{inProgress.current=false;setBusy(false)}
  }
  async function buyNow(product:Product,variant:Variant,quantity:number){
    if(inProgress.current||!variant.inStock||quantity<1||quantity>20)return false;
    inProgress.current=true;setBusy(true);setBagNotice(null);
    try{
      if(demo){
        const preview:Cart={currency:"EGP",subtotalMinor:variant.priceMinor*quantity,lines:[{variantId:variant.id,slug:product.slug,nameEn:product.nameEn,nameAr:product.nameAr,image:product.images[0],sizeMl:variant.sizeMl,format:variant.format,quantity,unitPriceMinor:variant.priceMinor,available:true}]};
        sessionStorage.setItem("siyag-express-token","preview");sessionStorage.setItem("siyag-express-preview",JSON.stringify(preview));return true;
      }
      const created=await api<{token:string;cart:Cart}>("store/carts",{method:"POST"});
      await api<Cart>("store/cart/lines/"+variant.id,{method:"PUT",token:created.token,data:{quantity}});
      sessionStorage.setItem("siyag-express-token",created.token);
      track("buy_now",itemData(product,variant,quantity));
      return true;
    }catch(error){setBagNotice({kind:"error",text:error instanceof Error?error.message:tr("Could not start checkout.","تعذر بدء الطلب.")});return false}
    finally{inProgress.current=false;setBusy(false)}
  }
  const value:Store={lang,ar:lang==="ar",tr,demo,cart,cartOpen,setCartOpen:openBag,busy,bagNotice,buyNow,dismissNotice:()=>setBagNotice(null),token:()=>tokenRef.current,
    toggleLanguage:()=>{const next=lang==="ar"?"en":"ar";writeLocal("siyag-lang",next);setLang(next)},
    add:(p,v,q)=>update(v.id,(cartRef.current.lines.find(l=>l.variantId===v.id)?.quantity??0)+q,p,v),
    setQuantity:update,
    saved,toggleSaved:(slug)=>{const next=saved.includes(slug)?saved.filter(s=>s!==slug):[...saved,slug];if(!saved.includes(slug))track("add_to_wishlist",{items:[{item_id:slug}]});writeLocal("siyag-saved",JSON.stringify(next));setSaved(next)},
    clearCart:()=>{saveToken("");set(EMPTY)},
  };
  return <Context.Provider value={value}>{children}<div className="toast-live" aria-live="polite">{!cartOpen&&bagNotice&&<div className="bag-confirmation" data-kind={bagNotice.kind}><p>{bagNotice.text}</p>{bagNotice.kind==="success"&&<div><button type="button" onClick={()=>openBag(true)}>{tr("View bag","عرض الحقيبة")}</button><Link href="/checkout" onClick={()=>setBagNotice(null)}>{tr("Checkout","إتمام الطلب")}</Link></div>}<button type="button" className="notice-dismiss" onClick={()=>setBagNotice(null)}>{tr("Continue shopping","متابعة التسوق")}</button></div>}</div></Context.Provider>;
}
