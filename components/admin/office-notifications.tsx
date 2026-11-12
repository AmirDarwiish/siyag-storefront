"use client";
import {useEffect,useRef,useState} from "react";
import {Bell,CheckCheck,RefreshCw,X} from "lucide-react";
import {Popover} from "radix-ui";
import {HubConnectionBuilder,LogLevel} from "@microsoft/signalr";
import {useRouter} from "next/navigation";
import {office,orderDate,statusNames} from "@/lib/admin";
import {Message} from "./shared";
type Event={id:number;kind:string;reference:string;status:string;at:string};
type Feed={items:Event[];unread:number};
const title=(event:Event)=>event.kind==="order.created"?"طلب جديد":event.kind==="order.payment"?"تحديث دفع":"تحديث طلب";
export function OfficeNotifications(){
 const [feed,setFeed]=useState<Feed>({items:[],unread:0}),[open,setOpen]=useState(false),[connection,setConnection]=useState("connecting"),[error,setError]=useState("");
 const mounted=useRef(true),router=useRouter();
 async function refresh(){try{const data=await office<Feed>("notifications");if(mounted.current){setFeed(data);setError("")}}catch{if(mounted.current)setError("تعذّر تحميل الإشعارات. تأكد من تحديث الخادم.")}}
 useEffect(()=>{
  mounted.current=true;let disposed=false;
  const hub=new HubConnectionBuilder().withUrl("https://siyag.runasp.net/hubs/office",{accessTokenFactory:async()=>{const ticket=await office<{token:string}>("realtime/ticket",{method:"POST"});return ticket.token},withCredentials:false}).configureLogging(LogLevel.None).withAutomaticReconnect([0,2000,5000,10000,30000]).build();
  hub.on("OfficeChanged",(event:Event)=>{if(disposed)return;setFeed(current=>current.items.some(item=>item.id===event.id)?current:{items:[event,...current.items].slice(0,50),unread:current.unread+1});window.dispatchEvent(new Event("siyag-office-changed"));});
  hub.onreconnecting(()=>{if(!disposed)setConnection("reconnecting")});hub.onreconnected(()=>{if(!disposed){setConnection("connected");void refresh();window.dispatchEvent(new Event("siyag-office-changed"))}});hub.onclose(()=>{if(!disposed){setConnection("offline");retry=setTimeout(()=>void start(),15000)}});
  let retry:ReturnType<typeof setTimeout>|undefined;
  async function start(){try{await hub.start();if(!disposed){setConnection("connected");void refresh();window.dispatchEvent(new Event("siyag-office-changed"))}}catch{if(!disposed){setConnection("offline");retry=setTimeout(()=>void start(),15000)}}}
  void refresh();void start();
  return()=>{disposed=true;mounted.current=false;clearTimeout(retry);void hub.stop()};
 },[]);
 return <Popover.Root open={open} onOpenChange={setOpen}><Popover.Trigger asChild><button type="button" className="office-icon ghost office-notification-trigger" aria-label={`الإشعارات${feed.unread?`، ${feed.unread} غير مقروء`:""}`} aria-expanded={open} ><Bell size={19}/>{feed.unread>0&&<span className="office-notification-count">{feed.unread>99?"99+":feed.unread}</span>}</button></Popover.Trigger><Popover.Portal><Popover.Content asChild align="end" sideOffset={10} collisionPadding={12}><section className="office-notification-popover" aria-label="الإشعارات"><header><div><h2>الإشعارات</h2><small data-state={connection}>{connection==="connected"?"متصل لحظيًا":connection==="connecting"?"جارٍ الاتصال…":connection==="reconnecting"?"جارٍ إعادة الاتصال…":"الاتصال اللحظي غير متاح"}</small></div><button type="button" className="office-icon" aria-label="إغلاق الإشعارات" onClick={()=>setOpen(false)}><X size={17}/></button></header><div className="office-notification-tools"><button type="button" className="office-text-button" onClick={()=>void refresh()}><RefreshCw size={15}/> تحديث</button><button type="button" className="office-text-button" disabled={!feed.items.length||!feed.unread} onClick={async()=>{try{await office("notifications/read",{method:"PUT",data:{throughId:feed.items[0].id}});await refresh()}catch{setError("تعذّر تعليم الإشعارات كمقروءة.")}}}><CheckCheck size={16}/> تعليم الكل كمقروء</button></div><Message message={error} error/><div className="office-notification-list">{feed.items.map(event=><button key={event.id} type="button" onClick={()=>{setOpen(false);router.push("/admin/orders/"+event.reference)}}><strong>{title(event)}</strong><span dir="ltr">{event.reference}</span><small>{statusNames[event.status]??event.status} · {orderDate(event.at)}</small></button>)}{!feed.items.length&&!error&&<div className="office-empty"><Bell size={23}/><p>أي طلب جديد أو تحديث دفع هيظهر هنا.</p></div>}</div></section></Popover.Content></Popover.Portal></Popover.Root>;
}
