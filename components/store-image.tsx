import Image, {type ImageProps} from "next/image";
/** Optimize bundled brand photography; keep API/third-party image contracts unchanged. */
export function StoreImage({src,unoptimized,...props}:Omit<ImageProps,"src">&{src:string}){
 const bundled=src.startsWith("/brand/")&&!src.endsWith(".svg");
 return <Image {...props} src={src} unoptimized={unoptimized??!bundled}/>;
}
