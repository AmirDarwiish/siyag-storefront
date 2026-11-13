/** Pick one substantially visible rail, favouring the centre of the usable viewport. */
export function primaryRail(bounds:{top:number;bottom:number}[],top:number,bottom:number){
 const viewport=bottom-top;if(viewport<=0)return -1;
 let selected=-1,best=-Infinity;
 bounds.forEach((rect,index)=>{
  const height=rect.bottom-rect.top;if(height<=0)return;
  const visible=Math.max(0,Math.min(bottom,rect.bottom)-Math.max(top,rect.top));
  const coverage=visible/Math.min(height,viewport);
  if(coverage<.55)return;
  const distance=Math.abs((rect.top+rect.bottom)/2-(top+bottom)/2)/viewport;
  const score=coverage-distance*.25;
  if(score>best){selected=index;best=score}
 });
 return selected;
}

type Rail={element:HTMLElement;advance:()=>void;interval:number};
const rails=new Set<Rail>();
let current:Rail|undefined,timer:ReturnType<typeof setTimeout>|undefined,frame:number|undefined;
function clear(){if(timer!==undefined)clearTimeout(timer);timer=undefined}
function choose(){
 const entries=[...rails];
 const header=document.querySelector('.site-header')?.getBoundingClientRect();
 const top=Math.max(0,header?.bottom??0);
 return document.hidden?undefined:entries[primaryRail(entries.map(rail=>rail.element.getBoundingClientRect()),top,innerHeight)];
}
function reconcile(restart=false){
 const next=choose();
 if(next!==current||restart){clear();current=next}
 if(!current||timer!==undefined)return;
 const rail=current;
 timer=setTimeout(()=>{
  timer=undefined;
  if(choose()!==rail){reconcile();return}
  rail.advance();reconcile();
 },rail.interval);
}
function refresh(){
 // Start a full reading pause after the customer reaches a section.
 clear();
 if(frame!==undefined)return;
 frame=requestAnimationFrame(()=>{frame=undefined;reconcile(true)});
}

/** A shared scheduler ensures two visible sections never advance together. */
export function registerRailAutoplay(rail:Rail){
 rails.add(rail);
 if(rails.size===1){
  window.addEventListener('scroll',refresh,{passive:true});
  window.addEventListener('resize',refresh);
  document.addEventListener('visibilitychange',refresh);
 }
 refresh();
 return()=>{
  rails.delete(rail);
  if(current===rail){clear();current=undefined}
  if(!rails.size){
   clear();if(frame!==undefined)cancelAnimationFrame(frame);frame=undefined;
   window.removeEventListener('scroll',refresh);
   window.removeEventListener('resize',refresh);
   document.removeEventListener('visibilitychange',refresh);
  }else refresh();
 };
}
