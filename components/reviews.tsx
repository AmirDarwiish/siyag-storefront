"use client";

import Link from "next/link";
import {useEffect,useRef,useState,type FormEvent} from "react";
import {ArrowUpRight,Camera,Check,ChevronLeft,ChevronRight,Star} from "lucide-react";
import {api,type Receipt} from "@/lib/store";
import {reviewPhoto,type OrderProof,type ReviewPage} from "@/lib/reviews";
import {Modal} from "./shell";
import {useStore} from "./store-context";

function Stars({rating}:{rating:number}){
  return <span className="review-stars" aria-hidden="true" dir="ltr">
    {[1,2,3,4,5].map(value=><Star key={value} size={16} fill={value<=Math.round(rating)?"currentColor":"none"}/>)}
  </span>;
}

export function ReviewButton({product,proof}:{product?:string;proof?:OrderProof}){
  const {tr,demo}=useStore();
  const [open,setOpen]=useState(false);
  const title=product?tr("Write your experience","اكتب تجربتك"):tr("Review SIYAG","قيّم تجربتك مع SIYAG");
  if(demo)return null;
  return <>
    <button type="button" className="action ink review-cta" onClick={()=>setOpen(true)}>{title}<ArrowUpRight size={15}/></button>
    <Modal open={open} onOpenChange={setOpen} title={title} className="review-modal">
      {open&&<ReviewForm product={product} proof={proof} title={title}/>}
    </Modal>
  </>;
}

