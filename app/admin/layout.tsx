import type {Metadata} from "next";
import type {ReactNode} from "react";
import {AdminDashboard} from "@/components/admin/dashboard";
import "./office.css";
export const metadata:Metadata={title:"SIYAG Office",robots:{index:false,follow:false}};
export default function OfficeLayout({children}:{children:ReactNode}){return <><AdminDashboard/>{children}</>}
