import type { Collection, Product } from "./store";

export const collections:Collection[]=[
  {slug:"signature",nameEn:"The signature collection",nameAr:"تشكيلة سيجنتشر",imageUrl:"/brand/categories/signature.webp"},
  {slug:"oud",nameEn:"The oud collection",nameAr:"تشكيلة العود",imageUrl:"/brand/categories/oud.webp"},
  {slug:"discovery",nameEn:"Discovery sizes",nameAr:"أحجام التجربة",imageUrl:"/brand/categories/discovery.webp"},
];
const products=[
  ["noir","Noir","نوار","woody","Dark woods, warm spice and a trace of smoke.","أخشاب داكنة وتوابل دافئة ولمسة دخان.","signature","Black pepper","Cedar","Vetiver"],
  ["oud","Oud","عود","amber","Golden amber over a slow-burning oud.","عنبر ذهبي فوق عود دافئ.","oud","Saffron","Amber","Oud"],
  ["eclat","Éclat","إيكلات","fresh","Citrus brightness softened by white musk.","حمضيات مشرقة ولمسة مسك أبيض.","signature","Bergamot","Neroli","White musk"],
  ["royal","Royal","رويال","oriental","A resinous warmth with a polished amber finish.","دفء راتنجي مع قاعدة عنبرية.","oud","Cardamom","Labdanum","Amber"],
  ["neroli","Neroli","نيرولي","fresh","Bitter orange leaves and neroli settle over a soft cedar base.","أوراق البرتقال المرّ والنيرولي فوق قاعدة ناعمة من خشب الأرز.","signature","Bitter orange","Neroli","Cedar"],
  ["musk","Musk","مسك","floral","Soft iris and white musk with a dry sandalwood finish.","سوسن ناعم ومسك أبيض مع لمسة من خشب الصندل.","signature","Pear","Iris","White musk"],
];
export const demoProducts:Product[]=products.map(([slug,nameEn,nameAr,family,descriptionEn,descriptionAr,collection,top,heart,base],index)=>({
  id:`demo-${slug}`,slug,nameEn,nameAr,descriptionEn,descriptionAr,brand:"SIYAG",family,concentration:"eauDeParfum",audience:"unisex",
  topNotes:[top],heartNotes:[heart],baseNotes:[base],images:[`/brand/${slug}.webp`,`/brand/${slug}-detail.webp`],featured:index<4,collections:[collection,"discovery"],
  variants:[
    {id:`demo-${slug}-10`,sku:`DEMO-${slug}-10`,sizeMl:10,format:"decant",priceMinor:19000+index*1000,inStock:true},
    {id:`demo-${slug}-50`,sku:`DEMO-${slug}-50`,sizeMl:50,format:"fullBottle",priceMinor:89000+index*10000,inStock:true},
    {id:`demo-${slug}-100`,sku:`DEMO-${slug}-100`,sizeMl:100,format:"fullBottle",priceMinor:139000+index*10000,inStock:index!==3},
  ],
}));
