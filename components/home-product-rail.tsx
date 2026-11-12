"use client";
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from "react";
import {flushSync} from "react-dom";
import {imageSizes} from "@/lib/image-sizes";
import {normalizeRail,mobileRailPlan,railStepProgress} from "@/lib/rail-motion";
import type {Product} from "@/lib/store";
import {useStore} from "./store-context";
import {ProductCard} from "./product";

/** Unique real cards. Mobile advances one complete card, then becomes manual on interaction. */
export function HomeProductRail({products}:{products:Product[]}){
 const {ar,tr}=useStore(),rail=useRef<HTMLDivElement>(null),track=useRef<HTMLDivElement>(null);
 const [shift,setShift]=useState(0),[visible,setVisible]=useState(false),[reduced,setReduced]=useState(true),[mobile,setMobile]=useState(false),[mobilePaused,setMobilePaused]=useState(false);
 const position=useRef(0),step=useRef(0),pending=useRef(false),resumeAt=useRef(0),dragging=useRef(false),hovered=useRef(false),mobileStopped=useRef(false);
 const settings=useRef({speed:0,resume:0,interval:0,duration:0}),count=products.length;
 const start=count?((shift+(!ar&&!reduced?count-1:0))%count+count)%count:0;
 const ordered=[...products.slice(start),...products.slice(0,start)];
 function paint(){const element=rail.current,strip=track.current;if(!element||!strip)return;const whole=Math.floor(position.current);element.scrollLeft=whole;strip.style.setProperty("--rail-offset",`${-(position.current-whole)}px`)}
 function rest(){position.current=rail.current?.scrollLeft??0;track.current?.style.setProperty("--rail-offset","0px");resumeAt.current=performance.now()+settings.current.resume}
 function interact(pointer=false){
  if(pointer)dragging.current=true;
  rest();
  if(mobile){mobileStopped.current=true;setMobilePaused(true);if(rail.current)rail.current.dataset.motion="paused"}
 }
 useEffect(()=>{
  const preference=matchMedia("(prefers-reduced-motion: reduce)"),update=()=>setReduced(preference.matches);update();preference.addEventListener("change",update);
  const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.05});if(rail.current)observer.observe(rail.current);
  return()=>{preference.removeEventListener("change",update);observer.disconnect()};
 },[]);
 useLayoutEffect(()=>{
  const element=rail.current,strip=track.current;if(!element||!strip)return;
  step.current=0;
  function measure(){
   if(!element||!strip)return;
   const css=getComputedStyle(strip),theme=getComputedStyle(element),next=(strip.firstElementChild?.getBoundingClientRect().width??0)+(parseFloat(css.columnGap)||0);
   setMobile(theme.getPropertyValue("--rail-step-mode").trim()==="1");
   settings.current={speed:parseFloat(theme.getPropertyValue("--motion-rail-speed"))||0,resume:parseFloat(theme.getPropertyValue("--motion-rail-resume"))||0,interval:parseFloat(theme.getPropertyValue("--motion-rail-step-interval"))||0,duration:parseFloat(theme.getPropertyValue("--motion-rail-step-duration"))||0};
   if(Math.abs(next-step.current)<.1)return;
   step.current=next;position.current=ar||reduced?0:next;pending.current=false;element.dataset.stepping="false";paint();
  }
  measure();const observer=new ResizeObserver(measure);observer.observe(element);if(strip.firstElementChild)observer.observe(strip.firstElementChild);return()=>observer.disconnect();
 },[ar,count,reduced,mobile]);
 useLayoutEffect(()=>{if(pending.current){paint();pending.current=false}},[shift]);

 // Desktop retains the slower continuous presentation.
 useEffect(()=>{
  const element=rail.current;if(!element||mobile||reduced||!visible||count<2)return;
  let frame=0,last=0;
  function advance(now:number){
   if(!element)return;const elapsed=last?Math.min(now-last,40):0;last=now;
   const paused=hovered.current||dragging.current||element.contains(document.activeElement)||!!document.querySelector('[role="dialog"][data-state="open"]')||document.visibilityState!=="visible";
   element.dataset.motion=paused?"paused":"running";
   if(!paused&&now>=resumeAt.current&&step.current>0){
    position.current+=(ar?1:-1)*settings.current.speed*elapsed/1000;
    const normalized=normalizeRail(position.current,step.current),crossed=normalized.crossed;
    if(crossed!==0){position.current=normalized.offset;pending.current=true;flushSync(()=>setShift(value=>((value+crossed)%count+count)%count))}else paint();
   }
   frame=requestAnimationFrame(advance);
  }
  frame=requestAnimationFrame(advance);return()=>cancelAnimationFrame(frame);
 },[ar,count,reduced,visible,mobile]);

 // No animation frames during the reading interval. A first mobile interaction
 // cancels the current transition synchronously and disables autoplay for this visit.
 useEffect(()=>{
  const element=rail.current;if(!element||!mobile||mobilePaused||reduced||!visible||count<2)return;
  let timer:ReturnType<typeof setTimeout>|undefined,frame=0,disposed=false;
  const blocked=()=>hovered.current||dragging.current||element.contains(document.activeElement)||!!document.querySelector('[role="dialog"][data-state="open"]')||document.visibilityState!=="visible"||performance.now()<resumeAt.current;
  function schedule(){if(!disposed&&!mobileStopped.current)timer=setTimeout(cycle,settings.current.interval)}
  function stopMotion(){cancelAnimationFrame(frame);position.current=element!.scrollLeft;track.current?.style.setProperty("--rail-offset","0px");if(!dragging.current)element!.dataset.stepping="false"}
  function recycle(delta:number,anchor:number){position.current=anchor;if(delta%count){pending.current=true;flushSync(()=>setShift(value=>((value+delta)%count+count)%count))}else paint()}
  function cycle(){
   if(disposed||mobileStopped.current)return;
   if(blocked()||step.current<=0){element!.dataset.motion="paused";schedule();return}
   const plan=mobileRailPlan(element!.scrollLeft,step.current,ar);
   // Snap has already settled before an idle interval ends. Rebase without changing
   // the visible product, including after an offscreen interrupted transition.
   element!.dataset.stepping="true";recycle(plan.rebase,plan.anchor);element!.dataset.motion="stepping";
   let began:number|undefined;
   function animate(now:number){
    if(disposed)return;
    if(mobileStopped.current||blocked()){stopMotion();element!.dataset.motion="paused";schedule();return}
    began??=now;const progress=railStepProgress(now-began,settings.current.duration);
    position.current=plan.anchor+(plan.target-plan.anchor)*progress;paint();
    if(progress<1)frame=requestAnimationFrame(animate);
    else {recycle(plan.advance,plan.anchor);element!.dataset.stepping="false";element!.dataset.motion="idle";schedule()}
   }
   frame=requestAnimationFrame(animate);
  }
  element.dataset.motion="idle";schedule();
  return()=>{disposed=true;clearTimeout(timer);stopMotion()};
 },[ar,count,reduced,visible,mobile,mobilePaused]);
 useEffect(()=>{
  const release=()=>{if(dragging.current){dragging.current=false;rest();if(mobile&&rail.current)rail.current.dataset.stepping="false"}};
  window.addEventListener("pointerup",release);window.addEventListener("pointercancel",release);window.addEventListener("touchend",release,{passive:true});window.addEventListener("touchcancel",release,{passive:true});
  return()=>{window.removeEventListener("pointerup",release);window.removeEventListener("pointercancel",release);window.removeEventListener("touchend",release);window.removeEventListener("touchcancel",release)};
 },[mobile]);
 return <div ref={rail} className="home-product-rail" data-mode={mobile?"step":"continuous"} data-flow={ar?"left":"right"} data-count={count} data-motion={mobilePaused&&mobile?"paused":reduced?"reduced":visible?mobile?"idle":"running":"offscreen"} style={{"--rail-visible":Math.max(1,Math.min(count-1,3))} as CSSProperties} tabIndex={0} role="region" aria-label={mobile?tr("Selected fragrances, one card at a time. Automatic movement stops after your first interaction. Swipe to browse.","مختارات العطور، كارت واحد كل مرة. الحركة تتوقف بعد أول تفاعل؛ اسحب للتصفح."):tr("Selected fragrances. Focus to pause; use arrow keys to browse and Escape to resume.","مختارات العطور. ركّز لإيقاف الحركة، واستخدم الأسهم للتصفح وEscape لاستئنافها.")}
 onPointerEnter={event=>{if(event.pointerType==="mouse")hovered.current=true}} onPointerLeave={()=>{hovered.current=false;rest()}}
 onPointerDownCapture={()=>interact(true)} onTouchStartCapture={()=>interact(true)} onClickCapture={()=>{if(mobile)interact()}} onFocusCapture={()=>{if(mobile)interact()}}
 onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))rest()}}
 onScroll={event=>{if(dragging.current||performance.now()<resumeAt.current){position.current=event.currentTarget.scrollLeft;resumeAt.current=performance.now()+settings.current.resume}}}
 onWheel={()=>interact()} onKeyDown={event=>{
  interact();if(event.target!==event.currentTarget)return;
  if(mobile&&["ArrowLeft","ArrowRight","Home","End"].includes(event.key)){
   event.preventDefault();const element=event.currentTarget,index=Math.round(element.scrollLeft/step.current),next=event.key==="Home"?0:event.key==="End"?count-1:index+(event.key==="ArrowRight"?1:-1);
   element.scrollTo({left:Math.max(0,Math.min(count-1,next))*step.current,behavior:reduced?"auto":"smooth"});
  }else if(event.key==="Escape")event.currentTarget.blur();
 }}>
  <div ref={track} className="home-product-track">{ordered.map(product=><div className="home-rail-item" dir={ar?"rtl":"ltr"} key={product.id}><ProductCard product={product} photoSizes={imageSizes.rail}/></div>)}</div>
 </div>;
}
