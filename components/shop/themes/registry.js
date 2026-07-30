/**
 * Shop Theme Registry
 *
 * This is a static manifest — never fetched from DB.
 * Add new themes here. Each theme declares its available sections.
 * Each section's `defaults` are rich fake data shown in the editor preview
 * before the user fills in real content.
 *
 * The actual React components are loaded via dynamic import on the public page
 * and in ShopPreview, ensuring code-splitting: only sections used by a shop
 * are ever downloaded by visitors.
 */

// ─── Base Section Template ───────────────────────────────────────────────────

const BASE_SECTIONS_TEMPLATES = [
  {
    id: "header",
    label: { ar: "رأس الصفحة", en: "Header" },
    description: {
      ar: "شعار المتجر والقائمة الرئيسية",
      en: "Shop logo and main navigation menu",
    },
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="5" rx="1"/><path d="M3 10h18"/><rect x="3" y="3" width="18" height="18" rx="1"/></svg>`,
    defaults: {
      logo: "",
      showSearch: true,
      sticky: true,
      alwaysWhite: false,
      singleLangLogo: false,
    },
  },
  {
    id: "hero",
    label: { ar: "البانر الرئيسي", en: "Hero Banner" },
    description: {
      ar: "صور متحركة مع عنوان وصندوق بحث",
      en: "Animated banner carousel with title and search box",
    },
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`,
    defaults: {
      singleLangImage: false,
      heroTitleAr: "اكتشف أفضل المنتجات للإيجار",
      heroTitleEn: "Discover the Best Products for Rent",
      heroDescriptionAr:
        "مجموعة متنوعة من المنتجات عالية الجودة بأسعار تنافسية",
      heroDescriptionEn:
        "A diverse collection of high-quality products at competitive prices",
      heroBanners: [
        {
          imageAr: "880ca55b6ed07aab13c9d1b7fa51a317f8fda731_qoinak",
          imageEn: "880ca55b6ed07aab13c9d1b7fa51a317f8fda731_qoinak",
          link: "",
          altAr: "",
          altEn: "",
          order: 0,
        },
      ],
    },
  },
  {
    id: "about",
    label: { ar: "عن المتجر", en: "About Us" },
    description: {
      ar: "بطاقة تعريفية بالمتجر مع الشعار والوصف",
      en: "Brand card with logo, description and CTA button",
    },
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
    defaults: {
      shopNameAr: "اسم المتجر",
      shopNameEn: "Shop Name",
      aboutDescriptionAr: "وصف المنتج باللغة العربية",
      aboutDescriptionEn: "Description of the product in English",
      aboutImage: "",
      aboutUsButtonTextAr: "تعرف المزيد",
      aboutUsButtonTextEn: "Learn More",
      aboutUsLink: "#",
    },
  },
  {
    id: "slider",
    label: { ar: "شريط منتجات", en: "Product Slider" },
    description: {
      ar: "عرض منتجاتك في شريط أفقي أو شبكة",
      en: "Display your products in a carousel or grid",
    },
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    allowMultiple: true,
    defaults: {
      titleAr: "احدث المنتجات",
      titleEn: "Newest Products",
      products: [],
      type: "newest",
      displayMode: "slider",
    },
  },
  {
    id: "offerBanners",
    label: { ar: "لافتات العروض", en: "Offer Banners" },
    description: {
      ar: "لافتات إعلانية لترويج العروض والخصومات بالمتجر",
      en: "Branded banner images for offers and promo codes",
    },
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l7.3-7.3a1 1 0 0 0 0-1.41z"/><path d="M7 7h.01"/></svg>`,
    allowMultiple: true,
    defaults: {
      singleLangImage: false,
      banners: [
        {
          imageAr: "880ca55b6ed07aab13c9d1b7fa51a317f8fda731_qoinak",
          imageEn: "880ca55b6ed07aab13c9d1b7fa51a317f8fda731_qoinak",
          link: "",
          titleAr: "عنوان العرض",
          titleEn: "Offer Title",
          subtitleAr: "وصف فرعي",
          subtitleEn: "Subtitle",
          order: 0,
        },
      ],
    },
  },
  {
    id: "categories",
    label: { ar: "الأقسام المتميزة", en: "Featured Categories" },
    description: {
      ar: "عرض الفئات الرئيسية بطريقة منسقة وتفاعلية",
      en: "Grid of product categories with custom icons",
    },
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
    defaults: {
      titleAr: "تصفح حسب الأقسام",
      titleEn: "Browse by Categories",
      categories: [],
    },
  },
  {
    id: "howItWorks",
    label: { ar: "كيف نعمل", en: "How It Works" },
    description: {
      ar: "خطوات توضيحية لعملية الإيجار أو الطلب",
      en: "Step-by-step onboarding flow for renters",
    },
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
    defaults: {
      sectionTitleAr: "الإيجار في 3 خطوات بسيطة",
      sectionTitleEn: "Rent in 3 simple steps",
      estajerSide: {
        iconType: "search",
        titleAr: "تصفح واختر",
        titleEn: "Browse & pick",
        itemsAr: [
          "تصفح كتالوجنا حسب الفئة.",
          "فلتر حسب التاريخ أو الموقع أو العلامة التجارية لتجد ما تحتاجه تماماً.",
        ],
        itemsEn: [
          "Browse our catalog by category.",
          "Filter by date, location, or brand to find exactly what you need.",
        ],
      },
      partnerSide: {
        iconType: "wallet",
        titleAr: "احجز وادفع",
        titleEn: "Book & pay",
        itemsAr: [
          "اختر فترة الإيجار الخاصة بك.",
          "أكد عنوانك وادفع بأمان عبر الإنترنت مع تأكيد الحجز الفوري.",
        ],
        itemsEn: [
          "Choose your rental period.",
          "Confirm your address, and pay securely online. Instant booking confirmation.",
        ],
      },
      sharedBenefits: {
        iconType: "shipping",
        titleAr: "استخدم وأرجع",
        titleEn: "Use & return",
        itemsAr: [
          "نقوم بالتوصيل إليك.",
          "استخدمه طالما كنت بحاجة إليه، وأعده عند الانتهاء وسنقوم بالاستلام.",
        ],
        itemsEn: [
          "We deliver to you. Use it as long as you need.",
          "Return it when done — we handle pickup.",
        ],
      },
    },
  },
  {
    id: "reviews",
    label: { ar: "آراء العملاء", en: "Customer Reviews" },
    description: {
      ar: "تقييمات وآراء العملاء وتجاربهم مع المتجر",
      en: "Testimonials slider showing customer feedback",
    },
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>`,
    defaults: {
      showReviews: true,
    },
  },
  {
    id: "features",
    label: { ar: "ميزات المتجر", en: "Store Features" },
    description: {
      ar: "شريط الميزات مثل الشحن السريع أو الدعم الفني",
      en: "Value props banner (e.g. support, warranty, fast delivery)",
    },
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
    defaults: {
      features: [
        {
          iconType: "support",
          titleAr: "دعم على مدار الساعة",
          titleEn: "24/7 Support",
          descAr: "نحن هنا لمساعدتك دائماً",
          descEn: "Always here to help you",
        },
        {
          iconType: "shipping",
          titleAr: "توصيل سريع",
          titleEn: "Fast Delivery",
          descAr: "توصيل مباشر إلى باب منزلك",
          descEn: "Direct delivery to your doorstep",
        },
        {
          iconType: "quality",
          titleAr: "جودة مضمونة",
          titleEn: "Guaranteed Quality",
          descAr: "منتجاتنا تفحص بدقة وعناية",
          descEn: "All items are thoroughly inspected",
        },
        {
          iconType: "secure",
          titleAr: "دفع آمن",
          titleEn: "Secure Payment",
          descAr: "طرق دفع آمنة ومشفرة 100%",
          descEn: "100% safe & encrypted payment",
        },
      ],
    },
  },
  {
    id: "faq",
    label: { ar: "الأسئلة الشائعة", en: "FAQ" },
    description: {
      ar: "الأسئلة الأكثر تكراراً مع إجاباتها التوضيحية",
      en: "Accordion containing common questions & answers",
    },
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`,
    defaults: {
      titleAr: "الأسئلة الأكثر شيوعاً",
      titleEn: "Frequently Asked Questions",
      faqs: [
        {
          questionAr: "كيف يمكنني حجز منتج؟",
          questionEn: "How do I book an item?",
          answerAr: "من خلال اختيار التواريخ والضغط على زر احجز الآن",
          answerEn: "Select your dates and click Book Now",
          order: 0,
        },
        {
          questionAr: "ما هي شروط الإلغاء والاسترجاع؟",
          questionEn: "What are the cancellation and refund policies?",
          answerAr:
            "تخضع شروط الإلغاء لسياسة المالك المحددة في تفاصيل كل منتج قبل الحجز.",
          answerEn:
            "Cancellation terms are subject to the owner's policy specified in the product details before booking.",
          order: 1,
        },
        {
          questionAr: "هل يتطلب الأمر دفع تأمين للمنتجات؟",
          questionEn: "Is a security deposit required for items?",
          answerAr:
            "نعم، قد يطلب بعض الملاك مبلغ تأمين مسترد بالكامل بعد إرجاع المنتج بحالته الأصلية.",
          answerEn:
            "Yes, some owners may require a security deposit, which is fully refundable after returning the item in its original condition.",
          order: 2,
        },
        {
          questionAr: "كيف يتم استلام وتسليم المنتجات المستأجرة؟",
          questionEn: "How do I pick up and return rented items?",
          answerAr:
            "يمكنك التنسيق مباشرة مع المالك لتحديد طريقة التسليم، سواء كان بالاستلام الشخصي أو الشحن المتوفر.",
          answerEn:
            "You can coordinate directly with the owner to determine the handover method, whether through self-pickup or available shipping options.",
          order: 3,
        },
      ],
    },
  },
  {
    id: "contact",
    label: { ar: "اتصل بنا", en: "Contact Us" },
    description: {
      ar: "معلومات التواصل مع المتجر ونموذج المراسلة",
      en: "Contact details form, map placeholder and social links",
    },
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.58 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    defaults: {
      titleAr: "تواصل معنا",
      titleEn: "Get in Touch",
      email: "shop@estajer.com",
      phone: "+966 500 000 000",
      addressAr: "الرياض، المملكة العربية السعودية",
      addressEn: "Riyadh, Saudi Arabia",
      showMap: true,
    },
  },
  {
    id: "banner",
    label: { ar: "بانر إعلاني", en: "Promo Banner" },
    description: {
      ar: "بانر إعلاني عريض مع عنوان ووصف وزر إجراء",
      en: "Full-width promotional billboard with title, description, and button",
    },
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 19-9-9 19-2-8-8-2z"/></svg>`,
    allowMultiple: true,
    defaults: {
      badgeAr: "عرض حصري",
      badgeEn: "Exclusive Deal",
      titleAr: "عرض خاص لفترة محدودة",
      titleEn: "Limited Time Special Offer",
      subtitleAr:
        "احصل على خصم مميز عند الاستئجار اليوم واستمتع بتجربة لا تُنسى",
      subtitleEn:
        "Get a special discount when you rent today and enjoy an unforgettable experience",
      buttonTextAr: "اكتشف الآن",
      buttonTextEn: "Discover Now",
      buttonLink: "#",
      imageAr: "880ca55b6ed07aab13c9d1b7fa51a317f8fda731_qoinak",
      imageEn: "880ca55b6ed07aab13c9d1b7fa51a317f8fda731_qoinak",
    },
  },
  {
    id: "gallery",
    label: { ar: "معرض الصور", en: "Photo Gallery" },
    description: {
      ar: "شبكة صور مرنة مع روابط اختيارية ومشاهد عرض",
      en: "Masonry image grid with optional links and lightbox",
    },
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`,
    allowMultiple: true,
    defaults: {
      titleAr: "معرض الصور",
      titleEn: "Gallery",
      layout: "magazine",
      images: [{ src: "", altAr: "", altEn: "", link: "" }],
    },
  },
  {
    id: "productHighlight",
    label: { ar: "منتج مميز", en: "Product Highlight" },
    description: {
      ar: "عرض منتج واحد بشكل بارز مع السعر والتقييم وزر الإيجار",
      en: "Split-layout showcase of a single product with price, rating and CTA",
    },
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`,
    allowMultiple: true,
    defaults: {
      titleAr: "منتج مميز",
      titleEn: "Featured Product",
      subtitleAr: "",
      subtitleEn: "",
      product: null,
      manualNameAr: "",
      manualNameEn: "",
      manualPrice: "",
      manualDiscountPrice: "",
      manualImage: "",
      manualLink: "",
      ctaTextAr: "استأجر الآن",
      ctaTextEn: "Rent Now",
      imagePosition: "left",
    },
  },
  {
    id: "footer",
    label: { ar: "تذييل الصفحة", en: "Footer" },
    description: {
      ar: "روابط المتجر وحسابات التواصل الاجتماعي",
      en: "Store links, footer description and social icons",
    },
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 15h18"/><path d="M3 19h18"/></svg>`,
    defaults: {
      logo: "",
      descriptionAr: "",
      descriptionEn: "",
      facebook: "",
      instagram: "",
      twitter: "",
      snapchat: "",
      tiktok: "",
      whatsapp: "",
    },
  },
];

