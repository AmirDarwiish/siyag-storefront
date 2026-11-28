"use client";
import Link from 'next/link';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {Sun,Coffee,Sparkles,Feather,Briefcase,Heart,Moon,Citrus,Cookie,Trees,Flower2,Flame,Layers,User,Users,Check,RotateCcw,type LucideIcon} from 'lucide-react';
import {useStore} from './store-context';
import {StoreImage} from './store-image';
import {ProductCard} from './product';
import {api,type Product,type Page} from '@/lib/store';
import {journeyPolicy,quizSteps,validQuizAnswers,recommendByMood,normalizeJourneyPhone,type QuizAnswers} from '@/lib/fragrance-journeys';
import {homeCatalogPolicy} from '@/lib/home-catalog';
const icons:Record<string,LucideIcon>={sun:Sun,coffee:Coffee,sparkles:Sparkles,feather:Feather,briefcase:Briefcase,heart:Heart,moon:Moon,citrus:Citrus,cookie:Cookie,trees:Trees,flower:Flower2,flame:Flame,layers:Layers,user:User,users:Users};
function JourneyHeading({title,copy}:{title:string;copy:string}){
 const {tr}=useStore();
 return <header className="journey-heading"><Link className="text-link" href="/">{tr('Home','الرئيسية')}</Link><span className="eyebrow">SIYAG PARFUMS</span><h1>{title}</h1><p>{copy}</p></header>;
}
export function CustomFragrance(){
 const {tr}=useStore();
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[receipt,setReceipt]=useState<{reference:string;createdAt:string}>();
 const [size,setSize]=useState<number>(30);
 const requestKey=useRef<{fingerprint:string;id:string}|null>(null),sending=useRef(false),confirmation=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(receipt)confirmation.current?.focus()},[receipt]);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(sending.current)return;
  const form=new FormData(event.currentTarget);
  const phone=normalizeJourneyPhone(String(form.get('phone')??''));
  if(!/^(?:01|\+201)[0125][0-9]{8}$/.test(phone)){setError(tr('Enter a valid Egyptian mobile number.','اكتب رقم موبايل مصري صحيح.'));return}
  const details={name:String(form.get('name')??'').trim(),phone,fragranceName:String(form.get('fragranceName')??'').trim(),notes:String(form.get('notes')??'').trim()||null,sizeMl:size,quantity:Number(form.get('quantity'))};
  const fingerprint=JSON.stringify(details);
  if(requestKey.current?.fingerprint!==fingerprint)requestKey.current={fingerprint,id:crypto.randomUUID()};
  sending.current=true;setBusy(true);setError('');
  try{setReceipt(await api<{reference:string;createdAt:string}>('store/fragrance-requests',{method:'POST',data:{...details,requestId:requestKey.current.id},signal:AbortSignal.timeout(20000)}))}
  catch{setError(tr('We couldn’t send your request. Your details are still here; please try again.','تعذّر إرسال الطلب. بياناتك لسه موجودة؛ جرّب تاني.'))}
  finally{sending.current=false;setBusy(false)}
 }
 return <main className="container section journey-page">
  <JourneyHeading title={tr('A scent, just for you.','عطر معمول ليك.')} copy={tr('Have a fragrance in mind? Tell us what you would love to try.','في عطر نفسك تجرّبه؟ قولّنا اسمه وذوقك، ونبدأ معاك.')} />
  <div className="journey-layout"><aside className="journey-art"><StoreImage src="/brand/journeys/custom-banner.webp" alt={tr('Inside the SIYAG fragrance atelier','من عالم صناعة عطور SIYAG')} width={900} height={900} sizes="(max-width:767px) 100vw,40vw"/><div><Sparkles aria-hidden="true"/><h2>{tr('Your idea, our starting point.','ذوقك هو البداية.')}</h2><p>{tr('We’ll confirm availability, details and price with you before anything is made.','هنأكد معاك التوفر والتفاصيل والسعر قبل التنفيذ.')}</p></div></aside>
  <section className="journey-panel" aria-label={tr('Personal fragrance request','طلب عطر خاص')}>
   {receipt?<div ref={confirmation} tabIndex={-1} className="journey-confirmation" role="status"><Check aria-hidden="true"/><h2>{tr('Your request is with SIYAG.','طلبك وصل لـSIYAG.')}</h2><p>{tr('Keep your reference. Our team will contact you to discuss your fragrance.','احتفظ برقم الطلب. فريقنا هيتواصل معاك لتأكيد تفاصيل عطرك.')}</p><strong dir="ltr">{receipt.reference}</strong><Link className="action ink" href="/shop">{tr('Explore the collection','تصفّح العطور')}</Link><button className="text-link" type="button" onClick={()=>{setReceipt(undefined);requestKey.current=null;setSize(30)}}>{tr('Make another request','طلب جديد')}</button></div>:
   <form onSubmit={submit} className="journey-form" aria-busy={busy}>
    <fieldset disabled={busy}><label>{tr('Your name','اسمك')}<input name="name" autoComplete="name" required maxLength={journeyPolicy.maxName}/></label>
    <label>{tr('Mobile number','رقم الموبايل')}<input name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required maxLength={24} placeholder="01xxxxxxxxx"/></label>
    <label>{tr('Which fragrance would you love to try?','اسم العطر اللي نفسك تجرّبه')}<input name="fragranceName" required maxLength={journeyPolicy.maxFragranceName} placeholder={tr('Name and brand, if you know them','الاسم والبراند لو تعرفهم')}/></label>
    <label>{tr('Tell us a little more (optional)','تفاصيل تحب نعرفها (اختياري)')}<textarea name="notes" rows={4} maxLength={journeyPolicy.maxNotes} placeholder={tr('The notes you love, the feeling you want, or anything you would like us to know.','النوتات اللي بتحبها، الإحساس اللي بتدور عليه، أو أي تفاصيل تهمك.')}/></label>
    <div className="journey-form-row"><fieldset className="journey-size"><legend>{tr('Bottle size','حجم الزجاجة')}</legend><div className="sizes">{journeyPolicy.sizes.map(ml=><button type="button" key={ml} aria-pressed={size===ml} onClick={()=>setSize(ml)}>{ml} {tr('ml','مل')}</button>)}</div></fieldset><label>{tr('Quantity','العدد')}<input name="quantity" type="number" inputMode="numeric" min={1} max={journeyPolicy.maxQuantity} defaultValue={1} required/></label></div>
    <p className="muted">{tr('This is a personal request. Price and availability are confirmed before you commit.','ده طلب خاص؛ السعر والتوفر بيتأكدوا معاك قبل التنفيذ.')}</p>
    {error&&<p className="form-error" role="alert">{error}</p>}<button className="action ink" type="submit" disabled={busy}>{busy?tr('Sending…','جاري الإرسال…'):tr('Send my request','ابعت طلبي')}</button></fieldset>
   </form>}
  </section></div>
 </main>;
}
export function ScentFinder({initialProducts}:{initialProducts:Product[]}){
 const {tr}=useStore();
 const [answers,setAnswers]=useState<QuizAnswers>({}),[step,setStep]=useState(0),[complete,setComplete]=useState(false),[products,setProducts]=useState(initialProducts),[loading,setLoading]=useState(true),[failed,setFailed]=useState(false);
 const focus=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{
  const controller=new AbortController();
  api<Page<Product>>('store/products?pageSize=100',{signal:AbortSignal.any([controller.signal,AbortSignal.timeout(homeCatalogPolicy.clientTimeoutMs)])}).then(page=>{setProducts(page.data);setFailed(page.data.some(p=>p.inventoryStatus==='unavailable'))}).catch(()=>{if(!controller.signal.aborted){setFailed(true);setProducts(current=>current.map(p=>({...p,inventoryStatus:'unavailable',variants:p.variants.map(v=>({...v,inStock:false}))})))}}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});
  return()=>controller.abort();
 },[]);
 useEffect(()=>{focus.current?.focus()},[step,complete]);
 const current=quizSteps[step],matches=complete?recommendByMood(products,answers):[];
 function restart(){setComplete(false);setAnswers({});setStep(0)}
 const selected=current.options.some(option=>option.id===answers[current.key]);
 return <main className="container section journey-page">
  <JourneyHeading title={tr('Your mood. Your fragrance.','عطرك على مودك.')} copy={tr('Four simple choices. Discover a few fragrances that feel like you.','أربع اختيارات بسيطة، ونرشّح لك عطور قريبة من ذوقك.')} />
  {!complete?<section className="journey-quiz journey-panel" aria-labelledby="quiz-question">
   <ol className="journey-progress" aria-label={tr('Your progress','خطواتك')}>{quizSteps.map((item,index)=><li key={item.key} aria-current={index===step?'step':undefined} data-complete={index<step}><span>{index+1}</span>{tr(item.en,item.ar)}</li>)}</ol>
   <h2 id="quiz-question" ref={focus} tabIndex={-1}>{tr(current.en,current.ar)}</h2><p className="muted">{tr(current.hintEn,current.hintAr)}</p>
   <div className="journey-options" role="group" aria-label={tr(current.en,current.ar)}>{current.options.map(option=>{const Icon=icons[option.icon]??Sparkles;return <button type="button" key={option.id} className="journey-option" aria-pressed={answers[current.key]===option.id} onClick={()=>setAnswers(old=>({...old,[current.key]:option.id}))}><Icon aria-hidden="true"/><span>{tr(option.en,option.ar)}</span>{answers[current.key]===option.id&&<Check className="journey-option-check" aria-hidden="true"/>}</button>})}</div>
   <div className="journey-navigation"><button type="button" className="text-link" disabled={step===0} onClick={()=>setStep(value=>value-1)}>{tr('Back','رجوع')}</button><button className="action ink" type="button" disabled={!selected} onClick={()=>{if(step===quizSteps.length-1){if(validQuizAnswers(answers))setComplete(true)}else setStep(value=>value+1)}}>{step===quizSteps.length-1?tr('Show my matches','ورّيني الترشيحات'):tr('Continue','كمّل')}</button></div>
  </section>:<section className="journey-results" aria-labelledby="quiz-results"><div className="section-head"><div><span className="eyebrow">{tr('CHOSEN FOR YOUR MOOD','اختيارات على مودك')}</span><h2 id="quiz-results" ref={focus} tabIndex={-1}>{tr('Meet your matches.','دي ترشيحاتنا ليك.')}</h2></div><button type="button" className="text-link" onClick={restart}><RotateCcw aria-hidden="true"/>{tr('Start again','نبدأ من جديد')}</button></div>
   {(loading||failed)&&<p role="status" className="muted">{loading?tr('Checking current availability…','بنراجع التوفر الحالي…'):tr('You can explore your matches. Availability could not be updated right now.','تقدر تتصفح الترشيحات، لكن تعذّر تحديث التوفر حاليًا.')}</p>}
   {!loading&&!failed&&matches.length>0&&!matches.some(match=>match.product.variants.some(v=>v.inStock))&&<p className="muted">{tr('These matches are currently sold out. You can explore their profiles or tell us what you would like.','الترشيحات دي غير متاحة حاليًا. تقدر تتصفح تفاصيلها أو تطلب مننا عطر يناسبك.')}</p>}
   <div className="product-grid">{matches.map(({product,reasons})=><div key={product.id} className="journey-match"><p className="journey-match-reason">{reasons.length?reasons.map(reason=>{const field=quizSteps.find(q=>q.key===(reason==='note'?'note':reason==='mood'?'mood':'occasion'))!;const option=field.options.find(o=>o.id===answers[field.key])!;return tr(option.en,option.ar)}).join(' · '):tr('Another fragrance to explore','عطر آخر يستحق التجربة')}</p><ProductCard product={product}/></div>)}</div>
   <div className="journey-result-footer"><p>{tr('Have something else in mind?','في بالك عطر تاني؟')}</p><Link className="text-link" href="/custom-fragrance">{tr('Ask for a personal fragrance','اطلب عطر مخصوص ليك')}</Link><Link className="text-link" href="/shop">{tr('Explore all fragrances','تصفّح كل العطور')}</Link></div>
  </section>}
 </main>;
}
