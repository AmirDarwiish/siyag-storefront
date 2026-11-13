"use client";
import {useEffect,useRef,useState,type CSSProperties} from "react";
import {imageSizes} from "@/lib/image-sizes";
import {registerRailAutoplay} from "@/lib/rail-autoplay";
import {cssMilliseconds} from "@/lib/rail-motion";
import type {Product} from "@/lib/store";
import {useStore} from "./store-context";
import {ProductCard} from "./product";

/** Two mobile cards per page, native swiping, and pagination without cloned products. */
export function HomeProductRail({products}:{products:Product[]}) {
 const {ar,tr}=useStore(),rail=useRef<HTMLDivElement>(null),resumeAt=useRef(0),dragging=useRef(false);
 const targets=useRef<number[]>([0]);
 const [pagination,setPagination]=useState({count:1,active:0});
 useEffect(()=>{
  const element=rail.current;if(!element)return;
  resumeAt.current=0;element.scrollTo({left:0,behavior:"instant"});
  const preference=matchMedia("(prefers-reduced-motion: reduce)");
  let direction=1;
  const update=()=>{
   const items=element.querySelectorAll<HTMLElement>(".home-rail-item");
   const step=items.length>1?Math.abs(items[1].offsetLeft-items[0].offsetLeft):0;
   const maximum=Math.max(0,element.scrollWidth-element.clientWidth);
   const perPage=step?Math.max(1,Math.round((element.clientWidth+step-items[0].clientWidth)/step)):1;
   targets.current=maximum>1&&step?Array.from({length:Math.ceil(items.length/perPage)},(_,i)=>Math.min(i*perPage*step,maximum)):[0];
   const position=Math.abs(element.scrollLeft);
   const active=targets.current.reduce((best,target,i)=>Math.abs(target-position)<Math.abs(targets.current[best]-position)?i:best,0);
   setPagination(previous=>previous.count===targets.current.length&&previous.active===active?previous:{count:targets.current.length,active});
  };
  update();
  const resize=new ResizeObserver(update);resize.observe(element);
  element.addEventListener("scroll",update,{passive:true});
  const interval=cssMilliseconds(getComputedStyle(element).getPropertyValue("--motion-rail-step-interval"));
  const unregister=registerRailAutoplay({element,interval:interval||4200,advance:()=>{
   if(dragging.current||performance.now()<resumeAt.current||preference.matches||document.hidden||element.parentElement?.contains(document.activeElement)&&!!document.activeElement?.matches(":focus-visible")||(matchMedia("(hover: hover)").matches&&element.matches(":hover"))||document.querySelector('[role="dialog"][data-state="open"]'))return;
   const pages=targets.current;if(pages.length<2)return;
   const position=Math.abs(element.scrollLeft);
   const active=pages.reduce((best,target,i)=>Math.abs(target-position)<Math.abs(pages[best]-position)?i:best,0);
   if(active===pages.length-1)direction=-1;else if(active===0)direction=1;
   element.scrollTo({left:(ar?-1:1)*pages[active+direction],behavior:"smooth"});
  }});
  return()=>{unregister();resize.disconnect();element.removeEventListener("scroll",update)};
 },[ar,products.length]);
 const stop=()=>{const element=rail.current;if(!element)return;resumeAt.current=performance.now()+cssMilliseconds(getComputedStyle(element).getPropertyValue("--motion-rail-resume"));element.scrollTo({left:element.scrollLeft,behavior:"instant"})};
 const goTo=(index:number)=>{stop();rail.current?.scrollTo({left:(ar?-1:1)*targets.current[index],behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"})};
 return <div className="home-rail-carousel">
 <div ref={rail} className="home-product-rail" dir={ar?"rtl":"ltr"} data-mode="step" data-count={products.length}
  style={{"--rail-visible":Math.max(1,Math.min(products.length,3))} as CSSProperties}
  tabIndex={0} role="region" aria-roledescription={tr("carousel","عرض متحرك")} aria-label={tr("Selected fragrances. Swipe or use arrow keys. Automatic movement pauses when you interact.","مختارات العطور. اسحب أو استخدم الأسهم. تتوقف الحركة مؤقتًا عند تفاعلك.")}
  onPointerDownCapture={()=>{dragging.current=true;stop()}} onPointerUpCapture={()=>{dragging.current=false;stop()}} onPointerCancelCapture={()=>{dragging.current=false;stop()}} onTouchStartCapture={()=>{dragging.current=true;stop()}} onTouchEndCapture={()=>{dragging.current=false;stop()}} onTouchCancelCapture={()=>{dragging.current=false;stop()}} onWheel={stop} onFocusCapture={stop}
  onKeyDown={event=>{
   if(event.target!==event.currentTarget||event.ctrlKey||event.metaKey||event.altKey)return;
   if(!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
   event.preventDefault();
   const next=event.key==="Home"?0:event.key==="End"?pagination.count-1:Math.max(0,Math.min(pagination.count-1,pagination.active+(event.key==="ArrowRight"?(ar?-1:1):(ar?1:-1))));
   goTo(next);
  }}>
  <div className="home-product-track">{products.map(product=><div className="home-rail-item" key={product.id}><ProductCard product={product} photoSizes={imageSizes.rail}/></div>)}</div>
 </div>
 {pagination.count>1&&<nav className="home-rail-pagination" dir={ar?"rtl":"ltr"} aria-label={tr("Fragrance pages","صفحات العطور")}>{Array.from({length:pagination.count},(_,index)=><button key={index} type="button" className="home-rail-dot" aria-label={tr(`Show fragrance page ${index+1} of ${pagination.count}`,`عرض صفحة العطور ${index+1} من ${pagination.count}`)} aria-current={pagination.active===index?"true":undefined} onClick={()=>goTo(index)}><span/></button>)}</nav>}
 </div>;
}
