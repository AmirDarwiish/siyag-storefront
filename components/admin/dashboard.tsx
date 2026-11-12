"use client";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {IntegrationSettings} from "./integration-settings";
import {OfficeNotifications} from "./office-notifications";
import {useEffect,useRef,useState,type FormEvent} from "react";
import {CreditCard,PanelRightClose,PanelRightOpen,ArrowUpRight,Plus,Store,ShieldCheck,LayoutDashboard,Menu,Warehouse,Boxes,FolderOpen,KeyRound,LogOut,PackageCheck,Star,Truck,Users} from "lucide-react";
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
  {id:"integrations",label:"الدفع والتكاملات",description:"إعدادات Paymob ومفاتيح شركات الشحن.",icon:CreditCard,component:IntegrationSettings,roles:["Owner"]},
];

export function AdminDashboard(){
  const [user,setUser]=useState<StaffUser|null>(null);
  const role=user?.role;
  const [change,setChange]=useState(false);
  const [configured,setConfigured]=useState<boolean>();
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const pathname=usePathname(),router=useRouter();
  const section=pathname.split("/")[2]||"overview";
  const [menu,setMenu]=useState(false);
  const [collapsed,setCollapsed]=useState(false);
  const mainScroll=useRef<HTMLDivElement>(null);

  function navigate(id:string){setMenu(false);router.push("/admin/"+id)}
  function editProduct(id:string){setMenu(false);router.push("/admin/products/"+(id||"new"))}
  useEffect(()=>{mainScroll.current?.scrollTo({top:0,behavior:"instant"})},[pathname]);
  useEffect(()=>{
    if(window.location.hash)router.replace("/admin/"+window.location.hash.slice(1));
    const controller=new AbortController();
    office<{configured:boolean;user:StaffUser|null}>("session",{signal:controller.signal})
      .then(session=>{setConfigured(session.configured);setUser(session.user)})
      .catch(()=>{if(!controller.signal.aborted){setConfigured(false);setError("تعذّر التحقق من جلسة الإدارة.")}});
    function expired(){setUser(null);setChange(false);setError("انتهت جلسة الإدارة. سجّل الدخول من جديد.")}
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
    try{await office("session",{method:"DELETE"});setUser(null);setChange(false)}
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
  const groups=[{label:"إدارة المتجر",ids:["overview","orders","products","inventory","collections"]},{label:"العملاء والتسويق",ids:["journey","reviews"]},{label:"الفريق والإعدادات",ids:["shipping","integrations","staff"]}];
  const initials=(user?.name??"S").trim().split(/\s+/).slice(0,2).map(part=>part[0]).join("");
  const navigation=<><div className="office-mark" dir="ltr">SIYAG <span>WORKSPACE</span></div>
    <div className="office-store-identity"><span className="office-store-avatar"><Store size={20}/></span><div><strong>متجر SIYAG</strong></div></div>
    <nav aria-label="أقسام الإدارة">{groups.map(group=>{const items=group.ids.map(id=>available.find(panel=>panel.id===id)).filter(panel=>panel!==undefined);return items.length?<div className="office-nav-group" key={group.label}><h2>{group.label}</h2>{items.map(({id,label,icon:Icon})=><button type="button" key={id} aria-label={label} title={collapsed?label:undefined} aria-current={active.id===id?"page":undefined} onClick={()=>navigate(id)}><Icon size={18}/><span>{label}</span></button>)}</div>:null})}</nav>
    <div className="office-sidebar-bottom"><button type="button" onClick={()=>{setMenu(false);setError("");setChange(true)}}><KeyRound size={17}/> أمان الحساب</button><div className="office-account"><span className="office-avatar">{initials}</span><div><strong>{user?.name}</strong><small><ShieldCheck size={12}/>{roleNames[role]}</small></div></div></div></>;
  return <main className="office office-dashboard" data-collapsed={collapsed} dir="rtl" lang="ar">
    <aside className="office-sidebar">{navigation}</aside>
    {menu&&<Panel title="أقسام الإدارة" description="تنقّل بين صفحات المتجر" onClose={()=>setMenu(false)}><div className="office-sidebar office-mobile-navigation">{navigation}</div></Panel>}
    <div className="office-main" ref={mainScroll} tabIndex={-1} aria-label="محتوى لوحة الإدارة"><div className="office-topbar"><button type="button" className="office-icon office-collapse" aria-label={collapsed?"توسيع القائمة الجانبية":"تصغير القائمة الجانبية"} aria-expanded={!collapsed} onClick={()=>setCollapsed(value=>!value)}>{collapsed?<PanelRightOpen size={19}/>:<PanelRightClose size={19}/>}</button><button className="office-icon office-menu" aria-label="فتح قائمة الإدارة" onClick={()=>setMenu(true)}><Menu size={21}/></button><div className="office-topbar-path"><h1>{active.label}</h1></div><div>{(role==="Owner"||role==="Fulfillment")&&<OfficeNotifications/>}<Link href="/" target="_blank" rel="noreferrer" className="office-button secondary office-store-link" aria-label="فتح المتجر"><ArrowUpRight size={16}/><span>فتح المتجر</span></Link><button type="button" className="office-button secondary" onClick={logout} disabled={busy}><LogOut size={16}/> خروج</button></div></div>
    <div className="office-workspace">

      <Message message={error} error/>
      {active.id==="overview"?<Overview role={role} navigate={navigate} createProduct={()=>editProduct("")}/>:active.id==="inventory"?<Inventory editProduct={editProduct}/>:active.id==="products"?<Products/>:<ActivePanel key={active.id}/>}
    </div></div>
  </main>;
}
