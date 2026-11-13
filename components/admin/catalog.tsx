"use client";
import {useCallback,useEffect,useRef,useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {Plus,Search,Boxes,ArrowUp,ArrowDown,ExternalLink,RefreshCw,SquarePen,Eye,EyeOff} from "lucide-react";
import {office,type AdminCollection,type AdminProduct,type AdminVariant,type ProductSummary} from "@/lib/admin";
import {concentrations,families,formats,imageUrl,money,type Page} from "@/lib/store";
import {useEditorRoute,RowAction,TableFrame,Message,Pagination,Panel,Upload,useOfficeData} from "./shared";

import {useOfficePathname} from "./office-route";
import {loadCatalogIndex,loadCatalogDetails} from "@/lib/admin-queries";
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

export function Products(){
  const [page,setPage]=useState(1),[pageSize,setPageSize]=useState(20),[query,setQuery]=useState(""),[filter,setFilter]=useState("all");
  const {editor:editing,open:setEditing,close:closeEditor}=useEditorRoute("products");
  const [revision,setRevision]=useState(0);
  const {data:products,error}=useOfficeData<ProductSummary[]>("catalog/index",revision,60000,loadCatalogIndex);
  const {data:collections,error:collectionError}=useOfficeData<AdminCollection[]>("collections");
  const term=query.trim().toLocaleLowerCase();
  const filtered=products?.filter(p=>(filter==="all"||(filter==="published"?p.published:!p.published))&&(!term||[p.nameAr,p.nameEn,p.slug].some(value=>value.toLocaleLowerCase().includes(term))));
  const currentPage=Math.min(page,Math.max(1,Math.ceil((filtered?.length??0)/pageSize)));
  const rows=filtered?.slice((currentPage-1)*pageSize,currentPage*pageSize);
  const visibleIds=JSON.stringify(editing===null?rows?.map(row=>row.id)??[]:[]);
  const detailsLoader=useCallback((signal:AbortSignal)=>loadCatalogDetails(JSON.parse(visibleIds),signal),[visibleIds]);
  const detailResource=useOfficeData<Awaited<ReturnType<typeof loadCatalogDetails>>>(editing===null&&rows?.length?"catalog-details/"+visibleIds:null,revision,15000,detailsLoader);
  const details=detailResource.data?.products??{};
  const detailError=detailResource.error||(detailResource.data?.failed?"تعذّر التحقق من بعض تفاصيل المنتجات. أعد التحديث قبل اتخاذ إجراء.":"");
  if(editing!==null)return <Panel title={editing?"إدارة العطر":"إضافة عطر"} description="البيانات، الصور، الأحجام والأسعار والمخزون" onClose={closeEditor}><Message message={collectionError} error/><ProductEditor id={editing} collections={collections} changed={()=>setRevision(value=>value+1)}/></Panel>;
  return <>
    <div className="office-toolbar"><p>{products?`${products.length} منتج في الكتالوج`:"جارٍ تحميل الكتالوج…"}</p><div className="office-tools"><button className="office-icon" aria-label="تحديث المنتجات" onClick={()=>setRevision(v=>v+1)}><RefreshCw size={17}/></button><button className="office-button" onClick={()=>setEditing("")}><Plus size={17}/> إضافة عطر</button></div></div>
    <div className="office-list-controls"><div className="office-tabs" role="group" aria-label="حالة المنتج">{[["all","الكل"],["published","منشور"],["draft","مسودة"]].map(([value,label])=><button key={value} aria-pressed={filter===value} onClick={()=>{setFilter(value);setPage(1)}}>{label}</button>)}</div><label className="office-search"><Search size={17}/><input aria-label="البحث في المنتجات" placeholder="اسم المنتج أو المعرّف…" value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}}/></label></div>
    <Message message={error} error/>
    <Message message={detailError} error/>
    <TableFrame label="قائمة المنتجات" actions total={filtered?.length} offset={(currentPage-1)*pageSize} scope={`${query}|${filter}|${currentPage}`} bulkActions={productActions()} onBulkComplete={()=>setRevision(v=>v+1)}><table className="office-table"><thead><tr><th>المنتج</th><th>الحالة</th><th>السعر</th><th>المخزون والأحجام</th><th>الأقسام</th><th>الإجراءات</th></tr></thead>
      <tbody>{rows?.map(product=>{const detail=details[product.id],prices=detail?.variants.map(v=>v.priceMinor)??[],stock=detail?.variants.reduce((sum,v)=>sum+v.stock,0);return <tr key={product.id}><td><button className="office-product-name" onClick={()=>setEditing(product.id)}><ProductThumb url={detail?.images[0]} name={product.nameAr}/><span><strong>{product.nameAr}</strong><small>{product.nameEn}</small></span></button></td>
        <td><span className="office-badge" data-status={product.published?"confirmed":"neutral"}>{product.published?"منشور":"مسودة"}</span>{product.featured&&<small>ضمن المختارات</small>}</td>
        <td data-sort-value={prices.length?Math.min(...prices):undefined}>{detail?prices.length?<>{money(Math.min(...prices),"ar")}{Math.max(...prices)!==Math.min(...prices)&&<small>حتى {money(Math.max(...prices),"ar")}</small>}</>:"بدون أحجام":"—"}</td>
        <td data-sort-value={stock}>{detail?<><span className="office-badge" data-status={stock===0?"cancelled":(stock??0)<=5?"pending":"confirmed"}>{stock} قطعة</span><small>{detail.variants.length} حجم · {detail.variants.filter(v=>v.active).length} مفعّل</small></>:"—"}</td>
        <td className="office-wrap-cell">{detail?(detail.collections.map(slug=>collections?.find(c=>c.slug===slug)?.nameAr??slug).join("، ")||"غير مصنّف"):"—"}</td>
        <td><div className="office-row-actions"><RowAction label={`تعديل ${product.nameAr}`} icon={SquarePen} onClick={()=>setEditing(product.id)}/>{product.published&&<RowAction label={`معاينة ${product.nameAr}`} icon={ExternalLink} href={"/products/"+product.slug}/>}</div></td></tr>})}</tbody></table>
      {!rows?.length&&!error&&<div className="office-empty"><Boxes size={28}/><strong>{!products?"جارٍ تحميل العطور…":products.length?"لا توجد منتجات مطابقة":"ابدأ بأول عطر في مجموعتك"}</strong><p>{products?.length?"جرّب اسمًا آخر أو غيّر حالة العرض.":"احفظ المنتج كمسودة، ثم أضف الأحجام والمخزون قبل النشر."}</p></div>}</TableFrame>
    {filtered&&<Pagination data={{data:rows??[],totalCount:filtered.length,totalPages:Math.ceil(filtered.length/pageSize),pageNumber:currentPage,pageSize}} go={setPage} changeSize={setPageSize}/>}

  </>;
}

