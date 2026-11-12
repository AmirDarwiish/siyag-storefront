"use client";
import {useState,type FormEvent} from "react";
import {RefreshCw,Search,Eye} from "lucide-react";
import {office,orderDate,paymentNames,statusNames,type AdminOrder,type OrderRow} from "@/lib/admin";
import {money,type Page} from "@/lib/store";
import {useEditorRoute,RowAction,TableFrame,Message,Pagination,Panel,useOfficeData} from "./shared";

import {orderActions} from "./bulk-actions";

const transitions:Record<string,string[]>={
  pending:["confirmed","cancelled"],confirmed:["packing","cancelled"],packing:["shipped","cancelled"],
  shipped:["delivered","deliveryFailed"],deliveryFailed:["shipped","cancelled"],delivered:["returned"],
};

export function Orders(){
  const [page,setPage]=useState(1);
  const [status,setStatus]=useState("");
  const [number,setNumber]=useState("");
  const [search,setSearch]=useState("");
  const {editor:selected,open:setSelected,close}=useEditorRoute("orders");
  const [revision,setRevision]=useState(0);
  const query=new URLSearchParams({pageSize:"20",pageNumber:String(page)});
  if(status)query.set("status",status);
  if(number)query.set("number",number);
  const {data,error}=useOfficeData<Page<OrderRow>>("orders?"+query,revision,20_000);
  const refresh=()=>setRevision(value=>value+1);
  if(selected!==null)return <Panel title={"طلب "+selected} description="تفاصيل العميل والأصناف وسجل التنفيذ" onClose={close}><OrderDetail key={selected} number={selected} changed={refresh}/></Panel>;
  return <>
    <div className="office-toolbar">
      <form className="office-search" onSubmit={event=>{event.preventDefault();setNumber(search.trim().toUpperCase());setPage(1)}}>
        <Search size={17}/><input aria-label="رقم الطلب" placeholder="ابحث برقم الطلب" value={search} onChange={event=>setSearch(event.target.value)} maxLength={25}/><button className="office-button secondary" type="submit">بحث</button>
      </form>
      <div className="office-tools"><select aria-label="حالة الطلب" value={status} onChange={event=>{setStatus(event.target.value);setPage(1)}}>
        <option value="">كل الحالات</option>{Object.entries(statusNames).map(([value,label])=><option value={value} key={value}>{label}</option>)}
      </select><button type="button" className="office-button secondary" onClick={refresh}><RefreshCw size={16}/> تحديث</button></div>
    </div>
    <Message message={error} error/>
    <TableFrame label="قائمة الطلبات" actions total={data?.totalCount} offset={(page-1)*20} scope={`${page}|${status}|${number}`} bulkActions={orderActions()} onBulkComplete={refresh}><table className="office-table">
      <thead><tr><th>رقم الطلب</th><th>التاريخ</th><th>الحالة</th><th>الدفع</th><th>الإجمالي</th><th>التفاصيل</th></tr></thead>
      <tbody>{data?.data.map(order=><tr key={order.number}>
        <td><strong dir="ltr">{order.number}</strong></td><td>{orderDate(order.createdAt)}</td>
        <td><span className="office-badge" data-status={order.status}>{statusNames[order.status]??order.status}</span></td>
        <td>{paymentNames[order.paymentStatus]??order.paymentStatus}</td><td>{money(order.totalMinor,"ar")}</td>
        <td><RowAction label={`عرض الطلب ${order.number}`} icon={Eye} onClick={()=>setSelected(order.number)}/></td>
      </tr>)}</tbody>
    </table>{!data?.data.length&&<p className="office-empty">{error?"":data?"لا توجد طلبات بهذه الخيارات.":"جارٍ تحميل الطلبات…"}</p>}</TableFrame>
    <Pagination data={data} go={setPage}/>

  </>;
}

