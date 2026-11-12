"use client";
import {useEffect,useRef,useState,type FormEvent} from "react";
import {Plus,Search,Boxes,ArrowUp,ArrowDown,ExternalLink,RefreshCw,SquarePen,Eye,EyeOff} from "lucide-react";
import {office,type AdminCollection,type AdminProduct,type AdminVariant,type ProductSummary} from "@/lib/admin";
import {concentrations,families,formats,imageUrl,money,type Page} from "@/lib/store";
import {RowAction,TableFrame,Message,Pagination,Panel,Upload,useOfficeData} from "./shared";

import {productActions,collectionActions} from "./bulk-actions";

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

export function Products({initialEditing=null}:{initialEditing?:string|null}={}){
  const [page,setPage]=useState(1),[query,setQuery]=useState(""),[filter,setFilter]=useState("all");
  const [editing,setEditing]=useState<string|null>(initialEditing);
  const [revision,setRevision]=useState(0);
  const [products,setProducts]=useState<ProductSummary[]>();
  const [details,setDetails]=useState<Record<string,AdminProduct>>({});
  const [detailError,setDetailError]=useState("");
  const [error,setError]=useState("");
  const {data:collections,error:collectionError}=useOfficeData<AdminCollection[]>("collections");
  useEffect(()=>{
    const controller=new AbortController();setError("");
    async function load(){
      try{
        const first=await office<Page<ProductSummary>>("products?pageSize=100&pageNumber=1",{signal:controller.signal});
        const rows=[...first.data];
        for(let start=2;start<=first.totalPages;start+=4){
          const pages=await Promise.all(Array.from({length:Math.min(4,first.totalPages-start+1)},(_,i)=>office<Page<ProductSummary>>(`products?pageSize=100&pageNumber=${start+i}`,{signal:controller.signal})));
          for(const part of pages)rows.push(...part.data);
        }
        if(!controller.signal.aborted)setProducts(rows);
      }catch(error){if(!controller.signal.aborted)setError(error instanceof Error?error.message:"تعذّر تحميل المنتجات.")}
    }
    void load();return()=>controller.abort();
  },[revision]);
  const term=query.trim().toLocaleLowerCase();
  const filtered=products?.filter(p=>(filter==="all"||(filter==="published"?p.published:!p.published))&&(!term||[p.nameAr,p.nameEn,p.slug].some(value=>value.toLocaleLowerCase().includes(term))));
  const currentPage=Math.min(page,Math.max(1,Math.ceil((filtered?.length??0)/20)));
  const rows=filtered?.slice((currentPage-1)*20,currentPage*20);
  const visibleIds=JSON.stringify(rows?.map(row=>row.id)??[]);
  useEffect(()=>{
    const controller=new AbortController();setDetailError("");
    async function loadDetails(){
      const ids=JSON.parse(visibleIds) as string[];
      for(let start=0;start<ids.length;start+=4){
        const results=await Promise.allSettled(ids.slice(start,start+4).map(id=>office<AdminProduct>("products/"+id,{signal:controller.signal})));
        if(controller.signal.aborted)return;
        const loaded=results.flatMap(result=>result.status==="fulfilled"?[result.value]:[]);
        setDetails(current=>({...current,...Object.fromEntries(loaded.map(product=>[product.id,product]))}));
        if(results.some(result=>result.status==="rejected"))setDetailError("تعذّر تحميل بعض صور وتفاصيل المنتجات. اضغط تحديث لإعادة المحاولة.");
      }
    }
    void loadDetails();return()=>controller.abort();
  },[visibleIds,revision]);
  return <>
    <div className="office-toolbar"><p>{products?`${products.length} منتج في الكتالوج`:"جارٍ تحميل الكتالوج…"}</p><div className="office-tools"><button className="office-icon" aria-label="تحديث المنتجات" onClick={()=>setRevision(v=>v+1)}><RefreshCw size={17}/></button><button className="office-button" onClick={()=>setEditing("")}><Plus size={17}/> إضافة عطر</button></div></div>
    <div className="office-list-controls"><div className="office-tabs" role="group" aria-label="حالة المنتج">{[["all","الكل"],["published","منشور"],["draft","مسودة"]].map(([value,label])=><button key={value} aria-pressed={filter===value} onClick={()=>{setFilter(value);setPage(1)}}>{label}</button>)}</div><label className="office-search"><Search size={17}/><input aria-label="البحث في المنتجات" placeholder="اسم المنتج أو المعرّف…" value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}}/></label></div>
    <Message message={error} error/>
    <Message message={detailError} error/>
    <TableFrame label="قائمة المنتجات" actions total={filtered?.length} offset={(currentPage-1)*20} scope={`${query}|${filter}|${currentPage}`} bulkActions={productActions()} onBulkComplete={()=>setRevision(v=>v+1)}><table className="office-table"><thead><tr><th>المنتج</th><th>الحالة</th><th>السعر</th><th>المخزون والأحجام</th><th>الأقسام</th><th>الإجراءات</th></tr></thead>
      <tbody>{rows?.map(product=>{const detail=details[product.id],prices=detail?.variants.map(v=>v.priceMinor)??[],stock=detail?.variants.reduce((sum,v)=>sum+v.stock,0);return <tr key={product.id}><td><button className="office-product-name" onClick={()=>setEditing(product.id)}><ProductThumb url={detail?.images[0]} name={product.nameAr}/><span><strong>{product.nameAr}</strong><small>{product.nameEn}</small><small dir="ltr">{product.slug}</small></span></button></td>
        <td><span className="office-badge" data-status={product.published?"confirmed":"neutral"}>{product.published?"منشور":"مسودة"}</span>{product.featured&&<small>ضمن المختارات</small>}</td>
        <td>{detail?prices.length?<>{money(Math.min(...prices),"ar")}{Math.max(...prices)!==Math.min(...prices)&&<small>حتى {money(Math.max(...prices),"ar")}</small>}</>:"بدون أحجام":"—"}</td>
        <td>{detail?<><span className="office-badge" data-status={stock===0?"cancelled":(stock??0)<=5?"pending":"confirmed"}>{stock} قطعة</span><small>{detail.variants.length} حجم · {detail.variants.filter(v=>v.active).length} مفعّل</small></>:"—"}</td>
        <td className="office-wrap-cell">{detail?(detail.collections.map(slug=>collections?.find(c=>c.slug===slug)?.nameAr??slug).join("، ")||"غير مصنّف"):"—"}</td>
        <td><div className="office-row-actions"><RowAction label={`تعديل ${product.nameAr}`} icon={SquarePen} onClick={()=>setEditing(product.id)}/>{product.published&&<RowAction label={`معاينة ${product.nameAr}`} icon={ExternalLink} href={"/products/"+product.slug}/>}</div></td></tr>})}</tbody></table>
      {!rows?.length&&!error&&<div className="office-empty"><Boxes size={28}/><strong>{!products?"جارٍ تحميل العطور…":products.length?"لا توجد منتجات مطابقة":"ابدأ بأول عطر في مجموعتك"}</strong><p>{products?.length?"جرّب اسمًا آخر أو غيّر حالة العرض.":"احفظ المنتج كمسودة، ثم أضف الأحجام والمخزون قبل النشر."}</p></div>}</TableFrame>
    {filtered&&<Pagination data={{data:rows??[],totalCount:filtered.length,totalPages:Math.ceil(filtered.length/20),pageNumber:currentPage,pageSize:20}} go={setPage}/>}
    {editing!==null&&<Panel title={editing?"إدارة العطر":"إضافة عطر"} description="البيانات، الصور، الأحجام والأسعار والمخزون" onClose={()=>setEditing(null)}><Message message={collectionError} error/><ProductEditor id={editing} collections={collections} changed={()=>setRevision(value=>value+1)}/></Panel>}
  </>;
}

