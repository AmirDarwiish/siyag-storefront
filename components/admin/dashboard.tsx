"use client";
import Link from "next/link";
import {useEffect,useState,type FormEvent} from "react";
import {ArrowUpRight,Boxes,FolderOpen,KeyRound,LogOut,PackageCheck,Truck} from "lucide-react";
import {office,type Role} from "@/lib/admin";
import {Collections,Products} from "./catalog";
import {Orders} from "./orders";
import {ShippingOptions} from "./shipping";
import {Message} from "./shared";

const panels=[
  {id:"orders",label:"الطلبات",description:"تابع الطلبات الجديدة، وحالات الشحن والتسليم.",icon:PackageCheck,component:Orders,roles:["Owner","Fulfillment"]},
  {id:"products",label:"العطور",description:"أدر بيانات العطور والصور والأحجام والأسعار والمخزون.",icon:Boxes,component:Products,roles:["Owner","Catalog"]},
  {id:"shipping",label:"التوصيل",description:"اضبط المحافظات ورسوم التوصيل قبل استقبال الطلبات.",icon:Truck,component:ShippingOptions,roles:["Owner","Fulfillment"]},
  {id:"collections",label:"التصنيفات",description:"أدر مجموعات العطور وترتيب ظهورها في المتجر.",icon:FolderOpen,component:Collections,roles:["Owner","Catalog"]},
];
const roleNames:Record<Role,string>={Owner:"مالك المتجر",Catalog:"إدارة الكتالوج",Fulfillment:"تنفيذ الطلبات"};

export function AdminDashboard(){
  const [role,setRole]=useState<Role|null>(null);
  const [configured,setConfigured]=useState<boolean>();
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [section,setSection]=useState("");
  useEffect(()=>{
    const controller=new AbortController();
    office<{configured:boolean;role:Role|null}>("session",{signal:controller.signal})
      .then(session=>{setConfigured(session.configured);setRole(session.role)})
      .catch(()=>{if(!controller.signal.aborted){setConfigured(false);setError("تعذّر التحقق من جلسة الإدارة.")}});
    return()=>controller.abort();
  },[]);
  async function login(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(busy)return;
    const form=event.currentTarget;
    const key=String(new FormData(form).get("key"));
    form.reset();
    setBusy(true);setError("");
    try{setRole((await office<{role:Role}>("session",{method:"POST",data:{key}})).role)}
    catch(error){setError(error instanceof Error?error.message:"تعذّر تسجيل الدخول.")}
    finally{setBusy(false)}
  }
  async function logout(){
    setBusy(true);setError("");
    try{await office("session",{method:"DELETE"});setRole(null);setSection("")}
    catch(error){setError(error instanceof Error?error.message:"تعذّر تسجيل الخروج.")}
    finally{setBusy(false)}
  }
  const available=role?panels.filter(panel=>panel.roles.includes(role)):[];
  const active=available.find(panel=>panel.id===section)??available[0];

  if(!role||!active)return <main className="office office-login" dir="rtl" lang="ar">
    <section>
      <div className="office-mark" dir="ltr">SIYAG <span>OFFICE</span></div>
      <KeyRound size={27}/>
      <h1>لوحة إدارة سياج</h1><p>مساحة فريق المتجر لإدارة الطلبات والكتالوج.</p>
      {configured===true&&<form className="office-form" onSubmit={login}>
        <label>مفتاح المشغّل<input name="key" type="password" autoComplete="current-password" dir="ltr" minLength={32} maxLength={256} required/></label>
        <button className="office-button" disabled={busy}>{busy?"جارٍ التحقق…":"تسجيل الدخول"}</button>
      </form>}
      {configured===undefined&&<p role="status">جارٍ التحقق من جلسة الإدارة…</p>}
      {configured===false&&!error&&<Message message="لوحة الإدارة جاهزة وتنتظر تفعيل إعداد الجلسات على الخادم."/>}
      <Message message={error} error/><Link href="/" className="office-text-button">العودة إلى المتجر</Link>
    </section>
  </main>;

  const ActivePanel=active.component;
  return <main className="office office-dashboard" dir="rtl" lang="ar">
    <aside className="office-sidebar">
      <div className="office-mark" dir="ltr">SIYAG <span>OFFICE</span></div>
      <p>{roleNames[role]}</p>
      <nav aria-label="أقسام الإدارة">{available.map(({id,label,icon:Icon})=>
        <button type="button" key={id} aria-current={active.id===id?"page":undefined} onClick={()=>setSection(id)}><Icon size={19}/>{label}</button>)}</nav>
      <Link href="/"><ArrowUpRight size={17}/> المتجر</Link>
    </aside>
    <div className="office-workspace">
      <header className="office-header"><div><span>إدارة المتجر</span><h1>{active.label}</h1><p>{active.description}</p></div>
        <button type="button" className="office-button secondary" onClick={logout} disabled={busy}><LogOut size={17}/> خروج</button></header>
      <Message message={error} error/>
      <ActivePanel key={active.id}/>
    </div>
  </main>;
}
