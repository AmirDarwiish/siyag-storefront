"use client";
import {useEffect,useId,useRef,useState,type ReactNode} from "react";
import {ChevronLeft,ChevronRight,MoveHorizontal,X} from "lucide-react";
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
export function TableFrame({label,children,actions=false,compact=false,total}:{label:string;children:ReactNode;actions?:boolean;compact?:boolean;total?:number}){
  const viewport=useRef<HTMLDivElement>(null);
  const [overflow,setOverflow]=useState(false);
  const hint=useId();
  useEffect(()=>{
    const element=viewport.current;if(!element)return;
    const measure=()=>setOverflow(element.scrollWidth>element.clientWidth+2);
    measure();const observer=new ResizeObserver(measure);observer.observe(element);
    if(element.firstElementChild)observer.observe(element.firstElementChild);
    return()=>observer.disconnect();
  },[children]);
  return <section className="office-data-table" data-actions={actions} data-compact={compact}>
    <header className="office-table-heading"><h2>{label}</h2>{total!==undefined&&<span className="office-count">{total.toLocaleString("ar-EG")}</span>}<span className="office-table-view">عرض الجدول</span></header>
    <div className="office-table-wrap" ref={viewport} role="region" aria-label={label} aria-describedby={overflow?hint:undefined} tabIndex={overflow?0:undefined}>{children}</div>
    {overflow&&<p className="office-table-hint" id={hint}><MoveHorizontal size={16}/> مرّر أفقيًا لعرض باقي الأعمدة. يمكنك استخدام أسهم لوحة المفاتيح.</p>}
  </section>;
}
export function Pagination({data,go}:{data?:Page<unknown>;go:(page:number)=>void}){
  if(!data)return null;
  const first=data.totalCount?(data.pageNumber-1)*data.pageSize+1:0;
  const last=Math.min(data.pageNumber*data.pageSize,data.totalCount);
  const format=(n:number)=>n.toLocaleString("ar-EG");
  return <div className="office-pagination"><p>عرض {format(first)}–{format(last)} من {format(data.totalCount)}</p><div><button type="button" disabled={data.pageNumber<=1} onClick={()=>go(data.pageNumber-1)} aria-label="الصفحة السابقة"><ChevronRight size={17}/> السابق</button>
    <span>{format(data.pageNumber)} / {format(Math.max(1,data.totalPages))}</span><button type="button" disabled={data.pageNumber>=data.totalPages} onClick={()=>go(data.pageNumber+1)} aria-label="الصفحة التالية">التالي <ChevronLeft size={17}/></button></div></div>;
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
