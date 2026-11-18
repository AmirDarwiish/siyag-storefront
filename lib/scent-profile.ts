const arabicNotes:Record<string,string>={
 'black pepper':'الفلفل الأسود',cedar:'خشب الأرز',vetiver:'نجيل الهند',saffron:'الزعفران',amber:'العنبر',oud:'العود',bergamot:'البرغموت',neroli:'النيرولي','white musk':'المسك الأبيض',cardamom:'الهيل',labdanum:'اللابدانوم','bitter orange':'البرتقال المر',pear:'الكمثرى',iris:'السوسن',sandalwood:'خشب الصندل',vanilla:'الفانيليا',rose:'الورد',jasmine:'الياسمين',patchouli:'الباتشولي',musk:'المسك',lemon:'الليمون','tonka bean':'حبوب التونكا',incense:'البخور',orange:'البرتقال',lavender:'اللافندر',apple:'التفاح',ginger:'الزنجبيل',sage:'المريمية'};
Object.assign(arabicNotes,{honey:'العسل',cinnamon:'القرفة',cashmere:'الكشمير',cashmeran:'الكشميران','tobacco leaf':'أوراق التبغ','tonka beans':'حبوب التونكا'});
const normalizedArabic=(value:string)=>value.trim().replace(/^ال/,'');
/** Bilingual labels fit the existing catalog string-array contract without a database migration. */
export function noteName(note:string,ar:boolean){
 const [en,arabic]=note.split('|').map(value=>value.trim());
 if(arabic!==undefined)return (ar?arabic:en)||en||arabic;
 if(ar)return arabicNotes[en.toLowerCase()]??en;
 return Object.entries(arabicNotes).find(([,value])=>normalizedArabic(value)===normalizedArabic(en))?.[0].replace(/\b\w/g,value=>value.toUpperCase())??en;
}
export function localizedNotes(arabic:string,english:string):string[]{
 const split=(value:string)=>value.split(/[،,\n]+/).map(note=>note.trim()).filter(Boolean);
 const ar=split(arabic),en=split(english);
 if(ar.length&&en.length&&ar.length!==en.length)throw new Error('عدد النوتات بالعربي والإنجليزي لازم يكون متساويًا وبنفس الترتيب.');
 if([...ar,...en].some(note=>note.includes('|')))throw new Error('استخدم الفاصلة للفصل بين النوتات.');
 return Array.from({length:Math.max(ar.length,en.length)},(_,index)=>{
  const left=en[index]||noteName(ar[index],false),right=ar[index]||noteName(en[index],true);
  return left===right?left:`${left} | ${right}`;
 });
}
