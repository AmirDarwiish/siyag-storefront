import type {Collection,Product,Page} from './store';
/** Owner-approved 21-fragrance catalogue. Prices are EGP minor units; inventory comes from the API. */
export const publishedProducts:Product[]=[
  {
    "id": "f0f4eec4-4e7c-5edb-8423-c59686f2a7d8",
    "slug": "siyag-1",
    "nameEn": "SIYAG 1",
    "nameAr": "SIYAG 1",
    "descriptionEn": "Warm, sensual and inviting, with a softly sweet character made for date nights and evenings that deserve a little more presence.",
    "descriptionAr": "دافئ وجذّاب بحلاوة ناعمة وحضور مميز، اختيار مناسب للمواعيد المسائية واللحظات القريبة.",
    "brand": "SIYAG",
    "family": "amber",
    "concentration": "parfum",
    "audience": "men",
    "topNotes": [
      "Pink Pepper | فلفل وردي"
    ],
    "heartNotes": [
      "Lavender | لافندر",
      "Sage | مريمية",
      "Chestnut | كستناء",
      "Cinnamon | قرفة"
    ],
    "baseNotes": [
      "Vanilla | فانيليا",
      "Amber Woods | أخشاب عنبرية"
    ],
    "images": [
      "/brand/numbered/siyag-1-notes-gold.webp",
      "/brand/numbered/siyag-1-photo-gold.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "Emporio Armani Stronger With You Intensely",
      "nameAr": "إمبوريو أرماني سترونجر ويذ يو إنتنسلي",
      "descriptionEn": "Inspired by Emporio Armani Stronger With You Intensely.",
      "descriptionAr": "مستوحى من إمبوريو أرماني سترونجر ويذ يو إنتنسلي.",
      "imageUrl": "/brand/inspiration/intensely-3d.webp"
    },
    "notesImageUrl": "/brand/numbered/siyag-1-notes-gold.webp",
    "variants": [
      {
        "id": "550215b4-3e92-5ce0-937c-86190d755aee",
        "sku": "SIYAG-1-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 45000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "d04eb4bf-38c7-5cae-b690-d2bd8165a564",
        "sku": "SIYAG-1-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 80000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 1",
      "descriptionEn": "Warm, sensual and inviting, with a softly sweet character made for date nights and evenings that deserve a little more presence."
    }
  },
  {
    "id": "6790f539-492f-56ed-879a-b7aaa21b8495",
    "slug": "siyag-2",
    "nameEn": "SIYAG 2",
    "nameAr": "SIYAG 2",
    "descriptionEn": "An indulgent, toffee-like sweetness with a playful gourmand character. A fragrance for anyone who loves their signature unapologetically sweet.",
    "descriptionAr": "إحساس غني بحلاوة تشبه التوفي وطابع جورماند مرح؛ لعشّاق العطور الحلوة بحضورها الواضح.",
    "brand": "SIYAG",
    "family": "gourmand",
    "concentration": "parfum",
    "audience": "unisex",
    "topNotes": [],
    "heartNotes": [],
    "baseNotes": [
      "Jackfruit Blossom | زهر الجاك فروت",
      "Juniper Berry | توت العرعر",
      "Lily of the Valley | زنبق الوادي",
      "Lychee | ليتشي",
      "Teak | خشب الساج"
    ],
    "images": [
      "/brand/numbered/siyag-2-notes-v2.webp",
      "/brand/numbered/siyag-2-photo-v2.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "Arabian Oud Feeling",
      "nameAr": "العربية للعود فيلينج",
      "descriptionEn": "Inspired by Arabian Oud Feeling.",
      "descriptionAr": "مستوحى من العربية للعود فيلينج.",
      "imageUrl": "/brand/inspiration/catalog-2-3d-v2.webp"
    },
    "variants": [
      {
        "id": "a650f630-e846-5516-b59f-92d067a83c2a",
        "sku": "SIYAG-2-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 29000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "40fa6af0-67b8-54d4-ac3c-089fbe878001",
        "sku": "SIYAG-2-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 52000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 2",
      "descriptionEn": "An indulgent, toffee-like sweetness with a playful gourmand character. A fragrance for anyone who loves their signature unapologetically sweet."
    },
    "notesImageUrl": "/brand/numbered/siyag-2-notes-v2.webp"
  },
  {
    "id": "d3cf7f87-319d-5d65-816c-903fa51b295c",
    "slug": "siyag-3",
    "nameEn": "SIYAG 3",
    "nameAr": "SIYAG 3",
    "descriptionEn": "Bright citrus meets creamy vanilla in a scent that brings a freshly baked lemon cake to mind. Comforting, smooth and full of character.",
    "descriptionAr": "انتعاش حمضي يلتقي بفانيليا كريمية في إحساس يذكّرك بكيكة الليمون؛ ناعم ودافئ ومليان شخصية.",
    "brand": "SIYAG",
    "family": "gourmand",
    "concentration": "parfum",
    "audience": "unisex",
    "topNotes": [
      "Bergamot | برغموت",
      "Green Notes | نوتات خضراء",
      "Blue Ginger | زنجبيل أزرق",
      "Pink Pepper | فلفل وردي"
    ],
    "heartNotes": [
      "Blackcurrant | كشمش أسود",
      "Turkish Rose | ورد تركي",
      "Cardamom | هيل"
    ],
    "baseNotes": [
      "Patchouli | باتشولي",
      "Cedarwood | خشب الأرز",
      "Vanilla | فانيليا",
      "Benzoin | بنزوين",
      "Ambergris | عنبر رمادي",
      "Musk | مسك",
      "Sandalwood | خشب الصندل"
    ],
    "images": [
      "/brand/numbered/siyag-3-notes-gold.webp",
      "/brand/numbered/siyag-3-photo-gold.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "Nishane Ani",
      "nameAr": "نيشاني آني",
      "descriptionEn": "Inspired by Nishane Ani.",
      "descriptionAr": "مستوحى من نيشاني آني.",
      "imageUrl": "/brand/inspiration/ani-3d.webp"
    },
    "notesImageUrl": "/brand/numbered/siyag-3-notes-gold.webp",
    "variants": [
      {
        "id": "7b5cc861-73b2-59f9-97b1-65d4e2a35548",
        "sku": "SIYAG-3-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 38000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "95322814-abdb-5281-8ace-e0eb86fe029d",
        "sku": "SIYAG-3-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 65000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 3",
      "descriptionEn": "Bright citrus meets creamy vanilla in a scent that brings a freshly baked lemon cake to mind. Comforting, smooth and full of character."
    }
  },
  {
    "id": "8501a8e6-d97b-5fdd-9d1b-5489414aa432",
    "slug": "siyag-4",
    "nameEn": "SIYAG 4",
    "nameAr": "SIYAG 4",
    "descriptionEn": "An expressive lavender-led scent with a clean, freshly showered feeling. Smooth and polished, with a vibrant aromatic presence.",
    "descriptionAr": "حضور عطري واضح يقوده اللافندر، بإحساس نظيف ومنتعش يشبه الخروج من الدش؛ ناعم ومرتب وحيوي.",
    "brand": "SIYAG",
    "family": "woody",
    "concentration": "parfum",
    "audience": "unisex",
    "topNotes": [
      "Bourbon Vanilla | فانيليا بوربون"
    ],
    "heartNotes": [
      "Lavender | لافندر"
    ],
    "baseNotes": [
      "Vetiver | نجيل الهند"
    ],
    "images": [
      "/brand/numbered/siyag-4-notes-v2.webp",
      "/brand/numbered/siyag-4-photo-v2.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "Valentino Uomo Born in Roma Intense",
      "nameAr": "فالنتينو أومو بورن إن روما إنتنس",
      "descriptionEn": "Inspired by Valentino Uomo Born in Roma Intense.",
      "descriptionAr": "مستوحى من فالنتينو أومو بورن إن روما إنتنس.",
      "imageUrl": "/brand/inspiration/catalog-4-3d-v2.webp"
    },
    "variants": [
      {
        "id": "69bcb508-ef0d-5c03-8b75-3adf3137cef8",
        "sku": "SIYAG-4-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 35000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "6ca34f63-d6d1-5ea4-b84f-86594d0087ea",
        "sku": "SIYAG-4-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 60000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 4",
      "descriptionEn": "An expressive lavender-led scent with a clean, freshly showered feeling. Smooth and polished, with a vibrant aromatic presence."
    },
    "notesImageUrl": "/brand/numbered/siyag-4-notes-v2.webp"
  },
  {
    "id": "da3c97a7-fdb9-5fdc-a661-6c1ee085109e",
    "slug": "siyag-5",
    "nameEn": "SIYAG 5",
    "nameAr": "SIYAG 5",
    "descriptionEn": "Fresh woods with a polished, versatile character. An effortless signature that moves comfortably between dressed-up occasions and everyday plans.",
    "descriptionAr": "أخشاب منعشة بطابع أنيق ومرن؛ توقيع عطري يناسب إطلالة رسمية أو يومك العادي بسهولة.",
    "brand": "SIYAG",
    "family": "woody",
    "concentration": "parfum",
    "audience": "men",
    "topNotes": [],
    "heartNotes": [],
    "baseNotes": [
      "Cedar | خشب الأرز",
      "Sandalwood | خشب الصندل",
      "Musk | مسك"
    ],
    "images": [
      "/brand/numbered/siyag-5-notes-v2.webp",
      "/brand/numbered/siyag-5-photo-v2.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "BLEU DE CHANEL Eau de Parfum",
      "nameAr": "بلو دي شانيل أو دو بارفان",
      "descriptionEn": "Inspired by BLEU DE CHANEL Eau de Parfum.",
      "descriptionAr": "مستوحى من بلو دي شانيل أو دو بارفان.",
      "imageUrl": "/brand/inspiration/catalog-5-3d-v2.webp"
    },
    "variants": [
      {
        "id": "31f5f49d-7bc3-551d-9e77-06a34c5365e8",
        "sku": "SIYAG-5-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 46000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "d75700ec-f2b0-566d-9ef4-ed72fce8420f",
        "sku": "SIYAG-5-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 82000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 5",
      "descriptionEn": "Fresh woods with a polished, versatile character. An effortless signature that moves comfortably between dressed-up occasions and everyday plans."
    },
    "notesImageUrl": "/brand/numbered/siyag-5-notes-v2.webp"
  },
  {
    "id": "00dbc4f1-30d6-57de-8e71-bafb88ed46fe",
    "slug": "siyag-6",
    "nameEn": "SIYAG 6",
    "nameAr": "SIYAG 6",
    "descriptionEn": "Creamy vanilla with a soft, enveloping sweetness. A deliciously comforting scent that feels warm, inviting and effortlessly indulgent.",
    "descriptionAr": "فانيليا كريمية بحلاوة ناعمة تحتضن الحواس؛ إحساس شهي ودافئ يترك حضورًا جذّابًا ومريحًا.",
    "brand": "SIYAG",
    "family": "gourmand",
    "concentration": "parfum",
    "audience": "unisex",
    "topNotes": [
      "Bergamot | برغموت",
      "Mandarin | ماندرين",
      "Elemi | إيليمي"
    ],
    "heartNotes": [
      "Orange Blossom | زهر البرتقال",
      "Cinnamon | قرفة",
      "Cardamom | هيل"
    ],
    "baseNotes": [
      "Bourbon Vanilla | فانيليا بوربون",
      "Guaiac Wood | خشب الغاياك",
      "Praline | برالين"
    ],
    "images": [
      "/brand/numbered/siyag-6-notes-v2.webp",
      "/brand/numbered/siyag-6-photo-v2.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "Parfums de Marly Althaïr",
      "nameAr": "بارفامز دي مارلي ألثير",
      "descriptionEn": "Inspired by Parfums de Marly Althaïr.",
      "descriptionAr": "مستوحى من بارفامز دي مارلي ألثير.",
      "imageUrl": "/brand/inspiration/catalog-6-3d-v2.webp"
    },
    "variants": [
      {
        "id": "16151a35-080b-5f7d-9ee7-d101d8fab948",
        "sku": "SIYAG-6-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 38000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "bd747ddd-55ec-5e06-815f-014e049bad46",
        "sku": "SIYAG-6-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 63000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 6",
      "descriptionEn": "Creamy vanilla with a soft, enveloping sweetness. A deliciously comforting scent that feels warm, inviting and effortlessly indulgent."
    },
    "notesImageUrl": "/brand/numbered/siyag-6-notes-v2.webp"
  },
  {
    "id": "f2fee72f-216c-5175-9e64-76bc90da479e",
    "slug": "siyag-7",
    "nameEn": "SIYAG 7",
    "nameAr": "SIYAG 7",
    "descriptionEn": "A distinctive frankincense-led character, lifted by freshness and grounded in woods. Refined and individual, for a signature with its own point of view.",
    "descriptionAr": "طابع مميز يقوده اللبان، ترفعه لمسة انتعاش وتمنحه الأخشاب عمقًا أنيقًا؛ لمن يحب عطرًا له شخصية مختلفة.",
    "brand": "SIYAG",
    "family": "woody",
    "concentration": "parfum",
    "audience": "men",
    "topNotes": [
      "Pink Pepper | فلفل وردي",
      "Bergamot | برغموت",
      "Cardamom | هيل"
    ],
    "heartNotes": [
      "Frankincense | لبان",
      "Juniper | عرعر",
      "Myrrh | مُرّ"
    ],
    "baseNotes": [
      "Patchouli | باتشولي",
      "Cedarwood | خشب الأرز",
      "Vanilla | فانيليا"
    ],
    "images": [
      "/brand/numbered/siyag-7-notes-v2.webp",
      "/brand/numbered/siyag-7-photo.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "Amouage Decision",
      "nameAr": "أمواج ديسيشن",
      "descriptionEn": "Inspired by Amouage Decision.",
      "descriptionAr": "مستوحى من أمواج ديسيشن.",
      "imageUrl": "/brand/inspiration/decision-3d.webp"
    },
    "variants": [
      {
        "id": "1a85ea21-83d1-5dbe-abc1-bbce139dc58a",
        "sku": "SIYAG-7-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 65000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "8aee8ff0-44ba-5635-b086-8af7bc778775",
        "sku": "SIYAG-7-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 100000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 7",
      "descriptionEn": "A distinctive frankincense-led character, lifted by freshness and grounded in woods. Refined and individual, for a signature with its own point of view."
    },
    "notesImageUrl": "/brand/numbered/siyag-7-notes-v2.webp"
  },
  {
    "id": "ea12f2a1-ee32-4454-9fc9-75d863db7f16",
    "slug": "siyag-8",
    "nameEn": "SIYAG 8",
    "nameAr": "SIYAG 8",
    "descriptionEn": "Warm, richly textured and confidently refined. A composed signature for formal occasions and moments when you want your presence to speak quietly.",
    "descriptionAr": "دافئ وغني بالتفاصيل بطابع واثق وراقٍ؛ توقيع متزن للمناسبات الرسمية ولحضور أنيق يلفت من غير مبالغة.",
    "brand": "SIYAG",
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
      "/brand/numbered/siyag-8-notes-v2.webp",
      "/brand/numbered/siyag-8-photo-v2.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "Xerjoff Naxos",
      "nameAr": "زيرجوف ناكسوس",
      "descriptionEn": "Inspired by Xerjoff Naxos.",
      "descriptionAr": "مستوحى من زيرجوف ناكسوس.",
      "imageUrl": "/brand/inspiration/naxos.webp"
    },
    "variants": [
      {
        "id": "4a639957-0872-5454-9258-56beebdc792c",
        "sku": "SIYAG-8-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 35000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "8c97091c-5dd5-40fd-b84a-674ec8924d0c",
        "sku": "SIYAG-8-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 60000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 8",
      "descriptionEn": "Warm, richly textured and confidently refined. A composed signature for formal occasions and moments when you want your presence to speak quietly."
    },
    "notesImageUrl": "/brand/numbered/siyag-8-notes-v2.webp"
  },
  {
    "id": "4fdded53-6f25-5293-973b-8fd6c5bfe80d",
    "slug": "siyag-9",
    "nameEn": "SIYAG 9",
    "nameAr": "SIYAG 9",
    "descriptionEn": "Luminous white florals with a deep, enveloping character. Elegant and expressive, balancing airy beauty with a richer sense of presence.",
    "descriptionAr": "زهور بيضاء مضيئة بطابع عميق يحتضن الحواس؛ أناقة تجمع نعومة الزهور وحضورها الغني.",
    "brand": "SIYAG",
    "family": "floral",
    "concentration": "parfum",
    "audience": "unisex",
    "topNotes": [],
    "heartNotes": [],
    "baseNotes": [
      "Amber | عنبر",
      "Orange Blossom | زهر البرتقال",
      "Peru Balsam | بلسم بيرو"
    ],
    "images": [
      "/brand/numbered/siyag-9-notes-v2.webp",
      "/brand/numbered/siyag-9-photo-v2.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "Louis Vuitton Stellar Times",
      "nameAr": "لويس فويتون ستيلار تايمز",
      "descriptionEn": "Inspired by Louis Vuitton Stellar Times.",
      "descriptionAr": "مستوحى من لويس فويتون ستيلار تايمز.",
      "imageUrl": "/brand/inspiration/catalog-9-3d-v2.webp"
    },
    "variants": [
      {
        "id": "409d4fea-cf9d-5fe3-8388-4b80c2b4f9ed",
        "sku": "SIYAG-9-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 39000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "adadf83c-79e2-5a82-aada-71633f92237a",
        "sku": "SIYAG-9-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 67000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 9",
      "descriptionEn": "Luminous white florals with a deep, enveloping character. Elegant and expressive, balancing airy beauty with a richer sense of presence."
    },
    "notesImageUrl": "/brand/numbered/siyag-9-notes-v2.webp"
  },
  {
    "id": "eec0afe7-9647-5805-b721-1f400d17c9d5",
    "slug": "siyag-10",
    "nameEn": "SIYAG 10",
    "nameAr": "SIYAG 10",
    "descriptionEn": "Rich amber and indulgent sweetness create a bold evening signature. Confident, dressed-up and full of character after dark.",
    "descriptionAr": "عنبر غني وحلاوة عميقة يصنعان توقيعًا مسائيًا جريئًا؛ حضور واثق يناسب الإطلالات الرسمية والليالي المميزة.",
    "brand": "SIYAG",
    "family": "amber",
    "concentration": "parfum",
    "audience": "men",
    "topNotes": [
      "Bitter Orange | برتقال مر"
    ],
    "heartNotes": [
      "Blonde Tobacco | تبغ أشقر"
    ],
    "baseNotes": [
      "Tonka Bean | حبوب التونكا"
    ],
    "images": [
      "/brand/numbered/siyag-10-notes-v2.webp",
      "/brand/numbered/siyag-10-photo-v2.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "Clive Christian Blonde Amber",
      "nameAr": "كلايف كريستيان بلوند أمبر",
      "descriptionEn": "Inspired by Clive Christian Blonde Amber.",
      "descriptionAr": "مستوحى من كلايف كريستيان بلوند أمبر.",
      "imageUrl": "/brand/inspiration/catalog-10-3d-v2.webp"
    },
    "variants": [
      {
        "id": "de6e1d11-c470-5dc9-8d9a-c1aaf00f2133",
        "sku": "SIYAG-10-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 42000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "26568e4c-b7bc-5c1e-afc9-b19a8c890cb4",
        "sku": "SIYAG-10-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 75000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 10",
      "descriptionEn": "Rich amber and indulgent sweetness create a bold evening signature. Confident, dressed-up and full of character after dark."
    },
    "notesImageUrl": "/brand/numbered/siyag-10-notes-v2.webp"
  },
  {
    "id": "58c2145e-03d4-5c94-8bc4-54d9792c08de",
    "slug": "siyag-11",
    "nameEn": "SIYAG 11",
    "nameAr": "SIYAG 11",
    "descriptionEn": "A clean, fresh impression with an elegant Arabian character. Refined and distinctive, bringing a sense of tradition to a modern signature.",
    "descriptionAr": "إحساس نظيف ومنتعش بلمسة عربية أنيقة؛ طابع مميز يجمع روح الأصالة بحضور عصري.",
    "brand": "SIYAG",
    "family": "woody",
    "concentration": "parfum",
    "audience": "men",
    "topNotes": [
      "Pink Pepper | فلفل وردي",
      "Frankincense | لبان",
      "Cumin | كمون",
      "Cardamom | هيل",
      "Saffron | زعفران",
      "Mace | قشور جوزة الطيب",
      "Nutmeg | جوزة الطيب",
      "Myrtle | آس"
    ],
    "heartNotes": [
      "Geranium | إبرة الراعي",
      "Myrrh | مُرّ"
    ],
    "baseNotes": [
      "Oud | عود",
      "Sandalwood | خشب الصندل",
      "Patchouli | باتشولي",
      "Leather | جلد",
      "Frankincense | لبان",
      "Cedarwood | خشب الأرز",
      "Musk | مسك",
      "Castoreum | كاستوريوم"
    ],
    "images": [
      "/brand/numbered/siyag-11-notes-v2.webp",
      "/brand/numbered/siyag-11-photo-v2.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "Amouage Epic Man",
      "nameAr": "أمواج إبيك مان",
      "descriptionEn": "Inspired by Amouage Epic Man.",
      "descriptionAr": "مستوحى من أمواج إبيك مان.",
      "imageUrl": "/brand/inspiration/catalog-11-3d-v2.webp"
    },
    "variants": [
      {
        "id": "3d4a5e6f-ef49-52e3-ad3c-3ee3b42d02f8",
        "sku": "SIYAG-11-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 45000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "7e9eb75e-4a96-550e-911c-d04685972c99",
        "sku": "SIYAG-11-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 80000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 11",
      "descriptionEn": "A clean, fresh impression with an elegant Arabian character. Refined and distinctive, bringing a sense of tradition to a modern signature."
    },
    "notesImageUrl": "/brand/numbered/siyag-11-notes-v2.webp"
  },
  {
    "id": "e9060915-392d-55a0-92eb-1fc380a4212d",
    "slug": "siyag-12",
    "nameEn": "SIYAG 12",
    "nameAr": "SIYAG 12",
    "descriptionEn": "Creamy, powdery vanilla with a softly coconut-like impression. A comforting gourmand signature with a delicate, feminine-leaning character.",
    "descriptionAr": "فانيليا كريمية وبودرية بإحساس ناعم يذكّر بجوز الهند؛ توقيع جورماند مريح للجميع يميل للرقة الأنثوية.",
    "brand": "SIYAG",
    "family": "gourmand",
    "concentration": "parfum",
    "audience": "unisex",
    "topNotes": [],
    "heartNotes": [],
    "baseNotes": [
      "Madagascar Vanilla | فانيليا مدغشقر",
      "Tonka Bean | حبوب التونكا",
      "White Powders | نوتات بودرية بيضاء"
    ],
    "images": [
      "/brand/numbered/siyag-12-notes-v2.webp",
      "/brand/numbered/siyag-12-photo-v2.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "Matière Première Vanilla Powder Extrait de Parfum",
      "nameAr": "ماتيير بريميير فانيلا باودر إكستريت",
      "descriptionEn": "Inspired by Matière Première Vanilla Powder Extrait de Parfum.",
      "descriptionAr": "مستوحى من ماتيير بريميير فانيلا باودر إكستريت.",
      "imageUrl": "/brand/inspiration/catalog-12-3d-v2.webp"
    },
    "variants": [
      {
        "id": "381e76f5-3ca1-5c8f-89e5-fd24a276729a",
        "sku": "SIYAG-12-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 38000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "95c6e34d-147c-5947-8d6b-c670bbd70af5",
        "sku": "SIYAG-12-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 65000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 12",
      "descriptionEn": "Creamy, powdery vanilla with a softly coconut-like impression. A comforting gourmand signature with a delicate, feminine-leaning character."
    },
    "notesImageUrl": "/brand/numbered/siyag-12-notes-v2.webp"
  },
  {
    "id": "260905e7-ea02-5cb9-aefd-3d5e030010a1",
    "slug": "siyag-13",
    "nameEn": "SIYAG 13",
    "nameAr": "SIYAG 13",
    "descriptionEn": "Cool aromatic freshness meets a vivid touch of spice and a deeper, dressed-up character. A distinctive choice for tailored looks and formal evenings.",
    "descriptionAr": "انتعاش عطري بارد تبرزه لمسة توابل وعمق أنيق؛ اختيار مميز للإطلالات الرسمية والبدل.",
    "brand": "SIYAG",
    "family": "woody",
    "concentration": "parfum",
    "audience": "men",
    "topNotes": [
      "Cardamom | هيل",
      "Bergamot | برغموت",
      "Lemon | ليمون",
      "Sichuan Pepper | فلفل سيتشوان",
      "Elemi | إيليمي",
      "Frankincense | لبان"
    ],
    "heartNotes": [
      "Patchouli | باتشولي",
      "Rose | ورد",
      "Orange Blossom | زهر البرتقال",
      "Cumin | كمون",
      "Geranium | إبرة الراعي",
      "Davana | دافانا",
      "Saffron | زعفران",
      "Anise | يانسون",
      "Coriander | كزبرة"
    ],
    "baseNotes": [
      "Benzoin | بنزوين",
      "Labdanum | لابدانوم",
      "Amber | عنبر",
      "Ambergris | عنبر رمادي",
      "Frankincense | لبان",
      "Opoponax | أوبوبوناكس",
      "Vanilla | فانيليا",
      "Birch | بتولا",
      "Musk | مسك",
      "Oud | عود"
    ],
    "images": [
      "/brand/numbered/siyag-13-notes-v2.webp",
      "/brand/numbered/siyag-13-photo-v2.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "Amouage Outlands",
      "nameAr": "أمواج أوتلاندز",
      "descriptionEn": "Inspired by Amouage Outlands.",
      "descriptionAr": "مستوحى من أمواج أوتلاندز.",
      "imageUrl": "/brand/inspiration/catalog-13-3d-v2.webp"
    },
    "variants": [
      {
        "id": "9215456c-9547-5c23-afc6-30cebc417247",
        "sku": "SIYAG-13-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 40000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "12004817-42d4-529a-ac9d-edacb7fbddc0",
        "sku": "SIYAG-13-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 72000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 13",
      "descriptionEn": "Cool aromatic freshness meets a vivid touch of spice and a deeper, dressed-up character. A distinctive choice for tailored looks and formal evenings."
    },
    "notesImageUrl": "/brand/numbered/siyag-13-notes-v2.webp"
  },
  {
    "id": "ed22818f-0e2e-5a5e-83d0-c1e6328b2a48",
    "slug": "siyag-14",
    "nameEn": "SIYAG 14",
    "nameAr": "SIYAG 14",
    "descriptionEn": "A delicate veil of powdery rose and soft musk, grounded in elegant patchouli. Feminine and quietly captivating, with an intimate evening character.",
    "descriptionAr": "ورد بودري ناعم يلتقي بالمسك ويستقر على أناقة الباتشولي؛ حضور أنثوي رقيق وجذّاب للمساء.",
    "brand": "SIYAG",
    "family": "floral",
    "concentration": "parfum",
    "audience": "women",
    "topNotes": [
      "Rose | ورد",
      "Powdery Notes | نوتات بودرية"
    ],
    "heartNotes": [
      "Musk | مسك",
      "White Rose | ورد أبيض"
    ],
    "baseNotes": [
      "Patchouli | باتشولي"
    ],
    "images": [
      "/brand/numbered/siyag-14-notes-v2.webp",
      "/brand/numbered/siyag-14-photo-v2.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "Laverne Musk Patchouli",
      "nameAr": "لافيرن مسك باتشولي",
      "descriptionEn": "Inspired by Laverne Musk Patchouli.",
      "descriptionAr": "مستوحى من لافيرن مسك باتشولي.",
      "imageUrl": "/brand/inspiration/catalog-14-3d-v2.webp"
    },
    "variants": [
      {
        "id": "ef303b30-f333-5da5-8ced-0efd7215ba3f",
        "sku": "SIYAG-14-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 38000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "bcda51f7-8626-537d-8faa-0fd739619788",
        "sku": "SIYAG-14-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 65000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 14",
      "descriptionEn": "A delicate veil of powdery rose and soft musk, grounded in elegant patchouli. Feminine and quietly captivating, with an intimate evening character."
    },
    "notesImageUrl": "/brand/numbered/siyag-14-notes-v2.webp"
  },
  {
    "id": "1e0070e0-db0d-5409-a777-ee226a522566",
    "slug": "siyag-15",
    "nameEn": "SIYAG 15",
    "nameAr": "SIYAG 15",
    "descriptionEn": "Refined woods with a confident, dressed-up presence. A polished signature for formal moments and a quietly distinctive style.",
    "descriptionAr": "أخشاب أنيقة بحضور واثق يناسب المناسبات الرسمية؛ توقيع راقٍ لمن يحب التميز بهدوء.",
    "brand": "SIYAG",
    "family": "woody",
    "concentration": "parfum",
    "audience": "men",
    "topNotes": [],
    "heartNotes": [],
    "baseNotes": [
      "Sandalwood | خشب الصندل",
      "Labdanum | لابدانوم",
      "Amber Woods | أخشاب عنبرية"
    ],
    "images": [
      "/brand/numbered/siyag-15-notes-v2.webp",
      "/brand/numbered/siyag-15-photo-v2.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "BLEU DE CHANEL L’EXCLUSIF",
      "nameAr": "بلو دي شانيل ليكسكلوسيف",
      "descriptionEn": "Inspired by BLEU DE CHANEL L’EXCLUSIF.",
      "descriptionAr": "مستوحى من بلو دي شانيل ليكسكلوسيف.",
      "imageUrl": "/brand/inspiration/catalog-15-3d-v2.webp"
    },
    "variants": [
      {
        "id": "49376e30-a3d3-56dd-83e5-bd49eb93e9d8",
        "sku": "SIYAG-15-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 40000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "872fcc36-41c9-51fa-81dd-ff397c667227",
        "sku": "SIYAG-15-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 72000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 15",
      "descriptionEn": "Refined woods with a confident, dressed-up presence. A polished signature for formal moments and a quietly distinctive style."
    },
    "notesImageUrl": "/brand/numbered/siyag-15-notes-v2.webp"
  },
  {
    "id": "51780f2c-8ae5-58f7-8d92-0a091bca76d9",
    "slug": "siyag-16",
    "nameEn": "SIYAG 16",
    "nameAr": "SIYAG 16",
    "descriptionEn": "Fresh, clean and effortlessly put together. An easy modern signature for bright starts, busy days and everyday confidence.",
    "descriptionAr": "منعش ونظيف بطابع عصري ومرتب؛ توقيع سهل لبداية يومك ومشاويرك اليومية بثقة.",
    "brand": "SIYAG",
    "family": "woody",
    "concentration": "parfum",
    "audience": "men",
    "topNotes": [],
    "heartNotes": [],
    "baseNotes": [
      "Sage | مريمية",
      "Geranium | إبرة الراعي",
      "Woods | أخشاب",
      "Tonka Bean | حبوب التونكا"
    ],
    "images": [
      "/brand/numbered/siyag-16-notes-v2.webp",
      "/brand/numbered/siyag-16-photo-v2.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "Yves Saint Laurent Y Eau de Parfum",
      "nameAr": "إيف سان لوران واي أو دو بارفان",
      "descriptionEn": "Inspired by Yves Saint Laurent Y Eau de Parfum.",
      "descriptionAr": "مستوحى من إيف سان لوران واي أو دو بارفان.",
      "imageUrl": "/brand/inspiration/catalog-16-3d-v2.webp"
    },
    "variants": [
      {
        "id": "320f55e5-1ac6-5dbb-8a3f-c5b5564b7603",
        "sku": "SIYAG-16-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 40000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "e952a5fe-b654-5d0d-8974-70339287562f",
        "sku": "SIYAG-16-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 72000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 16",
      "descriptionEn": "Fresh, clean and effortlessly put together. An easy modern signature for bright starts, busy days and everyday confidence."
    },
    "notesImageUrl": "/brand/numbered/siyag-16-notes-v2.webp"
  },
  {
    "id": "38df8af5-9060-5926-a3be-4f5244fad735",
    "slug": "siyag-17",
    "nameEn": "SIYAG 17",
    "nameAr": "SIYAG 17",
    "descriptionEn": "Soft leather with a smooth, refined character. An intimate yet distinctive signature for special occasions and carefully chosen moments.",
    "descriptionAr": "جلد ناعم بطابع سلس وراقٍ؛ توقيع قريب ومميز للمناسبات الخاصة واللحظات اللي تختار لها تفاصيلك بعناية.",
    "brand": "SIYAG",
    "family": "amber",
    "concentration": "parfum",
    "audience": "men",
    "topNotes": [
      "Cardamom | هيل",
      "Saffron | زعفران",
      "Boozy Notes | نوتات معتقة",
      "Cade | خشب الكاد"
    ],
    "heartNotes": [
      "Cistus | قستوس",
      "Suede | جلد سويدي",
      "Benzoin | بنزوين",
      "Coffee | قهوة"
    ],
    "baseNotes": [
      "Tonka Bean | حبوب التونكا",
      "Vanilla | فانيليا",
      "Labdanum | لابدانوم",
      "Guaiac Wood | خشب الغاياك",
      "Amberwood | خشب عنبري"
    ],
    "images": [
      "/brand/numbered/siyag-17-notes-v2.webp",
      "/brand/numbered/siyag-17-photo-v2.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "OMANLUXURY Caden",
      "nameAr": "عمان لاكشري كادن",
      "descriptionEn": "Inspired by OMANLUXURY Caden.",
      "descriptionAr": "مستوحى من عمان لاكشري كادن.",
      "imageUrl": "/brand/inspiration/catalog-17-3d-v2.webp"
    },
    "variants": [
      {
        "id": "874bfc2d-8e84-5236-8ab0-d58afb0e00c3",
        "sku": "SIYAG-17-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 42000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "bd218830-d912-5c23-9ad8-aa099ea229fe",
        "sku": "SIYAG-17-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 75000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 17",
      "descriptionEn": "Soft leather with a smooth, refined character. An intimate yet distinctive signature for special occasions and carefully chosen moments."
    },
    "notesImageUrl": "/brand/numbered/siyag-17-notes-v2.webp"
  },
  {
    "id": "e17fa2e9-bfbc-5f50-80d6-10069a86e5ca",
    "slug": "siyag-18",
    "nameEn": "SIYAG 18",
    "nameAr": "SIYAG 18",
    "descriptionEn": "Rich vanilla wrapped in the warmth of tobacco. Deep, comforting and full-bodied, made for winter days and atmospheric evenings.",
    "descriptionAr": "فانيليا غنية يحيط بها دفء التبغ؛ طابع عميق ومريح وممتلئ، يناسب الشتاء والأمسيات الدافئة.",
    "brand": "SIYAG",
    "family": "amber",
    "concentration": "parfum",
    "audience": "unisex",
    "topNotes": [],
    "heartNotes": [],
    "baseNotes": [
      "Tobacco Leaf | أوراق التبغ",
      "Ginger | زنجبيل",
      "Spices | توابل",
      "Vanilla | فانيليا",
      "Tonka Bean | حبوب التونكا",
      "Cocoa | كاكاو",
      "Dried Fruits | فواكه مجففة"
    ],
    "images": [
      "/brand/numbered/siyag-18-notes-v2.webp",
      "/brand/numbered/siyag-18-photo-v2.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "Tom Ford Tobacco Vanille",
      "nameAr": "توم فورد توباكو فاني",
      "descriptionEn": "Inspired by Tom Ford Tobacco Vanille.",
      "descriptionAr": "مستوحى من توم فورد توباكو فاني.",
      "imageUrl": "/brand/inspiration/catalog-18-3d-v2.webp"
    },
    "variants": [
      {
        "id": "90d0767c-4b58-5a32-b1b1-d34c24b9c4ad",
        "sku": "SIYAG-18-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 45000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "df49826a-e86c-578c-8136-4852b7c05573",
        "sku": "SIYAG-18-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 80000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 18",
      "descriptionEn": "Rich vanilla wrapped in the warmth of tobacco. Deep, comforting and full-bodied, made for winter days and atmospheric evenings."
    },
    "notesImageUrl": "/brand/numbered/siyag-18-notes-v2.webp"
  },
  {
    "id": "71b24087-fc94-540e-863f-6b6fd8b39ddc",
    "slug": "siyag-19",
    "nameEn": "SIYAG 19",
    "nameAr": "SIYAG 19",
    "descriptionEn": "Vibrant freshness with a bright, carefree holiday mood. A lively daytime signature that brings a little sunshine to everyday plans.",
    "descriptionAr": "انتعاش حيوي بروح مشرقة وخفيفة تشبه أجواء الإجازة؛ توقيع نهاري يضيف لمسة صيفية ليومك.",
    "brand": "SIYAG",
    "family": "fresh",
    "concentration": "parfum",
    "audience": "unisex",
    "topNotes": [
      "Lemon | ليمون",
      "Bergamot | برغموت",
      "Orange | برتقال"
    ],
    "heartNotes": [
      "Mediterranean Fruits | فواكه متوسطية"
    ],
    "baseNotes": [
      "Amber | عنبر",
      "Vanilla | فانيليا",
      "White Musk | مسك أبيض"
    ],
    "images": [
      "/brand/numbered/siyag-19-notes-v2.webp",
      "/brand/numbered/siyag-19-photo-v2.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "Xerjoff Erba Pura",
      "nameAr": "زيرجوف إربا بورا",
      "descriptionEn": "Inspired by Xerjoff Erba Pura.",
      "descriptionAr": "مستوحى من زيرجوف إربا بورا.",
      "imageUrl": "/brand/inspiration/catalog-19-3d-v2.webp"
    },
    "variants": [
      {
        "id": "9a8f14f0-d4e2-5b3c-b3b3-ad4355130f37",
        "sku": "SIYAG-19-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 42000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "b35e2281-7c8d-5d28-89e2-3522dfa15f81",
        "sku": "SIYAG-19-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 75000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 19",
      "descriptionEn": "Vibrant freshness with a bright, carefree holiday mood. A lively daytime signature that brings a little sunshine to everyday plans."
    },
    "notesImageUrl": "/brand/numbered/siyag-19-notes-v2.webp"
  },
  {
    "id": "46939e1f-64b3-58d0-aaf0-3b44a4ae5bb8",
    "slug": "siyag-20",
    "nameEn": "SIYAG 20 · Satsuma",
    "nameAr": "SIYAG 20 · Satsuma",
    "descriptionEn": "A SIYAG creation opening with sparkling mandarin and citrus. Orange and white florals soften the heart before white musk and cashmere wood leave a clean, gentle trail.",
    "descriptionAr": "إبداع من SIYAG يبدأ بإشراقة الماندرين والحمضيات، يليه قلب ناعم من البرتقال والزهور البيضاء، ويستقر على المسك الأبيض وخشب الكشمير بأثر نظيف وهادئ.",
    "brand": "SIYAG",
    "family": "woody",
    "concentration": "parfum",
    "audience": "men",
    "topNotes": [
      "Mandarin | ماندرين",
      "Citrus Notes | نوتات حمضية"
    ],
    "heartNotes": [
      "Orange | برتقال",
      "White Flowers | زهور بيضاء"
    ],
    "baseNotes": [
      "White Musk | مسك أبيض",
      "Cashmere Wood | خشب الكشمير"
    ],
    "images": [
      "/brand/numbered/siyag-20-notes-v2.webp",
      "/brand/numbered/siyag-20-photo-v2.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "variants": [
      {
        "id": "34be47bf-4a63-553c-998b-3a07675d8ee7",
        "sku": "SIYAG-20-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 38000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "0bdf16da-c2ef-5e2c-96b5-0c5656c5ed0f",
        "sku": "SIYAG-20-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 65000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 20 · Satsuma",
      "descriptionEn": "A SIYAG creation opening with sparkling mandarin and citrus. Orange and white florals soften the heart before white musk and cashmere wood leave a clean, gentle trail."
    },
    "notesImageUrl": "/brand/numbered/siyag-20-notes-v2.webp"
  },
  {
    "id": "149f0af9-7f98-5808-a8fa-a4c6c3fc78d0",
    "slug": "siyag-21",
    "nameEn": "SIYAG 21",
    "nameAr": "SIYAG 21",
    "descriptionEn": "Fresh woods with a polished, formal character. Composed and confident, for a signature that feels as considered as your best-dressed look.",
    "descriptionAr": "أخشاب منعشة بطابع رسمي ومرتب؛ حضور متزن وواثق يكمل إطلالة أنيقة بتفاصيل محسوبة.",
    "brand": "SIYAG",
    "family": "woody",
    "concentration": "parfum",
    "audience": "men",
    "topNotes": [
      "Bergamot | برغموت"
    ],
    "heartNotes": [
      "Cardamom | هيل"
    ],
    "baseNotes": [
      "Amber | عنبر"
    ],
    "images": [
      "/brand/numbered/siyag-21-notes-v2.webp",
      "/brand/numbered/siyag-21-photo-v2.webp"
    ],
    "featured": false,
    "collections": [
      "signature"
    ],
    "inspiration": {
      "nameEn": "Arabian Oud Amiri",
      "nameAr": "العربية للعود أميري",
      "descriptionEn": "Inspired by Arabian Oud Amiri.",
      "descriptionAr": "مستوحى من العربية للعود أميري.",
      "imageUrl": "/brand/inspiration/catalog-21-3d-v2.webp"
    },
    "variants": [
      {
        "id": "6fb44bd0-423f-51d2-a33e-a961ca5a2d99",
        "sku": "SIYAG-21-30-FULLBOTTLE",
        "sizeMl": 30,
        "format": "fullBottle",
        "priceMinor": 38000,
        "compareAtMinor": null,
        "inStock": false
      },
      {
        "id": "61209a5b-ad2e-5158-b516-87c56fea97e7",
        "sku": "SIYAG-21-50-FULLBOTTLE",
        "sizeMl": 50,
        "format": "fullBottle",
        "priceMinor": 65000,
        "compareAtMinor": null,
        "inStock": false
      }
    ],
    "seo": {
      "titleEn": "SIYAG 21",
      "descriptionEn": "Fresh woods with a polished, formal character. Composed and confident, for a signature that feels as considered as your best-dressed look."
    },
    "notesImageUrl": "/brand/numbered/siyag-21-notes-v2.webp"
  }
];
export const publishedCollections:Collection[]=[
  {
    "slug": "signature",
    "nameEn": "The SIYAG collection",
    "nameAr": "مجموعة SIYAG",
    "imageUrl": "/brand/categories/signature.webp"
  }
];
export function publishedProduct(slug:string){return publishedProducts.find(p=>p.slug===slug)??null}
export function publishedPage(query:URLSearchParams,products:Product[]=publishedProducts):Page<Product>{
 const pageNumber=Math.max(1,Math.floor(Number(query.get('pageNumber')))||1),pageSize=Math.max(1,Math.min(100,Math.floor(Number(query.get('pageSize')))||12));
 const term=query.get('q')?.trim().toLocaleLowerCase();
 const data=products.filter(p=>(!term||[p.nameEn,p.nameAr,p.descriptionEn,p.descriptionAr,p.inspiration?.nameEn??"",p.inspiration?.nameAr??""].some(x=>x.toLocaleLowerCase().includes(term)))&&(!query.get('collection')||p.collections.includes(query.get('collection')!))&&(!query.get('family')||p.family===query.get('family'))&&(!query.get('concentration')||p.concentration===query.get('concentration'))&&(!query.get('audience')||p.audience===query.get('audience'))&&p.variants.some(v=>(!query.get('sizeMl')||v.sizeMl===Number(query.get('sizeMl')))&&(!query.get('format')||v.format===query.get('format'))&&(query.get('inStock')!=='true'||v.inStock)&&(!query.get('minPriceMinor')||v.priceMinor>=Number(query.get('minPriceMinor')))&&(!query.get('maxPriceMinor')||v.priceMinor<=Number(query.get('maxPriceMinor')))));
 const selectedPrice=(p:Product)=>Math.min(...p.variants.filter(v=>!query.get('sizeMl')||v.sizeMl===Number(query.get('sizeMl'))).map(v=>v.priceMinor));
 if(query.get('sort')==='price-asc')data.sort((a,b)=>selectedPrice(a)-selectedPrice(b));
 else if(query.get('sort')==='price-desc')data.sort((a,b)=>selectedPrice(b)-selectedPrice(a));
 else data.sort((a,b)=>Number(a.slug.slice(6))-Number(b.slug.slice(6)));
 return {data:data.slice((pageNumber-1)*pageSize,pageNumber*pageSize),totalCount:data.length,pageSize,pageNumber,totalPages:Math.ceil(data.length/pageSize)};
}
