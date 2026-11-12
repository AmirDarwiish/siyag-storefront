import type {MetadataRoute} from "next";
import {siteUrl} from "@/lib/metadata";
import {DEMO} from "@/lib/server-store";
export default function robots():MetadataRoute.Robots{return {rules:DEMO?{userAgent:"*",disallow:"/"}:{userAgent:"*",allow:"/",disallow:["/admin","/api/","/checkout","/cart","/track","/payment/"]},sitemap:new URL("/sitemap.xml",siteUrl).href}}
