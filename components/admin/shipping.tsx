"use client";
import {useState,type FormEvent} from "react";
import {Plus,SquarePen} from "lucide-react";
import {office} from "@/lib/admin";
import {governorates} from "@/lib/governorates";
import {money,type Shipping} from "@/lib/store";
import {useEditorRoute,RowAction,TableFrame,Message,Panel,useOfficeData} from "./shared";

import {shippingActions} from "./bulk-actions";

type ShippingOption=Shipping&{active:boolean;freeFromMinor?:number|null};
const blank:ShippingOption={code:"",nameAr:"",nameEn:"",governorate:"",feeMinor:0,active:true};
const slugPattern="[a-z0-9]+(?:-[a-z0-9]+)*";

export function ShippingOptions(){
  const {editor,open,close}=useEditorRoute("shipping");
  const [revision,setRevision]=useState(0);
  const {data,error}=useOfficeData<ShippingOption[]>("shipping",revision);
  const editing=editor===null?null:editor===""?blank:data?.find(item=>item.code===editor);
  const setEditing=(item:ShippingOption|null)=>item?open(item.code):close();
  if(editor!==null)return editing?<Panel title={editing.code?"تعديل التوصيل":"إضافة طريقة توصيل"} description="رسوم التوصيل والحد الأدنى للتوصيل المجاني" onClose={()=>setEditing(null)}>
      <ShippingForm initial={editing} existing={data??[]} saved={()=>{setEditing(null);setRevision(value=>value+1)}}/>
    </Panel>:<Message message={error||(data?"طريقة التوصيل غير موجودة.":"جارٍ تحميل التوصيل…")} error={!!error||!!data}/>;
  return <>
    <div className="office-toolbar"><p>أضف طريقة توصيل مفعّلة لكل محافظة ترغب في استقبال طلباتها.</p>
      <button className="office-button" onClick={()=>setEditing(blank)}><Plus size={16}/> إضافة طريقة توصيل</button></div>
    <Message message={error} error/>
    <TableFrame label="طرق التوصيل" actions total={data?.length} bulkActions={shippingActions()} onBulkComplete={()=>setRevision(v=>v+1)}><table className="office-table"><thead><tr><th>الطريقة</th><th>المحافظة</th><th>الرسوم</th><th>مجاني من</th><th>الحالة</th><th>التعديل</th></tr></thead>
      <tbody>{data?.map(option=><tr key={option.code}><td>{option.nameAr}</td><td>{governorates[option.governorate]?.[1]??option.governorate}</td><td>{money(option.feeMinor,"ar")}</td>
        <td>{option.freeFromMinor?money(option.freeFromMinor,"ar"):"—"}</td><td>{option.active?"مفعّلة":"متوقفة"}</td><td><RowAction label={`تعديل توصيل ${option.nameAr}`} icon={SquarePen} onClick={()=>setEditing(option)}/></td></tr>)}</tbody>
    </table>{!data?.length&&!error&&<p className="office-empty">{data?"أضف طريقة توصيل لتظهر في إتمام الطلب.":"جارٍ تحميل طرق التوصيل…"}</p>}</TableFrame>

  </>;
}
function ShippingForm({initial,existing,saved}:{initial:ShippingOption;existing:ShippingOption[];saved:()=>void}){
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();const form=new FormData(event.currentTarget);
    const code=String(form.get("code")).trim();
    if(!initial.code&&existing.some(value=>value.code===code)){setError("رمز الطريقة مستخدم بالفعل.");return}
    setBusy(true);setError("");
    try{await office("shipping/"+encodeURIComponent(code),{method:"PUT",data:{
      nameAr:form.get("nameAr"),nameEn:form.get("nameEn"),governorate:form.get("governorate"),
      feeMinor:Math.round(Number(form.get("fee"))*100),
      freeFromMinor:form.get("freeFrom")?Math.round(Number(form.get("freeFrom"))*100):null,active:form.has("active"),
    }});saved()}
    catch(error){setError(error instanceof Error?error.message:"تعذّر حفظ طريقة التوصيل.")}
    finally{setBusy(false)}
  }
  return <form className="office-form" onSubmit={submit}>
    <div className="office-fields">
      <label>الاسم بالعربي<input name="nameAr" defaultValue={initial.nameAr} required maxLength={100}/></label>
      <label>الاسم بالإنجليزي<input name="nameEn" defaultValue={initial.nameEn} required maxLength={100} dir="ltr"/></label>
      <label>رمز الطريقة<input name="code" defaultValue={initial.code} readOnly={!!initial.code} required pattern={slugPattern} maxLength={100} dir="ltr" placeholder="cairo-standard"/></label>
      <label>المحافظة<select name="governorate" defaultValue={initial.governorate} required><option value="">اختر المحافظة</option>{Object.entries(governorates).map(([value,label])=><option key={value} value={value}>{label[1]}</option>)}{initial.governorate&&!governorates[initial.governorate]&&<option value={initial.governorate}>{initial.governorate}</option>}</select></label>
      <label>الرسوم بالجنيه<input name="fee" type="number" min={0} max={10000} step=".01" defaultValue={initial.feeMinor/100} required/></label>
      <label>مجاني من قيمة طلب<input name="freeFrom" type="number" min=".01" step=".01" defaultValue={initial.freeFromMinor?initial.freeFromMinor/100:""}/></label>
    </div>
    <label className="office-check"><input name="active" type="checkbox" defaultChecked={initial.active}/> مفعّلة في المتجر</label>
    <button className="office-button" disabled={busy}>حفظ طريقة التوصيل</button><Message message={error} error/>
  </form>;
}
