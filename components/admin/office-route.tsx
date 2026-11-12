"use client";
import {createContext,useContext} from "react";
import {usePathname} from "next/navigation";
export const OfficeRouteContext=createContext<string|null>(null);
export function useOfficePathname(){const actual=usePathname();return useContext(OfficeRouteContext)??actual}
const viewState=new Map<string,unknown>();
export function readOfficeView<T>(key:string,fallback:T):T{return (viewState.get(key) as T|undefined)??fallback}
export function writeOfficeView<T>(key:string,value:T){viewState.set(key,value)}
