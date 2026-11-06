"use client";
import {useRef,useState,type FormEvent} from "react";
import {Plus} from "lucide-react";
import {office,type AdminCollection,type AdminProduct,type AdminVariant,type ProductSummary} from "@/lib/admin";
import {concentrations,families,formats,imageUrl,money,type Page} from "@/lib/store";
import {Message,Pagination,Panel,Upload,useOfficeData} from "./shared";

const blankProduct:AdminProduct={
  id:"",slug:"",nameEn:"",nameAr:"",descriptionEn:"",descriptionAr:"",brand:"SIYAG Perfumes",
  family:"woody",concentration:"eauDeParfum",audience:"unisex",published:false,featured:false,
  topNotes:[],heartNotes:[],baseNotes:[],images:[],variants:[],collections:[],
};
const blankCollection:AdminCollection={slug:"",nameAr:"",nameEn:"",published:false,sortOrder:0};
const blankVariant:AdminVariant={id:"",sku:"",sizeMl:50,format:"fullBottle",priceMinor:0,stock:0,active:true};
const slugPattern="[a-z0-9]+(?:-[a-z0-9]+)*";
const notes=(value:FormDataEntryValue|null)=>String(value??"").split(/[،,\n]+/).map(note=>note.trim()).filter(Boolean);
const variantOrder=(variants:AdminVariant[])=>[...variants].sort((a,b)=>a.sizeMl-b.sizeMl);

export function Products(){
  const [page,setPage]=useState(1);
  const [editing,setEditing]=useState<string|null>(null);
  const [revision,setRevision]=useState(0);
  const {data,error}=useOfficeData<Page<ProductSummary>>("products?pageSize=20&pageNumber="+page,revision);
  const {data:collections,error:collectionError}=useOfficeData<AdminCollection[]>("collections");
  const refresh=()=>setRevision(value=>value+1);
  return <>
    <div className="office-toolbar"><p>أضف العطر، ثم اضبط أحجامه وأسعاره ومخزونه قبل النشر.</p><button className="office-button" onClick={()=>setEditing("")}><Plus size={17}/> إضافة عطر</button></div>
    <Message message={error} error/>
    <div className="office-table-wrap"><table className="office-table"><thead><tr><th>العطر</th><th>المعرّف</th><th>الظهور</th><th>التعديل</th></tr></thead>
      <tbody>{data?.data.map(product=><tr key={product.id}><td><strong>{product.nameAr}</strong><small>{product.nameEn}</small></td><td dir="ltr">{product.slug}</td>
        <td><span className="office-badge" data-status={product.published?"confirmed":"pending"}>{product.published?"منشور":"مسودة"}</span>{product.featured&&<small>ضمن المختارات</small>}</td>
        <td><button className="office-text-button" onClick={()=>setEditing(product.id)}>إدارة العطر</button></td></tr>)}</tbody></table>
      {!data?.data.length&&!error&&<p className="office-empty">{data?"أضف أول عطر لبناء الكتالوج.":"جارٍ تحميل العطور…"}</p>}</div>
    <Pagination data={data} go={setPage}/>
    {editing!==null&&<Panel title={editing?"إدارة العطر":"إضافة عطر"} description="المحتوى، الصور، التصنيفات والأحجام" onClose={()=>setEditing(null)}>
      <Message message={collectionError} error/><ProductEditor id={editing} collections={collections} changed={refresh}/>
    </Panel>}
  </>;
}

function ProductEditor({id,collections,changed}:{id:string;collections?:AdminCollection[];changed:()=>void}){
  const {data,error}=useOfficeData<AdminProduct>(id?"products/"+id:null);
  if(id&&!data)return <><Message message={error} error/>{!error&&<p>جارٍ تحميل العطر…</p>}</>;
  return <ProductForm initial={data??blankProduct} collections={collections} changed={changed}/>;
}

