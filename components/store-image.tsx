"use client";
import Image, {type ImageProps} from "next/image";
import {useCallback,useState,type ImgHTMLAttributes} from 'react';
import {imagePlaceholderSource,nextImageAttempt,storeImageSource,type ImageAttempt} from '@/lib/store-images';

function useImageAttempt(optimized:boolean){
 const [attempt,setAttempt]=useState<ImageAttempt>(optimized?'optimized':'original');
 const [loaded,setLoaded]=useState(false);
 const load=useCallback(()=>setLoaded(true),[]);
 const fail=useCallback(()=>{setLoaded(false);setAttempt(nextImageAttempt)},[]);
 return {attempt,state:attempt==='fallback'?'fallback':loaded?'loaded':'loading',
  load,fail};
}
/** Same image element and sizing; all loading/error presentation comes from global theme tokens. */
export function StoreImage({src,unoptimized,loading,fetchPriority,...props}:Omit<ImageProps,"src">&{src:string}){
 const source=storeImageSource(src);
 return <ManagedImage key={source.src} {...props} src={source.src} fetchPriority={fetchPriority} loading={fetchPriority==="high"?"eager":loading} unoptimized={unoptimized??!source.optimize}/>;
}
function ManagedImage({src,unoptimized,onLoad,onError,...props}:Omit<ImageProps,'src'>&{src:string}){
 const image=useImageAttempt(!unoptimized);
 return <Image {...props} data-store-image={image.state} src={image.attempt==='fallback'?imagePlaceholderSource:src} unoptimized={image.attempt!=='optimized'}
  onLoad={event=>{image.load();onLoad?.(event)}} onError={event=>{image.fail();onError?.(event)}}/>;
}

/** Native image slots share the same fallback without changing their existing dimensions or optimization. */
export function StorePhoto({src,...props}:Omit<ImgHTMLAttributes<HTMLImageElement>,'src'>&{src:string}){
 const source=storeImageSource(src);
 return <ManagedPhoto key={source.src} {...props} src={source.src}/>;
}
function ManagedPhoto({src,onLoad,onError,...props}:Omit<ImgHTMLAttributes<HTMLImageElement>,'src'>&{src:string}){
 const image=useImageAttempt(false);
 const imageRef=useCallback((node:HTMLImageElement|null)=>{
  if(node?.complete){if(node.naturalWidth>0)image.load();else image.fail()}
 },[image.load,image.fail]);
 return <img {...props} ref={imageRef} data-store-image={image.state} src={image.attempt==='fallback'?imagePlaceholderSource:src}
  onLoad={event=>{image.load();onLoad?.(event)}} onError={event=>{image.fail();onError?.(event)}}/>;
}