function ProductEditor({id,collections,changed}:{id:string;collections?:AdminCollection[];changed:()=>void}){
  const {data,error}=useOfficeData<AdminProduct>(id?"products/"+id:null);
  if(id&&!data)return <><Message message={error} error/>{!error&&<p>جارٍ تحميل العطر…</p>}</>;
  return <ProductForm initial={data??blankProduct} collections={collections} changed={changed}/>;
}

function ProductForm({initial,collections,changed}:{initial:AdminProduct;collections?:AdminCollection[];changed:()=>void}){
  const router=useRouter(),pathname=useOfficePathname();
  const [drafts,setDrafts]=useState([{key:"first",sku:"",sizeMl:50,format:"fullBottle",price:"",compareAt:"",stock:0,active:true}]);
  const [product,setProduct]=useState(initial);
  useEffect(()=>{setProduct(current=>({...current,variants:initial.variants}))},[initial.variants]);
  const [slug,setSlug]=useState(initial.slug);
  const [customSlug,setCustomSlug]=useState(!!initial.slug);
  const [images,setImages]=useState(initial.images);
  const [url,setUrl]=useState("");
  const [feedback,setFeedback]=useState("");
  const [failed,setFailed]=useState(false);
  const [busy,setBusy]=useState(false);
  const variantSegment=pathname.split("/")[5];
  const variant=variantSegment==="new"?blankVariant:product.variants.find(item=>item.id===variantSegment);
  const setVariant=(item:AdminVariant|null)=>router.push(`/admin/products/${product.id}`+(item?`/variants/${item.id||"new"}`:""));
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
    const published=form.has("published");
    if(published&&!(product.id?product.variants:drafts).some(v=>v.active)){setFailed(true);setFeedback("فعّل مقاسًا واحدًا على الأقل قبل نشر العطر.");return}
    setBusy(true);setFeedback("");setFailed(false);
    const values={
      slug:String(form.get("slug")),nameAr:String(form.get("nameAr")),nameEn:String(form.get("nameEn")),
      descriptionAr:String(form.get("descriptionAr")),descriptionEn:String(form.get("descriptionEn")),
      family:String(form.get("family")),concentration:String(form.get("concentration")),audience:String(form.get("audience")),
      brand:product.brand,seo:product.seo,topNotes:notes(form.get("topNotes")),heartNotes:notes(form.get("heartNotes")),baseNotes:notes(form.get("baseNotes")),
      published,featured:form.has("featured"),images,collections:form.getAll("collections").map(String),
      ...(!product.id?{variants:drafts.map(item=>({sku:item.sku.trim()||`${slug}-${item.sizeMl}-${item.format}`.toUpperCase(),sizeMl:item.sizeMl,format:item.format,priceMinor:Math.round(Number(item.price)*100),compareAtMinor:item.compareAt?Math.round(Number(item.compareAt)*100):null,stock:item.stock,active:item.active}))}:{}),
    };
    try{
      const result=await office<{id:string}|undefined>(product.id?"products/"+product.id:"products",{method:product.id?"PUT":"POST",data:values});
      setProduct(current=>({...current,...values,variants:current.variants,id:result?.id??current.id}));
      changed();setFeedback("تم حفظ العطر.");
      if(!product.id&&result?.id)router.replace("/admin/products/"+result.id);
    }catch(error){setFailed(true);setFeedback(error instanceof Error?error.message:"تعذّر حفظ العطر.")}
    finally{setBusy(false)}
  }
  if(pathname.split("/")[4]==="variants")return variant?<section className="office-detail"><header><h3>{variant.id?`تعديل صنف ${variant.sku}`:"إضافة صنف للمنتج"}</h3><p className="office-help">{product.nameAr} · سعر ومخزون مستقل لكل صنف.</p></header><VariantForm key={variant.id||"new"} productId={product.id} initial={variant} onCancel={()=>setVariant(null)} onSave={value=>{setProduct(current=>({...current,variants:[...current.variants.filter(item=>item.id!==value.id),value]}));if(!variant.id)router.replace(`/admin/products/${product.id}/variants/${value.id}`);changed()}}/></section>:<Message message="الصنف غير موجود." error/>;
  return <div className="office-detail">
    {!product.id&&<p className="office-help">المنتج وأصنافه يُحفظوا معًا. لكل صنف سعر ومخزون مستقل.</p>}
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
      {!product.id&&<section className="office-editor-section"><div className="office-toolbar"><div><h3>الأصناف والأحجام</h3><p className="office-help">لكل حجم رمز وسعر ومخزون مستقل. كل البيانات تُحفظ مع المنتج في عملية واحدة.</p></div><button type="button" className="office-button secondary" onClick={()=>setDrafts(items=>[...items,{key:crypto.randomUUID(),sku:"",sizeMl:100,format:"fullBottle",price:"",compareAt:"",stock:0,active:true}])}><Plus size={16}/> إضافة صنف</button></div>{drafts.map((item,index)=>{const update=(patch:Partial<typeof item>)=>setDrafts(items=>items.map(current=>current.key===item.key?{...current,...patch}:current));return <fieldset className="office-draft-variant" key={item.key}><legend>الصنف {index+1}</legend><div className="office-fields"><label>الحجم بالمل<input type="number" min={1} max={1000} required value={item.sizeMl} onChange={e=>update({sizeMl:Number(e.target.value)})}/></label><label>نوع العبوة<select value={item.format} onChange={e=>update({format:e.target.value})}>{Object.entries(formats).map(([value,label])=><option key={value} value={value}>{label[1]}</option>)}</select></label><label>السعر بالجنيه<input type="number" min=".01" max={1000000} step=".01" required value={item.price} onChange={e=>update({price:e.target.value})}/></label><label>السعر قبل الخصم (اختياري)<input type="number" min={item.price?Number(item.price)+.01:.01} max={1000000} step=".01" value={item.compareAt} onChange={e=>update({compareAt:e.target.value})}/></label><label>المخزون الافتتاحي<input type="number" min={0} max={100000} required value={item.stock} onChange={e=>update({stock:Number(e.target.value)})}/></label><label>رمز الصنف SKU<input dir="ltr" maxLength={80} value={item.sku} placeholder={`${slug||"SIYAG"}-${item.sizeMl}-${item.format}`.toUpperCase()} onChange={e=>update({sku:e.target.value})}/><small>يُنشأ تلقائيًا إذا تركته فارغًا.</small></label></div><div className="office-toolbar"><label className="office-check"><input type="checkbox" checked={item.active} onChange={e=>update({active:e.target.checked})}/> الصنف مفعّل</label><button type="button" className="office-text-button" disabled={drafts.length===1} onClick={()=>setDrafts(items=>items.filter(current=>current.key!==item.key))}>إزالة الصنف</button></div></fieldset>})}</section>}
      <section className="office-editor-section"><h3>الظهور في المتجر</h3><div className="office-tools"><label className="office-check"><input name="featured" type="checkbox" defaultChecked={product.featured}/> يظهر ضمن المختارات</label>
        <label className="office-check"><input name="published" type="checkbox" defaultChecked={product.published}/> نشر في المتجر</label></div>
      {!!product.id&&product.published&&<a className="office-text-button" href={"/products/"+product.slug} target="_blank" rel="noreferrer">فتح المنتج في المتجر <ExternalLink size={14}/></a>}
      </section><div className="office-save-bar"><Message message={feedback} error={failed}/><button className="office-button" disabled={busy||!collections}>{busy?"جارٍ الحفظ…":product.id?"حفظ التغييرات":"حفظ المنتج والأصناف"}</button></div>
    </form>
    {!!product.id&&<section className="office-form-section">
      <div className="office-toolbar"><h3>الأحجام والأسعار والمخزون</h3><button type="button" className="office-button secondary" onClick={()=>setVariant(blankVariant)}><Plus size={16}/> إضافة حجم</button></div>
      <TableFrame label="الأحجام والأسعار" actions compact total={product.variants.length} bulkActions={[true,false].map(active=>({id:active?"activate":"deactivate",label:active?"تفعيل الأحجام":"إيقاف الأحجام",icon:active?Eye:EyeOff,run:async(id:string)=>{const current=await office<AdminProduct>("products/"+product.id);const item=current.variants.find(v=>v.id===id);if(!item)throw new Error("الحجم لم يعد متاحًا");const updated=await office<AdminVariant>(`products/${product.id}/variants/${id}`,{method:"PUT",data:{...item,active}});setProduct(value=>({...value,variants:value.variants.map(v=>v.id===id?updated:v)}))}}))} onBulkComplete={changed}><table className="office-table"><thead><tr><th>SKU</th><th>الحجم</th><th>السعر</th><th>المخزون</th><th>الحالة</th><th>الإجراء</th></tr></thead><tbody>
        {variantOrder(product.variants).map(item=><tr key={item.id}><td dir="ltr">{item.sku}</td><td>{item.sizeMl} مل</td><td data-sort-value={item.priceMinor}>{money(item.priceMinor,"ar")}</td><td>{item.stock}</td><td>{item.active?"مفعّل":"متوقف"}</td><td><RowAction label={`تعديل الحجم ${item.sizeMl} مل`} icon={SquarePen} onClick={()=>setVariant(item)}/></td></tr>)}
      </tbody></table>{!product.variants.length&&<p className="office-empty">أضف حجمًا قبل نشر العطر.</p>}</TableFrame>

    </section>}
  </div>;
}

