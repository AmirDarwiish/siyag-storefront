/** Only optimize assets served by this store; retain third-party URLs unchanged. */
export function storeImageSource(src:string){
 const local=src.replace(/^https:\/\/siyag-two\.vercel\.app(?=\/)/,'');
 const owned=/^\/brand\//.test(local)||/^\/api\/siyag\/media\/[a-f0-9]{64}\.(?:png|jpg|webp)$/.test(local);
 return {src:owned?local:src,optimize:owned&&!local.endsWith('.svg')};
}
