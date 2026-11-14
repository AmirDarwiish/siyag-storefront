/** Content API actions deliberately support links within the storefront. */
export function bannerHref(value?:string|null){
 const href=value?.trim()??"";
 if(href==="/shop?format=decant")return "/shop?collection=discovery";
 return href.startsWith("/")&&!href.startsWith("//")&&!/[\\\u0000-\u0020]/.test(href)?href:null;
}
