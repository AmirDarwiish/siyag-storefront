"use client";
import {usePathname} from "next/navigation";
import type {ReactNode} from "react";
import {StoreProvider} from "./store-context";
import {Bag,Footer,Header} from "./shell";

export function StorefrontFrame({children,demo}:{children:ReactNode;demo:boolean}){
  const path=usePathname();
  if(path==="/admin"||path?.startsWith("/admin/"))return children;
  return <StoreProvider demo={demo}><Header/>{children}<Footer/><Bag/></StoreProvider>;
}
