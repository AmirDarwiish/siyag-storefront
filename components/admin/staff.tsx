"use client";
import {useEffect,useState,type FormEvent} from "react";
import {office,roleNames,type StaffUser} from "@/lib/admin";
import {UserPlus,Search,ShieldCheck,Users} from "lucide-react";
import {Message,Panel,TableFrame} from "./shared";

export function Staff(){
  const [people,setPeople]=useState<StaffUser[]>([]);
  const [loaded,setLoaded]=useState(false);
  const [editing,setEditing]=useState<StaffUser|null>(null);
  const [open,setOpen]=useState(false);
  const [query,setQuery]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");

  useEffect(()=>{
    const controller=new AbortController();
    office<StaffUser[]>("staff",{signal:controller.signal}).then(items=>{setPeople(items);setLoaded(true)})
      .catch(error=>{if(!controller.signal.aborted)setError(error.message)});
    return()=>controller.abort();
  },[]);

  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(busy)return;
    const form=event.currentTarget;
    const fields=new FormData(form);
    const temporaryPassword=String(fields.get("temporaryPassword")||"");
    const role=fields.get("role");
    setBusy(true);setError("");setNotice("");
    try{
      const user=await office<StaffUser>(editing?"staff/"+editing.id:"staff",{
        method:editing?"PUT":"POST",
        data:editing?{role,active:fields.has("active"),temporaryPassword:temporaryPassword||null}:
          {role,name:fields.get("name"),email:fields.get("email"),temporaryPassword},
      });
      setPeople(items=>[...items.filter(item=>item.id!==user.id),user].sort((a,b)=>a.email.localeCompare(b.email)));
      form.reset();setEditing(null);setOpen(false);setNotice(editing?"اتحفظت بيانات الموظف.":"اتضاف الموظف. شارك معاه كلمة المرور المؤقتة بشكل خاص.");
    }catch(error){setError(error instanceof Error?error.message:"تعذّر حفظ الموظف.")}
    finally{setBusy(false)}
  }

  const filtered=people.filter(person=>[person.name,person.email,roleNames[person.role]].some(value=>value.toLowerCase().includes(query.trim().toLowerCase())));
  return <section className="office-staff-page">
    <div className="office-toolbar"><p className="office-help">حساب مستقل لكل موظف، بصلاحيات تناسب دوره.</p><button type="button" className="office-button" onClick={()=>{setEditing(null);setOpen(true);setError("")}}><UserPlus size={17}/> إضافة موظف</button></div>
    <div className="office-info-note"><ShieldCheck size={19}/><p>مالك المتجر يملك جميع الصلاحيات. موظف الكتالوج يدير المنتجات، وموظف التنفيذ يتابع الطلبات والتوصيل.</p></div>
    <label className="office-search office-collection-search"><Search size={17}/><input aria-label="البحث في الموظفين" placeholder="ابحث بالاسم أو البريد أو الصلاحية…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
    {!open&&<Message message={error} error/>}<Message message={notice}/>
    {!loaded&&!error&&<p role="status">جارٍ تحميل الفريق…</p>}
    <TableFrame label="فريق المتجر" actions total={filtered.length}><table className="office-table"><thead><tr>
      <th>الاسم</th><th>البريد الإلكتروني</th><th>الصلاحية</th><th>الحالة</th><th>الإجراء</th>
    </tr></thead><tbody>{filtered.map(person=><tr key={person.id}>
      <td>{person.name}</td><td><bdi>{person.email}</bdi></td><td>{roleNames[person.role]}</td>
      <td><span className="office-badge" data-status={!person.active?"cancelled":person.mustChangePassword?"pending":"confirmed"}>{!person.active?"موقوف":person.mustChangePassword?"بانتظار تفعيل الدخول":"نشط"}</span></td>
      <td>{person.role==="Owner"?<span className="office-owner-tag"><ShieldCheck size={15}/> المالك</span>:<button type="button" className="office-text-button" disabled={busy}
        onClick={()=>{setEditing(person);setOpen(true);setError("");setNotice("")}}>تعديل</button>}</td>
    </tr>)}</tbody></table>{loaded&&!filtered.length&&<div className="office-empty"><Users size={26}/><p>لا توجد حسابات مطابقة للبحث.</p></div>}</TableFrame>
    {open&&<Panel title={editing?"تعديل الموظف":"إضافة موظف"} description="بيانات الحساب والصلاحية المطلوبة للعمل" onClose={()=>{setOpen(false);setEditing(null)}}><form className="office-form" key={editing?.id??"new"} onSubmit={save}>
      {editing&&<div className="office-info-note"><Users size={18}/><p>{editing.name} · <bdi>{editing.email}</bdi></p></div>}
      {!editing&&<>
        <label>اسم الموظف<input name="name" maxLength={100} required/></label>
        <label>البريد الإلكتروني<input type="email" name="email" dir="ltr" maxLength={254} required/></label>
      </>}
      <label>الصلاحية<select name="role" defaultValue={editing?.role??"Catalog"}>
        <option value="Catalog">إدارة الكتالوج</option><option value="Fulfillment">تنفيذ الطلبات والتوصيل</option>
      </select></label>
      {editing&&<label><span><input name="active" type="checkbox" defaultChecked={editing.active}/> الحساب نشط</span></label>}
      <label>{editing?"كلمة مرور مؤقتة جديدة (اختياري)":"كلمة المرور المؤقتة"}
        <input name="temporaryPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required={!editing}/>
      </label>
      <div><button className="office-button" disabled={busy||!loaded}>{editing?"حفظ التعديلات":"إضافة الموظف"}</button>{" "}
        {editing&&<button className="office-text-button" type="button" disabled={busy} onClick={()=>{setEditing(null);setOpen(false)}}>إلغاء</button>}
      </div>
      <Message message={error} error/>
    </form></Panel>}
  </section>;
}
