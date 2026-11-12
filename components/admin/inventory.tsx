"use client";
import {useState} from "react";
import {Boxes,RefreshCw,SlidersHorizontal} from "lucide-react";
import type {Page} from "@/lib/store";
import {RowAction,TableFrame,Message,Pagination,useOfficeData} from "./shared";
type InventoryRow={variantId:string;productId:string;sku:string;nameEn:string;nameAr:string;stock:number;active:boolean;published:boolean};
export function Inventory({editProduct}:{editProduct:(id:string)=>void}){
 const [lowOnly,setLowOnly]=useState(true),[page,setPage]=useState(1),[revision,setRevision]=useState(0);
 const {data,error}=useOfficeData<Page<InventoryRow>>(`inventory?pageSize=30&pageNumber=${page}${lowOnly?"&maximumStock=5":""}`,revision);
 return <><div className="office-page-actions"><div><h2>المخزون</h2><p>راجع كل حجم لوحده، وافتح المنتج لتسوية الكمية مع تسجيل السبب.</p></div><button className="office-button secondary" onClick={()=>setRevision(v=>v+1)}><RefreshCw size={16}/> تحديث</button></div>
 <div className="office-tabs" role="group" aria-label="عرض المخزون"><button aria-pressed={lowOnly} onClick={()=>{setLowOnly(true);setPage(1)}}>٥ قطع أو أقل</button><button aria-pressed={!lowOnly} onClick={()=>{setLowOnly(false);setPage(1)}}>كل المخزون</button></div><Message message={error} error/>
 <TableFrame label="كميات المخزون" actions total={data?.totalCount} offset={(page-1)*30} scope={`${page}|${lowOnly}`}><table className="office-table"><thead><tr><th>المنتج</th><th>رمز SKU</th><th>المتاح</th><th>الحالة</th><th>الإجراء</th></tr></thead><tbody>{data?.data.map(row=><tr key={row.variantId}><td><strong>{row.nameAr||row.nameEn}</strong><small>{row.nameEn}</small></td><td dir="ltr">{row.sku}</td><td><span className="office-badge" data-status={row.stock===0?"cancelled":row.stock<=5?"pending":"confirmed"}>{row.stock}</span></td><td>{!row.active?"حجم غير مفعّل":row.published?"منشور":"المنتج مسودة"}</td><td><RowAction label={`إدارة مخزون ${row.nameAr} — ${row.sku}`} icon={SlidersHorizontal} onClick={()=>editProduct(row.productId)}/></td></tr>)}</tbody></table>{!data?.data.length&&!error&&<div className="office-empty"><Boxes size={28}/><p>{data?"لا توجد أحجام مطابقة لهذا العرض.":"جارٍ تحميل المخزون…"}</p></div>}</TableFrame><Pagination data={data} go={setPage}/></>;
}
