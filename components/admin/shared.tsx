"use client";
import {useEffect,useState,type ReactNode} from "react";
import {ChevronLeft,ChevronRight,X} from "lucide-react";
import {Dialog,DialogContent,DialogDescription,DialogTitle} from "@/components/ui/dialog";
import {office} from "@/lib/admin";
import type {Page} from "@/lib/store";

export function useOfficeData<T>(path:string|null,revision=0,poll=0){
  const [data,setData]=useState<T>();
  const [error,setError]=useState("");
  useEffect(()=>{
    if(!path)return;
    setData(undefined);setError("");
    const controller=new AbortController();
    let pending=false;
    async function load(){
      if(!path||pending||controller.signal.aborted)return;
      pending=true;
      try{
        const value=await office<T>(path,{signal:controller.signal});
        if(!controller.signal.aborted){setData(value);setError("")}
      }catch(error){if(!controller.signal.aborted)setError(error instanceof Error?error.message:"تعذّر تحميل البيانات.")}
      finally{pending=false}
    }
    void load();
    const timer=poll?setInterval(()=>{if(!document.hidden)void load()},poll):undefined;
    return()=>{controller.abort();clearInterval(timer)};
  },[path,revision,poll]);
  return {data,error};
}
export function Message({message,error=false}:{message:string;error?:boolean}){
  return message?<p className={error?"office-error":"office-message"} role={error?"alert":"status"}>{message}</p>:null;
}
export function Pagination({data,go}:{data?:Page<unknown>;go:(page:number)=>void}){
  if(!data||data.totalPages<2)return null;
  return <div className="office-pagination"><button type="button" disabled={data.pageNumber<=1} onClick={()=>go(data.pageNumber-1)} aria-label="الصفحة السابقة"><ChevronRight size={18}/></button>
    <span>{data.pageNumber} / {data.totalPages}</span><button type="button" disabled={data.pageNumber>=data.totalPages} onClick={()=>go(data.pageNumber+1)} aria-label="الصفحة التالية"><ChevronLeft size={18}/></button></div>;
}
export function Panel({title,description,onClose,children}:{title:string;description:string;onClose:()=>void;children:ReactNode}){
  return <Dialog open onOpenChange={open=>{if(!open)onClose()}}><DialogContent placement="side" className="office-modal" showCloseButton={false}>
    <div className="office-modal-head"><div><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></div>
      <button type="button" className="office-icon" aria-label="إغلاق" onClick={onClose}><X size={20}/></button></div>
    <div className="office-modal-body" dir="rtl">{children}</div>
  </DialogContent></Dialog>;
}
export function Upload({onUpload}:{onUpload:(url:string)=>void}){
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  return <div>
    <label className="office-upload">{busy?"جارٍ رفع الصورة…":"رفع صورة JPG أو PNG أو WebP"}
      <input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async event=>{
        const input=event.currentTarget;const image=input.files?.[0];input.value="";
        if(!image)return;
        if(image.size>3_000_000){setError("الحد الأقصى 3 ميجابايت لكل صورة.");return}
        setBusy(true);setError("");
        const data=new FormData();data.set("image",image);
        try{onUpload((await office<{url:string}>("media/images",{method:"POST",data})).url)}
        catch(error){setError(error instanceof Error?error.message:"تعذّر رفع الصورة.")}
        finally{setBusy(false)}
      }}/>
    </label>
    <Message message={error} error/>
  </div>;
}
