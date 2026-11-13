"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import {connectOfficeCache,loadOffice} from "@/lib/admin-cache";
import {loadCatalogIndex} from "@/lib/admin-queries";
import {OfficeRouteContext} from "./office-route";
import {OfficeDataStatus} from "./office-data-status";
import {usePathname,useRouter} from "next/navigation";
const IntegrationSettings=dynamic(()=>import("./integration-settings").then(m=>m.IntegrationSettings),{loading:PageSkeleton});
import {OfficeChrome} from "./office-chrome";
import {Activity,useEffect,useLayoutEffect,useRef,useState,type FormEvent} from "react";
import {CreditCard,PanelRightClose,PanelRightOpen,ArrowUpRight,Plus,Store,ShieldCheck,LayoutDashboard,Menu,Warehouse,Boxes,FolderOpen,KeyRound,LogOut,PackageCheck,Star,Truck,Users} from "lucide-react";
import {office,roleNames,type StaffUser} from "@/lib/admin";
const Products=dynamic(()=>import("./catalog").then(m=>m.Products),{loading:PageSkeleton});
const StorefrontContent=dynamic(()=>import("./storefront-content").then(m=>m.StorefrontContent),{loading:PageSkeleton});
const Collections=dynamic(()=>import("./catalog").then(m=>m.Collections),{loading:PageSkeleton});
const Orders=dynamic(()=>import("./orders").then(m=>m.Orders),{loading:PageSkeleton});
const ShippingOptions=dynamic(()=>import("./shipping").then(m=>m.ShippingOptions),{loading:PageSkeleton});
const Staff=dynamic(()=>import("./staff").then(m=>m.Staff),{loading:PageSkeleton});
const ReviewModeration=dynamic(()=>import("./reviews").then(m=>m.ReviewModeration),{loading:PageSkeleton});
const JourneyDashboard=dynamic(()=>import("./journey").then(m=>m.JourneyDashboard),{loading:PageSkeleton});
import {Message,Panel,OfficeTip} from "./shared";
import {Overview} from "./overview";
const Inventory=dynamic(()=>import("./inventory").then(m=>m.Inventory),{loading:PageSkeleton});

