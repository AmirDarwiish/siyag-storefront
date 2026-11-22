/** Only optimize assets served by this store; retain third-party URLs unchanged. */
export function storeImageSource(src:string){
 const original=src.replace(/^https:\/\/siyag-two\.vercel\.app(?=\/)/,'');
 const local=original.startsWith('/media/')?'/api/siyag'+original:original;
 const owned=/^\/brand\//.test(local)||/^\/api\/siyag\/media\/[a-f0-9]{64}\.(?:png|jpg|webp)$/.test(local);
 return {src:owned?local:src,optimize:owned&&!local.endsWith('.svg')};
}
export type ImageAttempt='optimized'|'original'|'fallback';
/** Retry the original once if optimization fails. A failed original ends in a local, request-free placeholder. */
export const nextImageAttempt=(attempt:ImageAttempt):ImageAttempt=>attempt==='optimized'?'original':'fallback';
export const imagePlaceholderSource='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/%3E';
