import {NextRequest,NextResponse} from "next/server";
import {adminConfigured,checkOperator,createSession,readSession,sameOrigin,sessionCookie,sessionOptions,sessionSeconds} from "@/lib/admin-session";

const headers={"Cache-Control":"no-store"};
const json=(data:unknown,status=200)=>NextResponse.json(data,{status,headers});

export function GET(request:NextRequest){
  return json({configured:adminConfigured(),role:readSession(request)?.role??null});
}

export async function POST(request:NextRequest){
  if(!sameOrigin(request))return json({detail:"الطلب صادر من عنوان غير مسموح."},403);
  if(!adminConfigured())return json({detail:"جلسات الإدارة غير مفعّلة على الخادم."},503);
  const body=await request.json().catch(()=>null);
  const key=typeof body?.key==="string"?body.key.trim():"";
  if(key.length<32||key.length>256)return json({detail:"مفتاح الدخول غير صالح."},401);
  try{
    const role=await checkOperator(key);
    if(!role)return json({detail:"مفتاح الدخول غير صالح أو غير مفعّل."},401);
    const response=json({role});
    response.cookies.set(sessionCookie,createSession(key,role),{...sessionOptions,maxAge:sessionSeconds});
    return response;
  }catch{return json({detail:"تعذّر الاتصال بخادم الإدارة. حاول مرة أخرى."},503)}
}

export function DELETE(request:NextRequest){
  if(!sameOrigin(request))return json({detail:"الطلب صادر من عنوان غير مسموح."},403);
  const response=json({role:null});
  response.cookies.set(sessionCookie,"",{...sessionOptions,maxAge:0});
  return response;
}