function PageSkeleton(){return <div className="office-page-skeleton" aria-label="جارٍ تحميل محتوى الصفحة" role="status"><span className="office-skeleton"/><span className="office-skeleton"/><span className="office-skeleton"/></div>}
const panels=[
  {id:"overview",label:"نظرة عامة",description:"ملخص المتجر والمهام التي تحتاج انتباهك.",icon:LayoutDashboard,component:JourneyDashboard,roles:["Owner","Catalog","Fulfillment"]},
  {id:"journey",label:"رحلة العميل",description:"تابع الزيارات والحملات والسلة وإتمام الطلب.",icon:Users,component:JourneyDashboard,roles:["Owner"]},
  {id:"orders",label:"الطلبات",description:"تابع الطلبات الجديدة، وحالات الشحن والتسليم.",icon:PackageCheck,component:Orders,roles:["Owner","Fulfillment"]},
  {id:"inventory",label:"المخزون",description:"الكميات المتاحة وتنبيهات المخزون المنخفض.",icon:Warehouse,component:Products,roles:["Owner","Catalog"]},
  {id:"products",label:"المنتجات",description:"أدر بيانات العطور والصور والأحجام والأسعار والمخزون.",icon:Boxes,component:Products,roles:["Owner","Catalog"]},
  {id:"shipping",label:"التوصيل",description:"اضبط المحافظات ورسوم التوصيل قبل استقبال الطلبات.",icon:Truck,component:ShippingOptions,roles:["Owner","Fulfillment"]},
  {id:"storefront",label:"محتوى المتجر",description:"إدارة بانرات الرئيسية والكتالوج والصور والروابط.",icon:Store,component:StorefrontContent,roles:["Owner","Catalog"]},
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
  const scrollPositions=useRef<Record<string,number>>({});
  const [visited,setVisited]=useState<Record<string,string>>(()=>({[section]:pathname}));

  function navigate(id:string){setMenu(false);router.push("/admin/"+id)}
  function editProduct(id:string){setMenu(false);router.push("/admin/products/"+(id||"new"))}
  useLayoutEffect(()=>{if(mainScroll.current)mainScroll.current.scrollTop=scrollPositions.current[pathname]??0},[pathname]);
  useEffect(()=>{setVisited(current=>({...current,[section]:pathname}));setMenu(false)},[pathname,section]);
  useEffect(()=>connectOfficeCache(),[]);
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

  const renderPanel=(id:string)=>id==="overview"?<Overview role={role} navigate={navigate} createProduct={()=>editProduct("")}/>:id==="inventory"?<Inventory editProduct={editProduct}/>:id==="products"?<Products/>:id==="storefront"?<StorefrontContent/>:id==="collections"?<Collections/>:id==="orders"?<Orders/>:id==="shipping"?<ShippingOptions/>:id==="staff"?<Staff/>:id==="reviews"?<ReviewModeration/>:id==="integrations"?<IntegrationSettings/>:<JourneyDashboard/>;
  function prefetchPanel(id:string){router.prefetch("/admin/"+id);if(id==="products")void loadOffice("catalog/index",loadCatalogIndex).catch(()=>{});else{const query:Record<string,string>={orders:"orders?pageSize=20&pageNumber=1",inventory:"inventory?pageSize=30&pageNumber=1&maximumStock=5",collections:"collections",shipping:"shipping",staff:"staff",overview:role==="Owner"?"reports/summary":role==="Catalog"?"products?pageSize=1":"orders?status=pending&pageSize=5",journey:"reports/journey?days=30"};const path=query[id];if(path)void loadOffice(path,signal=>office(path,{signal})).catch(()=>{})}}

  const groups=[{label:"إدارة المتجر",ids:["overview","orders","products","inventory","collections","storefront"]},{label:"العملاء والتسويق",ids:["journey","reviews"]},{label:"الفريق والإعدادات",ids:["shipping","integrations","staff"]}];
  const initials=(user?.name??"S").trim().split(/\s+/).slice(0,2).map(part=>part[0]).join("");
  const navigation=<><Link href="/admin/overview" className="office-brand-lockup" onClick={()=>setMenu(false)} aria-label="SIYAG الرئيسية"><span className="office-brand-symbol"><Boxes size={21}/></span><div className="office-mark" dir="ltr">SIYAG <span>WORKSPACE</span></div></Link>
    <nav aria-label="أقسام الإدارة">{groups.map(group=>{const items=group.ids.map(id=>available.find(panel=>panel.id===id)).filter(panel=>panel!==undefined);return items.length?<div className="office-nav-group" key={group.label}><h2>{group.label}</h2>{items.map(({id,label,icon:Icon})=><OfficeTip label={label} side="left" disabled={!collapsed} key={id}><Link href={"/admin/"+id} aria-label={label} aria-current={active.id===id?"page":undefined} onMouseEnter={()=>prefetchPanel(id)} onFocus={()=>prefetchPanel(id)} onClick={()=>setMenu(false)}><Icon size={18}/><span>{label}</span></Link></OfficeTip>)}</div>:null})}</nav>
    <div className="office-sidebar-bottom"><div className="office-account"><span className="office-avatar">{initials}</span><div><strong>{user?.name}</strong><small><ShieldCheck size={12}/>{roleNames[role]}</small></div><OfficeTip label="أمان الحساب" side="left"><button type="button" className="office-account-security" aria-label="أمان الحساب" onClick={()=>{setMenu(false);setError("");setChange(true)}}><KeyRound size={16}/></button></OfficeTip></div></div></>;
  return <main className="office office-dashboard" data-collapsed={collapsed} dir="rtl" lang="ar">
    <aside className="office-sidebar">{navigation}</aside>
    {menu&&<Panel title="أقسام الإدارة" description="تنقّل بين صفحات المتجر" onClose={()=>setMenu(false)}><div className="office-sidebar office-mobile-navigation">{navigation}</div></Panel>}
    <div className="office-main"><div className="office-topbar"><button type="button" className="office-icon ghost office-collapse" aria-label={collapsed?"توسيع القائمة الجانبية":"تصغير القائمة الجانبية"} aria-expanded={!collapsed} onClick={()=>setCollapsed(value=>!value)}>{collapsed?<PanelRightOpen size={19}/>:<PanelRightClose size={19}/>}</button><button className="office-icon ghost office-menu" aria-label="فتح قائمة الإدارة" onClick={()=>setMenu(true)}><Menu size={21}/></button><div className="office-topbar-path"><h1>{active.label}</h1></div><OfficeChrome user={user!} destinations={available} busy={busy} security={()=>{setMenu(false);setError("");setChange(true)}} logout={()=>void logout()}/></div>
    <div className="office-workspace" ref={mainScroll} onScroll={()=>{if(mainScroll.current)scrollPositions.current[pathname]=mainScroll.current.scrollTop}} tabIndex={-1} aria-label="محتوى الصفحة"><OfficeDataStatus/>

      <Message message={error} error/>
      {available.filter(panel=>panel.id===active.id||visited[panel.id]).map(panel=><Activity key={panel.id} mode={panel.id===active.id?"visible":"hidden"}><OfficeRouteContext.Provider value={panel.id===active.id?pathname:visited[panel.id]}><section className="office-page-view" data-page={panel.id}>{renderPanel(panel.id)}</section></OfficeRouteContext.Provider></Activity>)}
    </div></div>
  </main>;
}
