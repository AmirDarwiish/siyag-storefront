'use client';
import {useEffect,useState} from 'react';
import {usePathname,useSearchParams} from 'next/navigation';
import Script from 'next/script';
import {allowed,consent,track} from '@/lib/analytics';
import {readLocal} from '@/lib/browser-storage';
import {useStore} from './store-context';
export function Measurement(){
 const {tr}=useStore();const path=usePathname();const search=useSearchParams().toString();const [enabled,setEnabled]=useState(false);const [open,setOpen]=useState(false);
 useEffect(()=>{setEnabled(allowed());setOpen(!readLocal('siyag-measurement'));const update=()=>setEnabled(allowed());window.addEventListener('siyag-consent',update);return()=>window.removeEventListener('siyag-consent',update)},[]);
 useEffect(()=>{if(enabled)track('page_view')},[path,search,enabled]);
 const ga=process.env.NEXT_PUBLIC_GA4_ID;const pixel=process.env.NEXT_PUBLIC_META_PIXEL_ID;
 return <>{enabled&&ga&&/^G-[A-Z0-9]+$/.test(ga)&&<><Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive"/><Script id="siyag-ga">{`window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});gtag('js',new Date());gtag('config','${ga}',{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});`}</Script></>}
 {enabled&&pixel&&/^\d+$/.test(pixel)&&<Script id="siyag-meta">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};n.queue=[];n.loaded=true;n.version='2.0';t=b.createElement(e);t.async=true;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}',{},{autoConfig:false});fbq('set','autoConfig',false,'${pixel}');`}</Script>}
 <button className="privacy-settings" onClick={()=>setOpen(true)} type="button">{tr('Privacy preferences','إعدادات الخصوصية')}</button>
 {open&&<section className="consent-panel" aria-label={tr('Privacy preferences','إعدادات الخصوصية')}><strong>{tr('Help us improve your experience','ساعدنا نحسن تجربتك')}</strong><p>{tr('Optional visit and shopping measurement through Google Analytics and Meta when enabled. Contact and payment details are excluded. You can change this later.','قياس اختياري للزيارات والتسوق عبر Google Analytics وMeta عند تفعيلهما. بيانات الاتصال والدفع لا تُرسل. تقدر تغيّر اختيارك لاحقًا.')}</p><div><button onClick={()=>{consent(false);setOpen(false)}} type="button">{tr('Necessary only','الضروري فقط')}</button><button onClick={()=>{consent(true);setOpen(false)}} type="button">{tr('Allow measurement','السماح بالقياس')}</button></div></section>}
 </>;
}
