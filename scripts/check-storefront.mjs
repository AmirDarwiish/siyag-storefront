import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
async function source(path){const text=ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'))}
const {normalizeRail,mobileRailPlan,railStepProgress,cssMilliseconds}=await source('lib/rail-motion.ts');
const {storeImageSource}=await source('lib/store-images.ts');
const {productInspirations}=await source('lib/product-inspiration.ts');
const sourceId='ea12f2a1-ee32-4454-9fc9-75d863db7f16';
const inspiration={slug:'inspiration-'+sourceId,titleEn:'Xerjoff Naxos',titleAr:'زيرجوف ناكسوس',textEn:'Honey and tobacco',textAr:'عسل وتبغ'};
assert.deepEqual(productInspirations([inspiration])[sourceId],{nameEn:inspiration.titleEn,nameAr:inspiration.titleAr,descriptionEn:inspiration.textEn,descriptionAr:inspiration.textAr});
assert.deepEqual(productInspirations([{...inspiration,slug:'home-hero'},{...inspiration,titleAr:''}]),{},'unrelated content and incomplete translations must not show inspiration sections');
assert.equal(productInspirations([{...inspiration,imageUrl:'/brand/inspiration/naxos.webp'}])[sourceId].imageUrl,'/brand/inspiration/naxos.webp','inspiration images must follow the saved product content');
const uploaded='/api/siyag/media/'+ 'a'.repeat(64)+'.png';
assert.deepEqual(storeImageSource(uploaded),{src:uploaded,optimize:true});
assert.deepEqual(storeImageSource('https://siyag-two.vercel.app'+uploaded),{src:uploaded,optimize:true});
assert.deepEqual(storeImageSource('https://external.example/photo.png'),{src:'https://external.example/photo.png',optimize:false});
assert.equal(storeImageSource('/brand/hero-v2.webp').optimize,true);
assert.equal(storeImageSource('/brand/fallback.svg').optimize,false);
const {localizedNotes,noteName}=await source('lib/scent-profile.ts');
const bilingual=localizedNotes('عسل، أوراق التبغ، حبوب التونكا','Honey, Tobacco Leaf, Tonka Bean');
assert.deepEqual(bilingual.map(note=>noteName(note,false)),['Honey','Tobacco Leaf','Tonka Bean']);
assert.deepEqual(bilingual.map(note=>noteName(note,true)),['عسل','أوراق التبغ','حبوب التونكا']);
assert.deepEqual(localizedNotes(bilingual.map(note=>noteName(note,true)).join(','),bilingual.map(note=>noteName(note,false)).join(',')),bilingual,'editing must retain translated note pairs');
assert.equal(noteName('برغموت',false),'Bergamot');
assert.equal(noteName('Lavender',true),'اللافندر');
assert.equal(noteName('مكوّن خاص',false),'مكوّن خاص','unknown legacy notes must remain intact');
assert.throws(()=>localizedNotes('عسل، قرفة','Honey'),/بنفس الترتيب/);
assert.deepEqual(localizedNotes('',''),[]);
for(const [offset,step,crossed,remainder] of [[280.75,280,1,.75],[914.5,280,3,74.5],[-.25,280,-1,279.75],[-560.5,280,-3,279.5],[279.8,280,0,279.8]]){
 const result=normalizeRail(offset,step);assert.equal(result.crossed,crossed);assert(Math.abs(result.offset-remainder)<.001);assert(Math.abs(result.crossed*step+result.offset-offset)<.001,'recycling must preserve the visible content position');
}
assert.deepEqual(normalizeRail(10,0),{crossed:0,offset:0});
for(const ar of [true,false]){
 const plan=mobileRailPlan(ar?0:354,354,ar);
 assert.equal(Math.abs(plan.target-plan.anchor),354,'automatic mobile transitions must move one full card');
 assert.equal(Math.sign(plan.target-plan.anchor),ar?1:-1,'Arabic must move left and English right');
 assert.equal(plan.rebase,0);
 assert.equal(plan.anchor+plan.advance*354,plan.target,'recycling must preserve the arriving product');
}
assert.equal(mobileRailPlan(708,354,true).rebase,2);
assert.equal(mobileRailPlan(0,354,false).rebase,-1);
assert.equal(railStepProgress(0,520),0);assert.equal(railStepProgress(260,520),.5);assert.equal(railStepProgress(520,520),1);assert.equal(railStepProgress(900,520),1);
for(const [value,expected] of [["4200ms",4200],["4.2s",4200],["520ms",520],[".52s",520],["1.8s",1800],["1800ms",1800],["invalid",0]])assert.equal(cssMilliseconds(value),expected,'compiled CSS time units must preserve the configured pause and transition');
const {storeMetadata,siteUrl}=await source('lib/metadata.ts');
const metadata=storeMetadata('Neroli','A fragrance','/products/neroli','/brand/olive-hero.webp');
assert.equal(metadata.openGraph.url,new URL('/products/neroli',siteUrl).href);
assert.equal(metadata.alternates.canonical,metadata.openGraph.url);
assert.equal(metadata.twitter.card,'summary_large_image');assert(metadata.openGraph.images[0].url.startsWith('https://'));
console.log('Storefront checks passed: one-card language-aware mobile steps, reverse recycling, subpixel continuity and canonical social metadata.');

const {bannerHref}=await source('lib/banners.ts');
for(const path of ['/shop','/shop?collection=bestsellers','/products/musk?variant=example','/policies/shipping'])assert.equal(bannerHref(path),path);
for(const path of ['//example.com','https://example.com','javascript:alert(1)','/\\example.com','/shop\n'])assert.equal(bannerHref(path),path==='/shop\n'?'/shop':null);
assert.equal(bannerHref(undefined),null);
console.log('Banner action checks passed: internal storefront actions accepted; external and malformed actions rejected.');

const {primaryRail}=await source('lib/rail-autoplay.ts');
assert.equal(primaryRail([{top:-600,bottom:-100},{top:1000,bottom:1500}],100,900),-1,'offscreen rails must stay still');
assert.equal(primaryRail([{top:130,bottom:530},{top:600,bottom:1000}],100,900),0,'two visible sections must have one dominant rail');
assert.equal(primaryRail([{top:-150,bottom:250},{top:320,bottom:720}],100,900),1,'focus must transfer as the customer scrolls');
assert.equal(primaryRail([{top:760,bottom:1160}],100,900),-1,'a small glimpse must not start autoplay');
assert.equal(primaryRail([{top:0,bottom:400}],350,900),-1,'content behind the sticky header must not count as visible');
assert.equal(primaryRail([{top:50,bottom:1250}],100,900),0,'a tall rail filling the viewport must remain eligible');
assert.equal(primaryRail([{top:0,bottom:0}],0,800),-1);
assert.equal(primaryRail([{top:0,bottom:400}],900,100),-1);
console.log('Autoplay checks passed: one dominant visible rail, header occlusion, partial visibility, focus transfer and tall viewports.');

const {availableFirst,available,recommendations,variantImage,parseVariantImages,applyVariantImages,discoveryProduct,storefrontProduct,DISCOVERY_HREF}=await source('lib/catalog-experience.ts');
const makeProduct=(id,stock,family='woody',format='fullBottle')=>({id,slug:id,nameEn:id,nameAr:id,descriptionEn:'',descriptionAr:'',brand:'SIYAG',family,concentration:'eauDeParfum',audience:'unisex',images:['/brand/noir.webp'],topNotes:['Cedar'],heartNotes:[],baseNotes:[],collections:['signature','discovery'],featured:false,variants:[{id:'11111111-1111-1111-1111-111111111111',sku:id,sizeMl:50,format,priceMinor:10000,inStock:stock}]});
const sold=makeProduct('sold',false),stocked=makeProduct('stocked',true),other=makeProduct('other',true,'fresh');
assert.deepEqual(availableFirst([sold,stocked,other]).map(p=>p.id),['stocked','other','sold'],'partition before pagination keeps available products ahead of unavailable ones');
assert.deepEqual(availableFirst([other,stocked,sold]).map(p=>p.id),['other','stocked','sold'],'preserve chosen sorting within availability groups');
const mixed={...sold,variants:[...sold.variants,{...stocked.variants[0],id:'22222222-2222-2222-2222-222222222222',format:'decant',sizeMl:10}]};
assert.equal(available(mixed,new URLSearchParams('format=fullBottle')),false,'stock in another format must not make the selected format available');
assert.equal(available(mixed,new URLSearchParams('collection=discovery')),true);
assert.equal(discoveryProduct(mixed).variants.length,1);assert.equal(discoveryProduct(mixed).variants[0].sizeMl,10);
assert.deepEqual(recommendations(stocked,[sold,other,stocked,makeProduct('similar',true),other]).map(p=>p.id),['similar','other'],'exclude self, unavailable and duplicate recommendations; rank matching families first');
const id=stocked.variants[0].id,photo='https://siyag-two.vercel.app/brand/noir-detail.webp';
const images=parseVariantImages([{textEn:JSON.stringify({[id]:photo,'bad':'javascript:alert(1)'})},{textEn:'invalid'}]);
assert.deepEqual(images,{[id]:photo});assert.equal(variantImage(applyVariantImages(stocked,images),applyVariantImages(stocked,images).variants[0]),photo);
assert.equal(variantImage(stocked,stocked.variants[0]),stocked.images[0],'missing size photography must keep the actual product image');
assert.equal(bannerHref('/shop?format=decant'),DISCOVERY_HREF,'existing backend banner links use the same discovery route');
console.log('Catalog checks passed: availability groups, size-specific stock, discovery sizes, real alternatives, image mappings and legacy discovery links.');

const visibleProduct=storefrontProduct(mixed);
assert(visibleProduct.variants.every(v=>v.format==='fullBottle'));
assert(!visibleProduct.collections.includes('discovery'));
assert.equal(mixed.variants.length,2,'hiding sizes must preserve the source catalog');
assert.equal(storefrontProduct(makeProduct('sample-only',true,'woody','sample')).variants.length,0);
console.log('Public catalog visibility checks passed: discovery sizes hidden without mutating inventory.');

const {publishedProducts,publishedProduct,publishedPage,publishedCollections}=await source('lib/published-catalog.ts');
assert.deepEqual(publishedProducts.map(p=>p.slug),Array.from({length:21},(_,i)=>'siyag-'+(i+1)));
const pricePairs=[[450,800],[290,520],[380,650],[350,600],[460,820],[380,630],[650,1000],[350,600],[390,670],[420,750],[450,800],[380,650],[400,720],[380,650],[400,720],[400,720],[420,750],[450,800],[420,750],[380,650],[380,650]];
for(const [i,p] of publishedProducts.entries()){
 assert.deepEqual(p.variants.map(v=>v.sizeMl),[30,50]);
 assert.deepEqual(p.variants.map(v=>v.priceMinor),pricePairs[i].map(price=>price*100));
 assert(p.variants.every(v=>v.format==='fullBottle'&&v.compareAtMinor==null&&!v.inStock),'static catalogue cannot invent warehouse stock');
 assert(p.images.every(src=>!src.includes('preview')));
 assert(p.descriptionEn&&p.descriptionAr&&['men','women','unisex'].includes(p.audience));
}
assert.equal(new Set(publishedProducts.flatMap(p=>p.variants.map(v=>v.id))).size,42);
for(const slug of ['noir','musk','oud','amber-wood-preview'])assert.equal(publishedProduct(slug),null);
assert.equal(publishedPage(new URLSearchParams('q=ناكسوس')).data[0].slug,'siyag-8');
assert.equal(publishedPage(new URLSearchParams('q=ديسيشن')).data[0].slug,'siyag-7');
assert.equal(publishedPage(new URLSearchParams('q=Musk Patchouli')).data[0].slug,'siyag-14');
assert.equal(publishedPage(new URLSearchParams('sizeMl=100')).totalCount,0);
assert.equal(publishedPage(new URLSearchParams('sizeMl=30')).totalCount,21);
assert.equal(publishedPage(new URLSearchParams('inStock=true')).totalCount,0);
assert.equal(publishedPage(new URLSearchParams('sort=price-asc')).data[0].slug,'siyag-2');
assert.equal(publishedPage(new URLSearchParams('sort=price-desc')).data[0].slug,'siyag-7');
assert.equal(publishedPage(new URLSearchParams('sizeMl=50&minPriceMinor=100000')).totalCount,1);
assert.equal(publishedPage(new URLSearchParams('pageSize=2&pageNumber=2')).data.length,2);
assert.equal(publishedPage(new URLSearchParams('collection=discovery')).totalCount,0);
assert.deepEqual(publishedCollections.map(c=>c.slug),['signature']);
const {commerce,isPurchasePath}=await source('lib/commerce.ts');
assert.equal(commerce.showPrices,true);assert.equal(commerce.purchasingEnabled,true);
for(const path of ['store/carts','store/cart','store/cart/lines/abc','store/cart/quote','store/orders','store/orders/payment/paymob'])assert(isPurchasePath(path),path);
for(const path of ['store/orders/track','store/events','store/reviews','store/products/siyag-7','store/collections'])assert(!isPurchasePath(path),path);
assert.equal(publishedProduct('siyag-3').inspiration.nameEn,'Nishane Ani');
assert.equal(publishedProduct('siyag-7').inspiration.nameEn,'Amouage Decision');
assert.equal(publishedProduct('siyag-8').inspiration.nameEn,'Xerjoff Naxos');
assert.equal(publishedProduct('siyag-14').inspiration.nameEn,'Laverne Musk Patchouli');
assert.equal(publishedProduct('siyag-20').inspiration,undefined,'Satsuma is a SIYAG creation');
assert.equal(publishedProduct('siyag-8').variants[1].id,'8c97091c-5dd5-40fd-b84a-674ec8924d0c','retain the actual existing Naxos variant ID');
console.log('Approved catalogue checks passed: all 21 sequential products, all 42 owner prices, gender, search, price sorting and purchasing enabled.');

const {nextImageAttempt,imagePlaceholderSource}=await source('lib/store-images.ts');
assert.deepEqual(storeImageSource('/media/'+'a'.repeat(64)+'.webp'),{src:'/api/siyag/media/'+'a'.repeat(64)+'.webp',optimize:true});
assert.equal(nextImageAttempt('optimized'),'original');
assert.equal(nextImageAttempt('original'),'fallback');
assert.equal(nextImageAttempt('fallback'),'fallback','a failed fallback must never trigger a retry loop');
assert(imagePlaceholderSource.startsWith('data:image/'),'fallback must not need a network request');
for(const p of publishedProducts){
 for(const src of [...p.images,...(p.notesImageUrl?[p.notesImageUrl]:[])]){
  assert(src.startsWith('/brand/'),'approved product photography must not depend on API media availability');
  readFileSync('public'+src);
 }
}
const {createHash}=await import('node:crypto');
for(const [file,hash] of [['siyag-7-photo.webp','517524cece8f488357a363934d1d5317896ec5edd9a1bc0eda7db158b4a1e613'],['siyag-7-notes.webp','4b6562b46aa90174fb7cbeef21fe3c9467ccc3e20ff91f445defcd209feebfe1']])
 assert.equal(createHash('sha256').update(readFileSync('public/brand/numbered/'+file)).digest('hex'),hash,'SIYAG 7 artwork must remain byte-for-byte unchanged');
console.log('Image resilience checks passed: legacy URLs, bounded retry, network-free fallback and unchanged bundled Naxos photography.');

const {mergeCatalogInventory}=await source('lib/catalog-inventory.ts');
const naxos=publishedProduct('siyag-8'),actualId='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const liveNaxos={...naxos,variants:[{...naxos.variants[1],id:actualId,priceMinor:61234,inStock:true}]};
const hydrated=mergeCatalogInventory(publishedProducts,[liveNaxos]).find(p=>p.id===naxos.id);
assert.equal(hydrated.variants[1].id,actualId,'use the actual warehouse variant ID, not a generated public ID');
assert.equal(hydrated.variants[1].priceMinor,61234,'staff price updates must be honoured in the displayed price');
assert.equal(hydrated.variants[1].inStock,true);
assert.equal(hydrated.variants[0].inStock,false,'missing sizes cannot be purchased');
assert(mergeCatalogInventory(publishedProducts,[]).every(p=>p.variants.every(v=>!v.inStock)),'API failure must fail closed');
assert(mergeCatalogInventory(publishedProducts,[{...liveNaxos,slug:'siyag-7',nameEn:'SIYAG 7'}]).every(p=>p.variants.every(v=>!v.inStock)),'legacy Naxos cannot be sold under the new Decision number');
console.log('Commerce inventory checks passed: actual IDs and prices, size-specific availability, missing API data and legacy renumbering protection.');

const customerOrder=["Emporio Armani Stronger With You Intensely", "Arabian Oud Feeling", "Nishane Ani", "Valentino Uomo Born in Roma Intense", "BLEU DE CHANEL Eau de Parfum", "Parfums de Marly Althaïr", "Amouage Decision", "Xerjoff Naxos", "Louis Vuitton Stellar Times", "Clive Christian Blonde Amber", "Amouage Epic Man", "Matière Première Vanilla Powder Extrait de Parfum", "Amouage Outlands", "Laverne Musk Patchouli", "BLEU DE CHANEL L’EXCLUSIF", "Yves Saint Laurent Y Eau de Parfum", "OMANLUXURY Caden", "Tom Ford Tobacco Vanille", "Xerjoff Erba Pura", "SIYAG Satsuma", "Arabian Oud Amiri"];
assert.deepEqual(publishedProducts.map(p=>p.inspiration?.nameEn??"SIYAG Satsuma"),customerOrder,"exact sequential fragrance mapping from the customer, including the duplicated original number 4");
assert.deepEqual(publishedPage(new URLSearchParams("pageSize=100"),[...publishedProducts].reverse()).data.map(p=>p.slug),publishedProducts.map(p=>p.slug),"default customer order survives shuffled API results");
console.log("Customer sequence confirmed for all 21 source fragrances.");

for(const product of publishedProducts.filter(p=>p.inspiration?.imageUrl)){
 const file=readFileSync('public'+product.inspiration.imageUrl);
 assert.equal(file.toString('ascii',0,4),'RIFF');
 assert(file.includes(Buffer.from('ALPH'))||(file.toString('ascii',12,16)==='VP8L'&&(file[24]&16)!==0),product.slug+' inspiration must retain an actual WebP alpha channel');
}
console.log('All 20 inspired-by images retain transparent alpha; Satsuma has no external source bottle.');
