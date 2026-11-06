"use client";

import Link from "next/link";
import {ArrowUpRight} from "lucide-react";
import {useStore} from "@/components/store-context";

export default function NotFound(){
  const {tr}=useStore();
  return <main className="container utility">
    <section className="catalog-notice">
      <span className="eyebrow">SIYAG PARFUMS</span>
      <h1>{tr("This page isn’t available","هذه الصفحة غير متاحة")}</h1>
      <p>{tr("Visit the collection to continue exploring SIYAG.","تصفّح المجموعة لمواصلة استكشاف عطور سياج.")}</p>
      <Link className="action ink" href="/shop">{tr("Browse the collection","تصفّح المجموعة")}<ArrowUpRight size={16}/></Link>
    </section>
  </main>;
}
