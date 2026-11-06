"use client";
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="container utility"><span className="eyebrow">SIYAG PARFUMS</span><h1>We couldn’t load this page.</h1><button type="button" className="action ink" onClick={reset}>Try again</button></main>}
