"use client";
import {useEffect,useState} from "react";
import {office,orderDate} from "@/lib/admin";
import type {Page} from "@/lib/store";
import type {Review} from "@/lib/reviews";
import {Message} from "./shared";

type Status="pending"|"approved"|"rejected";
type AdminReview=Review&{status:Status;productName?:string|null};
const labels:Record<Status,string>={pending:"بانتظار المراجعة",approved:"منشورة",rejected:"مخفية"};

export function ReviewModeration(){
  const [status,setStatus]=useState<Status>("pending");
  const [page,setPage]=useState(1);
  const [result,setResult]=useState<Page<AdminReview>>();
  const [revision,refresh]=useState(0);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  useEffect(()=>{
    const controller=new AbortController();
    office<Page<AdminReview>>(`reviews?status=${status}&pageNumber=${page}&pageSize=12`,{signal:controller.signal})
      .then(setResult).catch(error=>{if(!controller.signal.aborted)setError(error.message)});
    return()=>controller.abort();
  },[status,page,revision]);
  async function moderate(id:string,next:Status){
    setBusy(true);setError("");
    try{
      await office("reviews/"+id,{method:"PUT",data:{status:next}});
      setResult(undefined);
      if(result?.data.length===1&&page>1)setPage(page-1);
      else refresh(value=>value+1);
    }catch(error){setError(error instanceof Error?error.message:"تعذّر تحديث التقييم.")}
    finally{setBusy(false)}
  }
  return <section className="office-card">
    <label>حالة التقييمات <select value={status} onChange={e=>{setStatus(e.target.value as Status);setPage(1);setResult(undefined);setError("")}}>
      {Object.entries(labels).map(([value,label])=><option key={value} value={value}>{label}</option>)}
    </select></label>
    <Message message={error} error/>
    {!result&&!error&&<p role="status">جاري تحميل التقييمات…</p>}
    {result?.data.length===0&&<p>مفيش تقييمات في الحالة دي.</p>}
    {result?.data.map(review=><article key={review.id} className="office-review">
      <div><strong>{review.productName??"تقييم المتجر"}</strong><span>{review.rating} / 5 · {orderDate(review.createdAt)}</span></div>
      <p><strong dir="auto">{review.displayName}</strong> · {review.verifiedPurchase?"شراء موثّق":"تقييم زائر"}</p>
      <p dir="auto">{review.comment}</p>
      {review.hasPhoto&&<a className="office-text-button" href={`/api/office/reviews/${review.id}/photo`} target="_blank" rel="noreferrer">عرض الصورة</a>}
      <div>
        {status!=="approved"&&<button type="button" className="office-button" disabled={busy} onClick={()=>void moderate(review.id,"approved")}>نشر التقييم</button>}
        {status!=="rejected"&&<button type="button" className="office-button secondary" disabled={busy} onClick={()=>void moderate(review.id,"rejected")}>إخفاء التقييم</button>}
      </div>
    </article>)}
    {result&&result.totalPages>1&&<div className="office-review-pages">
      <button type="button" className="office-button secondary" disabled={page===1||busy} onClick={()=>{setResult(undefined);setPage(page-1)}}>السابق</button>
      <span>{page} / {result.totalPages}</span>
      <button type="button" className="office-button secondary" disabled={page>=result.totalPages||busy} onClick={()=>{setResult(undefined);setPage(page+1)}}>التالي</button>
    </div>}
  </section>;
}
