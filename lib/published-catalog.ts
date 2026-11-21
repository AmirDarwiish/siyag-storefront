import type {Collection,Product,Page} from './store';
/** Approved numbered fragrances. No preview stock or reserved number 9 is published. */
export const publishedProducts:Product[]=[
  {
    "id": "ea12f2a1-ee32-4454-9fc9-75d863db7f16",
    "slug": "siyag-7",
    "nameEn": "SIYAG 7",
    "nameAr": "SIYAG 7",
    "descriptionEn": "SIYAG 7 — EXTRAIT DE PARFUM\n\nGolden honey meets warm tobacco in a refined, enveloping fragrance. A bright opening of bergamot, lemon and lavender leads into a heart of honey, cinnamon, jasmine and soft cashmere nuances. Tobacco leaf, vanilla and tonka bean create a warm, rounded finish.\n\nA unisex fragrance balancing aromatic freshness with comforting sweetness. An elegant choice for evenings and cooler weather.\n\nAvailable in 30 ml and 50 ml.",
    "descriptionAr": "سياج 7 — EXTRAIT DE PARFUM\n\nحلاوة العسل ودفء التبغ، في عطر يترك حضورًا أنيقًا وعميقًا. تنطلق تركيبته بانتعاش البرغموت والليمون ونعومة اللافندر، ثم تنفتح على قلب من العسل والقرفة والياسمين ولمسة كشميرية. وتستقر على قاعدة دافئة من أوراق التبغ والفانيليا وحبوب التونكا.\n\nعطر للجميع، يجمع الانتعاش العطري والحلاوة الدافئة. اختيار مناسب للمساء والأجواء المعتدلة والباردة.\n\nمتوفر بحجمَي ٣٠ مل و٥٠ مل.",
    "brand": "SIYAG Perfumes",
    "family": "gourmand",
    "concentration": "parfum",
    "audience": "unisex",
    "topNotes": [
      "Bergamot | برغموت",
      "Lemon | ليمون",
      "Lavender | لافندر"
    ],
    "heartNotes": [
      "Honey | عسل",
      "Cinnamon | قرفة",
      "Jasmine | ياسمين",
      "Cashmere | كشمير"
    ],
    "baseNotes": [
      "Tobacco Leaf | أوراق التبغ",
      "Vanilla | فانيليا",
      "Tonka Bean | حبوب التونكا"
    ],
    "images": [
      "/media/517524cece8f488357a363934d1d5317896ec5edd9a1bc0eda7db158b4a1e613.webp",
      "/media/0dba6254073f14146b358231328b35b44a81db8437e3be3f420c43ab5330779f.webp",
      "/media/4d1e736aef06854f896d0c217aeb9aea786d53cfddd0500b080a22f8ba4e05b8.webp",
      "/media/4b6562b46aa90174fb7cbeef21fe3c9467ccc3e20ff91f445defcd209feebfe1.webp"
    ],
    "featured": false,
    "variants": [
      {
        "id": "4a639957-0872-5454-9258-56beebdc792c",
        "sku": "SIYAG-7-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 0,
        "compareAtMinor": null,
        "inStock": true
      },
      {
        "id": "c9fd5b44-47c8-5d96-a67e-c4183b387236",
        "sku": "SIYAG-7-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 0,
        "compareAtMinor": null,
        "inStock": true
      }
    ],
    "collections": [
      "new-arrivals",
      "signature"
    ],
    "seo": {
      "titleEn": "SIYAG 7",
      "descriptionEn": "SIYAG 7 — inspired by Xerjoff Naxos. 30 ml and 50 ml."
    },
    "inspiration": {
      "nameEn": "Xerjoff Naxos",
      "nameAr": "زيرجوف ناكسوس",
      "descriptionEn": "Inspired by Xerjoff Naxos.",
      "descriptionAr": "مستوحى من زيرجوف ناكسوس.",
      "imageUrl": "/brand/inspiration/naxos.webp"
    }
  },
  {
    "id": "f2fee72f-216c-5175-9e64-76bc90da479e",
    "slug": "siyag-6",
    "nameEn": "SIYAG 6",
    "nameAr": "SIYAG 6",
    "descriptionEn": "SIYAG 6 — inspired by Decision. Available in 30 ml and 50 ml.",
    "descriptionAr": "SIYAG 6 — مستوحى من ديسيشن. متوفر بحجمَي ٣٠ مل و٥٠ مل.",
    "brand": "SIYAG",
    "family": "other",
    "concentration": "parfum",
    "audience": "unisex",
    "topNotes": [],
    "heartNotes": [],
    "baseNotes": [],
    "images": [
      "/brand/numbered/siyag-6-50.svg",
      "/brand/numbered/siyag-6-30.svg"
    ],
    "featured": false,
    "collections": [
      "signature",
      "new-arrivals"
    ],
    "inspiration": {
      "nameEn": "Decision",
      "nameAr": "ديسيشن",
      "descriptionEn": "",
      "descriptionAr": ""
    },
    "variants": [
      {
        "id": "1a85ea21-83d1-5dbe-abc1-bbce139dc58a",
        "sku": "SIYAG-6-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 0,
        "compareAtMinor": null,
        "inStock": true,
        "imageUrl": "/brand/numbered/siyag-6-30.svg"
      },
      {
        "id": "8aee8ff0-44ba-5635-b086-8af7bc778775",
        "sku": "SIYAG-6-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 0,
        "compareAtMinor": null,
        "inStock": true,
        "imageUrl": "/brand/numbered/siyag-6-50.svg"
      }
    ]
  },
  {
    "id": "f0f4eec4-4e7c-5edb-8423-c59686f2a7d8",
    "slug": "siyag-1",
    "nameEn": "SIYAG 1",
    "nameAr": "SIYAG 1",
    "descriptionEn": "SIYAG 1 — inspired by Stronger With You Intensely. Available in 30 ml and 50 ml.",
    "descriptionAr": "SIYAG 1 — مستوحى من سترونجر ويذ يو إنتنسلي. متوفر بحجمَي ٣٠ مل و٥٠ مل.",
    "brand": "SIYAG",
    "family": "other",
    "concentration": "parfum",
    "audience": "unisex",
    "topNotes": [],
    "heartNotes": [],
    "baseNotes": [],
    "images": [
      "/brand/numbered/siyag-1-50.svg",
      "/brand/numbered/siyag-1-30.svg"
    ],
    "featured": false,
    "collections": [
      "signature",
      "new-arrivals"
    ],
    "inspiration": {
      "nameEn": "Stronger With You Intensely",
      "nameAr": "سترونجر ويذ يو إنتنسلي",
      "descriptionEn": "",
      "descriptionAr": ""
    },
    "variants": [
      {
        "id": "550215b4-3e92-5ce0-937c-86190d755aee",
        "sku": "SIYAG-1-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 0,
        "compareAtMinor": null,
        "inStock": true,
        "imageUrl": "/brand/numbered/siyag-1-30.svg"
      },
      {
        "id": "d04eb4bf-38c7-5cae-b690-d2bd8165a564",
        "sku": "SIYAG-1-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 0,
        "compareAtMinor": null,
        "inStock": true,
        "imageUrl": "/brand/numbered/siyag-1-50.svg"
      }
    ]
  },
  {
    "id": "d3cf7f87-319d-5d65-816c-903fa51b295c",
    "slug": "siyag-3",
    "nameEn": "SIYAG 3",
    "nameAr": "SIYAG 3",
    "descriptionEn": "SIYAG 3 — inspired by Nishane. Available in 30 ml and 50 ml.",
    "descriptionAr": "SIYAG 3 — مستوحى من نيشاني. متوفر بحجمَي ٣٠ مل و٥٠ مل.",
    "brand": "SIYAG",
    "family": "other",
    "concentration": "parfum",
    "audience": "unisex",
    "topNotes": [],
    "heartNotes": [],
    "baseNotes": [],
    "images": [
      "/brand/numbered/siyag-3-50.svg",
      "/brand/numbered/siyag-3-30.svg"
    ],
    "featured": false,
    "collections": [
      "signature",
      "new-arrivals"
    ],
    "inspiration": {
      "nameEn": "Nishane",
      "nameAr": "نيشاني",
      "descriptionEn": "",
      "descriptionAr": ""
    },
    "variants": [
      {
        "id": "7b5cc861-73b2-59f9-97b1-65d4e2a35548",
        "sku": "SIYAG-3-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 0,
        "compareAtMinor": null,
        "inStock": true,
        "imageUrl": "/brand/numbered/siyag-3-30.svg"
      },
      {
        "id": "95322814-abdb-5281-8ace-e0eb86fe029d",
        "sku": "SIYAG-3-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 0,
        "compareAtMinor": null,
        "inStock": true,
        "imageUrl": "/brand/numbered/siyag-3-50.svg"
      }
    ]
  }
];
export const publishedCollections:Collection[]=[
  {
    "slug": "signature",
    "nameEn": "The SIYAG collection",
    "nameAr": "مجموعة SIYAG",
    "imageUrl": "/brand/categories/signature.webp"
  },
  {
    "slug": "new-arrivals",
    "nameEn": "New arrivals",
    "nameAr": "وصل حديثًا",
    "imageUrl": "/brand/categories/new-arrivals.webp"
  }
];
export function publishedProduct(slug:string){return publishedProducts.find(p=>p.slug===slug)??null}
export function publishedPage(query:URLSearchParams):Page<Product>{
 const pageNumber=Math.max(1,Math.floor(Number(query.get('pageNumber')))||1),pageSize=Math.max(1,Math.min(100,Math.floor(Number(query.get('pageSize')))||12));
 const term=query.get('q')?.trim().toLocaleLowerCase();
 const data=publishedProducts.filter(p=>(!term||[p.nameEn,p.nameAr,p.descriptionEn,p.descriptionAr,p.inspiration?.nameEn??"",p.inspiration?.nameAr??""].some(x=>x.toLocaleLowerCase().includes(term)))&&(!query.get('collection')||p.collections.includes(query.get('collection')!))&&(!query.get('family')||p.family===query.get('family'))&&(!query.get('concentration')||p.concentration===query.get('concentration'))&&p.variants.some(v=>(!query.get('sizeMl')||v.sizeMl===Number(query.get('sizeMl')))&&(!query.get('format')||v.format===query.get('format')))&&(!query.get('audience')||p.audience===query.get('audience')));
 return {data:data.slice((pageNumber-1)*pageSize,pageNumber*pageSize),totalCount:data.length,pageSize,pageNumber,totalPages:Math.ceil(data.length/pageSize)};
}
