'use client';
import {useEffect,useState} from 'react';
import {ArrowUpRight,Flower2,Leaf,Moon,Snowflake,Star,Sun,Sunrise} from 'lucide-react';
import {api,families,name,type Product} from '@/lib/store';
import type {ReviewPage} from '@/lib/reviews';
import {noteName,scentGuide,type Fit} from '@/lib/scent-profile';
import {ReviewButton} from './reviews';
import {useStore} from './store-context';

export function ScentSignature({product}:{product:Product}){
 const {tr,ar,lang,demo}=useStore();
 const [reviews,setReviews]=useState<ReviewPage['summary']>();
 const [reviewState,setReviewState]=useState<'loading'|'ready'|'error'>(demo?'ready':'loading');
 const [stage,setStage]=useState(0);
 useEffect(()=>{
  if(demo)return;
  const controller=new AbortController();setReviews(undefined);setReviewState('loading');
  api<ReviewPage>('store/reviews?'+new URLSearchParams({product:product.slug,pageNumber:'1'}),{signal:controller.signal})
   .then(page=>{setReviews(page.summary);setReviewState('ready')}).catch(()=>{if(!controller.signal.aborted)setReviewState('error')});
  return()=>controller.abort();
 },[demo,product.slug]);
 const guide=scentGuide(product);
 const fits:Record<Fit,string>={natural:tr('A natural fit','اختيار مناسب'),versatile:tr('Also suits','يناسبه كمان'),personal:tr('Your preference','حسب ذوقك')};
 const stages=[{label:tr('The first impression','أول انطباع'),caption:tr('Opening notes','النوتات الافتتاحية'),text:tr('The introduction to the fragrance.','البداية اللي بتستقبلك مع أول رشة.'),notes:product.topNotes},
  {label:tr('The character','شخصية العطر'),caption:tr('Heart notes','نوتات القلب'),text:tr('The notes at the heart of the composition.','قلب التكوين اللي بيدي العطر شخصيته.'),notes:product.heartNotes},
  {label:tr('The lasting impression','الأثر الأخير'),caption:tr('Base notes','نوتات القاعدة'),text:tr('The foundation of the composition.','القاعدة اللي بتكمل حكاية العطر.'),notes:product.baseNotes}];
 const seasons=[{id:'spring',label:tr('Spring','الربيع'),icon:Flower2},{id:'summer',label:tr('Summer','الصيف'),icon:Sun},{id:'autumn',label:tr('Autumn','الخريف'),icon:Leaf},{id:'winter',label:tr('Winter','الشتاء'),icon:Snowflake}] as const;
 const number=new Intl.NumberFormat(ar?'ar-EG':'en-EG',{maximumFractionDigits:1});
 return <section className="container scent-signature" aria-labelledby="scent-signature-title">
  <header className="signature-heading"><div><span className="eyebrow">THE SIYAG SIGNATURE</span><h2 id="scent-signature-title">{tr('A fragrance. Your signature.','عطر له بصمة. والباقي عليك.')}</h2><p>{tr(`Get to know ${name(product,lang)}, beyond the bottle.`,`اتعرّف على ${name(product,lang)} من أول نوتة لآخر أثر.`)}</p></div><span className="signature-family">{families[product.family]?.[ar?1:0]??product.family}</span></header>
  <div className="signature-layout">
   <div className="scent-composition"><div className="signature-label"><span>01</span>{tr('The composition','حكاية النوتات')}</div>
    <div className="note-tabs" role="tablist" aria-label={tr('Fragrance journey','رحلة العطر')}>
     {stages.map((s,i)=><button type="button" role="tab" key={s.caption} id={`note-tab-${i}`} aria-selected={stage===i} aria-controls={`note-stage-${i}`} tabIndex={stage===i?0:-1} onClick={()=>setStage(i)} onKeyDown={event=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?2:(i+(event.key==='ArrowRight'?(ar?-1:1):(ar?1:-1))+3)%3;setStage(next);document.getElementById(`note-tab-${next}`)?.focus()}}}><span>{String(i+1).padStart(2,'0')}</span>{s.caption}</button>)}
    </div>
    <div className="note-stage" id={`note-stage-${stage}`} role="tabpanel" aria-labelledby={`note-tab-${stage}`} tabIndex={0}>
     <div className="note-orbit" aria-hidden="true"><div/><span>{String(stage+1).padStart(2,'0')}</span><div/></div><h3>{stages[stage].label}</h3><p>{stages[stage].text}</p>
     {stages[stage].notes.length?<ul className="note-petals">{stages[stage].notes.map((note,i)=><li key={note+i}><Leaf size={17} strokeWidth={1.2}/><span dir="auto">{noteName(note,ar)}</span></li>)}</ul>:<p>{tr('Notes for this stage have not been listed yet.','نوتات المرحلة دي لسه ما اتضافتش.')}</p>}
    </div>
    <div className="composition-preview">{stages.map((s,i)=><div key={i}><small>{s.caption}</small><p dir="auto">{s.notes.length?s.notes.map(n=>noteName(n,ar)).join(' · '):'—'}</p></div>)}</div>
   </div>
   <div className="signature-context">
    <div className="scent-moments"><div className="signature-label"><span>02</span>{tr('Find its moment','اختار له وقته')}</div>
     {guide?<><div className="season-grid">{seasons.map(({id,label,icon:Icon})=><div className="season-tile" data-fit={guide.seasons[id]} key={id}><Icon size={23} strokeWidth={1.3}/><strong>{label}</strong><small>{fits[guide.seasons[id]]}</small><span className="fit-marks" aria-hidden="true">{[0,1,2].map(n=><i key={n} data-filled={n<(guide.seasons[id]==='natural'?3:guide.seasons[id]==='versatile'?2:1)}/>)}</span></div>)}</div>
      <div className="day-night">{[{label:tr('By day','بالنهار'),icon:Sunrise,fit:guide.day},{label:tr('After dark','بعد الغروب'),icon:Moon,fit:guide.night}].map(({label,icon:Icon,fit})=><div key={label}><Icon size={21} strokeWidth={1.3}/><span><strong>{label}</strong><small>{fits[fit]}</small></span></div>)}</div>
      <p className="scent-guidance">{tr('Discovery guidance based on the fragrance family and listed notes. Your skin, weather and taste make the final choice.','دليل استكشافي مبني على العائلة العطرية والنوتات المذكورة. بشرتك والجو وذوقك هم الفيصل.')}</p></>:<p className="scent-guidance">{tr('Season and time-of-day guidance is not available for this composition yet.','دليل المواسم والأوقات للتكوين ده لسه مش متاح.')}</p>}
    </div>
    <div className="signature-rating"><div className="signature-label"><span>03</span>{tr('Your impressions','انطباعاتكم')}</div>
     <div className="signature-rating-body"><span className="rating-seal" aria-hidden="true"><Star size={27} strokeWidth={1.2}/></span><div>{reviewState==='loading'?<p role="status">{tr('Loading real reviews…','جاري تحميل التقييمات…')}</p>:reviewState==='error'?<p>{tr('Reviews are temporarily unavailable.','التقييمات مش متاحة حاليًا.')}</p>:reviews?.count?<><strong className="signature-score">{number.format(reviews.average)}<small>/ 5</small></strong><p>{number.format(reviews.count)} {tr('published reviews','تقييم منشور')}</p></>:<><strong>{tr('Be the first impression','خليك أول انطباع')}</strong><p>{tr('No published ratings yet. Tell us how it feels to you.','لسه مفيش تقييمات منشورة. احكيلنا العطر حسّسك بإيه.')}</p></>}</div></div>
     <div className="signature-review-actions"><ReviewButton product={product.slug}/><a className="text-link" href="#reviews">{tr('Read the stories','اقرأ التجارب')}<ArrowUpRight size={15}/></a></div>
    </div>
   </div>
  </div>
 </section>;
}
