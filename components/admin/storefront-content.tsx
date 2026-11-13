"use client";
import {useState,type FormEvent} from "react";
import {office} from "@/lib/admin";
import {type Content,imageUrl} from "@/lib/store";
import {useOfficeData,Upload,Message} from "./shared";
export function StorefrontContent(){
 const [revision,setRevision]=useState(0),[message,setMessage]=useState("");
 const {data,error}=useOfficeData<(Content&{area:string;published:boolean;sortOrder:number})[]>("content",revision);
 if(!data)return <Message message={error||"جارٍ تحميل محتوى المتجر…"} error={!!error}/>;
 const banner=data.find(item=>item.area==="catalog-banner");
 return <><p className="office-help">بانر صغير داخل الكتالوج. عدّل النصوص والصورة والرابط أو أوقف ظهوره.</p><Message message={message}/><BannerForm key={revision} initial={banner} saved={()=>{setRevision(v=>v+1);setMessage("تم حفظ بانر الكتالوج.")}}/></>;
}
function BannerForm({initial,saved}:{initial?:(Content&{published:boolean;sortOrder:number});saved:()=>void}){
 const [image,setImage]=useState(initial?.imageUrl??""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function save(event:FormEvent<HTMLFormElement>){event.preventDefault();if(busy)return;const f=new FormData(event.currentTarget);setBusy(true);setError("");try{await office("content/"+(initial?.slug??"catalog-discovery"),{method:"PUT",data:{...Object.fromEntries(f),imageUrl:image||null,area:"catalog-banner",published:f.has("published"),sortOrder:initial?.sortOrder??0}});saved()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <form className="office-form" onSubmit={save}><div className="office-fields">{[["titleAr","العنوان بالعربية"],["titleEn","العنوان بالإنجليزية"],["textAr","النص بالعربية"],["textEn","النص بالإنجليزية"],["actionAr","نص الزر بالعربية"],["actionEn","نص الزر بالإنجليزية"]].map(([field,label])=><label key={field}>{label}<input name={field} defaultValue={String(initial?.[field as keyof Content]??"")} required maxLength={field.startsWith("title")?150:field.startsWith("action")?80:1000} dir={field.endsWith("En")?"ltr":"rtl"}/></label>)}</div><label>رابط الزر داخل المتجر<input name="actionUrl" defaultValue={initial?.actionUrl??"/shop?format=decant"} required pattern="/[^\\\\]*" dir="ltr"/></label><label>رابط الصورة<input value={image} onChange={e=>setImage(e.target.value)} dir="ltr"/></label><Upload onUpload={setImage}/>{image&&<div className="office-images"><div><img src={imageUrl(image)} alt="معاينة البانر"/></div></div>}<label className="office-check"><input type="checkbox" name="published" defaultChecked={initial?.published??false}/>إظهار البانر في الكتالوج</label><Message message={error} error/><button className="office-button" disabled={busy}>{busy?"جارٍ الحفظ…":"حفظ البانر"}</button></form>
}
