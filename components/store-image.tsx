import Image, {type ImageProps} from "next/image";
import {storeImageSource} from '@/lib/store-images';
/** Resize both bundled and uploaded store photography for the rendered slot. */
export function StoreImage({src,unoptimized,loading,fetchPriority,...props}:Omit<ImageProps,"src">&{src:string}){
 const source=storeImageSource(src);
 return <Image {...props} src={source.src} fetchPriority={fetchPriority} loading={fetchPriority==="high"?"eager":loading} unoptimized={unoptimized??!source.optimize}/>;
}