function ProductForm({initial,collections,changed}:{initial:AdminProduct;collections?:AdminCollection[];changed:()=>void}){
  const [product,setProduct]=useState(initial);
  const [images,setImages]=useState(initial.images);
  const [url,setUrl]=useState("");
  const [feedback,setFeedback]=useState("");
  const [failed,setFailed]=useState(false);
  const [busy,setBusy]=useState(false);
  const [variant,setVariant]=useState<AdminVariant|null>(null);
  function addImage(value:string){
    const image=value.trim();
    if(!image)return;
    if(!/^https:\/\//i.test(image)&&!/^\/media\/[a-f0-9]{64}\.(?:jpg|png|webp)$/.test(image)){
      setFailed(true);setFeedback("استخدم رابط صورة HTTPS أو ارفع الصورة.");return;
    }
    setImages(items=>items.length<12&&!items.includes(image)?[...items,image]:items);
    setUrl("");
  }
  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(busy||!collections)return;
    const form=new FormData(event.currentTarget);
    const published=!!product.id&&form.has("published");
    if(published&&!product.variants.some(v=>v.active)){setFailed(true);setFeedback("فعّل مقاسًا واحدًا على الأقل قبل نشر العطر.");return}
    setBusy(true);setFeedback("");setFailed(false);
    const values={
      slug:String(form.get("slug")),nameAr:String(form.get("nameAr")),nameEn:String(form.get("nameEn")),
      descriptionAr:String(form.get("descriptionAr")),descriptionEn:String(form.get("descriptionEn")),
      family:String(form.get("family")),concentration:String(form.get("concentration")),audience:String(form.get("audience")),
      brand:product.brand,seo:product.seo,topNotes:notes(form.get("topNotes")),heartNotes:notes(form.get("heartNotes")),baseNotes:notes(form.get("baseNotes")),
      published,featured:form.has("featured"),images,collections:form.getAll("collections").map(String),
    };
    try{
      const result=await office<{id:string}|undefined>(product.id?"products/"+product.id:"products",{method:product.id?"PUT":"POST",data:values});
      setProduct(current=>({...current,...values,id:result?.id??current.id}));
      changed();setFeedback("تم حفظ العطر.");
    }catch(error){setFailed(true);setFeedback(error instanceof Error?error.message:"تعذّر حفظ العطر.")}
    finally{setBusy(false)}
  }
  return <div className="office-detail">
    <form className="office-form" onSubmit={save}>
      <div className="office-fields">
        <label>الاسم بالعربي<input name="nameAr" defaultValue={product.nameAr} required maxLength={150}/></label>
        <label>الاسم بالإنجليزي<input name="nameEn" defaultValue={product.nameEn} required maxLength={150} dir="ltr"/></label>
        <label>المعرّف في الرابط<input name="slug" defaultValue={product.slug} required pattern={slugPattern} maxLength={100} dir="ltr" placeholder="siyag-noir"/></label>
        <label>العائلة العطرية<select name="family" defaultValue={product.family}>{Object.entries(families).map(([value,label])=><option value={value} key={value}>{label[1]}</option>)}</select></label>
        <label>التركيز<select name="concentration" defaultValue={product.concentration}>{Object.entries(concentrations).map(([value,label])=><option value={value} key={value}>{label[1]}</option>)}</select></label>
        <label>الفئة<select name="audience" defaultValue={product.audience}><option value="unisex">للجميع</option><option value="men">رجالي</option><option value="women">نسائي</option></select></label>
        <label>الوصف بالعربي<textarea name="descriptionAr" defaultValue={product.descriptionAr} required maxLength={12000}/></label>
        <label>الوصف بالإنجليزي<textarea name="descriptionEn" defaultValue={product.descriptionEn} required maxLength={12000} dir="ltr"/></label>
        <label>النوتات الافتتاحية<input name="topNotes" defaultValue={product.topNotes.join("، ")} placeholder="افصل بين النوتات بفاصلة"/></label>
        <label>نوتات القلب<input name="heartNotes" defaultValue={product.heartNotes.join("، ")}/></label>
        <label>نوتات القاعدة<input name="baseNotes" defaultValue={product.baseNotes.join("، ")}/></label>
        <label>التصنيفات<select name="collections" multiple defaultValue={product.collections} disabled={!collections}>
          {(collections??[]).map(collection=><option value={collection.slug} key={collection.slug}>{collection.nameAr} {collection.published?"":"· مسودة"}</option>)}
        </select></label>
      </div>
      <section className="office-form-section"><h3>صور العطر</h3><p>الصورة الأولى هي الصورة الرئيسية، والثانية تظهر عند المرور على الكارت.</p>
        {images.length<12&&<><Upload onUpload={addImage}/><div className="office-image-link"><input value={url} onChange={event=>setUrl(event.target.value)} aria-label="رابط الصورة" placeholder="https://…" dir="ltr"/><button className="office-button secondary" type="button" onClick={()=>addImage(url)}>إضافة رابط</button></div></>}
        <div className="office-images">{images.map((image,index)=><div key={image}><img src={imageUrl(image)} alt={"صورة "+(index+1)}/><span>{index===0?"رئيسية":index===1?"صورة المرور":index+1}</span><button type="button" className="office-text-button" onClick={()=>setImages(items=>items.filter(item=>item!==image))}>إزالة</button></div>)}</div>
      </section>
      <div className="office-tools"><label className="office-check"><input name="featured" type="checkbox" defaultChecked={product.featured}/> يظهر ضمن المختارات</label>
        {!!product.id&&<label className="office-check"><input name="published" type="checkbox" defaultChecked={product.published}/> نشر في المتجر</label>}</div>
      <button className="office-button" disabled={busy||!collections}>{product.id?"حفظ العطر":"حفظ المسودة"}</button>
      <Message message={feedback} error={failed}/>
    </form>
    {!!product.id&&<section className="office-form-section">
      <div className="office-toolbar"><h3>الأحجام والأسعار والمخزون</h3><button type="button" className="office-button secondary" onClick={()=>setVariant(blankVariant)}><Plus size={16}/> إضافة حجم</button></div>
      <div className="office-table-wrap"><table className="office-table"><thead><tr><th>SKU</th><th>الحجم</th><th>السعر</th><th>المخزون</th><th></th></tr></thead><tbody>
        {variantOrder(product.variants).map(item=><tr key={item.id}><td dir="ltr">{item.sku}</td><td>{item.sizeMl} مل</td><td>{money(item.priceMinor,"ar")}</td><td>{item.stock}</td><td><button type="button" className="office-text-button" onClick={()=>setVariant(item)}>تعديل</button></td></tr>)}
      </tbody></table>{!product.variants.length&&<p className="office-empty">أضف حجمًا قبل نشر العطر.</p>}</div>
      {variant&&<VariantForm key={variant.id||"new"} productId={product.id} initial={variant} onCancel={()=>setVariant(null)} onSave={value=>{
        setProduct(current=>({...current,variants:[...current.variants.filter(item=>item.id!==value.id),value]}));
        setVariant(value);
      }}/>}
    </section>}
  </div>;
}

