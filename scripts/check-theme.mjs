import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
// Next's CSS toolchain already supplies PostCSS; no extra runtime dependency.
const postcss=createRequire(require.resolve('next/package.json'))('postcss');
const tokens=postcss.parse(readFileSync('app/theme/tokens.css','utf8'));
const styles=postcss.parse(readFileSync('app/theme/storefront.css','utf8'));
const names=new Set(['--store-header-height']);
tokens.walkDecls(d=>{if(d.prop.startsWith('--'))names.add(d.prop)});
let responsiveSeen=false;
for(const node of styles.nodes){
 if(node.type==='atrule')responsiveSeen=true;
 if(node.type==='rule')assert(!responsiveSeen,'Base rules must come before responsive rules');
}
const rules=new Set();
styles.walkRules(rule=>{
 let context='';for(let p=rule.parent;p?.type!=='root';p=p.parent)context=`@${p.name} ${p.params}|${context}`;
 const key=context+rule.selector;assert(!rules.has(key),`Duplicate component rule: ${key}`);rules.add(key);
});
styles.walkDecls(d=>{
 assert(!/#[a-f\d]{3,8}\b/i.test(d.value),`Use a color token: ${d.toString()}`);
 if(d.prop==='font-size')assert(d.value.includes('var(--type-'),`Use the type scale: ${d.toString()}`);
 for(const match of d.value.matchAll(/var\((--[\w-]+)/g))assert(names.has(match[1]),`Undefined token: ${match[1]}`);
});
const layout=readFileSync('app/layout.tsx','utf8');
for(const old of ['storefront','editorial','reviews','conversion','scent-signature','refinement']){
 assert(!layout.includes(`"./${old}.css"`),`Legacy cascade imported: ${old}`);
 assert(!existsSync(`app/${old}.css`),`Remove legacy cascade: ${old}`);
}
assert(layout.includes('./theme/tokens.css')&&layout.includes('./theme/storefront.css'));
console.log(`Theme checks passed: ${names.size} tokens, ${rules.size} canonical component rules.`);