function ReviewForm({product,proof,title}:{product?:string;proof?:OrderProof;title:string}){
  const {tr}=useStore();
  const [order,setOrder]=useState<OrderProof>(proof??{number:"",phone:""});
  const [verify,setVerify]=useState(Boolean(proof));
  const [rating,setRating]=useState(0);
  const [photo,setPhoto]=useState<File>();
  const photoInput=useRef<HTMLInputElement>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [sent,setSent]=useState(false);

  useEffect(()=>{
    if(proof)return;
    try{
      const receipt=JSON.parse(sessionStorage.getItem("siyag-receipt")??"null") as Receipt|null;
      if(receipt?.number)setOrder({number:receipt.number,phone:""});
    }catch{}
  },[proof]);

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(busy)return;
    if(!rating){setError(tr("Choose a star rating first.","اختار عدد النجوم الأول."));return}
    const form=new FormData(event.currentTarget);
    form.set("rating",String(rating));
    if(product)form.set("product",product);
    if(verify){
      form.set("number",order.number.trim());
      if(order.token)form.set("token",order.token);
      else form.set("phone",order.phone?.trim()??"");
    }
    setBusy(true);setError("");
    try{
      if(photo){
        try{form.set("photo",await reviewPhoto(photo),"review.jpg")}
        catch{setError(tr("Choose a photo your browser can open, up to 15 MB.","اختار صورة يقدر المتصفح يفتحها، بحجم لحد ١٥ ميجابايت."));return}
      }
      const response=await fetch("/api/siyag/store/reviews",{method:"POST",body:form});
      if(response.ok){setSent(true);return}
      const result=await response.json().catch(()=>null);
      const message=({
        "review-already-submitted":tr("We already received a review for this order.","التقييم للطلب ده وصلنا قبل كده."),
        "review-order-not-delivered":tr("You can review this order after delivery.","تقدر تقيّم الطلب بعد ما تستلمه."),
        "review-product-not-purchased":tr("This fragrance isn’t in that order.","العطر ده مش موجود في الطلب."),
        "not-found":tr("Check your order number and mobile number.","راجع رقم الطلب ورقم الموبايل."),
      } as Record<string,string>)[result?.code];
      setError(message??(response.status===429?tr("Please try again in a minute.","جرّب تاني بعد دقيقة."):tr("Could not send your review. Check the details and try again.","تعذّر إرسال التقييم. راجع البيانات وجرّب تاني.")));
    }catch{setError(tr("Could not reach the store. Try again.","تعذّر الاتصال بالمتجر. جرّب تاني."))}
    finally{setBusy(false)}
  }

  if(sent)return <div className="review-success" role="status"><Check size={26}/>
    <h2>{tr("Thank you for sharing","شكرًا إنك شاركت تجربتك")}</h2>
    <p>{tr("We received your review. It will appear after moderation.","تقييمك وصلنا وهيظهر بعد المراجعة.")}</p>
  </div>;

  return <form className="review-form" onSubmit={submit}>
    <h2>{title}</h2>
    <p>{tr("Share your experience. If you purchased from us, you can verify your review.","شارك تجربتك. لو اشتريت من SIYAG، تقدر توثّق تقييمك.")}</p>
    <fieldset disabled={busy}>
      <div className="review-rating" role="group" aria-label={tr("Star rating","التقييم بالنجوم")} dir="ltr">
        {[1,2,3,4,5].map(value=><button type="button" key={value} onClick={()=>setRating(value)}
          aria-label={tr(`Rate ${value} of 5`,`تقييم ${value} من 5`)} aria-pressed={value===rating}>
          <Star size={25} fill={value<=rating?"currentColor":"none"}/>
        </button>)}
      </div>
      <label>{tr("Public display name","الاسم اللي هيظهر في التقييم")}<input name="displayName" maxLength={60} required/></label>
      <label>{tr("Tell us about your experience","احكيلنا عن تجربتك")}<textarea name="comment" rows={3} maxLength={1200} required/></label>
      <label className="review-verify"><input type="checkbox" checked={verify} onChange={e=>setVerify(e.target.checked)}/>
        <span>{tr("Verify my purchase · optional","وثّق الشراء · اختياري")}</span></label>
      {verify&&(proof?<p className="review-verified-order"><Check size={14}/>{tr("Using your delivered order","هنستخدم طلبك اللي استلمته")}</p>:
        <div className="review-proof">
          <label>{tr("Order number","رقم الطلب")}<input dir="ltr" maxLength={20} required value={order.number}
            onChange={e=>setOrder({...order,number:e.target.value})}/></label>
          <label>{tr("Mobile used in the order","الموبايل المستخدم في الطلب")}<input type="tel" autoComplete="tel" dir="ltr" maxLength={13}
            pattern={"(?:01|\\+201)[0125][0-9]{8}"} required value={order.phone??""}
            onChange={e=>setOrder({...order,phone:e.target.value})}/></label>
        </div>)}
      <div className="review-attachment">
        <label className="review-upload"><Camera size={18}/><span>{photo?.name??tr("Add a photo · optional","أضف صورة · اختياري")}</span>
          <input ref={photoInput} className="sr-only" type="file" accept="image/*" onChange={e=>setPhoto(e.target.files?.[0])}/>
        </label>
        {photo&&<button className="text-link" type="button" onClick={()=>{
          if(photoInput.current)photoInput.current.value="";
          setPhoto(undefined);
        }}>{tr("Remove","إزالة الصورة")}</button>}
      </div>
      {error&&<p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="action ink" disabled={busy}>{busy?tr("Sending…","جاري الإرسال…"):tr("Send review","إرسال التقييم")}</button>
    </fieldset>
  </form>;
}