function VariantForm({productId,initial,onSave,onCancel}:{productId:string;initial:AdminVariant;onSave:(value:AdminVariant)=>void;onCancel:()=>void}){
  const [item,setItem]=useState(initial);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [failed,setFailed]=useState(false);
  const stockOperation=useRef<{signature:string;id:string}|null>(null);
  async function submit(event:FormEvent<HTMLFormElement>,stock=false){
    event.preventDefault();
    if(busy)return;
    const form=new FormData(event.currentTarget);
    setBusy(true);setMessage("");setFailed(false);
    try{
      let value:AdminVariant;
      if(stock){
        const delta=Number(form.get("delta"));
        const reason=String(form.get("reason")??"").trim();
        const signature=JSON.stringify([delta,reason]);
        if(stockOperation.current?.signature!==signature)stockOperation.current={signature,id:crypto.randomUUID()};
        value=await office<AdminVariant>("variants/"+item.id+"/stock",{method:"POST",data:{delta,reason,operationId:stockOperation.current.id}});
        stockOperation.current=null;
      }else{
        const priceMinor=Math.round(Number(form.get("price"))*100);
        const compareAtMinor=form.get("compare")?Math.round(Number(form.get("compare"))*100):null;
        value=await office<AdminVariant>("products/"+productId+"/variants"+(item.id?"/"+item.id:""),{method:item.id?"PUT":"POST",
          data:{sku:form.get("sku"),sizeMl:Number(form.get("size")),format:form.get("format"),priceMinor,compareAtMinor,active:form.has("active")}});
      }
      setItem(value);onSave(value);setMessage(stock?"تم تحديث المخزون.":"تم حفظ الحجم.");
    }catch(error){setFailed(true);setMessage(error instanceof Error?error.message:"تعذّر حفظ التعديل.")}
    finally{setBusy(false)}
  }
  return <div className="office-variant">
    <form className="office-form" onSubmit={event=>void submit(event)}>
      <div className="office-fields">
        <label>رمز SKU<input name="sku" defaultValue={item.sku} required maxLength={80} dir="ltr"/></label>
        <label>الحجم بالمل<input name="size" type="number" defaultValue={item.sizeMl} min={1} max={1000} required/></label>
        <label>نوع العبوة<select name="format" defaultValue={item.format}>{Object.entries(formats).map(([value,label])=><option value={value} key={value}>{label[1]}</option>)}</select></label>
        <label>السعر بالجنيه<input name="price" type="number" min=".01" max={10000} step=".01" defaultValue={item.priceMinor?item.priceMinor/100:""} required/></label>
        <label>السعر قبل الخصم<input name="compare" type="number" min=".01" max={10000} step=".01" defaultValue={item.compareAtMinor?item.compareAtMinor/100:""}/></label>
        <label className="office-check"><input name="active" type="checkbox" defaultChecked={item.active}/> الحجم مفعّل</label>
      </div><div className="office-tools"><button className="office-button" disabled={busy}>حفظ الحجم</button><button type="button" className="office-button secondary" onClick={onCancel}>إغلاق</button></div>
    </form>
    {!!item.id&&<form className="office-form office-form-section" onSubmit={event=>void submit(event,true)}>
      <h3>تسوية المخزون · المتاح {item.stock}</h3>
      <div className="office-fields"><label>التغيير<input type="number" name="delta" required min={-100000} max={100000} placeholder="+10 أو -2"/></label><label>سبب التسوية<input name="reason" required maxLength={200}/></label></div>
      <button className="office-button secondary" disabled={busy}>تطبيق التسوية</button>
    </form>}
    <Message message={message} error={failed}/>
  </div>;
}

