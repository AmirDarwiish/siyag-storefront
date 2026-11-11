import type {Product} from './store';
export type Season='spring'|'summer'|'autumn'|'winter';
export type Fit='natural'|'versatile'|'personal';
// Qualitative discovery guidance, not wear tests, customer votes or measured strength.
// Unknown families deliberately receive no generated recommendation.
export function scentGuide(product:Product):{seasons:Record<Season,Fit>;day:Fit;night:Fit}|undefined{
 const cool={spring:'versatile',summer:'personal',autumn:'natural',winter:'natural'} as const;
 const bright={spring:'natural',summer:'natural',autumn:'versatile',winter:'personal'} as const;
 if(['amber','oriental','gourmand'].includes(product.family))return {seasons:cool,day:'versatile',night:'natural'};
 if(product.family==='woody')return {seasons:{...cool,spring:'natural'},day:'versatile',night:'natural'};
 if(['fresh','floral'].includes(product.family))return {seasons:bright,day:'natural',night:'versatile'};
 return undefined;
}
const arabicNotes:Record<string,string>={
 'black pepper':'الفلفل الأسود',cedar:'خشب الأرز',vetiver:'نجيل الهند',saffron:'الزعفران',amber:'العنبر',oud:'العود',bergamot:'البرغموت',neroli:'النيرولي','white musk':'المسك الأبيض',cardamom:'الهيل',labdanum:'اللابدانوم','bitter orange':'البرتقال المر',pear:'الكمثرى',iris:'السوسن',sandalwood:'خشب الصندل',vanilla:'الفانيليا',rose:'الورد',jasmine:'الياسمين',patchouli:'الباتشولي',musk:'المسك',lemon:'الليمون','tonka bean':'حبوب التونكا',incense:'البخور',orange:'البرتقال',lavender:'اللافندر',apple:'التفاح',ginger:'الزنجبيل',sage:'المريمية'};
export function noteName(note:string,ar:boolean){return ar?arabicNotes[note.trim().toLowerCase()]??note:note}
