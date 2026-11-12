import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
async function source(path){const text=ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(text).toString('base64'))}
const {normalizeRail}=await source('lib/rail-motion.ts');
for(const [offset,step,crossed,remainder] of [[280.75,280,1,.75],[914.5,280,3,74.5],[-.25,280,-1,279.75],[-560.5,280,-3,279.5],[279.8,280,0,279.8]]){
 const result=normalizeRail(offset,step);assert.equal(result.crossed,crossed);assert(Math.abs(result.offset-remainder)<.001);assert(Math.abs(result.crossed*step+result.offset-offset)<.001,'recycling must preserve the visible content position');
}
assert.deepEqual(normalizeRail(10,0),{crossed:0,offset:0});
const {storeMetadata,siteUrl}=await source('lib/metadata.ts');
const metadata=storeMetadata('Neroli','A fragrance','/products/neroli','/brand/olive-hero.webp');
assert.equal(metadata.openGraph.url,new URL('/products/neroli',siteUrl).href);
assert.equal(metadata.alternates.canonical,metadata.openGraph.url);
assert.equal(metadata.twitter.card,'summary_large_image');assert(metadata.openGraph.images[0].url.startsWith('https://'));
console.log('Storefront checks passed: multi-card flings, reverse recycling, subpixel continuity and canonical social metadata.');
