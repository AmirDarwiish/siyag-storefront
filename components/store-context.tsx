"use client";

import {createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode} from "react";
import {api,ApiError,type Language,type Cart,type Product,type Variant,name,imageUrl,money} from "@/lib/store";
import Link from "next/link";
import {ArrowUpRight,Check,X} from "lucide-react";
import {variantImage} from "@/lib/catalog-experience";
import {track,itemData,cartData} from "@/lib/analytics";
import {readLocal,writeLocal} from "@/lib/browser-storage";

const EMPTY:Cart={lines:[],subtotalMinor:0,currency:"EGP"};
type BagNotice={text:string;kind:"success"|"error";item?:{image?:string;title:string;sizeMl:number;quantity:number;priceMinor:number}};
type Store = {
  lang:Language; ar:boolean; tr:(en:string,ar:string)=>string; toggleLanguage:()=>void; demo:boolean;
  cart:Cart; cartOpen:boolean; setCartOpen:(open:boolean)=>void; busy:boolean; pendingVariants:string[]; token:()=>string;
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
  const queue=useRef<Promise<unknown>>(Promise.resolve());
  const pendingCount=useRef(0);
  const pendingByVariant=useRef(new Map<string,number>());
  const [pendingVariants,setPendingVariants]=useState<string[]>([]);
  function run<T>(id:string|null,task:()=>Promise<T>):Promise<T>{
    pendingCount.current++;setBusy(true);
    if(id){pendingByVariant.current.set(id,(pendingByVariant.current.get(id)??0)+1);setPendingVariants([...pendingByVariant.current.keys()])}
    const result=queue.current.then(task);
    const settled=result.finally(()=>{
      pendingCount.current--;setBusy(pendingCount.current>0);
      if(id){const remaining=(pendingByVariant.current.get(id)??1)-1;if(remaining)pendingByVariant.current.set(id,remaining);else pendingByVariant.current.delete(id);setPendingVariants([...pendingByVariant.current.keys()])}
    });
    queue.current=settled.catch(()=>{});
    return settled;
  }
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
      void run(null,()=>api<Cart>("store/cart",{token:old}).then(set).catch(error=>{
        if(error instanceof ApiError && [404,409].includes(error.status)) saveToken("");
      }));
    }
    return cleanup;
  },[demo,set]);
  useEffect(()=>{document.documentElement.lang=lang;document.documentElement.dir=lang==="ar"?"rtl":"ltr"},[lang]);
  useEffect(()=>{if(!bagNotice)return;const timeout=setTimeout(()=>setBagNotice(null),8000);return()=>clearTimeout(timeout)},[bagNotice]);
  function openBag(open:boolean){setBagNotice(null);if(open)track("view_cart",cartData(cartRef.current));setCartOpen(open)}
  async function update(id:string,quantity:number,product?:Product,variant?:Variant,increment=false){
    return run(id,async()=>{
    if(increment)quantity+=(cartRef.current.lines.find(l=>l.variantId===id)?.quantity??0);
    if(quantity>20){setBagNotice({kind:"error",text:tr("Maximum 20 per size.","الحد الأقصى ٢٠ قطعة للمقاس.")});return false}
    try{
      const previous=cartRef.current.lines.find(l=>l.variantId===id);
      if(demo){
        const lines=cartRef.current.lines.filter(l=>l.variantId!==id);
        const previous=cartRef.current.lines.find(l=>l.variantId===id);
        if(quantity>0 && previous) lines.push({...previous,quantity});
        else if(quantity>0 && product && variant) lines.push({variantId:id,slug:product.slug,nameEn:product.nameEn,nameAr:product.nameAr,image:variantImage(product,variant),sizeMl:variant.sizeMl,format:variant.format,quantity,unitPriceMinor:variant.priceMinor,available:variant.inStock});
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
      if(product&&variant){setBagNotice({kind:"success",text:tr("Added to your bag","اتضاف لحقيبتك"),item:{image:variantImage(product,variant),title:name(product,lang),sizeMl:variant.sizeMl,quantity:quantity-(previous?.quantity??0),priceMinor:variant.priceMinor}});track("add_to_cart",itemData(product,variant,quantity-(previous?.quantity??0)))}
      return true;
    }catch(error){setBagNotice({kind:"error",text:lang==="ar"?"تعذر تحديث الحقيبة. راجع توافر المقاس وحاول مرة أخرى.":error instanceof Error?error.message:"Could not update your bag."});return false}
    });
  }
  async function buyNow(product:Product,variant:Variant,quantity:number){
    if(!variant.inStock||quantity<1||quantity>20)return false;
    return run(variant.id,async()=>{
    setBagNotice(null);
    try{
      if(demo){
        const preview:Cart={currency:"EGP",subtotalMinor:variant.priceMinor*quantity,lines:[{variantId:variant.id,slug:product.slug,nameEn:product.nameEn,nameAr:product.nameAr,image:variantImage(product,variant),sizeMl:variant.sizeMl,format:variant.format,quantity,unitPriceMinor:variant.priceMinor,available:true}]};
        sessionStorage.setItem("siyag-express-token","preview");sessionStorage.setItem("siyag-express-preview",JSON.stringify(preview));return true;
      }
      const created=await api<{token:string;cart:Cart}>("store/carts",{method:"POST"});
      await api<Cart>("store/cart/lines/"+variant.id,{method:"PUT",token:created.token,data:{quantity}});
      sessionStorage.setItem("siyag-express-token",created.token);
      track("buy_now",itemData(product,variant,quantity));
      return true;
    }catch(error){setBagNotice({kind:"error",text:error instanceof Error?error.message:tr("Could not start checkout.","تعذر بدء الطلب.")});return false}
    });
  }
  const dismissNotice=useCallback(()=>setBagNotice(null),[]);
  const value:Store={lang,ar:lang==="ar",tr,demo,cart,cartOpen,setCartOpen:openBag,busy,pendingVariants,bagNotice,buyNow,dismissNotice,token:()=>tokenRef.current,
    toggleLanguage:()=>{const next=lang==="ar"?"en":"ar";writeLocal("siyag-lang",next);setLang(next)},
    add:(p,v,q)=>update(v.id,q,p,v,true),
    setQuantity:update,
    saved,toggleSaved:(slug)=>{const next=saved.includes(slug)?saved.filter(s=>s!==slug):[...saved,slug];if(!saved.includes(slug))track("add_to_wishlist",{items:[{item_id:slug}]});writeLocal("siyag-saved",JSON.stringify(next));setSaved(next)},
    clearCart:()=>{saveToken("");set(EMPTY)},
  };
  return <Context.Provider value={value}>{children}<div className="toast-live" aria-live="polite">{!cartOpen&&bagNotice&&<section className="bag-confirmation refined-confirmation" data-kind={bagNotice.kind} aria-label={tr("Bag update","تحديث الحقيبة")}>
    <button type="button" className="confirmation-close" aria-label={tr("Dismiss notification","إغلاق التنبيه")} onClick={dismissNotice}><X size={18}/></button>
    <div className="confirmation-heading"><span className="confirmation-check"><Check size={14}/></span><span>{bagNotice.text}</span></div>
    {bagNotice.item&&<div className="confirmation-product"><img src={imageUrl(bagNotice.item.image)} alt=""/><div><strong>{bagNotice.item.title}</strong><small>{bagNotice.item.sizeMl} {tr("ml","مل")}<span> · </span>{tr("Quantity","الكمية")} {bagNotice.item.quantity}</small></div><span>{money(bagNotice.item.priceMinor*bagNotice.item.quantity,lang)}</span></div>}
    {bagNotice.kind==="success"?<><div className="confirmation-actions"><button type="button" onClick={()=>openBag(true)}>{tr("View bag","عرض الحقيبة")}<ArrowUpRight size={15}/></button><Link href="/checkout" onClick={dismissNotice}>{tr("Checkout","إتمام الطلب")}<ArrowUpRight size={15}/></Link></div><button type="button" className="confirmation-continue" onClick={dismissNotice}>{tr("Continue shopping","متابعة التسوق")}</button></>:null}

  </section>}</div></Context.Provider>;
}