// Dynamically generate section definitions for each theme
export function getThemeSections(themeId) {
  return BASE_SECTIONS_TEMPLATES.map((section) => {
    let defaults = { ...section.defaults };

    // Modern theme special overrides
    if (section.id === "howItWorks" && themeId === "modern") {
      defaults = {
        sectionTitleAr: "الإيجار في 3 خطوات بسيطة",
        sectionTitleEn: "Rent in 3 simple steps",
        estajerSide: {
          iconType: "search",
          titleAr: "تصفح واختر",
          titleEn: "Browse & pick",
          itemsAr: [
            "تصفح كتالوجنا حسب الفئة.",
            "فلتر حسب التاريخ أو الموقع أو العلامة التجارية لتجد ما تحتاجه تماماً.",
          ],
          itemsEn: [
            "Browse our catalog by category.",
            "Filter by date, location, or brand to find exactly what you need.",
          ],
        },
        partnerSide: {
          iconType: "wallet",
          titleAr: "احجز وادفع",
          titleEn: "Book & pay",
          itemsAr: [
            "اختر فترة الإيجار الخاصة بك.",
            "أكد عنوانك وادفع بأمان عبر الإنترنت مع تأكيد الحجز الفوري.",
          ],
          itemsEn: [
            "Choose your rental period.",
            "Confirm your address, and pay securely online. Instant booking confirmation.",
          ],
        },
        sharedBenefits: {
          iconType: "shipping",
          titleAr: "استخدم وأرجع",
          titleEn: "Use & return",
          itemsAr: [
            "نقوم بالتوصيل إليك.",
            "استخدمه طالما كنت بحاجة إليه، وأعده عند الانتهاء وسنقوم بالاستلام.",
          ],
          itemsEn: [
            "We deliver to you. Use it as long as you need.",
            "Return it when done — we handle pickup.",
          ],
        },
      };
    } else if (section.id === "features" && themeId === "modern") {
      defaults = {
        features: [
          {
            iconType: "shipping",
            titleAr: "توصيل سريع",
            titleEn: "Fast Delivery",
            descAr: "نصلك أينما كنت",
            descEn: "Delivered wherever you are",
          },
          {
            iconType: "support",
            titleAr: "دعم 24/7",
            titleEn: "Round-the-Clock Support",
            descAr: "فريقنا معك دائماً",
            descEn: "Always here when you need us",
          },
          {
            iconType: "secure",
            titleAr: "دفع آمن",
            titleEn: "Secure Payments",
            descAr: "خيارات دفع متعددة ومشفرة",
            descEn: "Multiple encrypted payment methods",
          },
          {
            iconType: "quality",
            titleAr: "جودة مضمونة",
            titleEn: "Guaranteed Quality",
            descAr: "كل منتج يخضع لمعايير صارمة",
            descEn: "Every product meets strict standards",
          },
        ],
      };
    } else if (section.id === "howItWorks" && themeId === "elegant") {
      defaults = {
        sectionTitleAr: "رحلة التأجير الراقية في 3 خطوات",
        sectionTitleEn: "Refined Rental in 3 simple steps",
        estajerSide: {
          iconType: "search",
          titleAr: "تصفح الكوليكشن",
          titleEn: "Curate & Select",
          itemsAr: [
            "اكتشف أفخم المنتجات المختارة بعناية.",
            "تصفح حسب فئاتنا المخصصة لتجد ما يطابق تطلعاتك.",
          ],
          itemsEn: [
            "Explore our handpicked luxury collection.",
            "Browse by curated categories to find exactly what fits your occasion.",
          ],
        },
        partnerSide: {
          iconType: "wallet",
          titleAr: "حجز راقٍ وآمن",
          titleEn: "Bespoke Booking",
          itemsAr: [
            "حدد الفترات المناسبة لطلبك.",
            "أتمم الدفع بأمان تام عبر بواباتنا المشفرة مع تأكيد فوري.",
          ],
          itemsEn: [
            "Select your desired boutique rental period.",
            "Pay securely with instant reservation and premium buyer protection.",
          ],
        },
        sharedBenefits: {
          iconType: "shipping",
          titleAr: "استلام وتوصيل نخبوي",
          titleEn: "Receive & Indulge",
          itemsAr: [
            "توصيل مخصص وسريع ومباشر إليك.",
            "استمتع بتجربتك الفريدة، وسنتولى استلام المنتج وتأكيده عند الانتهاء.",
          ],
          itemsEn: [
            "Elite delivery directly to your location.",
            "Indulge in your experience. We handle the returns and collection when done.",
          ],
        },
      };
    } else if (section.id === "features" && themeId === "elegant") {
      defaults = {
        features: [
          {
            iconType: "shipping",
            titleAr: "توصيل نخبوي",
            titleEn: "Concierge Delivery",
            descAr: "توصيل مباشر وسريع لباب منزلك",
            descEn: "Premium, prompt delivery to your doorstep",
          },
          {
            iconType: "support",
            titleAr: "دعم 24/7",
            titleEn: "Elite Support",
            descAr: "خدمة عملاء استثنائية على مدار الساعة",
            descEn: "Personalized 24/7 concierge service",
          },
          {
            iconType: "secure",
            titleAr: "مدفوعات راقية",
            titleEn: "Refined Payments",
            descAr: "خيارات دفع آمنة ومشفرة بالكامل",
            descEn: "100% encrypted, secure transactions",
          },
          {
            iconType: "quality",
            titleAr: "ضمان الأصالة والجودة",
            titleEn: "Authenticity Guaranteed",
            descAr: "منتجات مفحوصة بدقة وعناية استثنائية",
            descEn: "Every piece meets verified luxury standards",
          },
        ],
      };
    } else if (section.id === "howItWorks" && themeId === "cozy") {
      defaults = {
        sectionTitleAr: "خطوات بسيطة ودافئة للإيجار",
        sectionTitleEn: "Simple & Cozy Rental Steps",
        estajerSide: {
          iconType: "search",
          titleAr: "تصفح واختر بكل راحة",
          titleEn: "Browse & Select Cozy Items",
          itemsAr: [
            "تصفح مجموعتنا الفريدة والمريحة.",
            "اختر ما يناسب ذوقك واحتياجك بكل سهولة ويسر.",
          ],
          itemsEn: [
            "Explore our unique and comforting collection.",
            "Choose what fits your style and needs with ease.",
          ],
        },
        partnerSide: {
          iconType: "wallet",
          titleAr: "احجز وادفع بمرونة",
          titleEn: "Flexible Booking & Payment",
          itemsAr: [
            "حدد مدة الإيجار المناسبة لك.",
            "أكمل دفعك بأمان وسهولة بضغطة زر.",
          ],
          itemsEn: [
            "Select the rental period that works best for you.",
            "Complete your payment securely and effortlessly.",
          ],
        },
        sharedBenefits: {
          iconType: "shipping",
          titleAr: "توصيل دافئ ومريح",
          titleEn: "Cozy Delivery & Pickup",
          itemsAr: [
            "نقوم بتوصيل طلبك بعناية إلى باب منزلك.",
            "استمتع بتجربتك وسنتولى استلامه منك عند انتهاء المدة.",
          ],
          itemsEn: [
            "We carefully deliver your order straight to your doorstep.",
            "Enjoy your experience, and we will pick it up when done.",
          ],
        },
      };
    } else if (section.id === "features" && themeId === "cozy") {
      defaults = {
        features: [
          {
            iconType: "shipping",
            titleAr: "توصيل مريح",
            titleEn: "Cozy Delivery",
            descAr: "توصيل آمن ولطيف لباب منزلك",
            descEn: "Safe and friendly doorstep delivery",
          },
          {
            iconType: "support",
            titleAr: "خدمة ودودة",
            titleEn: "Friendly Support",
            descAr: "نحن هنا لمساعدتك بابتسامة",
            descEn: "Here to help you with a smile",
          },
          {
            iconType: "secure",
            titleAr: "دفع سهل",
            titleEn: "Easy Payments",
            descAr: "طرق دفع بسيطة وآمنة تماماً",
            descEn: "Simple and completely secure checkout",
          },
          {
            iconType: "quality",
            titleAr: "جودة دافئة ومضمونة",
            titleEn: "Inspected & Approved",
            descAr: "كل قطعة تفحص بعناية لراحتك",
            descEn: "Every item is checked with care for your comfort",
          },
        ],
      };
    }

    return {
      ...section,
      themeId,
      thumbnail: `/themes/${themeId}/${section.id}-thumb.jpg`,
      defaults,
    };
  });
}

