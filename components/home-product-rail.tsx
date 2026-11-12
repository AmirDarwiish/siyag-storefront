"use client";
import {useEffect,useRef,type CSSProperties} from "react";
import {imageSizes} from "@/lib/image-sizes";
import {cssMilliseconds} from "@/lib/rail-motion";
import type {Product} from "@/lib/store";
import {useStore} from "./store-context";
import {ProductCard} from "./product";

/** Native snapping and stable DOM order prevent recycling beneath a touch gesture. */
export function HomeProductRail({products}:{products:Product[]}) {
 const {ar,tr}=useStore(),rail=useRef<HTMLDivElement>(null),interacted=useRef(false);
 useEffect(()=>{
  const element=rail.current;if(!element)return;
  interacted.current=false;element.scrollTo({left:0,behavior:"instant"});
  const preference=matchMedia("(prefers-reduced-motion: reduce)");
  let visible=false,index=0;
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting},{threshold:.5});observer.observe(element);
  const interval=cssMilliseconds(getComputedStyle(element).getPropertyValue("--motion-rail-step-interval"));
  const timer=setInterval(()=>{
   if(interacted.current||preference.matches||!visible||document.hidden||element.contains(document.activeElement)||element.matches(":hover")||document.querySelector('[role="dialog"][data-state="open"]'))return;
   const items=element.querySelectorAll<HTMLElement>(".home-rail-item");
   const step=items.length>1?Math.abs(items[1].offsetLeft-items[0].offsetLeft):0;
   const maximum=Math.max(0,element.scrollWidth-element.clientWidth);
   // Stop at the end instead of introducing a visible reset or duplicate cards.
   if(!step||index*step>=maximum)return;
   index++;element.scrollTo({left:(ar?-1:1)*Math.min(index*step,maximum),behavior:"smooth"});
  },interval||4200);
  return()=>{clearInterval(timer);observer.disconnect()};
 },[ar,products.length]);
 const stop=()=>{interacted.current=true;const element=rail.current;if(element)element.scrollTo({left:element.scrollLeft,behavior:"instant"})};
 return <div ref={rail} className="home-product-rail" dir={ar?"rtl":"ltr"} data-mode="step" data-count={products.length}
  style={{"--rail-visible":Math.max(1,Math.min(products.length,3))} as CSSProperties}
  tabIndex={0} role="region" aria-label={tr("Selected fragrances. Swipe or use arrow keys. Automatic movement stops when you interact.","مختارات العطور. اسحب أو استخدم الأسهم. تتوقف الحركة التلقائية عند تفاعلك.")}
  onPointerDownCapture={stop} onTouchStartCapture={stop} onWheel={stop} onFocusCapture={stop}
  onKeyDown={event=>{
   stop();if(event.target!==event.currentTarget)return;
   if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
   event.preventDefault();const element=event.currentTarget,items=element.querySelectorAll<HTMLElement>(".home-rail-item");
   const step=items.length>1?Math.abs(items[1].offsetLeft-items[0].offsetLeft):0;
   const maximum=element.scrollWidth-element.clientWidth;
   const left=event.key==="Home"?0:event.key==="End"?(ar?-maximum:maximum):element.scrollLeft+(event.key==="ArrowRight"?step:-step);
   element.scrollTo({left,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
  }}>
  <div className="home-product-track">{products.map(product=><div className="home-rail-item" key={product.id}><ProductCard product={product} photoSizes={imageSizes.rail}/></div>)}</div>
 </div>;
}