function VariantForm({productId,initial,onSave,onCancel}:{productId:string;initial:AdminVariant;onSave:(value:AdminVariant)=>void;onCancel:()=>void}){
  const [item,setItem]=useState(initial);
  useEffect(()=>{setItem(current=>({...current,stock:initial.stock}))},[initial.stock]);
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
          data:{sku:form.get("sku"),sizeMl:Number(form.get("size")),format:form.get("format"),priceMinor,compareAtMinor,active:form.has("active"),...(!item.id?{initialStock:Number(form.get("initialStock"))}:{})}});
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
        <label>السعر بالجنيه<input name="price" type="number" min=".01" max={1000000} step=".01" defaultValue={item.priceMinor?item.priceMinor/100:""} required/></label>
        <label>السعر قبل الخصم<input name="compare" type="number" min=".01" max={1000000} step=".01" defaultValue={item.compareAtMinor?item.compareAtMinor/100:""}/></label>
        {!item.id&&<label>المخزون الافتتاحي<input name="initialStock" type="number" min={0} max={100000} defaultValue={0} required/></label>}
        <label className="office-check"><input name="active" type="checkbox" defaultChecked={item.active}/> الحجم مفعّل</label>
      </div><div className="office-tools"><button className="office-button" disabled={busy}>حفظ الحجم</button><button type="button" className="office-button secondary" onClick={onCancel}>العودة للمنتج</button></div>
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
  const {editor,open,close}=useEditorRoute("collections");
  const [query,setQuery]=useState("");
  const [revision,setRevision]=useState(0);
  const {data,error}=useOfficeData<AdminCollection[]>("collections",revision);
  const editing=editor===null?null:editor===""?blankCollection:data?.find(item=>item.slug===editor);
  const setEditing=(item:AdminCollection|null)=>item?open(item.slug):close();
  if(editor!==null)return editing?<Panel title={editing.slug?"تعديل التصنيف":"إضافة تصنيف"} description="الاسم والصورة وترتيب الظهور في المتجر" onClose={()=>setEditing(null)}>
      <CollectionForm initial={editing} existing={data??[]} saved={()=>{setRevision(value=>value+1);setEditing(null)}}/>
      {editing.slug&&(editing.supportsMultipleProducts?<CollectionMembers slug={editing.slug}/>:<p className="office-help">إدارة عطور القسم تتطلب نشر تحديث علاقة الأقسام على السيرفر أولًا.</p>)}
    </Panel>:<Message message={error||(data?"القسم غير موجود.":"جارٍ تحميل القسم…")} error={!!error||!!data}/>;
  return <>
    <div className="office-toolbar"><p>نظّم المنتجات في تصنيفات قابلة للنشر على المتجر.</p><button className="office-button" onClick={()=>setEditing(blankCollection)}><Plus size={17}/> إضافة تصنيف</button></div>
    <label className="office-search office-collection-search"><Search size={17}/><input aria-label="البحث في الأقسام" placeholder="ابحث عن قسم…" value={query} onChange={e=>setQuery(e.target.value)}/></label><Message message={error} error/>
    <TableFrame label="أقسام المتجر" actions total={data?.length} scope={query} bulkActions={collectionActions()} onBulkComplete={()=>setRevision(v=>v+1)}><table className="office-table"><thead><tr><th>التصنيف</th><th>الرابط</th><th>الترتيب</th><th>الظهور</th><th>التعديل</th></tr></thead><tbody>
      {data?.filter(c=>[c.nameAr,c.nameEn,c.slug].some(v=>v.toLowerCase().includes(query.trim().toLowerCase()))).sort((a,b)=>a.sortOrder-b.sortOrder).map(collection=><tr key={collection.slug}><td><strong>{collection.nameAr}</strong><small>{collection.nameEn}</small></td><td dir="ltr">{collection.slug}</td><td>{collection.sortOrder}</td>
        <td><span className="office-badge" data-status={collection.published?"confirmed":"pending"}>{collection.published?"منشور":"مسودة"}</span></td>
        <td><RowAction label={`تعديل ${collection.nameAr}`} icon={SquarePen} onClick={()=>setEditing(collection)}/></td></tr>)}
    </tbody></table>{!data?.length&&!error&&<p className="office-empty">{data?"يمكنك إنشاء أول تصنيف الآن.":"جارٍ تحميل التصنيفات…"}</p>}</TableFrame>

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
      <label>ترتيب الظهور <small>الأرقام الأصغر تظهر أولًا</small><input name="sortOrder" type="number" min={-10000} max={10000} defaultValue={initial.sortOrder} required/></label>
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

