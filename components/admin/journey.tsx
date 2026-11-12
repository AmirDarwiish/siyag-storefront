"use client";
import {useState,type CSSProperties} from "react";
import {CreditCard,CheckCircle2,Activity,Info,MousePointerClick,RefreshCw,ShoppingBag,Users,Wallet} from "lucide-react";
import {money} from "@/lib/store";
import {Message,TableFrame,useOfficeData} from "./shared";

type Metrics={sessions:number;purchases:number;revenueMinor:number;conversion:number};
type Report={days:number;truncated:boolean;visitors:number;sessions:number;productViews:number;addToCartSessions:number;checkoutSessions:number;purchaseSessions:number;bagToCheckoutSessions:number;abandonedCartSessions:number;abandonedCheckoutSessions:number;expressCheckoutSessions:number;purchases:number;revenueMinor:number;aovMinor:number;sources:{source:string;medium:string;campaign:string;metrics:Metrics}[];devices:{device:string;metrics:Metrics}[];visitorsByType:{returning:boolean;metrics:Metrics}[];topViewed:{product:string;views:number}[];topSelling:{variantId:string;product:string;quantity:number;revenueMinor:number}[];events:{name:string;count:number}[]};
const number=(value:number)=>value.toLocaleString("ar-EG");
const rate=(value:number,total:number)=>total?(value/total*100).toLocaleString("ar-EG",{maximumFractionDigits:1})+"٪":"—";
const deviceNames:Record<string,string>={mobile:"موبايل",desktop:"كمبيوتر",tablet:"تابلت",unknown:"غير محدد"};
function EmptyRow({columns}:{columns:number}){return <tr><td colSpan={columns+2}><div className="office-empty"><Activity size={24}/><p>لا توجد بيانات مسجلة في الفترة المحددة.</p></div></td></tr>}

