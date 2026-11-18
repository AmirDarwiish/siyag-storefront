import type {Content} from './store';
export type ProductInspiration={nameEn:string;nameAr:string;descriptionEn:string;descriptionAr:string;imageUrl?:string};
/** Published content blocks use the stable product ID, so renaming a slug keeps its story. */
export function productInspirations(rows:Content[]):Record<string,ProductInspiration>{
 const result:Record<string,ProductInspiration>={};
 for(const row of rows){
  const match=/^inspiration-([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})$/i.exec(row.slug);
  if(!match||!row.titleEn.trim()||!row.titleAr.trim())continue;
  result[match[1]]={nameEn:row.titleEn,nameAr:row.titleAr,descriptionEn:row.textEn,descriptionAr:row.textAr,...(row.imageUrl?{imageUrl:row.imageUrl}:{})};
 }
 return result;
}