function ProductEditor({id,collections,changed}:{id:string;collections?:AdminCollection[];changed:()=>void}){
  const {data,error}=useOfficeData<AdminProduct>(id?"products/"+id:null);
  if(id&&!data)return <><Message message={error} error/>{!error&&<p>جارٍ تحميل العطر…</p>}</>;
  return <ProductForm initial={data??blankProduct} collections={collections} changed={changed}/>;
}

function ProductForm({initial,collections,changed}:{initial:AdminProduct;collections?:AdminCollection[];changed:()=>void}){
  const [product,setProduct]=useState(initial);
  const [slug,setSlug]=useState(initial.slug);
  const [customSlug,setCustomSlug]=useState(!!initial.slug);
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
    <div className="office-product-progress"><strong>{product.id?"بيانات المنتج محفوظة":"١. ابدأ ببيانات المنتج"}</strong><span>{product.id?product.variants.length?"راجع المخزون ثم فعّل النشر واحفظ التغييرات.":"الخطوة التالية: أضف حجمًا وسعرًا ومخزونًا أسفل البيانات.":"احفظ المسودة أولًا لإتاحة الأحجام والأسعار والمخزون."}</span></div>
    <form className="office-form" onSubmit={save}>
      <section className="office-editor-section"><h3>بيانات العطر</h3>
      <div className="office-fields">
        <label>الاسم بالعربي<input name="nameAr" defaultValue={product.nameAr} required maxLength={150}/></label>
        <label>الاسم بالإنجليزي<input name="nameEn" defaultValue={product.nameEn} onChange={e=>{if(!customSlug)setSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""))}} required maxLength={150} dir="ltr"/></label>
        <label>المعرّف في الرابط<input name="slug" value={slug} onChange={e=>{setSlug(e.target.value);setCustomSlug(true)}} required pattern={slugPattern} maxLength={100} dir="ltr" placeholder="siyag-noir"/></label>
        <label>العائلة العطرية<select name="family" defaultValue={product.family}>{Object.entries(families).map(([value,label])=><option value={value} key={value}>{label[1]}</option>)}</select></label>
        <label>التركيز<select name="concentration" defaultValue={product.concentration}>{Object.entries(concentrations).map(([value,label])=><option value={value} key={value}>{label[1]}</option>)}</select></label>
        <label>الفئة<select name="audience" defaultValue={product.audience}><option value="unisex">للجميع</option><option value="men">رجالي</option><option value="women">نسائي</option></select></label>
        <label>الوصف بالعربي<textarea name="descriptionAr" defaultValue={product.descriptionAr} required maxLength={12000}/></label>
        <label>الوصف بالإنجليزي<textarea name="descriptionEn" defaultValue={product.descriptionEn} required maxLength={12000} dir="ltr"/></label>
        <label>النوتات الافتتاحية<input name="topNotes" defaultValue={product.topNotes.join("، ")} placeholder="افصل بين النوتات بفاصلة"/></label>
        <label>نوتات القلب<input name="heartNotes" defaultValue={product.heartNotes.join("، ")}/></label>
        <label>نوتات القاعدة<input name="baseNotes" defaultValue={product.baseNotes.join("، ")}/></label>
        <fieldset className="office-collection-picker office-wide"><legend>أقسام المنتج</legend><p className="office-help">اختر الأقسام التي ينتمي إليها العطر.</p><div className="office-tools">{collections?.length?collections.map(collection=><label className="office-check" key={collection.slug}><input type="checkbox" name="collections" value={collection.slug} defaultChecked={product.collections.includes(collection.slug)}/>{collection.nameAr}{!collection.published&&<small>مسودة</small>}</label>):<p className="office-help">{collections?"أنشئ أقسام المتجر من صفحة الأقسام، ثم اربط المنتج بها.":"جارٍ تحميل الأقسام…"}</p>}</div></fieldset>
      </div>
      </section><section className="office-editor-section"><h3>صور العطر</h3><p>الصورة الأولى هي الصورة الرئيسية، والثانية تظهر عند المرور على الكارت.</p>
        {images.length<12&&<><Upload onUpload={addImage}/><div className="office-image-link"><input value={url} onChange={event=>setUrl(event.target.value)} aria-label="رابط الصورة" placeholder="https://…" dir="ltr"/><button className="office-button secondary" type="button" onClick={()=>addImage(url)}>إضافة رابط</button></div></>}
        <div className="office-images">{images.map((image,index)=><div key={image}><img src={imageUrl(image)} alt={"صورة "+(index+1)}/><span>{index===0?"رئيسية":index===1?"صورة المرور":index+1}</span><div className="office-image-actions"><button type="button" className="office-icon" aria-label={"تقديم صورة "+(index+1)} disabled={index===0} onClick={()=>setImages(items=>{const next=[...items];[next[index-1],next[index]]=[next[index],next[index-1]];return next})}><ArrowUp size={14}/></button><button type="button" className="office-icon" aria-label={"تأخير صورة "+(index+1)} disabled={index===images.length-1} onClick={()=>setImages(items=>{const next=[...items];[next[index+1],next[index]]=[next[index],next[index+1]];return next})}><ArrowDown size={14}/></button></div><button type="button" className="office-text-button" onClick={()=>setImages(items=>items.filter(item=>item!==image))}>إزالة</button></div>)}</div>
      </section>
      <section className="office-editor-section"><h3>الظهور في المتجر</h3><div className="office-tools"><label className="office-check"><input name="featured" type="checkbox" defaultChecked={product.featured}/> يظهر ضمن المختارات</label>
        {!!product.id&&<label className="office-check"><input name="published" type="checkbox" defaultChecked={product.published}/> نشر في المتجر</label>}</div>
      {!!product.id&&product.published&&<a className="office-text-button" href={"/products/"+product.slug} target="_blank" rel="noreferrer">فتح المنتج في المتجر <ExternalLink size={14}/></a>}
      </section><div className="office-save-bar"><Message message={feedback} error={failed}/><button className="office-button" disabled={busy||!collections}>{busy?"جارٍ الحفظ…":product.id?"حفظ التغييرات":"حفظ المسودة"}</button></div>
    </form>
    {!!product.id&&<section className="office-form-section">
      <div className="office-toolbar"><h3>الأحجام والأسعار والمخزون</h3><button type="button" className="office-button secondary" onClick={()=>setVariant(blankVariant)}><Plus size={16}/> إضافة حجم</button></div>
      <TableFrame label="الأحجام والأسعار" actions compact total={product.variants.length} bulkActions={[true,false].map(active=>({id:active?"activate":"deactivate",label:active?"تفعيل الأحجام":"إيقاف الأحجام",icon:active?Eye:EyeOff,run:async(id:string)=>{const current=await office<AdminProduct>("products/"+product.id);const item=current.variants.find(v=>v.id===id);if(!item)throw new Error("الحجم لم يعد متاحًا");const updated=await office<AdminVariant>(`products/${product.id}/variants/${id}`,{method:"PUT",data:{...item,active}});setProduct(value=>({...value,variants:value.variants.map(v=>v.id===id?updated:v)}))}}))} onBulkComplete={changed}><table className="office-table"><thead><tr><th>SKU</th><th>الحجم</th><th>السعر</th><th>المخزون</th><th>الحالة</th><th>الإجراء</th></tr></thead><tbody>
        {variantOrder(product.variants).map(item=><tr key={item.id}><td dir="ltr">{item.sku}</td><td>{item.sizeMl} مل</td><td>{money(item.priceMinor,"ar")}</td><td>{item.stock}</td><td>{item.active?"مفعّل":"متوقف"}</td><td><RowAction label={`تعديل الحجم ${item.sizeMl} مل`} icon={SquarePen} onClick={()=>setVariant(item)}/></td></tr>)}
      </tbody></table>{!product.variants.length&&<p className="office-empty">أضف حجمًا قبل نشر العطر.</p>}</TableFrame>
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
      <h3>تسوية المخزون · المتاح {item.stock}</h3><p className="office-help">اكتب كمية موجبة للإضافة أو سالبة للخصم، وليس إجمالي المخزون الجديد.</p>
      <div className="office-fields"><label>التغيير<input type="number" name="delta" required min={-100000} max={100000} placeholder="+10 أو -2"/></label><label>سبب التسوية<input name="reason" required maxLength={200}/></label></div>
      <button className="office-button secondary" disabled={busy}>تطبيق التسوية</button>
    </form>}
    <Message message={message} error={failed}/>
  </div>;
}

