"use client";

import {useStore} from "@/components/store-context";

export default function ErrorPage({reset}:{reset:()=>void}){
  const {tr}=useStore();
  return <main className="container utility">
    <section className="catalog-notice">
      <span className="eyebrow">SIYAG PARFUMS</span>
      <h1>{tr("We couldn’t load this page","تعذّر عرض الصفحة")}</h1>
      <p>{tr("Try again in a moment.","يمكنك إعادة المحاولة بعد لحظات.")}</p>
      <button type="button" className="action ink" onClick={reset}>{tr("Try again","إعادة المحاولة")}</button>
    </section>
  </main>;
}
