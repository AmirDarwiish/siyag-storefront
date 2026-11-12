"use client";
import {useEffect,useState,useSyncExternalStore} from "react";
import {Check,Clock3,CloudOff,RefreshCw} from "lucide-react";
import {officeHealth,officeHealthVersion,subscribeOfficeHealth} from "@/lib/admin-cache";
export function OfficeDataStatus(){
 useSyncExternalStore(subscribeOfficeHealth,officeHealthVersion,()=>0);
 const [now,setNow]=useState(()=>Date.now());
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),5000);return()=>clearInterval(timer)},[]);
 const health=officeHealth(),age=health.verifiedAt?Math.max(0,Math.floor((now-health.verifiedAt)/1000)):0;
 const text=health.failed?"تعذّر التحقق من آخر تحديث":health.refreshing?"جارٍ التحقق من التحديثات":health.stale?"بيانات محفوظة تحتاج تحديثًا":health.verifiedAt?age<5?"تم التحقق الآن":`آخر تحقق منذ ${age<60?age.toLocaleString("ar-EG")+" ث":Math.floor(age/60).toLocaleString("ar-EG")+" د"}`:"مساحة العمل";
 if(!health.verifiedAt&&!health.refreshing&&!health.failed&&!health.stale)return null;
 const Icon=health.failed?CloudOff:health.refreshing?RefreshCw:health.stale?Clock3:Check;
 return <span className="office-data-status" data-state={health.failed?"error":health.refreshing?"refreshing":health.stale?"stale":"ready"} role="status" aria-live="polite"><Icon size={13}/>{text}</span>;
}
