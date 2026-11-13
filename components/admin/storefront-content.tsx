"use client";
import {useState,type FormEvent} from "react";
import {bannerHref} from "@/lib/banners";
import {office} from "@/lib/admin";
import {type Content,imageUrl} from "@/lib/store";
import {useOfficeData,Upload,Message} from "./shared";
type ManagedContent=Content&{area:string;published:boolean;sortOrder:number};
export function StorefrontContent(){
 const [revision,setRevision]=useState(0),[message,setMessage]=useState(""),[editor,setEditor]=useState<string|null>(null);
 const {data,error}=useOfficeData<ManagedContent[]>("content",revision);
 if(!data)return <Message message={error||"جارٍ تحميل محتوى المتجر…"} error={!!error}/>;
 const catalog=data.find(item=>item.area==="catalog-banner"),banners=data.filter(item=>item.area==="home-hero").sort((a,b)=>a.sortOrder-b.sortOrder||a.slug.localeCompare(b.slug));
 const selected=banners.find(item=>item.slug===editor);
 return <><Message message={message}/><section className="office-card"><header><div><h2>بانرات الصفحة الرئيسية</h2><p className="office-help">صور كوفر قابلة للضغط، بالترتيب المحدد. المقاس المقترح 1600 × 900 بكسل. النصوص للتعريف بالصورة فقط ولا تظهر فوق البانر.</p></div><button type="button" className="office-button" onClick={()=>{setEditor("new");setMessage("")}}>إضافة بانر</button></header>
  <div className="office-banner-list">{banners.map(banner=><article className="office-banner-item" key={banner.slug}>{banner.imageUrl&&<img src={imageUrl(banner.imageUrl)} alt={banner.titleAr}/>}<div><h3>{banner.titleAr}</h3><p>{banner.published?"ظاهر في المتجر":"مخفي"} · ترتيب {banner.sortOrder}</p><p dir="ltr">{banner.actionUrl||"بدون رابط"}</p></div><button type="button" className="office-text-button" onClick={()=>{setEditor(banner.slug);setMessage("")}}>تعديل {banner.titleAr}</button></article>)}</div>
  {!banners.length&&<p className="office-help">لا توجد بانرات. أضف أول صورة وحدد الرابط وترتيب الظهور.</p>}
  {editor!==null&&<HeroBannerForm key={editor+JSON.stringify(selected)} initial={selected} cancel={()=>setEditor(null)} saved={()=>{setRevision(v=>v+1);setEditor(null);setMessage("تم حفظ بانر الرئيسية.")}}/>}
 </section><section className="office-card"><header><h2>بانر الكتالوج</h2></header><p className="office-help">بانر صغير داخل الكتالوج. عدّل النصوص والصورة والرابط أو أوقف ظهوره.</p><BannerForm key={JSON.stringify(catalog)} initial={catalog} saved={()=>{setRevision(v=>v+1);setMessage("تم حفظ بانر الكتالوج.")}}/></section></>;
}
function HeroBannerForm({initial,saved,cancel}:{initial?:ManagedContent;saved:()=>void;cancel:()=>void}){
 const [image,setImage]=useState(initial?.imageUrl??""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function save(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;const form=new FormData(event.currentTarget),href=String(form.get("actionUrl")||"").trim();
  if(!image.trim()){setError("أضف صورة للبانر.");return}
  if(href&&!bannerHref(href)){setError("اكتب رابطًا داخل المتجر مثل /shop أو /shop?collection=bestsellers");return}
  const titleAr=String(form.get("titleAr")||"").trim(),titleEn=String(form.get("titleEn")||"").trim();
  setBusy(true);setError("");
  try{await office("content/"+(initial?.slug??"hero-"+crypto.randomUUID()),{method:"PUT",data:{titleAr,titleEn,textAr:titleAr,textEn:titleEn,imageUrl:image.trim(),actionUrl:href||null,actionAr:null,actionEn:null,area:"home-hero",published:form.has("published"),sortOrder:Number(form.get("sortOrder"))||0}});saved()}
  catch(e){setError((e as Error).message)}finally{setBusy(false)}
 }
 return <form className="office-form office-form-section" onSubmit={save}><h3>{initial?"تعديل بانر الرئيسية":"بانر جديد"}</h3><fieldset disabled={busy}><div className="office-fields"><label>اسم البانر بالعربية<input name="titleAr" defaultValue={initial?.titleAr??""} required maxLength={150}/></label><label>اسم البانر بالإنجليزية<input name="titleEn" defaultValue={initial?.titleEn??""} required maxLength={150} dir="ltr"/></label><label>ترتيب الظهور<input name="sortOrder" type="number" min={0} max={10000} defaultValue={initial?.sortOrder??0} required/></label><label>رابط البانر داخل المتجر<input name="actionUrl" defaultValue={initial?.actionUrl??"/shop"} maxLength={500} dir="ltr" placeholder="/shop?collection=bestsellers"/><small>اختياري. الضغط على الصورة يفتح هذا الرابط.</small></label></div><label>صورة البانر<input value={image} onChange={e=>setImage(e.target.value)} required dir="ltr"/></label><Upload onUpload={setImage}/>{image&&<img className="office-banner-preview" src={imageUrl(image)} alt="معاينة البانر"/>}<label className="office-check"><input type="checkbox" name="published" defaultChecked={initial?.published??true}/>إظهار البانر في الرئيسية</label><Message message={error} error/><div className="office-tools"><button className="office-button" disabled={busy}>{busy?"جارٍ الحفظ…":"حفظ بانر الرئيسية"}</button><button className="office-text-button" type="button" disabled={busy} onClick={cancel}>إلغاء</button></div></fieldset></form>;
}
function BannerForm({initial,saved}:{initial?:(Content&{published:boolean;sortOrder:number});saved:()=>void}){
 const [image,setImage]=useState(initial?.imageUrl??""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function save(event:FormEvent<HTMLFormElement>){event.preventDefault();if(busy)return;const f=new FormData(event.currentTarget);setBusy(true);setError("");try{await office("content/"+(initial?.slug??"catalog-discovery"),{method:"PUT",data:{...Object.fromEntries(f),imageUrl:image||null,area:"catalog-banner",published:f.has("published"),sortOrder:initial?.sortOrder??0}});saved()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <form className="office-form" onSubmit={save}><div className="office-fields">{[["titleAr","العنوان بالعربية"],["titleEn","العنوان بالإنجليزية"],["textAr","النص بالعربية"],["textEn","النص بالإنجليزية"],["actionAr","نص الزر بالعربية"],["actionEn","نص الزر بالإنجليزية"]].map(([field,label])=><label key={field}>{label}<input name={field} defaultValue={String(initial?.[field as keyof Content]??"")} required maxLength={field.startsWith("title")?150:field.startsWith("action")?80:1000} dir={field.endsWith("En")?"ltr":"rtl"}/></label>)}</div><label>رابط الزر داخل المتجر<input name="actionUrl" defaultValue={initial?.actionUrl??"/shop?format=decant"} required pattern="/[^\\\\]*" dir="ltr"/></label><label>رابط الصورة<input value={image} onChange={e=>setImage(e.target.value)} dir="ltr"/></label><Upload onUpload={setImage}/>{image&&<div className="office-images"><div><img src={imageUrl(image)} alt="معاينة البانر"/></div></div>}<label className="office-check"><input type="checkbox" name="published" defaultChecked={initial?.published??false}/>إظهار البانر في الكتالوج</label><Message message={error} error/><button className="office-button" disabled={busy}>{busy?"جارٍ الحفظ…":"حفظ البانر"}</button></form>
}