export function Reviews({product}:{product?:string}){
  const {tr,lang,ar,demo}=useStore();
  const [page,setPage]=useState(1);
  const [result,setResult]=useState<ReviewPage>();
  const [failed,setFailed]=useState(false);
  const [retry,setRetry]=useState(0);
  const [photo,setPhoto]=useState<{url:string;name:string}>();
  useEffect(()=>{
    if(demo)return;
    const controller=new AbortController();
    const params=new URLSearchParams({pageNumber:String(page)});
    if(product)params.set("product",product);
    setFailed(false);
    api<ReviewPage>("store/reviews?"+params,{signal:controller.signal})
      .then(setResult).catch(()=>{if(!controller.signal.aborted)setFailed(true)});
    return()=>controller.abort();
  },[demo,product,page,retry]);
  const title=product?tr("Written experiences","تجارب مكتوبة"):tr("The SIYAG experience","تجارب عملاء SIYAG");
  const summary=result?.summary;
  const Heading=product?"h2":"h1";
  const number=new Intl.NumberFormat(ar?"ar-EG":"en-EG",{maximumFractionDigits:1});
  const date=new Intl.DateTimeFormat(ar?"ar-EG":"en-GB",{dateStyle:"medium"});
  function goTo(next:number){setFailed(false);setPage(next)}
  return <section className="container reviews-section" id="reviews" aria-labelledby="reviews-title">
    <header className="reviews-heading">
      <div><span className="eyebrow">SIYAG PARFUMS</span><Heading id="reviews-title">{title}</Heading></div>
      <ReviewButton product={product}/>
    </header>
    {failed?<div className="review-empty" role="status">{tr("Reviews are temporarily unavailable.","التقييمات مش متاحة حاليًا.")}
      <button className="text-link" type="button" onClick={()=>{setFailed(false);setRetry(x=>x+1)}}>{tr("Try again","جرّب تاني")}</button></div>:
      !result&&!demo?<p className="review-empty" role="status">{tr("Loading reviews…","جاري تحميل التقييمات…")}</p>:
      !result||!summary?.count?<div className="review-empty"><Star size={23}/><div>
        <strong>{tr("Every fragrance has a story","لكل تجربة حكاية")}</strong>
        <p>{tr("Be the first to share yours.","شاركنا رأيك وابدأ أول تقييم.")}</p>
      </div></div>:<>
        <div className="review-summary">
          <div className="review-score">
            <strong>{number.format(summary.average)}</strong>
            <Stars rating={summary.average}/>
            <small>{number.format(summary.count)} {tr(summary.count===1?"review":"reviews","تقييم")}</small>
          </div>
          <div className="review-bars">
            {[5,4,3,2,1].map(rating=>{
              const count=summary.distribution.find(row=>row.rating===rating)?.count??0;
              return <div className="review-bar" key={rating}><span>{number.format(rating)}</span>
                <progress max={summary.count} value={count} aria-label={tr(`${rating} stars, ${count} reviews`,`${rating} نجوم، ${count} تقييم`)}/>
                <span>{number.format(count)}</span>
              </div>;
            })}
          </div>
        </div>
        <div className="review-grid" aria-busy={page!==result.pageNumber}>{result.data.map(review=>{
          const url="/api/siyag/store/reviews/"+review.id+"/photo";
          return <article className="review-card" key={review.id}>
            <div className="review-card-meta"><Stars rating={review.rating}/><span className="sr-only">{tr(`${review.rating} out of 5`,`${review.rating} من 5`)}</span>
              <time dateTime={review.createdAt}>{date.format(new Date(review.createdAt))}</time></div>
            <p dir="auto">{review.comment}</p>
            {review.hasPhoto&&<button type="button" className="review-thumbnail" onClick={()=>setPhoto({url,name:review.displayName})} aria-label={tr("Enlarge review photo","كبّر صورة التقييم")}><img src={url} alt="" loading="lazy"/></button>}
            <div className="review-author"><strong dir="auto">{review.displayName}</strong>{review.verifiedPurchase?<span><Check size={13}/>{tr("Verified purchase","شراء موثّق")}</span>:<span>{tr("Unverified purchase","شراء غير موثّق")}</span>}</div>
          </article>;
        })}</div>
        {result.totalPages>1&&<div className="review-pages">
          <button type="button" className="icon" disabled={page===1||page!==result.pageNumber} onClick={()=>goTo(page-1)} aria-label={tr("Previous reviews","التقييمات السابقة")}>{ar?<ChevronRight/>:<ChevronLeft/>}</button>
          <span>{number.format(page)} / {number.format(result.totalPages)}</span>
          <button type="button" className="icon" disabled={page>=result.totalPages||page!==result.pageNumber} onClick={()=>goTo(page+1)} aria-label={tr("More reviews","المزيد من التقييمات")}>{ar?<ChevronLeft/>:<ChevronRight/>}</button>
        </div>}
      </>}
    <Modal open={!!photo} onOpenChange={open=>{if(!open)setPhoto(undefined)}} title={tr("Review photo","صورة التقييم")} className="review-photo-modal">
      {photo&&<img src={photo.url} alt={tr(`Photo by ${photo.name}`,`صورة من ${photo.name}`)}/>}
    </Modal>
  </section>;
}

export function StoreReviewsLink(){
  const {tr}=useStore();
  return <section className="container store-reviews-link"><div><span className="eyebrow">SIYAG PARFUMS</span>
    <h2>{tr("The SIYAG experience","تجارب عملاء SIYAG")}</h2></div>
    <Link className="text-link" href="/reviews">{tr("Read store reviews","شوف تقييمات المتجر")}</Link>
  </section>;
}
