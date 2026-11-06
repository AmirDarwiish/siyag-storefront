import {createCipheriv, createDecipheriv, createHash, randomBytes} from "node:crypto";
import {NextRequest} from "next/server";

type Session = {token:string;expires:number};
export const sessionCookie = "siyag-office";
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

export function createSession(token:string,expires:number) {
  const secret=encryptionKey();
  if(!secret)throw new Error("Admin session is not configured.");
  const iv=randomBytes(12);
  const cipher=createCipheriv("aes-256-gcm",secret,iv);
  const plain=JSON.stringify({token,expires} satisfies Session);
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
    return session.expires>Date.now()&&/^[a-f0-9]{64}$/i.test(session.token)?session:null;
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
