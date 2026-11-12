"use client";
import {useState} from "react";
import {ArrowLeft,Boxes,FolderOpen,PackageCheck,Plus,RefreshCw,Truck,Wallet} from "lucide-react";
import {orderDate,statusNames,type OrderRow,type Role} from "@/lib/admin";
import {money,type Page} from "@/lib/store";
import {TableFrame,Message,useOfficeData} from "./shared";

type Summary={orders:number;deliveredOrders:number;cancelledOrders:number;returnedOrders:number;orderedMinor:number;collectedMinor:number;refundedMinor:number;lowStockVariants:number};
export function Overview({role,navigate,createProduct}:{role:Role;navigate:(section:string)=>void;createProduct:()=>void}){
 const [revision,setRevision]=useState(0);
 const owner=role==="Owner",catalog=owner||role==="Catalog",fulfillment=owner||role==="Fulfillment";
 const summary=useOfficeData<Summary>(owner?"reports/summary":null,revision);
 const products=useOfficeData<Page<unknown>>(catalog?"products?pageSize=1":null,revision);
 const pending=useOfficeData<Page<OrderRow>>(fulfillment?"orders?status=pending&pageSize=5":null,revision);
 const error=summary.error||products.error||pending.error;
 const cards=owner?[
  {label:"الطلبات",value:summary.data?.orders,section:"orders",icon:PackageCheck},
  {label:"قيمة الطلبات",value:summary.data?money(summary.data.orderedMinor,"ar"):undefined,section:"orders",icon:Wallet},
  {label:"المبالغ المحصّلة",value:summary.data?money(summary.data.collectedMinor,"ar"):undefined,section:"orders",icon:Wallet},
  {label:"أحجام بمخزون منخفض",value:summary.data?.lowStockVariants,section:"inventory",icon:Boxes},
 ]:catalog?[{label:"المنتجات",value:products.data?.totalCount,section:"products",icon:Boxes}]:[{label:"طلبات جديدة",value:pending.data?.totalCount,section:"orders",icon:PackageCheck}];
 const shortcuts=[...(catalog?[{section:"products",title:"إضافة منتج",copy:"البيانات، الصور، الأحجام والسعر.",icon:Plus},{section:"collections",title:"تنظيم الأقسام",copy:"أنشئ أقسامًا ورتّب ظهورها في المتجر.",icon:FolderOpen}]:[]),...(fulfillment?[{section:"orders",title:"متابعة الطلبات",copy:"من التأكيد والتجهيز لحد التسليم.",icon:PackageCheck},{section:"shipping",title:"إعدادات التوصيل",copy:"المحافظات والتكلفة وطرق الشحن.",icon:Truck}]:[])];
 return <div className="office-overview">
  <div className="office-page-actions"><div><h2>ملخص أداء المتجر</h2><p>متابعة الطلبات والتحصيل والمخزون من مساحة واحدة.</p></div><button className="office-button secondary" onClick={()=>setRevision(v=>v+1)}><RefreshCw size={16}/> تحديث</button></div>
  <Message message={error} error/>
  <div className="office-stats">{cards.map(({label,value,section,icon:Icon})=><button key={label} onClick={()=>navigate(section)}><div className="office-metric-label"><span>{label}</span><Icon size={19}/></div><strong>{value??"—"}</strong><small>عرض التفاصيل <ArrowLeft size={13}/></small></button>)}</div>
  {owner&&<p className="office-help">إجماليات المتجر لكل الفترات. قيمة الطلبات تستبعد الملغى، والمبالغ المحصّلة تظهر بشكل منفصل.</p>}
  <div className="office-overview-grid"><section className="office-card"><header><div><h2>ابدأ من هنا</h2><p>اختصارات للمهام اليومية</p></div></header><div className="office-shortcuts">{shortcuts.map(({section,title,copy,icon:Icon})=><button key={section} onClick={()=>section==="products"?createProduct():navigate(section)}><span className="office-shortcut-icon"><Icon size={21}/></span><div><strong>{title}</strong><p>{copy}</p></div><ArrowLeft size={17}/></button>)}</div></section>
  {catalog&&<section className="office-card office-setup"><div><Boxes size={24}/><h2>من المسودة لواجهة المتجر</h2><p>١. احفظ بيانات المنتج وصوره · ٢. أضف الأحجام والأسعار · ٣. اضبط المخزون · ٤. انشر المنتج.</p><button className="office-button" onClick={()=>navigate("products")}>إدارة المنتجات</button></div><span className="office-large-count">{products.data?.totalCount??"—"}<small>منتج في الكتالوج</small></span></section>}
  </div>
  {fulfillment&&<section className="office-card"><header><div><h2>طلبات تحتاج متابعة</h2><p>{pending.data?`${pending.data.totalCount} طلب جديد بانتظار التأكيد`:"جارٍ تحميل الطلبات…"}</p></div><button className="office-text-button" onClick={()=>navigate("orders")}>كل الطلبات</button></header>{pending.data?.data.length?<TableFrame label="طلبات تحتاج متابعة"><table className="office-table"><thead><tr><th>الطلب</th><th>التاريخ</th><th>الحالة</th><th>القيمة</th></tr></thead><tbody>{pending.data.data.map(order=><tr key={order.number}><td dir="ltr"><button className="office-text-button" onClick={()=>navigate("orders")}>{order.number}</button></td><td>{orderDate(order.createdAt)}</td><td><span className="office-badge">{statusNames[order.status]}</span></td><td>{money(order.totalMinor,"ar")}</td></tr>)}</tbody></table></TableFrame>:pending.data?<div className="office-empty"><PackageCheck size={27}/><strong>لا توجد طلبات جديدة حاليًا</strong><p>أي طلب جديد هيظهر هنا، وتقدر تراجع باقي الحالات من صفحة الطلبات.</p></div>:null}</section>}
 </div>;
}