function OrderDetail({number,changed}:{number:string;changed:()=>void}){
  const [revision,setRevision]=useState(0);
  const [action,setAction]=useState("");
  const [busy,setBusy]=useState(false);
  const [feedback,setFeedback]=useState("");
  const [failed,setFailed]=useState(false);
  const {data:order,error}=useOfficeData<AdminOrder>("orders/"+number,revision);
  async function write(path:string,data:unknown){
    setBusy(true);setFeedback("");setFailed(false);
    try{await office("orders/"+number+"/"+path,{method:"PUT",data});setRevision(value=>value+1);changed();setAction("");setFeedback("تم حفظ التحديث.")}
    catch(error){setFailed(true);setFeedback(error instanceof Error?error.message:"تعذّر حفظ التحديث.")}
    finally{setBusy(false)}
  }
  function update(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!action||busy)return;
    const form=new FormData(event.currentTarget);
    void write("status",{status:action,carrier:form.get("carrier"),carrierReference:form.get("reference"),trackingUrl:form.get("tracking"),restock:form.has("restock")});
  }
  if(!order)return <><Message message={error} error/>{!error&&<p>جارٍ تحميل تفاصيل الطلب…</p>}</>;
  const allowed=(transitions[order.status]??[]).filter(value=>
    (value!=="returned"||!!order.returnRequestedAt&&!order.returnRejectionReason)&&
    (order.paymentMethod!=="paymob"||order.paymentStatus==="collected"||!["confirmed","packing","shipped"].includes(value)));
  const totals=[["قيمة الأصناف",order.subtotalMinor],["الشحن",order.shippingMinor],["الخصم",order.discountMinor],["الإجمالي",order.totalMinor]] as const;
  return <div className="office-detail">
    <div className="office-detail-grid"><section><h3>بيانات التوصيل</h3><p>{order.customerName}</p><p dir="ltr">{order.phone}</p><p>{order.governorate} · {order.city}</p><p>{order.address}</p>{order.deliveryNotes&&<p>{order.deliveryNotes}</p>}</section>
      <section><h3>الطلب والدفع</h3><p>{statusNames[order.status]} · {paymentNames[order.paymentStatus]}</p><p>{orderDate(order.createdAt)}</p><p>{order.paymentMethod==="paymob"?"Paymob":"الدفع عند الاستلام"}</p>{order.carrier&&<p>{order.carrier} {order.carrierReference}</p>}</section></div>
    <TableFrame label="أصناف الطلب" compact total={order.lines.length}><table className="office-table"><thead><tr><th>العطر</th><th>الحجم</th><th>الكمية</th><th>القيمة</th></tr></thead>
      <tbody>{order.lines.map(line=><tr key={line.id}><td>{line.nameAr||line.nameEn}<small dir="ltr">{line.sku}</small></td><td>{line.sizeMl} مل</td><td>{line.quantity}</td><td>{money(line.quantity*line.unitPriceMinor,"ar")}</td></tr>)}</tbody>
    </table></TableFrame>
    <dl className="office-totals">{totals.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{money(value,"ar")}</dd></div>)}</dl>
    {!!allowed.length&&<form className="office-form" onSubmit={update}>
      <label>تحديث حالة الطلب<select required value={action} onChange={event=>setAction(event.target.value)}><option value="">اختر الحالة التالية</option>{allowed.map(value=><option key={value} value={value}>{statusNames[value]}</option>)}</select></label>
      {action==="shipped"&&<div className="office-fields"><label>شركة الشحن<input name="carrier" required maxLength={100}/></label><label>رقم الشحنة<input name="reference" maxLength={100}/></label><label className="office-wide">رابط التتبع<input name="tracking" type="url" placeholder="https://"/></label></div>}
      {action==="returned"&&<label className="office-check"><input name="restock" type="checkbox"/> إعادة القطع القابلة للبيع إلى المخزون</label>}
      <button className="office-button" disabled={busy||!action}>حفظ الحالة</button>
    </form>}
    {order.paymentMethod==="cashOnDelivery"&&order.paymentStatus==="unpaid"&&order.status==="delivered"&&<button className="office-button secondary" disabled={busy} onClick={()=>void write("payment",{status:"collected"})}>تسجيل تحصيل الدفع</button>}
    <Message message={feedback} error={failed}/>
    <section><h3>سجل الطلب</h3><ol className="office-events">{order.events.map(event=><li key={event.id??event.at}>{statusNames[event.status]??event.status}<small>{orderDate(event.at)} · {event.actor}</small></li>)}</ol></section>
  </div>;
}
