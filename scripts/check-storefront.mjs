import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
async function source(path){const text=ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'))}
const {normalizeRail,mobileRailPlan,railStepProgress,cssMilliseconds}=await source('lib/rail-motion.ts');
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
