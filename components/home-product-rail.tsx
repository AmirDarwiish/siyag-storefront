"use client";
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from "react";
import {flushSync} from "react-dom";
import {normalizeRail} from "@/lib/rail-motion";
import type {Product} from "@/lib/store";
import {useStore} from "./store-context";
import {ProductCard} from "./product";

/** One real card per product. Native touch scrolling, atomic recycling and subpixel motion. */
export function HomeProductRail({products}:{products:Product[]}){
 const {ar,tr}=useStore(),rail=useRef<HTMLDivElement>(null),track=useRef<HTMLDivElement>(null);
 const [shift,setShift]=useState(0),[visible,setVisible]=useState(false),[reduced,setReduced]=useState(true);
 const position=useRef(0),step=useRef(0),pending=useRef(false),resumeAt=useRef(0),dragging=useRef(false),hovered=useRef(false);
 const settings=useRef({speed:0,resume:0}),count=products.length;
 const start=count?((shift+(!ar&&!reduced?count-1:0))%count+count)%count:0;
 const ordered=[...products.slice(start),...products.slice(0,start)];
 function paint(){const element=rail.current,strip=track.current;if(!element||!strip)return;const whole=Math.floor(position.current);element.scrollLeft=whole;strip.style.setProperty("--rail-offset",`${-(position.current-whole)}px`)}
 function rest(){position.current=rail.current?.scrollLeft??0;track.current?.style.setProperty("--rail-offset","0px");resumeAt.current=performance.now()+settings.current.resume}
 useEffect(()=>{
  const preference=matchMedia("(prefers-reduced-motion: reduce)"),update=()=>setReduced(preference.matches);update();preference.addEventListener("change",update);
  const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.05});if(rail.current)observer.observe(rail.current);
  return()=>{preference.removeEventListener("change",update);observer.disconnect()};
 },[]);
 useLayoutEffect(()=>{
  const element=rail.current,strip=track.current;if(!element||!strip)return;
  step.current=0;
  function measure(){if(!element||!strip)return;const css=getComputedStyle(strip),next=(strip.firstElementChild?.getBoundingClientRect().width??0)+(parseFloat(css.columnGap)||0);if(Math.abs(next-step.current)<.1)return;step.current=next;const theme=getComputedStyle(element);settings.current={speed:parseFloat(theme.getPropertyValue("--motion-rail-speed"))||0,resume:parseFloat(theme.getPropertyValue("--motion-rail-resume"))||0};position.current=ar||reduced?0:next;pending.current=false;paint()}
  measure();const observer=new ResizeObserver(measure);observer.observe(element);if(strip.firstElementChild)observer.observe(strip.firstElementChild);return()=>observer.disconnect();
 },[ar,count,reduced]);
 useLayoutEffect(()=>{if(pending.current){paint();pending.current=false}},[shift]);
 useEffect(()=>{
  const element=rail.current;if(!element||reduced||!visible||count<2)return;
  let frame=0,last=0;
  function advance(now:number){
   if(!element)return;const elapsed=last?Math.min(now-last,40):0;last=now;const active=document.activeElement;
   const paused=hovered.current||dragging.current||element.contains(active)||!!document.querySelector('[role="dialog"][data-state="open"]')||document.visibilityState!=="visible";
   element.dataset.motion=paused?"paused":"running";
   if(!paused&&now>=resumeAt.current&&step.current>0){
    position.current+=(ar?1:-1)*settings.current.speed*elapsed/1000;
    // A touch fling may cross several cards. Rebase all of them in one layout commit,
    // only after native momentum settles; never fight the user's scrolling.
    const normalized=normalizeRail(position.current,step.current),crossed=normalized.crossed;
    if(crossed!==0){position.current=normalized.offset;pending.current=true;flushSync(()=>setShift(value=>((value+crossed)%count+count)%count))}else paint();
   }
   frame=requestAnimationFrame(advance);
  }
  frame=requestAnimationFrame(advance);return()=>cancelAnimationFrame(frame);
 },[ar,count,reduced,visible]);
 useEffect(()=>{const release=()=>{if(dragging.current){dragging.current=false;rest()}};window.addEventListener("pointerup",release);window.addEventListener("pointercancel",release);return()=>{window.removeEventListener("pointerup",release);window.removeEventListener("pointercancel",release)}},[]);
 return <div ref={rail} className="home-product-rail" data-flow={ar?"left":"right"} data-count={count} data-motion={reduced?"reduced":visible?"running":"offscreen"} style={{"--rail-visible":Math.max(1,Math.min(count-1,3))} as CSSProperties} tabIndex={0} role="region" aria-label={tr("Selected fragrances. Focus to pause; use arrow keys to browse and Escape to resume.","مختارات العطور. ركّز لإيقاف الحركة، واستخدم الأسهم للتصفح وEscape لاستئنافها.")}
 onPointerEnter={event=>{if(event.pointerType==="mouse")hovered.current=true}} onPointerLeave={()=>{hovered.current=false;rest()}} onPointerDown={()=>{dragging.current=true;rest()}} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))rest()}} onScroll={event=>{if(dragging.current||performance.now()<resumeAt.current){position.current=event.currentTarget.scrollLeft;resumeAt.current=performance.now()+settings.current.resume}}} onWheel={rest} onKeyDown={event=>{rest();if(event.key==="Escape")event.currentTarget.blur()}}>
  <div ref={track} className="home-product-track">{ordered.map(product=><div className="home-rail-item" dir={ar?"rtl":"ltr"} key={product.id}><ProductCard product={product}/></div>)}</div>
 </div>;
}
