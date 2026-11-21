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
assert.deepEqual(publishedProducts.map(p=>p.slug),['siyag-7','siyag-6','siyag-1','siyag-3']);
for(const p of publishedProducts){assert.deepEqual(p.variants.map(v=>v.sizeMl),[30,50]);assert(p.variants.every(v=>v.format==='fullBottle'&&v.compareAtMinor==null));assert(p.images.every(src=>!src.includes('preview')))}
for(const slug of ['noir','musk','oud','siyag-9','amber-wood-preview'])assert.equal(publishedProduct(slug),null);
assert.equal(publishedPage(new URLSearchParams('q=ناكسوس')).data[0].slug,'siyag-7');
assert.equal(publishedPage(new URLSearchParams('q=ديسيشن')).data[0].slug,'siyag-6');
assert.equal(publishedPage(new URLSearchParams('sizeMl=100')).totalCount,0);
assert.equal(publishedPage(new URLSearchParams('sizeMl=30')).totalCount,4);
assert.equal(publishedPage(new URLSearchParams('pageSize=2&pageNumber=2')).data.length,2);
assert.equal(publishedPage(new URLSearchParams('collection=discovery')).totalCount,0);
assert(publishedCollections.every(c=>c.slug!=='discovery'&&c.slug!=='oud'));
const {commerce,isPurchasePath}=await source('lib/commerce.ts');
assert.equal(commerce.showPrices,false);assert.equal(commerce.purchasingEnabled,false);
for(const path of ['store/carts','store/cart','store/cart/lines/abc','store/cart/quote','store/orders','store/orders/payment/paymob'])assert(isPurchasePath(path),path);
for(const path of ['store/orders/track','store/events','store/reviews','store/products/siyag-7','store/collections'])assert(!isPurchasePath(path),path);
console.log('Approved catalog checks passed: four numbered fragrances, 30/50 ml only, preview exclusion, pagination, search and purchase route guards.');

for(const n of [1,3,6]){
 const p=publishedProduct('siyag-'+n);
 assert(p.images[0].endsWith('-photo.webp'));
 assert(p.notesImageUrl.endsWith('-notes.webp'));
 assert(p.inspiration.imageUrl.endsWith('-3d.webp'));
 assert(p.topNotes.length&&p.heartNotes.length&&p.baseNotes.length);
 assert(p.variants.every(v=>v.imageUrl===p.images[0]));
}
assert.equal(publishedProduct('siyag-3').inspiration.nameEn,'Nishane Ani');
assert.equal(publishedProduct('siyag-6').inspiration.nameEn,'Amouage Decision');
console.log('Fragrance media checks passed: photographic galleries, notes, confirmed inspirations and unchanged 30/50 ml options.');
