import Image, {type ImageProps} from "next/image";
/** Optimize bundled brand photography; keep API/third-party image contracts unchanged. */
export function StoreImage({src,unoptimized,loading,fetchPriority,...props}:Omit<ImageProps,"src">&{src:string}){
 const bundled=src.startsWith("/brand/")&&!src.endsWith(".svg");
 return <Image {...props} src={src} fetchPriority={fetchPriority} loading={fetchPriority==="high"?"eager":loading} unoptimized={unoptimized??!bundled}/>;
}
