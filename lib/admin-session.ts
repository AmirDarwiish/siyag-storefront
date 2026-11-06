import {createCipheriv, createDecipheriv, createHash, randomBytes} from "node:crypto";
import {NextRequest} from "next/server";
import {requestStore} from "./server-store";

export type AdminRole = "Owner" | "Catalog" | "Fulfillment";
type Session = {key:string;role:AdminRole;expires:number};
export const sessionCookie = "siyag-office";
export const sessionSeconds = 8 * 60 * 60;
const localQa=process.env.VERCEL!=="1"&&process.env.SIYAG_LOCAL_ADMIN_QA==="1";
export const sessionOptions = {
  path:"/api/office", httpOnly:true, sameSite:"strict" as const,
  secure:process.env.VERCEL==="1" || (process.env.NODE_ENV==="production" && !localQa),
};

function encryptionKey() {
  const secret=process.env.SIYAG_ADMIN_SESSION_SECRET;
  return secret && secret.length>=32 ? createHash("sha256").update(secret).digest() : null;
}
export const adminConfigured=()=>Boolean(encryptionKey());

export function createSession(key:string,role:AdminRole) {
  const secret=encryptionKey();
  if(!secret)throw new Error("Admin session is not configured.");
  const iv=randomBytes(12);
  const cipher=createCipheriv("aes-256-gcm",secret,iv);
  const plain=JSON.stringify({key,role,expires:Date.now()+sessionSeconds*1000} satisfies Session);
  return Buffer.concat([iv,cipher.update(plain,"utf8"),cipher.final(),cipher.getAuthTag()]).toString("base64url");
}

export function readSession(request:NextRequest):Session|null {
  const secret=encryptionKey();
  const cookie=request.cookies.get(sessionCookie)?.value;
  if(!secret||!cookie||cookie.length>1024)return null;
  try{
    const bytes=Buffer.from(cookie,"base64url");
    if(bytes.length<29)return null;
    const decipher=createDecipheriv("aes-256-gcm",secret,bytes.subarray(0,12));
    decipher.setAuthTag(bytes.subarray(-16));
    const plain=Buffer.concat([decipher.update(bytes.subarray(12,-16)),decipher.final()]);
    const session=JSON.parse(plain.toString("utf8")) as Session;
    return session.expires>Date.now()&&["Owner","Catalog","Fulfillment"].includes(session.role)?session:null;
  }catch{return null}
}

export function sameOrigin(request:NextRequest) {
  if(request.headers.get("sec-fetch-site")==="cross-site")return false;
  const origin=request.headers.get("origin");
  if(!origin)return false;
  try{
    const url=new URL(origin);
    return url.origin===request.nextUrl.origin||
      (url.host===request.headers.get("host")&&(url.protocol==="https:"||localQa));
  }catch{return false}
}

export async function checkOperator(key:string):Promise<AdminRole|null> {
  const headers={Authorization:"Bearer "+key};
  const [catalog,orders]=await Promise.all([
    requestStore("/api/v1/admin/products","?pageSize=1",{headers}),
    requestStore("/api/v1/admin/orders","?pageSize=1",{headers}),
  ]);
  if(catalog.ok&&orders.ok)return "Owner";
  if(catalog.ok&&orders.status===403)return "Catalog";
  if(orders.ok&&catalog.status===403)return "Fulfillment";
  if([catalog.status,orders.status].some(status=>status>=500))throw new Error("Admin API unavailable.");
  return null;
}
