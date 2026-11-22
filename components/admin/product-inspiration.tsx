"use client";
import {StorePhoto} from "@/components/store-image";
import {useState,type FormEvent} from 'react';
import {office,type AdminProduct} from '@/lib/admin';
import {imageUrl,type Content} from '@/lib/store';
import {validImage} from '@/lib/catalog-experience';
import {Message,Upload,useOfficeData} from './shared';

export function ProductInspirationEditor({product}:{product:AdminProduct}){
 const {data,error,refreshing:loading}=useOfficeData<(Content&{published:boolean})[]>('content');
 const [picture,setPicture]=useState<string|null>(null);
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[failed,setFailed]=useState(false);
 const slug='inspiration-'+product.id,block=data?.find(row=>row.slug===slug);
 async function save(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy||loading||!data)return;
  const form=new FormData(event.currentTarget);
  const image=(picture??block?.imageUrl??'').trim();
  if(image&&!validImage(image)){setFailed(true);setMessage('استخدم رابط HTTPS أو ارفع صورة للعبوة.');return}
  setBusy(true);setMessage('');setFailed(false);
  try{await office('content/'+slug,{method:'PUT',data:{area:'product-inspiration',imageUrl:image.startsWith('/brand/')?new URL(image,window.location.origin).href:image||null,titleEn:String(form.get('nameEn')).trim(),titleAr:String(form.get('nameAr')).trim(),textEn:String(form.get('descriptionEn')).trim(),textAr:String(form.get('descriptionAr')).trim(),published:form.has('published'),sortOrder:0}});setMessage('تم حفظ مصدر الإلهام.');}
  catch(error){setFailed(true);setMessage((error as Error).message)}finally{setBusy(false)}
 }
 return <section className="office-form-section"><h3>مستوحى من</h3><p className="office-help">اختياري. يظهر في صفحة العطر بعد تفعيله، وباللغة التي يختارها العميل.</p><Message message={error} error/>
 {data&&<form key={block?.slug??'new'} className="office-form" onSubmit={save}><fieldset disabled={busy}><div className="office-fields">
  <label>العطر المستوحى منه بالعربي<input name="nameAr" defaultValue={block?.titleAr??''} maxLength={150} required placeholder="زيرجوف ناكسوس"/></label>
  <label>العطر المستوحى منه بالإنجليزي<input name="nameEn" defaultValue={block?.titleEn??''} maxLength={150} required dir="ltr" placeholder="Xerjoff Naxos"/></label>
  <label>وصف الإلهام بالعربي<textarea name="descriptionAr" defaultValue={block?.textAr??'اختيار من SIYAG مستوحى من الطابع العطري لهذا العطر.'} maxLength={1000} required/></label>
  <label>وصف الإلهام بالإنجليزي<textarea name="descriptionEn" defaultValue={block?.textEn??'A SIYAG fragrance inspired by the character of this scent.'} maxLength={1000} required dir="ltr"/></label>
 </div><label>صورة العطر الأصلي (اختياري)<input aria-label="صورة العطر الأصلي" dir="ltr" value={picture??block?.imageUrl??''} placeholder="https://…" onChange={event=>setPicture(event.target.value)}/></label><p className="office-help">يفضل صورة عبوة بخلفية شفافة. تظهر صغيرة بجوار اسم العطر مع ظل وميل خفيف.</p><Upload onUpload={setPicture}/>{validImage(picture??block?.imageUrl)&&<div className="office-images"><div><StorePhoto src={imageUrl(picture??block?.imageUrl??'')} alt="معاينة صورة العطر الأصلي"/></div></div>}<label className="office-check"><input type="checkbox" name="published" defaultChecked={block?.published??false}/> إظهار قسم مستوحى من</label><Message message={message} error={failed}/><button className="office-button" disabled={busy}>حفظ مصدر الإلهام</button></fieldset></form>}
 </section>;
}
