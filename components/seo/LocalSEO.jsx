export default function LocalSEO({ lang, city = "الرياض", region = "الرياض" }) {
  const businessData = {
    ar: {
      name: "استأجر - منصة تأجير المنتجات",
      title: "استأجر منتجات | منصة تأجير المنتجات الأولى في السعودية - استأجر",
      alternateName: "استأجر",
      description:
        "أفضل منصة لتأجير المنتجات في السعودية. استأجر أجهزة إلكترونية، أثاث، معدات، أدوات، مستلزمات فعاليات وآلاف المنتجات للإيجار في الرياض، جدة، الدمام وجميع مدن المملكة.",
      address: "المملكة العربية السعودية",
      areaServed: [
        "الرياض",
        "جدة",
        "الدمام",
        "مكة المكرمة",
        "المدينة المنورة",
        "الطائف",
        "تبوك",
        "بريدة",
        "خميس مشيط",
        "حائل",
        "الأحساء",
        "القطيف",
        "أبها",
        "نجران",
        "جازان",
      ],
      serviceType: "تأجير المنتجات",
      keywords: `تأجير منتجات ${city}, إيجار أثاث ${city}, تأجير أجهزة إلكترونية ${city}, تأجير أدوات ${city}, تأجير مستلزمات فعاليات ${city}, تأجير معدات ${city}, إيجار يومي ${city}, تأجير قصير المدى ${city}`,
      slogan: "لاتشتري .. استأجر .. ووفر",
    },
    en: {
      name: "Estajer - Product Rental Platform",
      alternateName: "Estajer",
      description:
        "Rent a wide variety of products at the best prices in Saudi Arabia. Electronics rental, furniture rental, equipment hire, tools, and event supplies. Don't buy.. rent and save with trusted Estajer platform.",
      address: "Kingdom of Saudi Arabia",
      areaServed: [
        "Riyadh",
        "Jeddah",
        "Dammam",
        "Mecca",
        "Medina",
        "Taif",
        "Tabuk",
        "Buraidah",
        "Khamis Mushait",
        "Hail",
        "Al Ahsa",
        "Qatif",
        "Abha",
        "Najran",
        "Jazan",
      ],
      serviceType: "Product Rental Services",
      keywords: `product rental ${city}, furniture rental ${city}, electronics rental ${city}, tools rental ${city}, event supplies rental ${city}, equipment rental ${city}, daily rental ${city}, short term rental ${city}`,
      slogan: "Don't buy, rent, and save!",
    },
  };

  const data = businessData[lang] || businessData.ar;

  // Main LocalBusiness Schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://estajer.com/#business",
    name: data.name,
    alternateName: data.alternateName,
    description: data.description,
    slogan: data.slogan,
    url: "https://estajer.com",
    logo: {
      "@type": "ImageObject",
      url: "https://res.cloudinary.com/dhfzkadm2/image/upload/v1768055959/logo_with_slogan_-estajer_y6tvqg_mujo45.webp",
      width: 1572,
      height: 748,
    },
    image: [
      "https://res.cloudinary.com/dhfzkadm2/image/upload/v1751550047/Screenshot_2025-07-03_163831_wiwtv4.webp",
      // "https://estajer.com/screenshots/2.png",
      // "https://estajer.com/screenshots/3.png",
      // "https://estajer.com/screenshots/4.png",
      // "https://estajer.com/screenshots/5.png",
    ],
    telephone: "+966530636879",
    email: "service@estajer.com",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+966530636879",
      email: "service@estajer.com",
      contactType: "customer service",
      areaServed: "SA",
      availableLanguage: ["Arabic", "English"],
    },
    foundingDate: "2023",
    numberOfEmployees: "11-50",
    address: {
      "@type": "PostalAddress",
      addressCountry: "SA",
      addressRegion: region,
      addressLocality: city,
      streetAddress: data.address,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "24.7136",
      longitude: "46.6753",
    },
    areaServed: data.areaServed.map((area) => ({
      "@type": "City",
      name: area,
      addressCountry: "SA",
    })),
    serviceType: data.serviceType,
    priceRange: "$$",
    currenciesAccepted: "SAR",
    paymentAccepted: [
      "Credit Card",
      "Bank Transfer",
      "Digital Wallet",
      "Visa",
      "Tabby",
    ],
    openingHours: "Mo-Su 00:00-23:59",
    sameAs: [
      "https://x.com/estajercom",
      "https://instagram.com/estajercom",
      "https://linkedin.com/company/estajer",
      "https://facebook.com/estajer",
      "https://www.tiktok.com/@estajer.com",
    ],
  };

  // Service Schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: data.serviceType,
    description: data.description,
    provider: {
      "@type": "Organization",
      name: data.name,
      url: "https://estajer.com",
    },
    areaServed: data.areaServed.map((area) => ({
      "@type": "City",
      name: area,
      addressCountry: "SA",
    })),
    serviceType: "Rental Services",
    category: "Product Rental",
  };

  // Combine all schemas
  const allSchemas = [localBusinessSchema, serviceSchema];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(allSchemas) }}
      />
    </>
  );
}
