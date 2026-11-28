import {mkdir,readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import ts from 'typescript';

// Use the same image encoder as Next.js, without adding another dependency.
const require=createRequire(import.meta.url);
const sharp=require(require.resolve('sharp',{paths:[require.resolve('next')]}));
const code=ts.transpileModule(await readFile('lib/published-catalog.ts','utf8'),{
 compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022},
}).outputText;
const {publishedProducts}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const directory='public/brand/share/notes-v2';
await mkdir(directory,{recursive:true});
for(const product of publishedProducts){
 const source=product.notesImageUrl||product.images[0];
 if(!source?.startsWith('/brand/'))throw new Error('Missing bundled notes photograph: '+product.slug);
 await sharp('public'+source).resize(1200,1200,{fit:'cover'}).jpeg({quality:88,mozjpeg:true}).toFile(directory+'/'+product.slug+'.jpg');
}
console.log('Generated '+publishedProducts.length+' share images from the published notes photographs.');
