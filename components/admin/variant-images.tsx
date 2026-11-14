"use client";
import {useState,type FormEvent} from 'react';
import {office,type AdminProduct} from '@/lib/admin';
import {imageUrl,formats,type Content} from '@/lib/store';
import {parseVariantImages,validImage,type VariantImages} from '@/lib/catalog-experience';
import {useOfficeData,Message,Upload} from './shared';

export function VariantImagesEditor({product}:{product:AdminProduct}){
 const [revision,setRevision]=useState(0),[message,setMessage]=useState('');
 const {data,error}=useOfficeData<Content[]>('content',revision);
 const slug='variant-media-'+product.id;
 if(!data)return <Message message={error||'جارٍ تحميل صور الأحجام…'} error={!!error}/>;
 const row=data.find(item=>item.slug===slug);
 return <><Message message={message}/><VariantImagesForm key={slug+JSON.stringify(row)} product={product} initial={row?parseVariantImages([row]):{}} saved={()=>{setMessage("تم حفظ صور الأحجام.");setRevision(v=>v+1)}}/></>;
}
function VariantImagesForm({product,initial,saved}:{product:AdminProduct;initial:VariantImages;saved:()=>void}){
 const [images,setImages]=useState(initial),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[failed,setFailed]=useState(false);
 async function save(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;
  const values=Object.fromEntries(product.variants.map(v=>[v.id,(images[v.id]||'').trim()]).filter(([,url])=>!!url));
  if(Object.values(values).some(url=>!validImage(url))){setFailed(true);setMessage('استخدم صورة من المعرض، أو رابط HTTPS، أو ارفع صورة.');return}
  const text=JSON.stringify(values);
  if(text.length>1000){setFailed(true);setMessage('روابط الصور طويلة. ارفع الصور بدل الروابط الخارجية الطويلة.');return}
  setBusy(true);setMessage('');setFailed(false);
  try{await office('content/variant-media-'+product.id,{method:'PUT',data:{area:'variant-media',titleEn:('Size images · '+product.nameEn).slice(0,150),titleAr:('صور الأحجام · '+product.nameAr).slice(0,150),textEn:text,textAr:text,published:true,sortOrder:0}});setMessage('تم حفظ صور الأحجام.');saved()}
  catch(error){setFailed(true);setMessage((error as Error).message)}finally{setBusy(false)}
 }
 return <section className="office-form-section"><h3>صور العبوة حسب الحجم</h3><p className="office-help">اربط الصورة الصحيحة بكل حجم. تظهر في الكارت والعرض السريع وصفحة المنتج والحقيبة. لو لم تحدد صورة، تظل صورة المنتج الأساسية ظاهرة.</p>
 <form className="office-form" onSubmit={save}><fieldset disabled={busy}>
 {product.variants.map(variant=>{const label=`صورة حجم ${variant.sizeMl} مل · ${formats[variant.format][1]}`;return <div className="office-editor-section" key={variant.id}><h4>{variant.sizeMl} مل · {formats[variant.format][1]}</h4><div className="office-fields"><label>اختر من صور العطر<select aria-label={`اختيار ${label}`} value={product.images.includes(images[variant.id])?images[variant.id]:''} onChange={e=>setImages(v=>({...v,[variant.id]:e.target.value}))}><option value="">صورة مخصصة أو الصورة الأساسية</option>{product.images.map((src,i)=><option value={src} key={src}>صورة {i+1}</option>)}</select></label><label>{label}<input dir="ltr" value={images[variant.id]||''} placeholder="https://…" onChange={e=>setImages(v=>({...v,[variant.id]:e.target.value}))}/></label></div><Upload onUpload={url=>setImages(v=>({...v,[variant.id]:url}))}/>{validImage(images[variant.id])&&<div className="office-images"><div><img src={imageUrl(images[variant.id])} alt={label}/></div></div>}</div>})}
 <Message message={message} error={failed}/><button className="office-button" disabled={busy}>حفظ صور الأحجام</button></fieldset></form></section>;
}
