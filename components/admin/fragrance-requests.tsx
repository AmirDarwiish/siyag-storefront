"use client";
import {useState} from 'react';
import {Eye,RefreshCw,Sparkles} from 'lucide-react';
import {office,orderDate} from '@/lib/admin';
import type {Page} from '@/lib/store';
import {customRequestStatuses} from '@/lib/fragrance-journeys';
import {TableFrame,RowAction,Pagination,Panel,Message,useOfficeData} from './shared';
type Status=keyof typeof customRequestStatuses;
type RequestRow={id:string;reference:string;createdAt:string;updatedAt:string;name:string;phone:string;fragranceName:string;notes?:string;sizeMl:number;quantity:number;status:Status};
export function FragranceRequests(){
 const [status,setStatus]=useState('new'),[page,setPage]=useState(1),[pageSize,setPageSize]=useState(12),[revision,refresh]=useState(0),[selected,setSelected]=useState<RequestRow>();
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const {data,error}=useOfficeData<Page<RequestRow>>(`fragrance-requests?pageNumber=${page}&pageSize=${pageSize}${status?'&status='+status:''}`,revision);
 async function update(next:Status){
  if(!selected)return;setBusy(true);setMessage('');
  try{await office(`fragrance-requests/${selected.id}/status`,{method:'PUT',data:{status:next}});setSelected({...selected,status:next});refresh(v=>v+1)}
  catch(e){setMessage(e instanceof Error?e.message:'تعذّر تحديث الطلب.')}
  finally{setBusy(false)}
 }
 return <><div className="office-page-actions"><label>حالة الطلب <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}><option value="">كل الطلبات</option>{Object.entries(customRequestStatuses).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><button className="office-button secondary" type="button" onClick={()=>refresh(v=>v+1)}><RefreshCw size={16}/> تحديث</button></div>
 <Message message={error} error/>
 <TableFrame label="طلبات العطور الخاصة" actions total={data?.totalCount} offset={(page-1)*pageSize} scope={`${status}|${page}`}><table className="office-table"><thead><tr><th>رقم الطلب</th><th>العميل</th><th>العطر المطلوب</th><th>الحجم والعدد</th><th>الحالة</th><th>التفاصيل</th></tr></thead><tbody>{data?.data.map(row=><tr key={row.id}><td><strong dir="ltr">{row.reference}</strong><small>{orderDate(row.createdAt)}</small></td><td>{row.name}<small dir="ltr">{row.phone}</small></td><td dir="auto">{row.fragranceName}</td><td>{row.sizeMl} مل × {row.quantity}</td><td>{customRequestStatuses[row.status]}</td><td><RowAction label={`عرض الطلب ${row.reference}`} icon={Eye} onClick={()=>{setSelected(row);setMessage('')}}/></td></tr>)}</tbody></table>{!data?.data.length&&!error&&<div className="office-empty"><Sparkles size={28}/><p>{data?'لا توجد طلبات في الحالة دي.':'جاري تحميل الطلبات…'}</p></div>}</TableFrame><Pagination data={data} go={setPage} changeSize={setPageSize}/>
 {selected&&<Panel title={selected.reference} description="طلب عطر خاص — تأكيد السعر والتوفر مع العميل قبل التنفيذ." onClose={()=>setSelected(undefined)}><div className="office-form"><p><strong>{selected.name}</strong></p><p><a href={'tel:'+selected.phone} dir="ltr">{selected.phone}</a></p><p dir="auto">{selected.fragranceName}</p><p>{selected.sizeMl} مل × {selected.quantity}</p><p dir="auto">{selected.notes||'لا توجد تفاصيل إضافية.'}</p><p>{orderDate(selected.createdAt)}</p><label>حالة المتابعة <select disabled={busy} value={selected.status} onChange={e=>void update(e.target.value as Status)}>{Object.entries(customRequestStatuses).map(([key,label])=><option value={key} key={key}>{label}</option>)}</select></label><Message message={message} error/></div></Panel>}
 </>;
}
