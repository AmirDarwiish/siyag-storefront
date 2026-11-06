"use client";

import Link from "next/link";
import {useEffect, useState} from "react";
import {ArrowUpRight, Box, FlaskConical, Sparkles} from "lucide-react";
import {api, imageUrl, name, type Collection, type Page, type Product} from "@/lib/store";
import {useStore} from "./store-context";
import {ProductCard} from "./product";

export function Home() {
  const {tr, lang} = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const options = {signal: controller.signal};
    api<Page<Product>>("store/products?featured=true&pageSize=4", options)
      .then(data => data.data.length ? data : api<Page<Product>>("store/products?pageSize=4", options))
      .then(data => setProducts(data.data))
      .catch(() => {});
    api<Collection[]>("store/collections", options).then(setCollections).catch(() => {});
    return () => controller.abort();
  }, []);

  const fallbackCategories = [
    {href: "/shop?format=fullBottle", title: tr("Full bottles", "الزجاجات الكاملة"), image: "/brand/noir.webp"},
    {href: "/shop?family=amber", title: tr("Amber fragrances", "عطور عنبرية"), image: "/brand/oud.webp"},
    {href: "/shop?format=decant", title: tr("Discovery sizes", "أحجام التجربة"), image: "/brand/eclat.webp"},
  ];
  const categories = collections.length
    ? collections.slice(0, 3).map((collection, index) => ({
        href: "/shop?collection=" + collection.slug,
        title: name(collection, lang),
        image: imageUrl(collection.imageUrl || fallbackCategories[index].image),
      }))
    : fallbackCategories;

  return <main>
    <section className="hero">
      <div className="hero-content">
        <div className="hero-kicker"><span/>{tr("AN EGYPTIAN FRAGRANCE HOUSE", "دار عطور مصرية")}</div>
        <h1>{tr("A scent that", "عطر يسيب")}<br/><em>{tr("stays with you.", "أثر.")}</em></h1>
        <p>{tr("Warm woods, luminous amber and fresh citrus. Discover the scent that feels like yours.", "أخشاب دافئة وعنبر وحمضيات منعشة. اكتشف العطر اللي يشبهك.")}</p>
        <Link href="/shop" className="action ink">
          {tr("Explore the collection", "استكشف التشكيلة")}<ArrowUpRight size={17}/>
        </Link>
      </div>
      <figure className="hero-visual">
        <img src="/brand/olive-hero.webp" alt="" width={1280} height={960} fetchPriority="high"/>
        <figcaption><span>SIYAG PARFUMS</span><span>{tr("01 / THE HOUSE", "٠١ / الدار")}</span></figcaption>
      </figure>
    </section>

    <div className="brand-strip">
      <div><FlaskConical size={16}/>{tr("Eau de Parfum", "أو دو بارفان")}</div>
      <div><Sparkles size={16}/>{tr("Explore by fragrance family", "تسوّق حسب العائلة العطرية")}</div>
      <div><Box size={16}/>{tr("Delivery across Egypt", "توصيل داخل مصر")}</div>
    </div>

    <section className="container section collections-section" id="collections">
      <div className="section-head">
        <div>
          <span className="eyebrow">{tr("THE COLLECTIONS", "التشكيلات")}</span>
          <h2>{tr("Find your signature.", "اختار عطرك المميز.")}</h2>
        </div>
        <Link className="text-link" href="/shop">
          {tr("Explore all fragrances", "كل العطور")}<ArrowUpRight size={16}/>
        </Link>
      </div>
      <div className="collections-grid">
        {categories.map((category, index) => <Link className="collection-card" href={category.href} key={category.href}>
          <div className="collection-visual">
            <img src={category.image} alt="" width={600} height={600} loading="lazy"/>
          </div>
          <div className="collection-caption">
            <span>0{index + 1}</span>
            <h3>{category.title}</h3>
            <span className="circle-arrow"><ArrowUpRight size={19}/></span>
          </div>
        </Link>)}
      </div>
    </section>

    {products.length > 0 && <section className="catalog-home"><div className="container section">
      <div className="section-head">
        <div><span className="eyebrow">{tr("FROM THE HOUSE", "من دار سياج")}</span><h2>{tr("The SIYAG edit.", "مختارات سياج.")}</h2></div>
        <Link className="text-link" href="/shop">{tr("View the collection", "شوف التشكيلة")}<ArrowUpRight size={16}/></Link>
      </div>
      <div className="product-grid">{products.map(product => <ProductCard product={product} key={product.id}/>)}</div>
    </div></section>}

    <section className="story" id="maison">
      <img src="/brand/olive-notes.webp" alt="" width={1140} height={855} loading="lazy"/>
      <div>
        <span className="eyebrow">{tr("THE HOUSE OF SIYAG", "دار سياج")}</span>
        <h2>{tr("From the first note.", "من أول نوتة.")}</h2>
        <p>{tr("Get to know the opening, heart and base of each fragrance before choosing the one you’ll wear.", "تعرّف على افتتاحية كل عطر وقلبه وقاعدته قبل ما تختار العطر المناسب لك.")}</p>
        <Link href="/shop" className="action ink">{tr("Discover the scents", "اكتشف العطور")}<ArrowUpRight size={16}/></Link>
      </div>
    </section>
  </main>;
}
