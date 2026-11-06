import {NextRequest} from "next/server";
import {readSession,sameOrigin} from "@/lib/admin-session";
import {requestStore} from "@/lib/server-store";

const guid="[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}";
const slug="[a-z0-9]+(?:-[a-z0-9]+)*";
const number="SYG-[A-F0-9]{16}";
const rules=[
  {method:"GET",pattern:new RegExp(`^reviews(?:/${guid}/photo)?$`,"i")},
  {method:"PUT",pattern:new RegExp(`^reviews/${guid}$`,"i")},
  {method:"GET",pattern:/^staff$/},
  {method:"POST",pattern:/^staff$/},
  {method:"PUT",pattern:new RegExp(`^staff/${guid}$`,"i")},
  {method:"GET",pattern:new RegExp(`^(products(?:/${guid})?|collections)$`,"i")},
  {method:"POST",pattern:new RegExp(`^(products|products/${guid}/variants|variants/${guid}/stock|media/images)$`,"i")},
  {method:"PUT",pattern:new RegExp(`^(products/${guid}(?:/variants/${guid})?|collections/${slug})$`,"i")},
  {method:"GET",pattern:new RegExp(`^(orders(?:/${number})?|shipping)$`)},
  {method:"PUT",pattern:new RegExp(`^(orders/${number}/(status|payment)|shipping/${slug})$`)},
];

async function proxy(request:NextRequest,{params}:{params:Promise<{path:string[]}>}){
  const session=readSession(request);
  const json=(detail:string,status:number)=>Response.json({detail},{status,headers:{"Cache-Control":"no-store"}});
  if(!session)return json("يرجى تسجيل الدخول إلى لوحة الإدارة.",401);
  const path=(await params).path.join("/");
  const rule=rules.find(rule=>rule.method===request.method&&rule.pattern.test(path));
  if(!rule||path.length>220)return json("المسار غير متاح.",404);
  if(request.method!=="GET"&&!sameOrigin(request))return json("الطلب صادر من عنوان غير مسموح.",403);
  try{
    const headers=new Headers({Authorization:"Bearer "+session.token});
    let body:BodyInit|undefined;
    if(path==="media/images"){
      const form=await request.formData();
      const image=form.get("image");
      if(!(image instanceof File)||image.size>3_000_000||!["image/jpeg","image/png","image/webp"].includes(image.type))
        return json("اختر صورة JPG أو PNG أو WebP بحجم لا يتجاوز 3 ميجابايت.",400);
      const upload=new FormData();
      upload.set("image",image);
      body=upload;
    }else if(request.method!=="GET"){
      body=await request.text();
      if(body.length>64_000)return json("حجم الطلب أكبر من المسموح.",413);
      headers.set("Content-Type","application/json");
    }
    const response=await requestStore("/api/v1/admin/"+path,request.nextUrl.search,{method:request.method,headers,body});
    if(response.status===401)return json("انتهت جلسة الإدارة. سجّل الدخول من جديد.",401);
    if(response.status===403)return json("صلاحيتك لا تسمح بهذا الإجراء.",403);
    return new Response(response.status===204?null:response.body,{status:response.status,headers:{
      "Content-Type":response.headers.get("Content-Type")||"application/json",
      "Cache-Control":"no-store","X-Content-Type-Options":"nosniff",
    }});
  }catch{return json("تعذّر الاتصال بخادم الإدارة.",502)}
}
export {proxy as GET,proxy as POST,proxy as PUT};
