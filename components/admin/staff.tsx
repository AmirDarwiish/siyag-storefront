"use client";
import {useEffect,useState,type FormEvent} from "react";
import {office,roleNames,type StaffUser} from "@/lib/admin";
import {Message} from "./shared";

export function Staff(){
  const [people,setPeople]=useState<StaffUser[]>([]);
  const [loaded,setLoaded]=useState(false);
  const [editing,setEditing]=useState<StaffUser|null>(null);
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
      form.reset();setEditing(null);setNotice(editing?"اتحفظت بيانات الموظف.":"اتضاف الموظف. شارك معاه كلمة المرور المؤقتة بشكل خاص.");
    }catch(error){setError(error instanceof Error?error.message:"تعذّر حفظ الموظف.")}
    finally{setBusy(false)}
  }

  return <section className="office-card">
    <Message message={error} error/><Message message={notice}/>
    {!loaded&&!error&&<p role="status">جارٍ تحميل الفريق…</p>}
    <div className="office-table-wrap"><table className="office-table"><thead><tr>
      <th>الاسم</th><th>البريد الإلكتروني</th><th>الصلاحية</th><th>الحالة</th><th>الإجراء</th>
    </tr></thead><tbody>{people.map(person=><tr key={person.id}>
      <td>{person.name}</td><td><bdi>{person.email}</bdi></td><td>{roleNames[person.role]}</td>
      <td>{!person.active?"موقوف":person.mustChangePassword?"بانتظار تغيير كلمة المرور":"نشط"}</td>
      <td>{person.role!=="Owner"&&<button type="button" className="office-text-button" disabled={busy}
        onClick={()=>{setEditing(person);setError("");setNotice("")}}>تعديل</button>}</td>
    </tr>)}</tbody></table></div>
    <form className="office-form" key={editing?.id??"new"} onSubmit={save}>
      <h2>{editing?`تعديل ${editing.name}`:"إضافة موظف"}</h2>
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
        {editing&&<button className="office-text-button" type="button" disabled={busy} onClick={()=>setEditing(null)}>إلغاء</button>}
      </div>
    </form>
  </section>;
}
