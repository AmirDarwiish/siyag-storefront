'use client';
import {useEffect,useRef,useState} from 'react';
import {Check,Flower2,Leaf,Moon,Snowflake,Star,Sun,Sunrise} from 'lucide-react';
import {families,name,type Product} from '@/lib/store';
import {noteName} from '@/lib/scent-profile';
import {emptyImpression,impressions,type ImpressionSelection,type ImpressionView,type ImpressionCount} from '@/lib/impressions';
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
 const [stage,setStage]=useState(0);
 const lock=useRef(false);
 useEffect(()=>{
  if(demo)return;
  const controller=new AbortController();
  impressions(product.slug,'GET',undefined,controller.signal).then(result=>{setView(result);setSelection(result.selection??emptyImpression());setFailure(false)}).catch(()=>{if(!controller.signal.aborted)setFailure(true)}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});
  return()=>controller.abort();
 },[demo,product.slug]);
 function toggle(field:'seasons'|'times'|'notes',value:string){setSelection(old=>({...old,[field]:old[field].includes(value)?old[field].filter(v=>v!==value):[...old[field],value]}));setDirty(true);setMessage('')}
 async function save(remove=false){
  if(lock.current||demo)return;lock.current=true;setBusy(true);setMessage('');
  try{const result=await impressions(product.slug,remove?'DELETE':'PUT',remove?undefined:selection);setView(result);setSelection(result.selection??emptyImpression());setDirty(false);setFailure(false);setMessage(remove?tr('Your impression was removed.','تم مسح اختياراتك.'):tr('Your impression is saved. You can change it any time.','تم حفظ رأيك. تقدر تعدّله في أي وقت.'))}
  catch(error){setFailure(true);setMessage(error instanceof Error&&error.message==='storage-unavailable'?tr('Allow browser storage to save and later edit your impression.','اسمح بالتخزين في المتصفح عشان تحفظ رأيك وتقدر تعدّله.'):error instanceof Error&&error.message==='rate-limited'?tr('Please wait a minute and try again.','استنى دقيقة وجرّب تاني.'):tr('Voting is temporarily unavailable. Your choices have not been saved.','التصويت مش متاح حاليًا. اختياراتك لم تُحفظ بعد.'))}
  finally{lock.current=false;setBusy(false)}
 }
 const stages=[{caption:tr('Opening','الافتتاحية'),title:tr('The first impression','أول انطباع'),notes:product.topNotes},{caption:tr('Heart','القلب'),title:tr('The character','شخصية العطر'),notes:product.heartNotes},{caption:tr('Base','القاعدة'),title:tr('The final impression','الأثر الأخير'),notes:product.baseNotes}];
 const seasons=[{id:'spring',label:tr('Spring','ربيع'),icon:Flower2},{id:'summer',label:tr('Summer','صيف'),icon:Sun},{id:'autumn',label:tr('Autumn','خريف'),icon:Leaf},{id:'winter',label:tr('Winter','شتاء'),icon:Snowflake}];
 const times=[{id:'day',label:tr('Daytime','نهار'),icon:Sunrise},{id:'night',label:tr('Evening','ليل'),icon:Moon}];
 const number=new Intl.NumberFormat(ar?'ar-EG':'en-EG',{maximumFractionDigits:1});
 const votes=(rows:ImpressionCount[]|undefined,id:string)=>rows?.find(row=>row.value.toLowerCase()===id.toLowerCase())?.count??0;
 const countLabel=(rows:ImpressionCount[]|undefined,id:string)=>view?tr(`${votes(rows,id)} votes`,`${number.format(votes(rows,id))} صوت`):'—';
 const hasChoice=selection.seasons.length+selection.times.length+selection.notes.length>0||selection.rating!==null;
 return <section className="container scent-signature" aria-labelledby="scent-signature-title">
  <header className="signature-heading"><div><span className="eyebrow">THE SIYAG SIGNATURE</span><h2 id="scent-signature-title">{tr('The scent, through your senses.','بصمة العطر، بإحساسك.')}</h2><p>{tr(`How does ${name(product,lang)} feel to you? Choose what you notice.`,`إيه إحساسك مع ${name(product,lang)}؟ اختار النوتات والمواسم الأقرب لتجربتك.`)}</p></div><span className="signature-family">{families[product.family]?.[ar?1:0]??product.family}</span></header>
  {loading&&<p className="community-status" role="status">{tr('Loading community impressions…','جاري تحميل آراء المجتمع…')}</p>}
  <fieldset className="signature-fieldset" disabled={busy||loading}>
   <legend className="sr-only">{tr('Your fragrance impression','انطباعك عن العطر')}</legend>
   <div className="signature-layout">
    <div className="scent-composition"><div className="signature-label">{tr('01 / The notes you notice','01 / النوتات اللي حسّيت بيها')}</div>
     <p className="community-hint">{tr('The composition comes from SIYAG. Tap the notes you recognise in your own experience.','دي النوتات المسجلة للعطر. اضغط على اللي حسّيت بيه في تجربتك.')}</p>
     <div className="note-tabs" role="tablist" aria-label={tr('Fragrance layers','طبقات العطر')}>{stages.map((s,i)=><button type="button" role="tab" key={s.caption} id={`note-tab-${i}`} aria-selected={stage===i} aria-controls={`note-stage-${i}`} tabIndex={stage===i?0:-1} onClick={()=>setStage(i)} onKeyDown={event=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?2:(i+(event.key==='ArrowRight'?(ar?-1:1):(ar?1:-1))+3)%3;setStage(next);document.getElementById(`note-tab-${next}`)?.focus()}}}>{s.caption}</button>)}</div>
     <div className="note-stage" role="tabpanel" id={`note-stage-${stage}`} aria-labelledby={`note-tab-${stage}`}><h3>{stages[stage].title}</h3><div className="note-choices">{stages[stage].notes.map((note,i)=><button type="button" key={note+i} aria-pressed={selection.notes.includes(note)} onClick={()=>toggle('notes',note)}><span className="choice-tick" aria-hidden="true">{selection.notes.includes(note)&&<Check size={13}/>}</span><span dir="auto">{noteName(note,ar)}</span><small>{countLabel(view?.summary.notes,note)}</small></button>)}{!stages[stage].notes.length&&<p>{tr('No notes listed for this layer yet.','لم تُضف نوتات لهذه المرحلة بعد.')}</p>}</div></div>
     <div className="selected-notes"><small>{tr('Your selected notes','النوتات اللي اخترتها')}</small><p>{selection.notes.length?selection.notes.map(n=>noteName(n,ar)).join(' · '):tr('Select notes from any layer.','اختار من أي طبقة فوق.')}</p></div>
    </div>
    <div className="signature-context"><div className="scent-moments"><div className="signature-label">{tr('02 / When would you wear it?','02 / تختاره إمتى؟')}</div><p className="community-hint">{tr('Choose more than one. Counts reflect saved community choices.','تقدر تختار أكتر من وقت. الأرقام من اختيارات الناس المحفوظة.')}</p>
     <div className="season-grid" role="group" aria-label={tr('Choose seasons','اختار المواسم')}>{seasons.map(({id,label,icon:Icon})=><button className="season-choice" type="button" key={id} aria-pressed={selection.seasons.includes(id)} onClick={()=>toggle('seasons',id)}><Icon size={23} strokeWidth={1.2}/><strong>{label}</strong><small>{countLabel(view?.summary.seasons,id)}</small>{selection.seasons.includes(id)&&<Check className="option-check" size={12}/>}</button>)}</div>
     <div className="day-night" role="group" aria-label={tr('Choose time of day','اختار وقت اليوم')}>{times.map(({id,label,icon:Icon})=><button type="button" key={id} aria-pressed={selection.times.includes(id)} onClick={()=>toggle('times',id)}><Icon size={22} strokeWidth={1.2}/><span><strong>{label}</strong><small>{countLabel(view?.summary.times,id)}</small></span>{selection.times.includes(id)&&<Check size={13}/>}</button>)}</div>
    </div>
    <div className="signature-rating"><div className="signature-label">{tr('03 / Your overall impression','03 / تقييمك للعطر')}</div><div className="impression-stars" role="group" aria-label={tr('Your rating','تقييمك')} dir="ltr">{[1,2,3,4,5].map(rating=><button type="button" key={rating} aria-pressed={selection.rating===rating} aria-label={tr(`Rate ${rating} of 5`,`تقييم ${rating} من 5`)} onClick={()=>{setSelection(old=>({...old,rating:old.rating===rating?null:rating}));setDirty(true);setMessage('')}}><Star size={25} strokeWidth={1} fill={rating<=(selection.rating??0)?'currentColor':'none'}/></button>)}</div><p className="community-rating-result">{view?.summary.ratingCount?tr(`${number.format(view.summary.averageRating!)} / 5 from ${number.format(view.summary.ratingCount)} impressions`,`${number.format(view.summary.averageRating!)} من 5 · ${number.format(view.summary.ratingCount)} تقييم`):tr('No saved ratings yet.','لسه مفيش تقييمات محفوظة.')}</p></div>
    </div>
   </div>
   <div className="impression-footer"><div><p>{view?tr(`${number.format(view.summary.participants)} community participants`,`${number.format(view.summary.participants)} مشارك`):tr('Community impressions','انطباعات المجتمع')}</p><small>{tr('One editable impression per browser. No account required.','رأي واحد قابل للتعديل لكل متصفح، بدون حساب.')}</small></div><div className="impression-actions">{view?.selection&&<button className="impression-remove" type="button" onClick={()=>void save(true)}>{tr('Remove my impression','مسح اختياراتي')}</button>}<button className="action ink" type="button" disabled={demo||!hasChoice||!dirty} onClick={()=>void save()}>{busy?tr('Saving…','جاري الحفظ…'):view?.selection?tr('Update my impression','تحديث اختياراتي'):tr('Save my impression','احفظ اختياراتي')}</button></div></div>
  </fieldset>
  {demo&&<p className="community-status">{tr('Design preview: try the choices; public voting is disabled here.','معاينة التصميم: جرّب الاختيارات؛ حفظ التصويت العام متوقف هنا.')}</p>}
  {(message||failure)&&<p className="community-status" role={failure?'alert':'status'}>{message||tr('Community voting is temporarily unavailable. You can choose now and try saving later.','التصويت مش متاح مؤقتًا. تقدر تختار وتحاول الحفظ لاحقًا.')}</p>}
 </section>;
}