export function JourneyDashboard(){
  const [days,setDays]=useState(30),[revision,setRevision]=useState(0);
  const {data:report,error}=useOfficeData<Report>("reports/journey?days="+days,revision);
  const stats=[
    {label:"الزوار",value:report?number(report.visitors):"—",icon:Users,caption:"زوار وافقوا على القياس"},
    {label:"الجلسات",value:report?number(report.sessions):"—",icon:MousePointerClick,caption:"خلال الفترة المحددة"},
    {label:"الطلبات المنسوبة",value:report?number(report.purchases):"—",icon:ShoppingBag,caption:"طلبات مرتبطة برحلة مسجلة"},
    {label:"قيمة الطلبات",value:report?money(report.revenueMinor,"ar"):"—",icon:Wallet,caption:"قبل احتساب صافي التحصيل"},
  ];
  const journey=report?[
    {label:"زيارة المتجر",value:report.sessions,icon:Users,tone:"blue"},
    {label:"إضافة للحقيبة",value:report.addToCartSessions,icon:ShoppingBag,tone:"violet"},
    {label:"بدء إتمام الطلب",value:report.checkoutSessions,icon:CreditCard,tone:"teal"},
    {label:"إتمام الشراء",value:report.purchaseSessions,icon:CheckCircle2,tone:"amber"},
  ]:[];
  const audience=report?[...report.devices.map(d=>({label:deviceNames[d.device]??d.device,metrics:d.metrics})),...report.visitorsByType.map(d=>({label:d.returning?"زائر عائد":"زائر جديد",metrics:d.metrics}))]:[];
  return <div className="office-analytics">
    <div className="office-toolbar"><div className="office-report-period"><Activity size={18}/><span>أداء المتجر</span></div><div className="office-tools"><label className="office-inline-field">الفترة<select aria-label="فترة التقرير" value={days} onChange={e=>setDays(Number(e.target.value))}><option value={7}>آخر ٧ أيام</option><option value={30}>آخر ٣٠ يومًا</option><option value={90}>آخر ٩٠ يومًا</option></select></label><button className="office-button secondary" onClick={()=>setRevision(v=>v+1)}><RefreshCw size={16}/> تحديث</button></div></div>
    <Message message={error} error/>
    {report?.truncated&&<Message message="الفترة تجاوزت ١٠٠ ألف حدث. اختر فترة أقصر لعرض تقرير كامل." error/>}
    <div className="office-stats office-analytics-stats">{stats.map(({label,value,icon:Icon,caption},index)=><section key={label} data-tone={["blue","violet","teal","amber"][index]}><div className="office-metric-label"><span>{label}</span><Icon size={19}/></div><strong>{value}</strong><small>{caption}</small></section>)}</div>
    {!report&&!error&&<p className="office-help" role="status">جارٍ تحميل بيانات التقرير…</p>}
    <details className="office-report-help"><summary><Info size={15}/> كيف تُحسب الأرقام؟</summary><p>الأرقام تخص الزوار الذين وافقوا على القياس. قيمة الطلبات تشمل الدفع عند الاستلام المسجّل والمدفوعات الإلكترونية المؤكدة؛ ولا تمثل صافي التحصيل. المراحل اختيارية، والشراء المباشر قد يتجاوز الحقيبة.</p></details>
    {report&&<>
      <section className="office-card office-journey-card"><header><h2>مسار التحويل</h2><span className="office-badge">{number(report.sessions)} جلسة</span></header><div className="office-journey-stages">{journey.map(({label,value,icon:Icon,tone})=><article key={label} data-tone={tone}><header><span className="office-stage-icon"><Icon size={18}/></span><h3>{label}</h3></header><div className="office-stage-value"><strong>{number(value)}</strong><span>{rate(value,report.sessions)}</span></div><div className="office-stage-track" role="progressbar" aria-label={label+" من إجمالي الجلسات"} aria-valuemin={0} aria-valuemax={report.sessions||1} aria-valuenow={value}><span style={{"--office-progress":`${report.sessions?Math.min(100,value/report.sessions*100):0}%`} as CSSProperties}/></div></article>)}</div></section>
      <div className="office-insights">{[
        ["متوسط قيمة الطلب",money(Math.round(report.aovMinor),"ar")],
        ["السلة ← بدء الطلب",rate(report.bagToCheckoutSessions,report.addToCartSessions)],
        ["إكمال الطلب",rate(report.purchaseSessions,report.checkoutSessions)],
        ["جلسات الشراء المباشر",number(report.expressCheckoutSessions)],
        ["حقيبة بدون بدء طلب",number(report.abandonedCartSessions)],
        ["بدء طلب بدون شراء",number(report.abandonedCheckoutSessions)],
      ].map(([label,value],index)=><div key={label} data-tone={index>=4?"amber":["blue","teal","violet","blue"][index]}><span>{label}</span><strong>{value}</strong></div>)}</div>
      <TableFrame label="المصادر والحملات" total={report.sources.length} scope={String(days)}><table className="office-table"><thead><tr><th>المصدر</th><th>الوسيط</th><th>الحملة</th><th>الجلسات</th><th>الطلبات</th><th>قيمة الطلبات</th></tr></thead><tbody>{report.sources.length?report.sources.map((s,i)=><tr key={i}><td><bdi>{s.source||"—"}</bdi></td><td><bdi>{s.medium||"—"}</bdi></td><td><bdi>{s.campaign||"—"}</bdi></td><td>{number(s.metrics.sessions)}</td><td>{number(s.metrics.purchases)}</td><td data-sort-value={s.metrics.revenueMinor}>{money(s.metrics.revenueMinor,"ar")}</td></tr>):<EmptyRow columns={6}/>}</tbody></table></TableFrame>
      <TableFrame label="الأجهزة ونوع الزوار" total={audience.length} scope={String(days)}><table className="office-table"><thead><tr><th>الفئة</th><th>الجلسات</th><th>الطلبات</th><th>معدل التحويل</th></tr></thead><tbody>{audience.length?audience.map(d=><tr key={d.label}><td>{d.label}</td><td>{number(d.metrics.sessions)}</td><td>{number(d.metrics.purchases)}</td><td>{d.metrics.conversion.toLocaleString("ar-EG",{maximumFractionDigits:1})}٪</td></tr>):<EmptyRow columns={4}/>}</tbody></table></TableFrame>
      <div className="office-report-grid"><TableFrame label="المنتجات الأكثر مشاهدة" total={report.topViewed.length} compact scope={String(days)}><table className="office-table"><thead><tr><th>المنتج</th><th>المشاهدات</th></tr></thead><tbody>{report.topViewed.length?report.topViewed.map(p=><tr key={p.product}><td>{p.product}</td><td>{number(p.views)}</td></tr>):<EmptyRow columns={2}/>}</tbody></table></TableFrame>
      <TableFrame label="المنتجات الأكثر مبيعًا" total={report.topSelling.length} compact scope={String(days)}><table className="office-table"><thead><tr><th>المنتج</th><th>الكمية</th><th>القيمة</th></tr></thead><tbody>{report.topSelling.length?report.topSelling.map(p=><tr key={p.variantId}><td>{p.product}</td><td>{number(p.quantity)}</td><td data-sort-value={p.revenueMinor}>{money(p.revenueMinor,"ar")}</td></tr>):<EmptyRow columns={3}/>}</tbody></table></TableFrame></div>
      {report.sessions===0&&<div className="office-info-note"><Info size={18}/><p>لا توجد أحداث مسجلة في هذه الفترة. ستظهر المؤشرات مع تسجيل زيارات وافقت على القياس.</p></div>}
    </>}
  </div>;
}
