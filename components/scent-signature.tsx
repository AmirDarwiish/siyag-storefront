'use client';
import {useEffect,useRef,useState} from 'react';
import {Check,Flower2,Leaf,Moon,Snowflake,Star,Sun,Sunrise,ArrowUpRight} from 'lucide-react';
import {families,name,type Product} from '@/lib/store';
import {noteName} from '@/lib/scent-profile';
import {emptyImpression,impressions,type ImpressionSelection,type ImpressionView,type ImpressionCount} from '@/lib/impressions';
import {Modal} from './shell';
import {useStore} from './store-context';

export function ScentSignature({product}:{product:Product}){
 const {tr,ar,lang,demo}=useStore();
 const [view,setView]=useState<ImpressionView>();
 const [selection,setSelection]=useState<ImpressionSelection>(emptyImpression);
 const [loading,setLoading]=useState(!demo);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [failure,setFailure]=useState(false);
 const [dirty,setDirty]=useState(false);
 const [open,setOpen]=useState(false);
 const [step,setStep]=useState(0);
 const lock=useRef(false);
 useEffect(()=>{
  if(demo)return;
  const controller=new AbortController();
  impressions(product.slug,'GET',undefined,controller.signal).then(result=>{setView(result);setSelection(result.selection??emptyImpression());setFailure(false)}).catch(()=>{if(!controller.signal.aborted)setFailure(true)}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});
  return()=>controller.abort();
 },[demo,product.slug]);
 function toggle(field:'seasons'|'times'|'notes',value:string){setSelection(old=>({...old,[field]:old[field].includes(value)?old[field].filter(v=>v!==value):[...old[field],value]}));setDirty(true);setMessage('')}
 function begin(){setSelection(view?.selection??emptyImpression());setDirty(false);setStep(0);setMessage('');setOpen(true)}
 async function save(remove=false){
  if(lock.current||demo)return;lock.current=true;setBusy(true);setMessage('');
  try{const result=await impressions(product.slug,remove?'DELETE':'PUT',remove?undefined:selection);setView(result);setSelection(result.selection??emptyImpression());setDirty(false);setFailure(false);setMessage(remove?tr('Your impression was removed.','تم مسح اختياراتك.'):tr('Thank you. Your impression is saved.','شكرًا ليك. تم حفظ رأيك.'));setOpen(false)}
  catch(error){setFailure(true);setMessage(error instanceof Error&&error.message==='storage-unavailable'?tr('Allow browser storage to save your impression.','اسمح بالتخزين في المتصفح عشان تحفظ رأيك.'):error instanceof Error&&error.message==='rate-limited'?tr('Please wait a minute and try again.','استنى دقيقة وجرّب تاني.'):tr('Your impression was not saved. Please try again.','رأيك ما اتحفظش. جرّب تاني.'))}
  finally{lock.current=false;setBusy(false)}
 }
 const layers=[{caption:tr('Opening','الافتتاحية'),notes:product.topNotes},{caption:tr('Heart','القلب'),notes:product.heartNotes},{caption:tr('Base','القاعدة'),notes:product.baseNotes}];
 const seasons=[{id:'spring',label:tr('Spring','ربيع'),icon:Flower2},{id:'summer',label:tr('Summer','صيف'),icon:Sun},{id:'autumn',label:tr('Autumn','خريف'),icon:Leaf},{id:'winter',label:tr('Winter','شتاء'),icon:Snowflake}];
 const times=[{id:'day',label:tr('Daytime','نهار'),icon:Sunrise},{id:'night',label:tr('Evening','ليل'),icon:Moon}];
 const number=new Intl.NumberFormat(ar?'ar-EG':'en-EG',{maximumFractionDigits:1});
 const votes=(rows:ImpressionCount[]|undefined,id:string)=>rows?.find(row=>row.value.toLowerCase()===id.toLowerCase())?.count??0;
 const hasChoice=selection.seasons.length+selection.times.length+selection.notes.length>0||selection.rating!==null;
 const ratingLabels=[tr('Not for me','مش مناسب ليّ'),tr('Not quite','أقل من توقعي'),tr('It’s good','عطر كويس'),tr('I like it','عجبني'),tr('Love it','عجبني جدًا')];
 const stepTitles=[tr('How did it feel?','العطر كان عامل إزاي؟'),tr('When would you wear it?','تختاره إمتى؟'),tr('What did you notice?','حسّيت بإيه في العطر؟')];
 const noteCount=Array.from(new Set(layers.flatMap(l=>l.notes))).length;
 return <section className="container scent-signature" aria-labelledby="scent-signature-title">
  <header className="signature-heading"><div><span className="eyebrow">THE SIYAG SIGNATURE</span><h2 id="scent-signature-title">{tr('Inside the fragrance','داخل العطر')}</h2><p>{tr(`The composition of ${name(product,lang)}, and the impressions it leaves.`,`تكوين ${name(product,lang)}، والانطباع اللي بيسيبه.`)}</p></div><span className="signature-family">{families[product.family]?.[ar?1:0]??product.family}</span></header>
  <div className="signature-overview">
   <div className="composition-story"><h3>{tr('The notes','النوتات العطرية')}</h3><p>{tr('From the first impression to the final trace.','من أول انطباع لآخر أثر.')}</p><dl className="composition-layers">{layers.filter(layer=>layer.notes.length).map((layer,i)=><div key={layer.caption}><dt><span aria-hidden="true">0{i+1}</span>{layer.caption}</dt><dd>{layer.notes.map((note,n)=><span key={note+n} dir="auto">{noteName(note,ar)}</span>)}</dd></div>)}</dl>{!noteCount&&<p>{tr('The composition will be listed soon.','تفاصيل التكوين هتتضاف قريب.')}</p>}</div>
   <div className="community-overview"><div className="community-score"><span className="score-number">{view?.summary.ratingCount?number.format(view.summary.averageRating!):'—'}</span><div><span className="score-stars" aria-hidden="true">{[1,2,3,4,5].map(n=><Star key={n} size={14} strokeWidth={1.2} fill={view?.summary.averageRating&&n<=Math.round(view.summary.averageRating)?'currentColor':'none'}/>)}</span><p>{loading?tr('Loading impressions…','جاري تحميل الآراء…'):view?.summary.ratingCount?tr(`${number.format(view.summary.ratingCount)} community ratings`,`${number.format(view.summary.ratingCount)} تقييم من المجتمع`):tr('Your impression could be the first.','ممكن يكون رأيك هو أول انطباع.')}</p></div></div>
    <h3>{tr('A moment for this scent','وقت يناسب العطر')}</h3>
    {view&&view.summary.participants>0?<><div className="moment-results">{seasons.map(({id,label,icon:Icon})=>{const count=votes(view.summary.seasons,id);return <div key={id}><Icon size={19} strokeWidth={1.2}/><span>{label}</span><progress max={view.summary.participants} value={count} aria-label={`${label}: ${count}`}/><small>{number.format(count)}</small></div>})}</div><div className="time-results">{times.map(({id,label,icon:Icon})=><span key={id}><Icon size={17} strokeWidth={1.2}/>{label}<strong>{number.format(votes(view.summary.times,id))}</strong></span>)}</div></>:<p className="community-empty">{tr('Share the seasons, moments and notes that felt right to you.','شاركنا المواسم والأوقات والنوتات الأقرب لإحساسك.')}</p>}
    <button className="action ink impression-start" type="button" onClick={begin} disabled={loading}>{view?.selection?tr('Edit your impression','عدّل انطباعك'):tr('Share your impression','شارك انطباعك')}<ArrowUpRight size={16}/></button><small className="community-footnote">{tr('No account needed. Your choices stay editable.','بدون حساب، وتقدر تعدّل اختياراتك.')}</small>
   </div>
  </div>
  {message&&!open&&<p className="community-status" role="status">{message}</p>}
  {failure&&!message&&!open&&<p className="community-status">{tr('Community results are temporarily unavailable. You can still prepare your impression.','نتائج المجتمع مش متاحة مؤقتًا. تقدر تجهّز انطباعك وتحاول الحفظ.')}</p>}
  <Modal open={open} onOpenChange={value=>{if(!busy)setOpen(value)}} title={tr('Share your impression','شارك انطباعك')} className="impression-modal">
   <header className="impression-modal-heading"><span className="eyebrow">{name(product,lang)} · {tr('YOUR IMPRESSION','انطباعك')}</span><h2>{stepTitles[step]}</h2><p>{step===0?tr('Start with your overall impression. Every question is optional.','ابدأ بإحساسك العام. كل الاختيارات اختيارية.'):step===1?tr('Choose the seasons and moments that fit. You can choose more than one.','اختار المواسم والأوقات المناسبة. ممكن تختار أكتر من واحد.'):tr('Choose the notes you recognised. You can leave this blank.','اختار النوتات اللي ميّزتها. ممكن تسيب الخطوة دي فاضية.')}</p><div className="impression-stepper" aria-label={tr(`Step ${step+1} of 3`,`خطوة ${step+1} من 3`)}>{[0,1,2].map(i=><span key={i} data-active={i<=step}/>)}</div></header>
   <div className="impression-modal-body"><fieldset disabled={busy}><legend className="sr-only">{stepTitles[step]}</legend>
    {step===0&&<div className="rating-question"><div className="impression-stars" role="group" aria-label={tr('Your rating','تقييمك')} dir="ltr">{[1,2,3,4,5].map(rating=><button type="button" key={rating} aria-pressed={selection.rating===rating} aria-label={tr(`Rate ${rating} of 5`,`تقييم ${rating} من 5`)} onClick={()=>{setSelection(old=>({...old,rating:rating===old.rating?null:rating}));setDirty(true);setMessage('')}}><Star size={34} strokeWidth={1} fill={rating<=(selection.rating??0)?'currentColor':'none'}/></button>)}</div><p aria-live="polite">{selection.rating?ratingLabels[selection.rating-1]:tr('Tap a star to choose','اضغط على نجمة للاختيار')}</p><small>{selection.rating?`${selection.rating} / 5`:tr('You can skip this step.','ممكن تتخطّى الخطوة دي.')}</small></div>}
    {step===1&&<><div className="season-grid" role="group" aria-label={tr('Choose seasons','اختار المواسم')}>{seasons.map(({id,label,icon:Icon})=><button className="season-choice" type="button" key={id} aria-pressed={selection.seasons.includes(id)} onClick={()=>toggle('seasons',id)}><Icon size={27} strokeWidth={1.2}/><strong>{label}</strong>{selection.seasons.includes(id)&&<Check size={14}/>}</button>)}</div><div className="day-night" role="group" aria-label={tr('Choose time of day','اختار وقت اليوم')}>{times.map(({id,label,icon:Icon})=><button type="button" key={id} aria-pressed={selection.times.includes(id)} onClick={()=>toggle('times',id)}><Icon size={22} strokeWidth={1.2}/><span>{label}</span>{selection.times.includes(id)&&<Check size={14}/>}</button>)}</div></>}
    {step===2&&<div className="note-question">{layers.filter(l=>l.notes.length).map(layer=><div key={layer.caption}><h3>{layer.caption}</h3><div className="note-choices">{layer.notes.map((note,i)=><button type="button" key={note+i} aria-pressed={selection.notes.includes(note)} onClick={()=>toggle('notes',note)}><span>{noteName(note,ar)}</span>{selection.notes.includes(note)&&<Check size={14}/>}</button>)}</div></div>)}{!noteCount&&<p>{tr('No notes are listed yet. You can save your other choices.','مفيش نوتات مسجّلة لسه. تقدر تحفظ باقي اختياراتك.')}</p>}<p className="selection-recap">{tr('Your selections','اختياراتك')}: {selection.rating?`${selection.rating}/5 · `:''}{selection.seasons.length+selection.times.length+selection.notes.length} {tr('choices','اختيارات')}</p></div>}
   </fieldset>{message&&<p className="community-status" role={failure?'alert':'status'}>{message}</p>}{!hasChoice&&step===2&&<p className="community-status">{tr('Choose at least one impression to save.','اختار تقييم أو موسم أو نوتة واحدة على الأقل للحفظ.')}</p>}{demo&&step===2&&<p className="community-status">{tr('Preview only. Public voting is disabled here.','معاينة فقط. حفظ التصويت متوقف هنا.')}</p>}</div>
   <footer className="impression-modal-footer"><div className="impression-navigation">{step>0?<button type="button" className="impression-back" disabled={busy} onClick={()=>setStep(s=>s-1)}>{tr('Back','رجوع')}</button>:<button type="button" className="impression-back" onClick={()=>setOpen(false)}>{tr('Not now','مش دلوقتي')}</button>}{step<2?<button className="action ink" type="button" onClick={()=>setStep(s=>s+1)}>{tr('Continue','التالي')}</button>:<button className="action ink" type="button" disabled={demo||!hasChoice||!dirty||busy} onClick={()=>void save()}>{busy?tr('Saving…','جاري الحفظ…'):tr('Save my impression','احفظ انطباعي')}</button>}</div>{view?.selection&&step===0&&<button className="impression-remove" type="button" disabled={busy} onClick={()=>void save(true)}>{tr('Remove my saved impression','مسح انطباعي المحفوظ')}</button>}</footer>
  </Modal>
 </section>;
}
