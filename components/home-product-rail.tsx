"use client";

import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from "react";
import type {Product} from "@/lib/store";
import {useStore} from "./store-context";
import {ProductCard} from "./product";

/** Recycles the real cards at the edge; no duplicate products or duplicate controls. */
export function HomeProductRail({products}:{products:Product[]}){
  const {ar,tr}=useStore();
  const rail=useRef<HTMLDivElement>(null);
  const [shift,setShift]=useState(0);
  const [visible,setVisible]=useState(false);
  const [reduced,setReduced]=useState(true);
  const [hovered,setHovered]=useState(false);
  const [focused,setFocused]=useState(false);
  const [dragging,setDragging]=useState(false);
  const position=useRef(0),step=useRef(0),recycling=useRef(false),resumeAt=useRef(0);
  const settings=useRef({speed:18,resume:1800});
  const count=products.length;
  const start=count?(shift+(!ar&&!reduced?count-1:0))%count:0;
  const ordered=[...products.slice(start),...products.slice(0,start)];
  const paused=hovered||focused||dragging;

  useEffect(()=>{
    const preference=matchMedia("(prefers-reduced-motion: reduce)");
    const update=()=>setReduced(preference.matches);
    update();preference.addEventListener("change",update);
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));
    if(rail.current)observer.observe(rail.current);
    return()=>{preference.removeEventListener("change",update);observer.disconnect()};
  },[]);
  useLayoutEffect(()=>{
    const element=rail.current;
    if(!element)return;
    function measure(){
      if(!element)return;
      const css=getComputedStyle(element);
      step.current=(element.firstElementChild?.getBoundingClientRect().width??0)+(parseFloat(css.columnGap)||0);
      settings.current={speed:parseFloat(css.getPropertyValue("--motion-rail-speed"))||18,resume:parseFloat(css.getPropertyValue("--motion-rail-resume"))||1800};
      position.current=ar||reduced?0:step.current;
      recycling.current=false;element.scrollLeft=position.current;
    }
    measure();
    const observer=new ResizeObserver(measure);observer.observe(element);
    return()=>observer.disconnect();
  },[ar,count,reduced]);
  useLayoutEffect(()=>{
    if(recycling.current&&rail.current){rail.current.scrollLeft=position.current;recycling.current=false}
  },[shift]);
  useEffect(()=>{
    const element=rail.current;
    if(!element||reduced||!visible||paused||count<2)return;
    let frame=0,last=0;
    function advance(now:number){
      if(!element)return;
      const elapsed=last?Math.min(now-last,64):0;last=now;
      const dialog=document.activeElement?.closest('[role="dialog"]');
      if(document.visibilityState==="visible"&&!dialog&&now>=resumeAt.current&&!recycling.current&&step.current>0){
        position.current+=(ar?1:-1)*settings.current.speed*elapsed/1000;
        if(ar&&position.current>=step.current){
          position.current-=step.current;recycling.current=true;setShift(value=>(value+1)%count);
        }else if(!ar&&position.current<=0){
          position.current+=step.current;recycling.current=true;setShift(value=>(value+count-1)%count);
        }else element.scrollLeft=position.current;
      }
      frame=requestAnimationFrame(advance);
    }
    frame=requestAnimationFrame(advance);
    return()=>cancelAnimationFrame(frame);
  },[ar,count,reduced,visible,paused]);
  function rest(){
    position.current=rail.current?.scrollLeft??0;
    resumeAt.current=performance.now()+settings.current.resume;
  }
  return <div ref={rail} className="home-product-rail" data-flow={ar?"left":"right"} data-count={count} data-motion={reduced?"reduced":paused?"paused":visible?"running":"offscreen"}
    style={{"--rail-visible":Math.max(1,Math.min(count-1,3))} as CSSProperties}
    tabIndex={0} role="region" aria-label={tr("Selected fragrances. Focus to stop movement and browse.","مختارات العطور. ركّز داخل القائمة لإيقاف الحركة والتصفح.")}
    onPointerEnter={event=>{if(event.pointerType==="mouse")setHovered(true)}} onPointerLeave={()=>{rest();setHovered(false);setDragging(false)}}
    onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget)){rest();setFocused(false)}}}
    onPointerDown={()=>setDragging(true)} onPointerUp={()=>{rest();setDragging(false)}} onPointerCancel={()=>{rest();setDragging(false)}}
    onLostPointerCapture={()=>{rest();setDragging(false)}} onScroll={event=>{if(paused||performance.now()<resumeAt.current)position.current=event.currentTarget.scrollLeft}} onWheel={rest} onKeyDown={rest}>
    {ordered.map(product=><div className="home-rail-item" dir={ar?"rtl":"ltr"} key={product.id}><ProductCard product={product}/></div>)}
  </div>;
}
