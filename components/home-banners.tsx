"use client";
import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import {api,imageUrl,type Content} from "@/lib/store";
import {bannerHref} from "@/lib/banners";
import {imageSizes} from "@/lib/image-sizes";
import {StoreImage} from "./store-image";
import {useStore} from "./store-context";

export function HomeBanners(){
 const {ar,tr}=useStore();
 const [banners,setBanners]=useState<Content[]|null>(null),[active,setActive]=useState(0);
 const region=useRef<HTMLElement>(null),resumeAt=useRef(0),start=useRef<number|null>(null),swiped=useRef(false);
 useEffect(()=>{
  const controller=new AbortController();
  api<Content[]>("store/content?area=home-hero",{signal:controller.signal})
   .then(rows=>{setBanners(rows.filter(row=>!!row.imageUrl));setActive(0)})
   .catch(()=>{if(!controller.signal.aborted)setBanners([{slug:"house-fallback",titleEn:"Explore SIYAG fragrances",titleAr:"اكتشف عطور SIYAG",textEn:"",textAr:"",imageUrl:"/brand/hero-v2.webp",actionUrl:"/shop"}])});
  return()=>controller.abort();
 },[]);
 useEffect(()=>{
  const element=region.current;if(!element||!banners||banners.length<2)return;
  let visible=false;const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting},{threshold:.2});observer.observe(element);
  const preference=matchMedia("(prefers-reduced-motion: reduce)");
  const timer=setInterval(()=>{if(!visible||document.hidden||preference.matches||performance.now()<resumeAt.current||element.contains(document.activeElement)||matchMedia("(hover: hover)").matches&&element.matches(":hover"))return;setActive(index=>(index+1)%banners.length)},5000);
  return()=>{clearInterval(timer);observer.disconnect()};
 },[banners]);
 const pause=()=>{resumeAt.current=performance.now()+8000};
 const choose=(index:number)=>{pause();if(banners?.length)setActive((index+banners.length)%banners.length)};
 if(banners?.length===0)return null;
 return <section ref={region} className="home-banner-carousel" aria-label={tr("SIYAG highlights","مختارات SIYAG")} aria-roledescription={tr("carousel","عرض متحرك")} aria-busy={!banners} tabIndex={0} onFocusCapture={pause} onPointerDownCapture={event=>{start.current=event.clientX;swiped.current=false;pause()}} onPointerUpCapture={event=>{if(start.current!==null&&Math.abs(event.clientX-start.current)>45){swiped.current=true;choose(active+(event.clientX<start.current?(ar?-1:1):(ar?1:-1)))}start.current=null}} onPointerCancelCapture={()=>{start.current=null;pause()}} onClickCapture={event=>{if(swiped.current){event.preventDefault();swiped.current=false}}} onKeyDown={event=>{if(event.target!==event.currentTarget||!["ArrowLeft","ArrowRight"].includes(event.key))return;event.preventDefault();choose(active+(event.key==="ArrowRight"?(ar?-1:1):(ar?1:-1)))}}>
  <h1 className="sr-only">{tr("SIYAG Parfums · Egyptian fragrance house","SIYAG · دار عطور مصرية")}</h1>
  <div className="home-banner-slides">{banners?banners.map((banner,index)=>{
   const selected=index===active,href=bannerHref(banner.actionUrl),alt=(ar?banner.titleAr:banner.titleEn)||tr("SIYAG fragrances","عطور SIYAG");
   const photo=<StoreImage src={imageUrl(banner.imageUrl)} alt={alt} width={1600} height={900} sizes={imageSizes.campaign} loading={index===0||index===(active+1)%banners.length?"eager":"lazy"} fetchPriority={index===0?"high":"auto"}/>;
   return <div className="home-banner-slide" key={banner.slug} data-active={selected} aria-hidden={!selected} inert={!selected}>{href?<Link href={href} tabIndex={selected?0:-1} aria-label={alt}>{photo}</Link>:photo}</div>;
  }):<div className="home-banner-loading"/>}</div>
  {banners&&banners.length>1&&<nav className="home-banner-pagination" aria-label={tr("Banner pages","صفحات البانر")}>{banners.map((banner,index)=><button type="button" key={banner.slug} className="home-rail-dot" aria-label={tr(`Show banner ${index+1} of ${banners.length}`,`عرض البانر ${index+1} من ${banners.length}`)} aria-current={active===index?"true":undefined} onClick={()=>choose(index)}><span/></button>)}</nav>}
 </section>;
}