export const CLASSIC_SECTIONS = getThemeSections("classic");
export const BOLD_SECTIONS = getThemeSections("bold");
export const MINIMAL_SECTIONS = getThemeSections("minimal");
export const MODERN_SECTIONS = getThemeSections("modern");
export const ELEGANT_SECTIONS = getThemeSections("elegant");
export const COZY_SECTIONS = getThemeSections("cozy");

// ─── Theme Manifest ───────────────────────────────────────────────────────────

export const THEMES = [
  {
    id: "classic",
    label: { ar: "الكلاسيكي", en: "Classic" },
    description: {
      ar: "تصميم نظيف واحترافي مناسب لجميع أنواع المتاجر",
      en: "Clean and professional design suitable for all shop types",
    },
    thumbnail: "/themes/classic/theme-thumb.jpg",
    sections: CLASSIC_SECTIONS,
  },
  {
    id: "bold",
    label: { ar: "الجريء", en: "Bold" },
    description: {
      ar: "تصميم جريء وحيوي مع ألوان العلامة التجارية وتخطيطات عصرية",
      en: "Bold and vibrant design with brand colors and editorial layouts",
    },
    thumbnail: "/themes/bold/theme-thumb.jpg",
    sections: BOLD_SECTIONS,
  },
  {
    id: "minimal",
    label: { ar: "معاصر بسيط", en: "Minimal" },
    description: {
      ar: "تصميم بسيط وعصري مع مساحات بيضاء وتنسيق نظيف",
      en: "Simple, modern and minimal design focused on space and clean typography",
    },
    thumbnail: "/themes/minimal/theme-thumb.jpg",
    sections: MINIMAL_SECTIONS,
  },
  {
    id: "modern",
    label: { ar: "عصري", en: "Modern" },
    description: {
      ar: "تصميم عصري ونظيف يركز على المساحات والخطوط البسيطة والزوايا الدائرية",
      en: "Clean, modern studio design focused on whitespace, fine lines, and soft rounded details",
    },
    thumbnail: "/themes/modern/theme-thumb.jpg",
    sections: MODERN_SECTIONS,
  },
  {
    id: "elegant",
    label: { ar: "راقي", en: "Elegant" },
    description: {
      ar: "تصميم راقي وفاخر مستوحى من المجلات الراقية وخطوط كلاسيكية وألوان ذهبية",
      en: "Luxury editorial theme inspired by high-end magazines with serif typography and elegant details",
    },
    thumbnail: "/themes/elegant/theme-thumb.jpg",
    sections: ELEGANT_SECTIONS,
  },
  {
    id: "cozy",
    label: { ar: "دافئ ومريح", en: "Cozy" },
    description: {
      ar: "تصميم دافئ ومريح بألوان ترابية وخطوط لطيفة وزوايا دائرية مرنة",
      en: "Warm and inviting design with earthy tones, soft rounded borders, and friendly layouts",
    },
    thumbnail: "/themes/cozy/theme-thumb.jpg",
    sections: COZY_SECTIONS,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Get metadata for a specific section type within a theme.
 */
export function getSectionMeta(themeId, sectionType) {
  const theme = THEMES.find((t) => t.id === themeId);
  if (!theme) return null;
  return theme.sections.find((s) => s.id === sectionType) || null;
}

/**
 * Dynamically import a section's React component.
 * Used on the public shop page and in ShopPreview.
 * Next.js code-splits each of these automatically.
 */
export function getSectionComponent(themeId, sectionType) {
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  if (sectionType === "header") return import(`./${themeId}/Header`);
  if (sectionType === "footer") return import(`./${themeId}/Footer`);
  return import(`./${themeId}/sections/${capitalize(sectionType)}Section`);
}
