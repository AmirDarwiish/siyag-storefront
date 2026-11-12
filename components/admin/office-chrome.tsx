"use client";
import {useEffect,useState,type FormEvent} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {Popover} from "radix-ui";
import {ArrowUpRight,ChevronDown,Command,KeyRound,LogOut,Search,X,Boxes,type LucideIcon} from "lucide-react";
import {Dialog,DialogContent,DialogDescription,DialogTitle} from "@/components/ui/dialog";
import {roleNames,type StaffUser,type ProductSummary} from "@/lib/admin";
import {loadCatalogIndex} from "@/lib/admin-queries";
import {OfficeNotifications} from "./office-notifications";
import {OfficeTip,useOfficeData} from "./shared";
type Destination={id:string;label:string;icon:LucideIcon};
export function OfficeChrome({user,destinations,busy,security,logout}:{user:StaffUser;destinations:Destination[];busy:boolean;security:()=>void;logout:()=>void}){
 const [search,setSearch]=useState(false),[account,setAccount]=useState(false);
 const initials=user.name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join("");
 useEffect(()=>{const shortcut=(event:KeyboardEvent)=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();setSearch(value=>!value)}};window.addEventListener("keydown",shortcut);return()=>window.removeEventListener("keydown",shortcut)},[]);
 return <><button type="button" className="office-command-trigger" aria-label="البحث في لوحة الإدارة" onClick={()=>setSearch(true)}><Search size={17}/><span>ابحث أو انتقل إلى…</span><kbd><Command size={11}/> K</kbd></button><div className="office-chrome-actions"><OfficeTip label="فتح المتجر"><Link href="/" target="_blank" rel="noreferrer" className="office-icon ghost" aria-label="فتح المتجر"><ArrowUpRight size={18}/></Link></OfficeTip>{(user.role==="Owner"||user.role==="Fulfillment")&&<OfficeNotifications/>}<span className="office-chrome-divider"/><Popover.Root open={account} onOpenChange={setAccount}><Popover.Trigger asChild><button type="button" className="office-profile-trigger" aria-label="قائمة الحساب" aria-expanded={account}><span className="office-profile-avatar">{initials}</span><ChevronDown size={13}/></button></Popover.Trigger><Popover.Portal><Popover.Content className="office-profile-menu" align="end" sideOffset={10} collisionPadding={12} dir="rtl" aria-label="حساب الإدارة"><header><span className="office-profile-avatar">{initials}</span><div><strong>{user.name}</strong><small>{roleNames[user.role]}</small></div></header><button type="button" onClick={()=>{setAccount(false);security()}}><KeyRound size={17}/> أمان الحساب</button><Link href="/" target="_blank" rel="noreferrer"><ArrowUpRight size={17}/> فتح المتجر</Link><button type="button" className="danger" disabled={busy} onClick={()=>{setAccount(false);logout()}}><LogOut size={17}/> تسجيل الخروج</button></Popover.Content></Popover.Portal></Popover.Root></div>{search&&<OfficeSearch user={user} destinations={destinations} close={()=>setSearch(false)}/>}</>;
}
function OfficeSearch({user,destinations,close}:{user:StaffUser;destinations:Destination[];close:()=>void}){
 const [query,setQuery]=useState("");const term=query.trim().toLowerCase(),router=useRouter();
 const catalog=user.role!=="Fulfillment";
 const {data,error,refreshing}=useOfficeData<ProductSummary[]>(catalog&&term.length>=2?"catalog/index":null,0,0,loadCatalogIndex);
 const pages=destinations.filter(item=>!term||item.label.includes(term));
 const products=(data??[]).filter(item=>term.length>=2&&[item.nameAr,item.nameEn,item.slug].some(value=>value.toLowerCase().includes(term))).slice(0,6);
 const go=(path:string)=>{close();router.push(path)};
 function submit(event:FormEvent){event.preventDefault();if(products.length)go("/admin/products/"+products[0].id);else if(pages.length)go("/admin/"+pages[0].id)}
 return <Dialog open onOpenChange={open=>{if(!open)close()}}><DialogContent className="office-command" showCloseButton={false}><DialogTitle className="sr-only">البحث في لوحة الإدارة</DialogTitle><DialogDescription className="sr-only">ابحث عن قسم أو منتج وانتقل إليه مباشرة</DialogDescription><form onSubmit={submit}><Search size={20}/><input autoFocus aria-label="ابحث عن صفحة أو منتج" placeholder={catalog?"ابحث عن صفحة، عطر أو رمز منتج…":"ابحث عن صفحة…"} value={query} onChange={e=>setQuery(e.target.value)}/><button type="button" className="office-icon ghost" aria-label="إغلاق البحث" onClick={close}><X size={17}/></button></form><div className="office-command-results">{pages.length>0&&<section><h2>الانتقال السريع</h2>{pages.map(({id,label,icon:Icon})=><button type="button" key={id} onClick={()=>go("/admin/"+id)}><Icon size={17}/><span>{label}</span><kbd>↵</kbd></button>)}</section>}{products.length>0&&<section><h2>المنتجات</h2>{products.map(product=><button type="button" key={product.id} onClick={()=>go("/admin/products/"+product.id)}><Boxes size={17}/><span>{product.nameAr}<small>{product.nameEn}</small></span><span className="office-badge">{product.published?"منشور":"مسودة"}</span></button>)}</section>}{refreshing&&!data&&<p className="office-command-feedback">جارٍ البحث في الكتالوج…</p>}{error&&<p className="office-error">{error}</p>}{!pages.length&&!products.length&&!refreshing&&<p className="office-command-feedback">لا توجد نتائج مطابقة.</p>}</div><footer><kbd>Esc</kbd> للإغلاق <span>Enter للانتقال</span></footer></DialogContent></Dialog>;
}
