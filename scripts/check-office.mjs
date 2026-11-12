import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createRequire} from 'node:module';
process.on('uncaughtException',error=>{console.error(error.message);process.exit(1)});
const require=createRequire(import.meta.url);
const postcss=createRequire(require.resolve('next/package.json'))('postcss');
const css=postcss.parse(readFileSync('app/admin/office.css','utf8'));
const tokens=new Set();
css.walkDecls(d=>{if(d.prop.startsWith('--'))tokens.add(d.prop)});
const rules=new Set();
css.walkRules(rule=>{
  let context='';for(let p=rule.parent;p?.type!=='root';p=p.parent)context=`@${p.name} ${p.params}|${context}`;
  const key=context+rule.selector;assert(!rules.has(key),`Duplicate office rule: ${key}`);rules.add(key);
});
css.walkDecls(d=>{
  if(!d.prop.startsWith('--'))assert(!/#[a-f\d]{3,8}\b/i.test(d.value),`Use an office theme token: ${d.toString()}`);
  for(const match of d.value.matchAll(/var\((--[\w-]+)/g))assert(tokens.has(match[1]),`Undefined office token: ${match[1]}`);
});
let tables=0;
for(const file of readdirSync('components/admin').filter(x=>x.endsWith('.tsx'))){
  const source=readFileSync('components/admin/'+file,'utf8');
  const matches=[...source.matchAll(/<table\b[^>]*>/g)];
  for(const [table] of matches)assert(/className="office-table"/.test(table),`Unstyled table in ${file}: use the office table class`);
  if(matches.length)assert((source.match(/<TableFrame\b/g)??[]).length>=matches.length,`Table in ${file} needs the shared accessible scrolling frame`);
  tables+=matches.length;
}
assert(tables>0);
console.log(`Office checks passed: ${tables} shared tables, ${tokens.size} theme tokens.`);
