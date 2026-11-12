import type {Metadata} from "next";
import {AdminDashboard} from "@/components/admin/dashboard";
import "../office.css";

export const metadata:Metadata={title:"SIYAG Office",robots:{index:false,follow:false}};
export default function AdminPage(){return <AdminDashboard/>}
