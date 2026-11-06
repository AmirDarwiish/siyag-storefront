"use client";
import Link from "next/link";
import {useEffect,useState,type FormEvent} from "react";
import {ArrowUpRight,Boxes,FolderOpen,KeyRound,LogOut,PackageCheck,Truck,Users} from "lucide-react";
import {office,roleNames,type StaffUser} from "@/lib/admin";
import {Collections,Products} from "./catalog";
import {Orders} from "./orders";
import {ShippingOptions} from "./shipping";
import {Staff} from "./staff";
import {Message} from "./shared";

const panels=[
  {id:"orders",label:"الطلبات",description:"تابع الطلبات الجديدة، وحالات الشحن والتسليم.",icon:PackageCheck,component:Orders,roles:["Owner","Fulfillment"]},
  {id:"products",label:"العطور",description:"أدر بيانات العطور والصور والأحجام والأسعار والمخزون.",icon:Boxes,component:Products,roles:["Owner","Catalog"]},
  {id:"shipping",label:"التوصيل",description:"اضبط المحافظات ورسوم التوصيل قبل استقبال الطلبات.",icon:Truck,component:ShippingOptions,roles:["Owner","Fulfillment"]},
  {id:"collections",label:"التصنيفات",description:"أدر مجموعات العطور وترتيب ظهورها في المتجر.",icon:FolderOpen,component:Collections,roles:["Owner","Catalog"]},
  {id:"staff",label:"الموظفون",description:"أضف موظفين وحدد صلاحياتهم وأدر حالة الحساب.",icon:Users,component:Staff,roles:["Owner"]},
];

export function AdminDashboard(){
  const [user,setUser]=useState<StaffUser|null>(null);
  const role=user?.role;
  const [change,setChange]=useState(false);
  const [configured,setConfigured]=useState<boolean>();
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [section,setSection]=useState("");
  useEffect(()=>{
    const controller=new AbortController();
    office<{configured:boolean;user:StaffUser|null}>("session",{signal:controller.signal})
      .then(session=>{setConfigured(session.configured);setUser(session.user)})
      .catch(()=>{if(!controller.signal.aborted){setConfigured(false);setError("تعذّر التحقق من جلسة الإدارة.")}});
    function expired(){setUser(null);setSection("");setChange(false);setError("انتهت جلسة الإدارة. سجّل الدخول من جديد.")}
    window.addEventListener("siyag-office-expired",expired);
    return()=>{controller.abort();window.removeEventListener("siyag-office-expired",expired)};
  },[]);
  async function login(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(busy)return;
    const form=event.currentTarget;
    const fields=new FormData(form);
    const data={email:fields.get("email"),password:fields.get("password")};
    form.reset();
    setBusy(true);setError("");
    try{setUser((await office<{user:StaffUser}>("session",{method:"POST",data})).user)}
    catch(error){setError(error instanceof Error?error.message:"تعذّر تسجيل الدخول.")}
    finally{setBusy(false)}
  }
  async function changePassword(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(busy)return;
    const form=event.currentTarget;
    const fields=new FormData(form);
    if(fields.get("newPassword")!==fields.get("confirmation")){setError("تأكيد كلمة المرور غير مطابق.");return}
    setBusy(true);setError("");
    try{
      const data={currentPassword:fields.get("currentPassword"),newPassword:fields.get("newPassword")};
      setUser((await office<{user:StaffUser}>("session",{method:"PUT",data})).user);
      form.reset();setChange(false);
    }catch(error){setError(error instanceof Error?error.message:"تعذّر تغيير كلمة المرور.")}
    finally{setBusy(false)}
  }
  async function logout(){
    setBusy(true);setError("");
    try{await office("session",{method:"DELETE"});setUser(null);setSection("");setChange(false)}
    catch(error){setError(error instanceof Error?error.message:"تعذّر تسجيل الخروج.")}
    finally{setBusy(false)}
  }
  const available=role?panels.filter(panel=>panel.roles.includes(role)):[];
  const active=available.find(panel=>panel.id===section)??available[0];

  if(user&&(user.mustChangePassword||change))return <main className="office office-login" dir="rtl" lang="ar">
    <section>
      <div className="office-mark" dir="ltr">SIYAG <span>OFFICE</span></div>
      <h1>تغيير كلمة المرور</h1>
      {user.mustChangePassword&&<p>عيّن كلمة مرور خاصة بيك قبل فتح لوحة الإدارة.</p>}
      <form className="office-form" onSubmit={changePassword}>
        <label>كلمة المرور الحالية<input name="currentPassword" type="password" autoComplete="current-password" maxLength={128} required/></label>
        <label>كلمة المرور الجديدة<input name="newPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label>
        <label>تأكيد كلمة المرور<input name="confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label>
        <button className="office-button" disabled={busy}>حفظ كلمة المرور</button>
      </form>
      <Message message={error} error/>
      <button className="office-text-button" type="button" disabled={busy} onClick={user.mustChangePassword?logout:()=>{setChange(false);setError("")}}>
        {user.mustChangePassword?"خروج":"العودة للوحة"}
      </button>
    </section>
  </main>;

  if(!role||!active)return <main className="office office-login" dir="rtl" lang="ar">
    <section>
      <div className="office-mark" dir="ltr">SIYAG <span>OFFICE</span></div>
      <KeyRound size={27}/>
      <h1>لوحة إدارة سياج</h1><p>مساحة فريق المتجر لإدارة الطلبات والكتالوج.</p>
      {configured===true&&<form className="office-form" onSubmit={login}>
        <label>البريد الإلكتروني<input name="email" type="email" autoComplete="username" dir="ltr" maxLength={254} required/></label>
        <label>كلمة المرور<input name="password" type="password" autoComplete="current-password" dir="ltr" maxLength={128} required/></label>
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
      <p>{user?.name} · {roleNames[role]}</p>
      <nav aria-label="أقسام الإدارة">{available.map(({id,label,icon:Icon})=>
        <button type="button" key={id} aria-current={active.id===id?"page":undefined} onClick={()=>setSection(id)}><Icon size={19}/>{label}</button>)}</nav>
      <button type="button" className="office-text-button" onClick={()=>{setError("");setChange(true)}}>تغيير كلمة المرور</button>
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
