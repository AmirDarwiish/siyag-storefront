"use client";
import Link from "next/link";
import {useEffect,useState,type FormEvent} from "react";
import {ArrowUpRight,LayoutDashboard,Menu,Warehouse,Boxes,FolderOpen,KeyRound,LogOut,PackageCheck,Star,Truck,Users} from "lucide-react";
import {office,roleNames,type StaffUser} from "@/lib/admin";
import {Collections,Products} from "./catalog";
import {Orders} from "./orders";
import {ShippingOptions} from "./shipping";
import {Staff} from "./staff";
import {ReviewModeration} from "./reviews";
import {JourneyDashboard} from "./journey";
import {Message,Panel} from "./shared";
import {Overview} from "./overview";
import {Inventory} from "./inventory";

const panels=[
  {id:"overview",label:"نظرة عامة",description:"ملخص المتجر والمهام التي تحتاج انتباهك.",icon:LayoutDashboard,component:JourneyDashboard,roles:["Owner","Catalog","Fulfillment"]},
  {id:"journey",label:"رحلة العميل",description:"تابع الزيارات والحملات والسلة وإتمام الطلب.",icon:Users,component:JourneyDashboard,roles:["Owner"]},
  {id:"orders",label:"الطلبات",description:"تابع الطلبات الجديدة، وحالات الشحن والتسليم.",icon:PackageCheck,component:Orders,roles:["Owner","Fulfillment"]},
  {id:"inventory",label:"المخزون",description:"الكميات المتاحة وتنبيهات المخزون المنخفض.",icon:Warehouse,component:Products,roles:["Owner","Catalog"]},
  {id:"products",label:"المنتجات",description:"أدر بيانات العطور والصور والأحجام والأسعار والمخزون.",icon:Boxes,component:Products,roles:["Owner","Catalog"]},
  {id:"shipping",label:"التوصيل",description:"اضبط المحافظات ورسوم التوصيل قبل استقبال الطلبات.",icon:Truck,component:ShippingOptions,roles:["Owner","Fulfillment"]},
  {id:"collections",label:"الأقسام",description:"أدر مجموعات العطور وترتيب ظهورها في المتجر.",icon:FolderOpen,component:Collections,roles:["Owner","Catalog"]},
  {id:"reviews",label:"التقييمات",description:"راجع تعليقات العملاء وصورهم قبل نشرها.",icon:Star,component:ReviewModeration,roles:["Owner","Catalog"]},
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
  const [menu,setMenu]=useState(false);
  const [productIntent,setProductIntent]=useState<string|null>(null);
  function navigate(id:string){setProductIntent(null);setSection(id);setMenu(false);window.history.replaceState(null,"","#"+id)}
  function editProduct(id:string){navigate("products");setProductIntent(id)}
  useEffect(()=>{
    setSection(window.location.hash.slice(1));
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
    setBusy(true);setError("");
    try{setUser((await office<{user:StaffUser}>("session",{method:"POST",data})).user);form.reset()}
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
      <h1>إدارة متجر SIYAG</h1><p>مساحة فريق المتجر لإدارة الطلبات والكتالوج.</p>
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
  const navigation=<><div className="office-mark" dir="ltr">SIYAG <span>OFFICE</span></div>
    <div className="office-store-identity"><span>متجر SIYAG</span><small>إدارة المتجر</small></div>
    <nav aria-label="أقسام الإدارة">{available.map(({id,label,icon:Icon})=><button type="button" key={id} aria-current={active.id===id?"page":undefined} onClick={()=>navigate(id)}><Icon size={19}/>{label}</button>)}</nav>
    <div className="office-sidebar-bottom"><Link href="/" target="_blank" rel="noreferrer"><ArrowUpRight size={17}/> فتح المتجر</Link><button type="button" onClick={()=>{setMenu(false);setError("");setChange(true)}}><KeyRound size={17}/> تغيير كلمة المرور</button><div className="office-account"><span>{user?.name}</span><small>{roleNames[role]}</small></div></div></>;
  return <main className="office office-dashboard" dir="rtl" lang="ar">
    <aside className="office-sidebar">{navigation}</aside>
    {menu&&<Panel title="أقسام الإدارة" description="تنقّل بين صفحات المتجر" onClose={()=>setMenu(false)}><div className="office-sidebar office-mobile-navigation">{navigation}</div></Panel>}
    <div className="office-main"><div className="office-topbar"><button className="office-icon office-menu" aria-label="فتح قائمة الإدارة" onClick={()=>setMenu(true)}><Menu size={21}/></button><span>SIYAG <small>مساحة إدارة المتجر</small></span><div><span className="office-role">{roleNames[role]}</span><button type="button" className="office-button secondary" onClick={logout} disabled={busy}><LogOut size={16}/> خروج</button></div></div>
    <div className="office-workspace">
      <header className="office-header"><div><span>إدارة المتجر / {active.label}</span><h1>{active.label}</h1><p>{active.description}</p></div></header>
      <Message message={error} error/>
      {active.id==="overview"?<Overview role={role} navigate={navigate} createProduct={()=>editProduct("")}/>:active.id==="inventory"?<Inventory editProduct={editProduct}/>:active.id==="products"?<Products key={productIntent??"list"} initialEditing={productIntent}/>:<ActivePanel key={active.id}/>}
    </div></div>
  </main>;
}