export function Collections(){
  const [editing,setEditing]=useState<AdminCollection|null>(null);
  const [revision,setRevision]=useState(0);
  const {data,error}=useOfficeData<AdminCollection[]>("collections",revision);
  return <>
    <div className="office-toolbar"><p>نظّم المنتجات في تصنيفات قابلة للنشر على المتجر.</p><button className="office-button" onClick={()=>setEditing(blankCollection)}><Plus size={17}/> إضافة تصنيف</button></div>
    <Message message={error} error/>
    <div className="office-table-wrap"><table className="office-table"><thead><tr><th>التصنيف</th><th>الترتيب</th><th>الظهور</th><th>التعديل</th></tr></thead><tbody>
      {data?.map(collection=><tr key={collection.slug}><td><strong>{collection.nameAr}</strong><small>{collection.nameEn}</small></td><td>{collection.sortOrder}</td>
        <td><span className="office-badge" data-status={collection.published?"confirmed":"pending"}>{collection.published?"منشور":"مسودة"}</span></td>
        <td><button className="office-text-button" onClick={()=>setEditing(collection)}>تعديل</button></td></tr>)}
    </tbody></table>{!data?.length&&!error&&<p className="office-empty">{data?"يمكنك إنشاء أول تصنيف الآن.":"جارٍ تحميل التصنيفات…"}</p>}</div>
    {editing&&<Panel title={editing.slug?"تعديل التصنيف":"إضافة تصنيف"} description="الاسم والصورة وترتيب الظهور في المتجر" onClose={()=>setEditing(null)}>
      <CollectionForm initial={editing} existing={data??[]} saved={()=>{setRevision(value=>value+1);setEditing(null)}}/>
    </Panel>}
  </>;
}

function CollectionForm({initial,existing,saved}:{initial:AdminCollection;existing:AdminCollection[];saved:()=>void}){
  const [image,setImage]=useState(initial.imageUrl??"");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const form=new FormData(event.currentTarget);
    const slug=initial.slug||String(form.get("slug")).trim();
    if(!initial.slug&&existing.some(value=>value.slug===slug)){setError("هذا المعرّف مستخدم بالفعل.");return}
    setBusy(true);setError("");
    try{await office("collections/"+encodeURIComponent(slug),{method:"PUT",data:{nameAr:form.get("nameAr"),nameEn:form.get("nameEn"),imageUrl:image.trim()||null,published:form.has("published"),sortOrder:Number(form.get("sortOrder"))}});saved()}
    catch(error){setError(error instanceof Error?error.message:"تعذّر حفظ التصنيف.")}
    finally{setBusy(false)}
  }
  return <form className="office-form" onSubmit={submit}>
    <div className="office-fields">
      <label>الاسم بالعربي<input name="nameAr" defaultValue={initial.nameAr} required maxLength={100}/></label>
      <label>الاسم بالإنجليزي<input name="nameEn" defaultValue={initial.nameEn} required maxLength={100} dir="ltr"/></label>
      <label>المعرّف في الرابط<input name="slug" defaultValue={initial.slug} readOnly={!!initial.slug} required pattern={slugPattern} maxLength={100} dir="ltr"/></label>
      <label>ترتيب الظهور<input name="sortOrder" type="number" min={0} max={10000} defaultValue={initial.sortOrder} required/></label>
    </div>
    <label>رابط الصورة<input value={image} onChange={event=>setImage(event.target.value)} dir="ltr" placeholder="https://…"/></label>
    <Upload onUpload={setImage}/>
    {/^https:\/\//i.test(image)||image.startsWith("/media/")?<div className="office-images"><div><img src={imageUrl(image)} alt="صورة التصنيف"/></div></div>:null}
    <label className="office-check"><input name="published" type="checkbox" defaultChecked={initial.published}/> نشر في المتجر</label>
    <button className="office-button" disabled={busy}>حفظ التصنيف</button><Message message={error} error/>
  </form>;
}
