"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {Mail,Package,ShieldCheck,ShoppingBag,ChevronDown} from "lucide-react";
import {api,money,type Content,type Settings,type Shipping} from "@/lib/store";
import {governorates} from "@/lib/governorates";
import {carePages,carePath,type CarePageKey} from "@/lib/store-pages";
import {useStore} from "./store-context";
export function CarePage({page}:{page:CarePageKey}){
 const {tr,ar,lang}=useStore(),definition=carePages[page];
 const [settings,setSettings]=useState<Settings>(),[shipping,setShipping]=useState<Shipping[]>(),[content,setContent]=useState<Content>(),[unavailable,setUnavailable]=useState(false);
 useEffect(()=>{const c=new AbortController();api<Content[]>("store/content?area=pages",{signal:c.signal}).then(items=>setContent(items.find(item=>item.slug===page))).catch(()=>{});if(page==="contact")api<Settings>("store/settings",{signal:c.signal}).then(setSettings).catch(()=>setUnavailable(true));if(page==="shipping")api<Shipping[]>("store/shipping",{signal:c.signal}).then(setShipping).catch(()=>setUnavailable(true));return()=>c.abort()},[page]);
 const copy=(p:[string,string])=>p[ar?1:0];
 const email=settings?.supportEmail?.trim();
 return <main className={"care-page container section "+(page==="about"?"care-about":"")}>
  <nav className="crumb" aria-label={tr("Breadcrumb","مسار الصفحة")}><Link href="/">{tr("Home","الرئيسية")}</Link><span>/</span><span>{copy(definition.title)}</span></nav>
  <header className="care-heading"><span className="eyebrow">{page==="about"?"SIYAG PARFUMS":tr("SIYAG CLIENT CARE","خدمة عملاء SIYAG")}</span><h1>{copy(definition.title)}</h1><p>{copy(definition.intro)}</p></header>
  <div className="care-layout"><article className="care-content">
   {page==="about"&&<figure className="care-image"><img src="/brand/olive-notes.webp" width={1140} height={855} alt={tr("Citrus, woods and resins in sunlight","حمضيات وأخشاب وراتنجات في ضوء الشمس")}/></figure>}
   {content?<section className="care-section"><h2>{ar?content.titleAr:content.titleEn}</h2><p className="care-published">{ar?content.textAr:content.textEn}</p></section>:definition.sections.map((section,index)=>page==="faq"?<details className="care-faq" key={index}><summary>{copy(section.title)}<ChevronDown size={18}/></summary><p>{copy(section.body)}</p></details>:<section className="care-section" key={index}><span className="care-section-index">{String(index+1).padStart(2,"0")}</span><div><h2>{copy(section.title)}</h2><p>{copy(section.body)}</p></div></section>)}
   {page==="contact"&&<section className="care-contact-panel"><Mail size={24}/><div><h2>{tr("Write to SIYAG","راسل SIYAG")}</h2>{email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?<a className="text-link" href={"mailto:"+encodeURIComponent(email)}>{email}</a>:<p role="status">{!settings&&!unavailable?tr("Loading contact details…","جاري تحميل بيانات التواصل…"):tr("A client-care email has not been published yet. You can still access your order through secure tracking.","لم يُنشر بريد خدمة العملاء بعد. تقدر توصل لطلبك من التتبع الآمن.")}</p>}</div></section>}
   {page==="shipping"&&<section className="care-rates"><h2>{tr("Current delivery options","خيارات التوصيل الحالية")}</h2>{shipping?.length?<div className="care-rate-list">{shipping.map(option=><div key={option.governorate+option.code}><span>{governorates[option.governorate]?.[ar?1:0]??option.governorate}<small>{ar?option.nameAr:option.nameEn}</small></span><strong>{money(option.feeMinor,lang)}</strong></div>)}</div>:<p role="status">{unavailable?tr("Delivery options could not be loaded. Check again at checkout.","تعذّر تحميل خيارات التوصيل. راجعها في إتمام الطلب."):shipping?tr("No delivery options are currently published.","لا توجد خيارات توصيل منشورة حاليًا."):tr("Loading delivery options…","جاري تحميل خيارات التوصيل…")}</p>}</section>}
   {page==="privacy"&&<button type="button" className="action ink" onClick={()=>window.dispatchEvent(new Event("siyag-open-privacy"))}><ShieldCheck size={18}/>{tr("Manage privacy preferences","إدارة إعدادات الخصوصية")}</button>}
   <div className="care-next"><Link className="action ink" href={page==="returns"||page==="contact"?"/track":"/shop"}>{page==="returns"||page==="contact"?<><Package size={18}/>{tr("Track your order","تتبّع طلبك")}</>:<><ShoppingBag size={18}/>{tr("Explore the collection","استكشف التشكيلة")}</>}</Link></div>
  </article><aside className="care-navigation" aria-label={tr("Client care pages","صفحات خدمة العملاء")}><span className="eyebrow">{tr("Here to help","للمساعدة")}</span>{(Object.keys(carePages) as CarePageKey[]).filter(key=>key!=="about").map(key=><Link key={key} href={carePath(key)} aria-current={page===key?"page":undefined}>{copy(carePages[key].title)}</Link>)}</aside></div>
 </main>
}