export function Collections(){
  const [editing,setEditing]=useState<AdminCollection|null>(null);
  const [query,setQuery]=useState("");
  const [revision,setRevision]=useState(0);
  const {data,error}=useOfficeData<AdminCollection[]>("collections",revision);
  return <>
    <div className="office-toolbar"><p>نظّم المنتجات في تصنيفات قابلة للنشر على المتجر.</p><button className="office-button" onClick={()=>setEditing(blankCollection)}><Plus size={17}/> إضافة تصنيف</button></div>
    <label className="office-search office-collection-search"><Search size={17}/><input aria-label="البحث في الأقسام" placeholder="ابحث عن قسم…" value={query} onChange={e=>setQuery(e.target.value)}/></label><Message message={error} error/>
    <TableFrame label="أقسام المتجر" actions total={data?.length} scope={query} bulkActions={collectionActions()} onBulkComplete={()=>setRevision(v=>v+1)}><table className="office-table"><thead><tr><th>التصنيف</th><th>الرابط</th><th>الترتيب</th><th>الظهور</th><th>التعديل</th></tr></thead><tbody>
      {data?.filter(c=>[c.nameAr,c.nameEn,c.slug].some(v=>v.toLowerCase().includes(query.trim().toLowerCase()))).sort((a,b)=>a.sortOrder-b.sortOrder).map(collection=><tr key={collection.slug}><td><strong>{collection.nameAr}</strong><small>{collection.nameEn}</small></td><td dir="ltr">{collection.slug}</td><td>{collection.sortOrder}</td>
        <td><span className="office-badge" data-status={collection.published?"confirmed":"pending"}>{collection.published?"منشور":"مسودة"}</span></td>
        <td><RowAction label={`تعديل ${collection.nameAr}`} icon={SquarePen} onClick={()=>setEditing(collection)}/></td></tr>)}
    </tbody></table>{!data?.length&&!error&&<p className="office-empty">{data?"يمكنك إنشاء أول تصنيف الآن.":"جارٍ تحميل التصنيفات…"}</p>}</TableFrame>
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
      <label>ترتيب الظهور <small>الأرقام الأصغر تظهر أولًا</small><input name="sortOrder" type="number" min={0} max={10000} defaultValue={initial.sortOrder} required/></label>
    </div>
    <label>رابط الصورة<input value={image} onChange={event=>setImage(event.target.value)} dir="ltr" placeholder="https://…"/></label>
    <Upload onUpload={setImage}/>
    {/^https:\/\//i.test(image)||image.startsWith("/media/")?<div className="office-images"><div><img src={imageUrl(image)} alt="صورة التصنيف"/></div></div>:null}
    <label className="office-check"><input name="published" type="checkbox" defaultChecked={initial.published}/> نشر في المتجر</label>
    <button className="office-button" disabled={busy}>{busy?"جارٍ الحفظ…":"حفظ التصنيف"}</button><Message message={error} error/>
  </form>;
}

function ProductThumb({url,name}:{url?:string;name:string}){
 const [failed,setFailed]=useState(false);
 return <span className="office-product-thumb">{url&&!failed?<img src={imageUrl(url)} alt={name} width={56} height={64} loading="lazy" onError={()=>setFailed(true)}/>:<Boxes size={22}/>}</span>;
}