function CollectionMembers({slug}:{slug:string}){
 const {data:index,error}=useOfficeData<ProductSummary[]>("catalog/index",0,60000,loadCatalogIndex);
 const [selected,setSelected]=useState<string[]>([]),[original,setOriginal]=useState<string[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 useEffect(()=>{let cancelled=false;setLoading(true);if(!index)return;loadCatalogDetails(index.map(p=>p.id),new AbortController().signal).then(result=>{if(cancelled)return;if(result.failed)throw new Error("تعذر تحميل بعض المنتجات؛ أعد فتح القسم.");const ids=Object.values(result.products).filter(p=>p.collections.includes(slug)).map(p=>p.id);setSelected(ids);setOriginal(ids);setLoading(false)}).catch(e=>{if(!cancelled)setMessage(e.message)});return()=>{cancelled=true}},[index,slug]);
 async function save(){if(busy||loading)return;setBusy(true);setMessage("");const done:string[]=[];try{for(const product of index??[]){if(selected.includes(product.id)===original.includes(product.id))continue;const fresh=await office<AdminProduct>("products/"+product.id);const collections=selected.includes(product.id)?[...new Set([...fresh.collections,slug])]:fresh.collections.filter(s=>s!==slug);await office("products/"+product.id,{method:"PUT",data:{...fresh,collections}});done.push(product.id)}setOriginal([...selected]);setMessage("تم حفظ منتجات القسم.")}catch(e){setOriginal(previous=>{const next=new Set(previous);for(const id of done)selected.includes(id)?next.add(id):next.delete(id);return [...next]});setMessage((e as Error).message+" — تم حفظ "+done.length+" تعديل؛ يمكنك إعادة المحاولة.")}finally{setBusy(false)}}
 return <section className="office-editor-section"><h3>عطور القسم</h3><p className="office-help">حدد المنتجات التي تظهر في هذا القسم، ثم احفظ اختيارك. باقي أقسام كل منتج تظل كما هي.</p><Message message={error||message} error={!!error||loading&&!!message}/>{loading?<p>جارٍ تحميل المنتجات…</p>:<><div className="office-fields">{index?.map(product=><label className="office-check" key={product.id}><input type="checkbox" disabled={busy} checked={selected.includes(product.id)} onChange={e=>setSelected(ids=>e.target.checked?[...ids,product.id]:ids.filter(id=>id!==product.id))}/>{product.nameAr} <small>{product.published?"منشور":"مسودة"}</small></label>)}</div><button className="office-button" type="button" disabled={busy} onClick={save}>{busy?"جارٍ الحفظ…":"حفظ عطور القسم"}</button></>}</section>
}
