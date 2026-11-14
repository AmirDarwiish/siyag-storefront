import {catalogPage,catalogProduct,cartImages} from "@/lib/server-catalog";
import { requestStore } from "@/lib/server-store";

const readPaths=/^store\/(products(?:\/[a-z0-9-]+)?|collections(?:\/[a-z0-9-]+)?|content(?:\/[a-z0-9-]+)?|settings|shipping|cart)$/;
const postPaths=/^store\/(events|carts|cart\/quote|orders(?:\/track|\/payment\/paymob)?)$/;
const linePath=/^store\/cart\/lines\/[0-9a-f-]{36}$/i;
const reviewPhotoPath=/^store\/reviews\/[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}\/photo$/i;
const impressionPath=/^store\/products\/[a-z0-9-]+\/impressions$/;
const mediaPath=/^media\/[a-f0-9]{64}\.(jpg|png|webp)$/;

async function proxy(request:Request, {params}:{params:Promise<{path:string[]}>}) {
  const path=(await params).path.join("/");
  const method=request.method;
  const incoming=new URL(request.url);
  const media=method==="GET"&&mediaPath.test(path);
  const reviewSubmission=method==="POST"&&path==="store/reviews";
  const reviewRead=method==="GET"&&(path==="store/reviews"||reviewPhotoPath.test(path));
  const allowed=(["GET","PUT","DELETE"].includes(method)&&impressionPath.test(path))||media||reviewSubmission||reviewRead||(method==="GET"&&readPaths.test(path))||(method==="POST"&&postPaths.test(path))||(method==="PUT"&&linePath.test(path));
  if(!allowed) return Response.json({detail:"Route not found."},{status:404});
  if(method!=="GET") {
    const origin=request.headers.get("origin");
    if(request.headers.get("sec-fetch-site")==="cross-site" || (origin && origin!==incoming.origin && origin!=="https://"+incoming.host)) {
      return Response.json({detail:"Origin not allowed."},{status:403});
    }
  }
  try {
    if(method==="GET"&&path==="store/products")return await catalogPage(incoming.searchParams);
    const headers=new Headers();
    const token=request.headers.get("x-cart-token");
    if(token) headers.set("X-Cart-Token",token);
    const impressionToken=request.headers.get("x-impression-token");
    if(impressionPath.test(path)&&impressionToken)headers.set("X-Impression-Token",impressionToken);
    let body:BodyInit|undefined;
    if(reviewSubmission){
      const contentType=request.headers.get("content-type");
      const size=Number(request.headers.get("content-length")??0);
      if(!contentType?.startsWith("multipart/form-data;"))return Response.json({detail:"Invalid review form."},{status:415});
      if(size>1_516_384)return Response.json({detail:"Photo too large."},{status:413});
      const bytes=await request.arrayBuffer();
      if(bytes.byteLength>1_516_384)return Response.json({detail:"Photo too large."},{status:413});
      body=bytes;
      headers.set("Content-Type",contentType);
    }else if(method!=="GET"){
      const json=await request.text();
      if(json.length>16384)return Response.json({detail:"Request too large."},{status:413});
      if(json){body=json;headers.set("Content-Type","application/json");}
    }
    const response=await requestStore(media?"/"+path:"/api/v1/"+path,incoming.search,{method,headers,body:body||undefined});
    if(method==="GET"&&/^store\/products\/[a-z0-9-]+$/.test(path))return await catalogProduct(response);
    if((method==="GET"&&path==="store/cart")||linePath.test(path))return await cartImages(response);
    return new Response(response.status===204?null:response.body,{status:response.status,headers:{
      "Content-Type":response.headers.get("content-type")||"application/json",
      "Cache-Control":media&&response.ok?"public, max-age=86400":"no-store","X-Content-Type-Options":"nosniff",
    }});
  } catch {
    return Response.json({detail:"The store is temporarily unavailable."},{status:502});
  }
}
export {proxy as GET,proxy as POST,proxy as PUT,proxy as DELETE};
