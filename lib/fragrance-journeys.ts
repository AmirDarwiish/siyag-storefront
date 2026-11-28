import type {Content,Product} from './store';
export const journeyPolicy={carouselIntervalMs:5000,carouselPauseMs:8000,maxNotes:1500,maxFragranceName:180,maxName:120,maxQuantity:20,sizes:[30,50] as const};
export const journeyBanners:Content[]=[
 {slug:'journey-custom',titleEn:'Made for you.',titleAr:'عطر على ذوقك',textEn:'Tell us the fragrance you dream of.',textAr:'قولّنا العطر اللي نفسك فيه.',imageUrl:'/brand/journeys/custom-banner.webp',actionUrl:'/custom-fragrance',actionEn:'Create your request',actionAr:'اطلب عطرك الخاص'},
 {slug:'journey-mood',titleEn:'Find your scent.',titleAr:'عطرك على مودك',textEn:'A few choices. Your kind of fragrance.',textAr:'اختيارات بسيطة، وترشيحات ليك.',imageUrl:'/brand/journeys/mood-banner.webp',actionUrl:'/find-your-scent',actionEn:'Find my scent',actionAr:'اكتشف عطرك'},
];
export const fallbackHero:Content={slug:'house-fallback',titleEn:'Explore SIYAG fragrances',titleAr:'اكتشف عطور SIYAG',textEn:'',textAr:'',imageUrl:'/brand/hero-v2.webp',actionUrl:'/shop'};
export function mergeJourneyBanners(rows:Content[]){
 const existing=rows.filter(row=>!!row.imageUrl);
 const base=existing.length?existing:[fallbackHero];
 return [...base,...journeyBanners.filter(path=>!base.some(row=>row.actionUrl===path.actionUrl))];
}
export type QuizAnswers={mood?:string;occasion?:string;note?:string;audience?:string};
export type QuizOption={id:string;en:string;ar:string;icon:string};
export const quizSteps:{key:keyof QuizAnswers;en:string;ar:string;hintEn:string;hintAr:string;options:QuizOption[]}[]=[
 {key:'mood',en:'How do you want to feel?',ar:'حابب تحس بإيه؟',hintEn:'Start with the feeling you want to carry.',hintAr:'نبدأ بالإحساس اللي حابب يكون معاك.',options:[{id:'fresh',en:'Fresh & energised',ar:'منعش ومليان طاقة',icon:'sun'},{id:'cozy',en:'Warm & comfortable',ar:'دافي ومريح',icon:'coffee'},{id:'confident',en:'Confident & distinctive',ar:'واثق ومميز',icon:'sparkles'},{id:'soft',en:'Soft & relaxed',ar:'ناعم وهادي',icon:'feather'}]},
 {key:'occasion',en:'Where will you wear it?',ar:'هتلبسه فين؟',hintEn:'Choose the moment you have in mind.',hintAr:'اختار الوقت اللي بتدور له على عطر.',options:[{id:'everyday',en:'Everyday',ar:'كل يوم',icon:'sun'},{id:'work',en:'Work & formal',ar:'الشغل والمناسبات الرسمية',icon:'briefcase'},{id:'date',en:'A date or close moments',ar:'خروجة مميزة',icon:'heart'},{id:'evening',en:'Evenings & occasions',ar:'السهرات والمناسبات',icon:'moon'}]},
 {key:'note',en:'Which scent draws you in?',ar:'أنهي ريحة بتشدّك؟',hintEn:'Go with your first instinct.',hintAr:'اختار الأقرب لذوقك.',options:[{id:'citrus',en:'Bright citrus',ar:'حمضيات منعشة',icon:'citrus'},{id:'vanilla',en:'Creamy vanilla',ar:'فانيليا كريمية',icon:'cookie'},{id:'woody',en:'Elegant woods',ar:'أخشاب أنيقة',icon:'trees'},{id:'floral',en:'Soft flowers',ar:'زهور ناعمة',icon:'flower'},{id:'amber',en:'Warm amber & resins',ar:'عنبر ودفء شرقي',icon:'flame'},{id:'leather',en:'Smooth leather',ar:'جلد ناعم',icon:'layers'}]},
 {key:'audience',en:'Who is it for?',ar:'العطر لمين؟',hintEn:'Unisex fragrances are included in every suitable selection.',hintAr:'العطور المناسبة للجميع بتدخل ضمن الترشيحات.',options:[{id:'men',en:'For men',ar:'للرجال',icon:'user'},{id:'women',en:'For women',ar:'للنساء',icon:'user'},{id:'any',en:'Any style',ar:'أي طابع',icon:'users'}]},
];
const profile={
 fresh:[4,5,7,11,16,19,20,21],cozy:[1,2,3,6,8,12,18],confident:[7,8,10,11,13,15,17,21],soft:[3,6,9,12,14],
 everyday:[4,5,14,16,19,20],work:[5,7,8,11,13,15,16,20,21],date:[1,3,4,6,9,10,12,14,18],evening:[1,6,7,8,10,13,15,17,18,21],
} as Record<string,number[]>;
const notePatterns:Record<string,RegExp>={citrus:/bergamot|lemon|mandarin|orange/,vanilla:/vanilla/,woody:/wood|cedar|vetiver|patchouli|teak|sandal|cashmere/,floral:/rose|flower|jasmine|lavender|blossom|geranium/,amber:/amber|benzoin|labdanum|frankincense|myrrh/,leather:/leather|suede|cade/};
export function validQuizAnswers(answers:QuizAnswers){return quizSteps.every(step=>step.options.some(option=>option.id===answers[step.key]))}
export function recommendByMood(products:Product[],answers:QuizAnswers){
 if(!validQuizAnswers(answers))return [];
 const eligible=products.filter(p=>answers.audience==='any'||p.audience===answers.audience||p.audience==='unisex');
 const stocked=eligible.filter(p=>p.variants.some(v=>v.inStock));
 const pool=stocked.length?stocked:eligible;
 return pool.map(product=>{
  const number=Number(product.slug.slice(6));
  const notes=[...product.topNotes,...product.heartNotes,...product.baseNotes].map(n=>n.split('|')[0]).join(' ').toLowerCase();
  const reasons:('note'|'mood'|'occasion')[]=[];
  let score=0;
  if(notePatterns[answers.note!]?.test(notes)){score+=6;reasons.push('note')}
  if(profile[answers.mood!]?.includes(number)){score+=4;reasons.push('mood')}
  if(profile[answers.occasion!]?.includes(number)){score+=3;reasons.push('occasion')}
  return {product,score,reasons};
 }).sort((a,b)=>b.score-a.score||Number(a.product.slug.slice(6))-Number(b.product.slug.slice(6))).slice(0,3);
}
export function normalizeJourneyPhone(value:string){return value.replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[\s()-]/g,'')}
export const customRequestStatuses={new:'جديد',contacted:'تم التواصل',completed:'مكتمل',cancelled:'ملغى'} as const;
