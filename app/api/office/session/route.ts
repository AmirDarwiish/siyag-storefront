import {NextRequest,NextResponse} from "next/server";
import {adminConfigured,createSession,readSession,sameOrigin,sessionCookie,sessionOptions} from "@/lib/admin-session";
import {requestStore} from "@/lib/server-store";
import type {StaffUser} from "@/lib/admin";

const headers={"Cache-Control":"no-store"};
const json=(data:unknown,status=200)=>NextResponse.json(data,{status,headers});
const unavailable=()=>json({detail:"تعذّر الاتصال بخادم الإدارة. حاول مرة أخرى."},503);
const forbidden=()=>json({detail:"الطلب صادر من عنوان غير مسموح."},403);
const bearer=(token:string)=>({Authorization:"Bearer "+token});

export async function GET(request:NextRequest){
  const configured=adminConfigured();
  const session=readSession(request);
  if(!session)return json({configured,user:null});
  try{
    const result=await requestStore("/api/v1/admin/auth/me","",{headers:bearer(session.token)});
    if(result.status===401||result.status===403){
      const response=json({configured,user:null});
      response.cookies.set(sessionCookie,"",{...sessionOptions,maxAge:0});
      return response;
    }
    return result.ok?json({configured,user:await result.json()}):unavailable();
  }catch{return unavailable()}
}

async function authenticate(request:NextRequest,change:boolean){
  if(!sameOrigin(request))return forbidden();
  if(!adminConfigured())return json({detail:"جلسات الإدارة غير مفعّلة على الخادم."},503);
  const session=change?readSession(request):null;
  if(change&&!session)return json({detail:"انتهت جلسة الإدارة. سجّل الدخول من جديد."},401);
  const body=await request.json().catch(()=>null);
  const fields=change?["currentPassword","newPassword"]:["email","password"];
  if(!fields.every(field=>typeof body?.[field]==="string"&&body[field].length>0&&body[field].length<=(field==="email"?254:128)))
    return json({detail:"راجع بيانات الدخول وكلمة المرور."},400);
  try{
    const result=await requestStore("/api/v1/admin/auth/"+(change?"password":"login"),"",{
      method:change?"PUT":"POST",headers:{"Content-Type":"application/json",...(session?bearer(session.token):{})},
      body:JSON.stringify(Object.fromEntries(fields.map(field=>[field,body[field]]))),
    });
    const data=await result.json().catch(()=>null);
    if(result.status===429)return json({detail:"محاولات كثيرة. جرّب مرة أخرى بعد دقيقة."},429);
    if(!result.ok){
      if(result.status===400||result.status===401)return json({detail:data?.detail||"راجع بيانات الدخول."},result.status);
      return unavailable();
    }
    const {user,token,expiresAt}=data as {user:StaffUser;token:string;expiresAt:string};
    const expiry=Date.parse(expiresAt);
    if(!user||!/^[a-f0-9]{64}$/i.test(token)||!Number.isFinite(expiry)||expiry<=Date.now())return unavailable();
    const response=json({user});
    response.cookies.set(sessionCookie,createSession(token,expiry),{...sessionOptions,expires:new Date(expiry)});
    return response;
  }catch{return unavailable()}
}
export const POST=(request:NextRequest)=>authenticate(request,false);
export const PUT=(request:NextRequest)=>authenticate(request,true);

export async function DELETE(request:NextRequest){
  if(!sameOrigin(request))return forbidden();
  const session=readSession(request);
  if(session){
    try{
      const result=await requestStore("/api/v1/admin/auth/session","",{method:"DELETE",headers:bearer(session.token)});
      if(!result.ok&&result.status!==401&&result.status!==403)return unavailable();
    }catch{return unavailable()}
  }
  const response=json({user:null});
  response.cookies.set(sessionCookie,"",{...sessionOptions,maxAge:0});
  return response;
}
