"use client";
import {Children,cloneElement,isValidElement,useCallback,useEffect,useId,useRef,useState,useSyncExternalStore,type ReactElement,type ReactNode} from "react";
import {ArrowDownUp,SlidersHorizontal,Check,Download,LoaderCircle,ChevronLeft,ChevronRight,MoveHorizontal,X,type LucideIcon} from "lucide-react";
import Link from "next/link";
import {officeSnapshot,officeServerSnapshot,subscribeOffice,loadOffice,officePolicy} from "@/lib/admin-cache";
import {useOfficePathname,readOfficeView,writeOfficeView} from "./office-route";
import {usePathname,useRouter} from "next/navigation";
import {Popover as OfficePopover,Tooltip as TooltipPrimitive} from "radix-ui";
import {Dialog,DialogContent,DialogDescription,DialogTitle} from "@/components/ui/dialog";
import {office} from "@/lib/admin";
import type {Page} from "@/lib/store";

export function useOfficeData<T>(path:string|null,revision=0,poll=0,loader?:(signal:AbortSignal)=>Promise<T>){
  const key=path??"__disabled",fetcher=useRef(loader);fetcher.current=loader;
  const previousRevision=useRef(revision);
  const subscribe=useCallback((listener:()=>void)=>path?subscribeOffice(key,listener):()=>{},[path,key]);
  const read=useCallback(()=>officeSnapshot<T>(key),[key]);
  const snapshot=useSyncExternalStore(subscribe,read,()=>officeServerSnapshot() as ReturnType<typeof read>);
  useEffect(()=>{
    if(!path)return;
    const force=previousRevision.current!==revision;previousRevision.current=revision;
    const load=(fresh=false)=>loadOffice<T>(path,signal=>fetcher.current?fetcher.current(signal):office<T>(path,{signal}),fresh).catch(()=>undefined);
    void load(force);
    const timer=setInterval(()=>{if(!document.hidden)void load()},poll||officePolicy(path).poll);
    return()=>clearInterval(timer);
  },[path,revision,poll]);
  return {data:snapshot.data,error:snapshot.error,refreshing:snapshot.loading,verifiedAt:snapshot.verifiedAt};
}
export function Message({message,error=false}:{message:string;error?:boolean}){
  return message?<p className={error?"office-error":"office-message"} role={error?"alert":"status"}>{message}</p>:null;
}
type TableElement=ReactElement<{children?:ReactNode;colSpan?:number;[key:string]:unknown}>;
const elements=(nodes:ReactNode)=>{const result:TableElement[]=[];Children.forEach(nodes,node=>{if(isValidElement(node))result.push(node as TableElement)});return result};
const nodeText=(node:ReactNode):string=>{if(typeof node==="string"||typeof node==="number")return String(node);if(Array.isArray(node))return node.map(nodeText).join(" ");return isValidElement<{children?:ReactNode}>(node)?nodeText(node.props.children):""};
const comparable=(value:string)=>value.replace(/[٠-٩]/g,d=>String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[\u200e\u200f\u061c]/g,"").trim();
export type BulkAction={id:string;label:string;icon:LucideIcon;run:(id:string)=>Promise<void>};
export function OfficeTip({label,children,side="bottom",disabled=false}:{label:string;children:ReactElement;side?:"top"|"bottom"|"left"|"right";disabled?:boolean}){
 return <TooltipPrimitive.Provider delayDuration={200}><TooltipPrimitive.Root open={disabled?false:undefined}><TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger><TooltipPrimitive.Portal><TooltipPrimitive.Content className="office-grid-tooltip" side={side} sideOffset={8}>{label}<TooltipPrimitive.Arrow/></TooltipPrimitive.Content></TooltipPrimitive.Portal></TooltipPrimitive.Root></TooltipPrimitive.Provider>;
}
export function RowAction({label,icon:Icon,onClick,href,disabled=false}:{label:string;icon:LucideIcon;onClick?:()=>void;href?:string;disabled?:boolean}){
  const control=href?<a className="office-row-action" href={href} target="_blank" rel="noreferrer" aria-label={label}><Icon size={18}/></a>:<button type="button" className="office-row-action" aria-label={label} disabled={disabled} onClick={onClick}><Icon size={18}/></button>;
  return <OfficeTip label={label}>{control}</OfficeTip>;
}
function SelectBox({label,checked,mixed=false,disabled=false,onChange}:{label:string;checked:boolean;mixed?:boolean;disabled?:boolean;onChange:()=>void}){
  const ref=useRef<HTMLInputElement>(null);
  useEffect(()=>{if(ref.current)ref.current.indeterminate=mixed},[mixed]);
  return <input ref={ref} type="checkbox" aria-label={label} checked={checked} disabled={disabled} onChange={onChange}/>;
}
export function TableFrame({label,children,actions=false,compact=false,total,offset=0,scope="",bulkActions=[],onBulkComplete}:{label:string;children:ReactNode;actions?:boolean;compact?:boolean;total?:number;offset?:number;scope?:string;bulkActions?:BulkAction[];onBulkComplete?:()=>void}){
  const viewport=useRef<HTMLDivElement>(null),lock=useRef(false),lastScope=useRef("");
  const [overflow,setOverflow]=useState(false),[selection,setSelection]=useState<Set<string>>(new Set());
  const [pending,setPending]=useState<BulkAction|null>(null),[busy,setBusy]=useState(false),[feedback,setFeedback]=useState(""),[failed,setFailed]=useState(false),[progress,setProgress]=useState(0);
  const hint=useId();
  const [sort,setSort]=useState<{column:number;direction:1|-1}|null>(()=>readOfficeView(label+":sort",null));
  const [hidden,setHidden]=useState<Set<number>>(()=>new Set(readOfficeView<number[]>(label+":columns",[])));
  useEffect(()=>{writeOfficeView(label+":sort",sort);writeOfficeView(label+":columns",[...hidden])},[label,sort,hidden]);
  const table=elements(children).find(node=>node.type==="table");
  const body=table&&elements(table.props.children).find(node=>node.type==="tbody");
  const head=table&&elements(table.props.children).find(node=>node.type==="thead");
  const columns=head?elements(elements(head.props.children)[0]?.props.children):[];
  const labels=columns.map(cell=>nodeText(cell.props.children));
  const rows=body?elements(body.props.children).filter(row=>row.type==="tr"&&row.key!==null):[];
  const ids=rows.map(row=>String(row.key)),signature=JSON.stringify([scope,ids]);
  const ordered=sort?[...rows].sort((a,b)=>{
    const get=(row:TableElement)=>{const cell=elements(row.props.children)[sort.column];return comparable(String(cell?.props["data-sort-value"]??nodeText(cell?.props.children)))};
    const left=get(a),right=get(b),number=/^-?\d+(?:[.,]\d+)?(?:\s|$)/;
    const result=number.test(left)&&number.test(right)?Number(left.match(number)![0].trim().replace(",","."))-Number(right.match(number)![0].trim().replace(",",".")):new Intl.Collator("ar",{numeric:true,sensitivity:"base"}).compare(left,right);
    return result*sort.direction;
  }):rows;
  const visibleCells=(row:TableElement,header=false)=>elements(row.props.children).flatMap((cell,index)=>{
    if(hidden.has(index))return [];
    if(!header||actions&&index===columns.length-1)return [cloneElement(cell,{key:index})];
    return [cloneElement(cell,{key:index,"aria-sort":sort?.column===index?(sort.direction===1?"ascending":"descending"):"none"},<button type="button" className="office-sort-button" aria-label={`ترتيب حسب ${labels[index]}`} aria-pressed={sort?.column===index} onClick={()=>setSort(current=>({column:index,direction:current?.column===index&&current.direction===1?-1:1}))}>{cell.props.children}<ArrowDownUp size={12}/></button>)];
  });
  const selected=ids.filter(id=>selection.has(id));
  useEffect(()=>{if(lock.current||total===undefined)return;if(lastScope.current!==signature){setSelection(new Set());setPending(null)}lastScope.current=signature},[signature,total]);
  useEffect(()=>{
    const element=viewport.current;if(!element)return;
    const measure=()=>setOverflow(element.scrollWidth>element.clientWidth+2);
    measure();const observer=new ResizeObserver(measure);observer.observe(element);
    if(element.firstElementChild)observer.observe(element.firstElementChild);
    return()=>observer.disconnect();
  },[children]);
  function toggle(id:string){setPending(null);setSelection(current=>{const next=new Set(current);if(next.has(id))next.delete(id);else next.add(id);return next})}
  function exportSelected(){
    const element=viewport.current?.querySelector("table");if(!element)return;
    const text=(cells:Element[])=>cells.map(cell=>{let value=((cell as HTMLElement).innerText??cell.textContent??"").trim().replace(/\s+/g," ");if(/^[=+@\-\t\r]/.test(value))value="'"+value;return '"'+value.replaceAll('"','""')+'"'}).join(",");
    const cells=(row:Element)=>Array.from(row.children).filter((_,index,array)=>index>0&&(!actions||index<array.length-1));
    const lines=[...element.querySelectorAll("thead tr")].map(row=>text(cells(row)));
    for(const row of element.querySelectorAll("tbody tr[data-office-row]"))if(selected.includes(row.getAttribute("data-office-row")??""))lines.push(text(cells(row)));
    const url=URL.createObjectURL(new Blob(["\ufeff"+lines.join("\r\n")],{type:"text/csv;charset=utf-8"}));
    const link=document.createElement("a");link.href=url;link.download=label+".csv";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function execute(){
    if(!pending||!selected.length||lock.current)return;
    lock.current=true;setBusy(true);setFeedback("");setProgress(0);
    const failures:string[]=[],messages:string[]=[];const action=pending;
    for(const [index,id] of selected.entries()){
      try{await action.run(id)}catch(error){failures.push(id);messages.push(error instanceof Error?error.message:"تعذّر التنفيذ")}
      setProgress(index+1);
    }
    setSelection(new Set(failures));setFailed(!!failures.length);setPending(null);
    setFeedback(`تم تنفيذ «${action.label}» على ${selected.length-failures.length} من ${selected.length} صف.`+(failures.length?` تعذّر تنفيذ ${failures.length}: ${[...new Set(messages)].join(" · ")}. الصفوف غير المكتملة تظل محددة إن كانت معروضة.`:""));
    lock.current=false;setBusy(false);onBulkComplete?.();
  }
  const enhanced=table?cloneElement(table,{},elements(table.props.children).map(part=>{
    if(part.type!=="thead"&&part.type!=="tbody")return part;
    return cloneElement(part,{key:String(part.type)},(part.type==="tbody"&&rows.length?ordered:elements(part.props.children)).map((row,index)=>{
      if(row.type!=="tr")return row;
      if(part.type==="thead")return cloneElement(row,{key:"head"},<th className="office-selection-cell"><SelectBox label={`تحديد كل الصفوف المعروضة في ${label}`} checked={!!ids.length&&selected.length===ids.length} mixed={selected.length>0&&selected.length<ids.length} disabled={busy||!ids.length} onChange={()=>{setPending(null);setSelection(selected.length===ids.length?new Set():new Set(ids))}}/></th>,<th className="office-index-cell" scope="col">#</th>,visibleCells(row,true));
      if(row.key===null)return row;
      const id=String(row.key),number=offset+index+1;
      return cloneElement(row,{key:id,"data-office-row":id,"data-selected":selection.has(id)},<td className="office-selection-cell"><SelectBox label={`تحديد الصف ${number} في ${label}`} checked={selection.has(id)} disabled={busy} onChange={()=>toggle(id)}/></td>,<td className="office-index-cell">{number.toLocaleString("ar-EG")}</td>,visibleCells(row));
    }));
  })):null;
  return <section className="office-data-table" data-actions={actions} data-compact={compact} aria-busy={busy}>
    <header className="office-table-heading"><h2>{label}</h2>{total!==undefined&&<span className="office-count">{total.toLocaleString("ar-EG")}</span>}<OfficePopover.Root><OfficePopover.Trigger asChild><button type="button" className="office-columns-trigger" aria-label={`اختيار أعمدة ${label}`}><SlidersHorizontal size={14}/> الأعمدة</button></OfficePopover.Trigger><OfficePopover.Portal><OfficePopover.Content className="office-table-column-menu" align="end" sideOffset={8} dir="rtl" aria-label={`أعمدة ${label}`}>{labels.map((name,index)=><label key={index}><input type="checkbox" checked={!hidden.has(index)} disabled={index===0||actions&&index===columns.length-1} onChange={()=>setHidden(current=>{const next=new Set(current);if(next.has(index))next.delete(index);else next.add(index);return next})}/>{name}</label>)}</OfficePopover.Content></OfficePopover.Portal></OfficePopover.Root></header>
    {!!selected.length&&<div className="office-bulk-bar"><strong>{selected.length.toLocaleString("ar-EG")} محدد</strong><div className="office-bulk-actions"><button type="button" className="office-button secondary" disabled={busy} onClick={exportSelected}><Download size={16}/> تصدير المحدد</button>{bulkActions.map(action=><button type="button" className="office-button secondary" key={action.id} disabled={busy} onClick={()=>setPending(action)}><action.icon size={16}/>{action.label}</button>)}<button type="button" className="office-icon" title="إلغاء التحديد" aria-label="إلغاء التحديد" disabled={busy} onClick={()=>{setSelection(new Set());setPending(null)}}><X size={17}/></button></div>{pending&&<div className="office-bulk-confirm"><p>تنفيذ «{pending.label}» على {selected.length} صف محدد؟</p><button type="button" className="office-button" disabled={busy} onClick={()=>void execute()}>{busy?<LoaderCircle size={16} className="office-spinning"/>:<Check size={16}/>} {busy?`${progress} / ${selected.length}`:"تأكيد التنفيذ"}</button><button type="button" className="office-button secondary" disabled={busy} onClick={()=>setPending(null)}>إلغاء</button></div>}</div>}
    {feedback&&<div className="office-table-feedback"><Message message={feedback} error={failed}/></div>}
    <div className="office-table-wrap" ref={viewport} role="region" aria-label={label} aria-describedby={overflow?hint:undefined} tabIndex={overflow?0:undefined}>{Children.map(children,child=>child===table?enhanced:child)}</div>
    {overflow&&<p className="office-table-hint" id={hint}><MoveHorizontal size={16}/> مرّر أفقيًا لعرض باقي الأعمدة. يمكنك استخدام أسهم لوحة المفاتيح.</p>}
  </section>;
}
export function Pagination({data,go,changeSize}:{data?:Page<unknown>;go:(page:number)=>void;changeSize?:(size:number)=>void}){
  if(!data)return null;
  const first=data.totalCount?(data.pageNumber-1)*data.pageSize+1:0;
  const last=Math.min(data.pageNumber*data.pageSize,data.totalCount);
  const format=(n:number)=>n.toLocaleString("ar-EG");
  return <div className="office-pagination">{changeSize&&<label>صفوف الصفحة<select aria-label="عدد الصفوف في الصفحة" value={data.pageSize} onChange={e=>{changeSize(Number(e.target.value));go(1)}}>{[10,20,30,50].map(size=><option value={size} key={size}>{size.toLocaleString("ar-EG")}</option>)}</select></label>}<p>عرض {format(first)}–{format(last)} من {format(data.totalCount)}</p><div><button type="button" disabled={data.pageNumber<=1} onClick={()=>go(data.pageNumber-1)} aria-label="الصفحة السابقة"><ChevronRight size={17}/> السابق</button>
    <span>{format(data.pageNumber)} / {format(Math.max(1,data.totalPages))}</span><button type="button" disabled={data.pageNumber>=data.totalPages} onClick={()=>go(data.pageNumber+1)} aria-label="الصفحة التالية">التالي <ChevronLeft size={17}/></button></div></div>;
}
export function useEditorRoute(section:string){
  const pathname=useOfficePathname(),router=useRouter();
  const segment=pathname.split("/")[3];
  return {editor:segment===undefined?null:segment==="new"?"":decodeURIComponent(segment),open:(id:string)=>router.push(`/admin/${section}/${id?encodeURIComponent(id):"new"}`),close:()=>router.push(`/admin/${section}`)};
}
export function Panel({title,description,onClose,children}:{title:string;description:string;onClose:()=>void;children:ReactNode}){
  const pathname=useOfficePathname();
  const back=pathname.split("/").slice(0,3).join("/");
  if(title!=="أقسام الإدارة")return <section className="office-editor-page"><header className="office-editor-head"><div><Link href={back} className="office-text-button"><ChevronRight size={17}/> العودة للقائمة</Link><h2>{title}</h2></div><button type="button" className="office-icon" aria-label="العودة للقائمة" onClick={onClose}><X size={20}/></button></header><div className="office-editor-body">{children}</div></section>;
  return <Dialog open onOpenChange={open=>{if(!open)onClose()}}><DialogContent overlayClassName="office-overlay" placement="side" className="office-modal" showCloseButton={false}>
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
