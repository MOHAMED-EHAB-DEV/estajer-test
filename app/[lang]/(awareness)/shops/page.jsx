import { getTranslations } from "@/hooks/getTranslations";
import Link from "next/link";
import ShopsGrid from "@/components/shop/ShopsGrid";

// ── Static params ─────────────────────────────────────────────────────────
export async function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

// ── Metadata ──────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;

  const meta = {
    ar: {
      title: "المتاجر | استأجر",
      description:
        "تصفح جميع المتاجر المتاحة على منصة استأجر واستأجر ما تحتاجه من منتجات بأفضل الأسعار.",
    },
    en: {
      title: "Shops | Estajer",
      description:
        "Browse all shops available on the Estajer platform and rent what you need at the best prices.",
    },
  };

  const currentMeta = meta[lang] || meta["ar"];
  const langPath = lang === "ar" ? "" : `${lang}/`;

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    alternates: {
      canonical: `${siteURL}/${langPath}shops`,
      languages: {
        ar: `${siteURL}/shops`,
        en: `${siteURL}/en/shops`,
      },
    },
    openGraph: {
      title: currentMeta.title,
      description: currentMeta.description,
      url: `${siteURL}/${langPath}shops`,
      type: "website",
    },
  };
}

// ── Data fetching ─────────────────────────────────────────────────────────
async function fetchShops(lang) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/shops?limit=100&lang=${lang}`,
      { next: { revalidate: 60 * 60, tags: ["everyShop"] } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (err) {
    console.error("Failed to fetch shops:", err);
    return [];
  }
}

// ── Background Dotted Pattern ─────────────────────────────────────────────
const DottedPattern = () => (
  <svg
    className="absolute inset-0 z-0"
    width="100%"
    height="100%"
    pointerEvents="none"
  >
    <defs>
      <pattern
        id="heroDotPattern"
        x="0"
        y="0"
        width="46.5"
        height="46.5"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="5" cy="5" r="5" fill="#F48A42" fillOpacity="0.08" />
      </pattern>
      <radialGradient id="fadeMask" cx="50%" cy="50%" r="50%">
        <stop offset="20%" stopColor="white" stopOpacity="1" />
        <stop offset="90%" stopColor="white" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect
      width="100%"
      height="100%"
      fill="url(#heroDotPattern)"
      mask="url(#fadeMask)"
    />
  </svg>
);

// ── Page ──────────────────────────────────────────────────────────────────
export default async function ShopsPage({ params }) {
  const { lang } = await params;
  const translate = await getTranslations(lang);
  const langPrefix = lang === "ar" ? "" : "en/";

  const shops = await fetchShops(lang);

  const t = (key) => translate(`shops.hero.${key}`);

  return (
    <main className="-mt-[7.5rem] mx-auto relative min-h-screen">
      {/* ── Hero Header ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#FEF6EE] font-IBMPlex">
        {/* ── Background decoration ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Warm blobs */}
          <div className="absolute -top-20 -right-20 opacity-30 blur-3xl w-[600px] h-[600px] bg-orange-200 rounded-full" />
          <div className="absolute top-40 -left-20 opacity-20 blur-3xl w-[400px] h-[400px] bg-orange-300 rounded-full" />

          {/* Large arc */}
          <div className="absolute -top-16 -right-16 w-full max-w-[738px] opacity-60 rotate-180">
            <svg
              width="100%"
              height="100%"
              fill="none"
              viewBox="0 0 738 190"
              className="w-full h-full object-contain"
            >
              <circle
                cx="369"
                cy="369"
                r="319"
                stroke="#F48A42"
                strokeWidth="100"
                opacity="0.2"
                style={{ mixBlendMode: "multiply" }}
              />
            </svg>
          </div>

          {/* Dotted pattern */}
          <DottedPattern />
        </div>

        {/* ── Floating shapes (desktop) ── */}
        {/* top-left square */}
        <div
          className="absolute top-[20%] left-[6%] hidden lg:block animate-bounce"
          style={{ animationDuration: "6s" }}
        >
          <div
            className="w-12 h-12 rounded-2xl rotate-[18deg]"
            style={{
              background: "linear-gradient(135deg, #FED7AA44, #FB923C22)",
              border: "1.5px solid #FED7AA",
              boxShadow: "0 8px 32px 0 #F9731610",
              backdropFilter: "blur(8px)",
            }}
          />
        </div>
        {/* top-right circle */}
        <div
          className="absolute top-52 right-[7%] hidden lg:block animate-bounce"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        >
          <div
            className="w-9 h-9 rounded-full"
            style={{
              border: "2px solid #FB923C55",
              boxShadow: "0 0 24px 4px #F9731614",
              backdropFilter: "blur(6px)",
            }}
          />
        </div>
        {/* mid-right diamond */}
        <div
          className="absolute top-[55%] right-[5%] hidden xl:block animate-bounce"
          style={{ animationDuration: "7s", animationDelay: "0.5s" }}
        >
          <div
            className="w-7 h-7 rotate-45 rounded-md"
            style={{
              background: "linear-gradient(135deg, #FDBA7444, #F9731622)",
              border: "1.5px solid #FED7AA88",
            }}
          />
        </div>

        {/* ── Spinning ring + glow circle ── */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-20 -translate-y-1/2 w-[700px] h-[700px] md:w-[850px] md:h-[850px] pointer-events-none z-0"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 0%, black 35%, transparent 65%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 35%, transparent 65%)",
          }}
        >
          {/* Static Inner Glow */}
          <svg
            width="100%"
            height="100%"
            fill="none"
            viewBox="0 0 950 950"
            className="absolute inset-0"
          >
            <circle
              cx="475"
              cy="475"
              r="450"
              fill="url(#shopHeroGrad)"
              opacity="0.6"
            />
            <defs>
              <linearGradient
                id="shopHeroGrad"
                x1="475"
                x2="475"
                y1="0"
                y2="950"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#FFEDE2" />
              </linearGradient>
            </defs>
          </svg>

          {/* Spinning Dashed Ring - visible only on the upper half */}
          <div
            className="absolute inset-0"
            style={{
              maskImage:
                "linear-gradient(to bottom, black 0%, black 30%, transparent 60%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, black 30%, transparent 60%)",
            }}
          >
            <svg
              width="100%"
              height="100%"
              fill="none"
              viewBox="0 0 950 950"
              className="absolute inset-0 animate-[spin_60s_linear_infinite]"
            >
              <rect
                width="946"
                height="946"
                x="2"
                y="2"
                stroke="#F48A42"
                strokeOpacity="0.7"
                strokeDasharray="8 8"
                strokeWidth="2"
                rx="473"
              />
            </svg>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 text-center pt-40 pb-28 md:pt-80 md:pb-64 flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-white/70 backdrop-blur-md border border-white/50 rounded-full mb-8 font-bold text-[11px] md:text-sm text-[#F97316] shadow-[0_4px_12px_rgba(249,115,22,0.08)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
            <span>{t("verifiedBadge")}</span>
          </div>

          {/* Heading */}
          <h1 className="font-black text-[#0F172A] mb-5 leading-[1.1] tracking-tighter text-[2.4rem] md:text-[3.5rem] lg:text-[4rem]">
            {t("titlePart1")}
            <span
              style={{
                background: "linear-gradient(135deg, #F97316, #F48A42)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("titleHighlight")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-[#64748B] leading-relaxed mb-10 text-sm md:text-[1.05rem] max-w-xl font-medium">
            {t("subtitle")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <a
              href="#shops-grid"
              className="inline-flex items-center gap-2 text-[#F97316] text-sm font-bold hover:underline underline-offset-4 transition-all"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
              {t("browseLink")}
            </a>
            <Link
              href={`/${langPrefix}rent-flow`}
              className="group/cta inline-flex items-center gap-2.5 bg-[#F97316] hover:bg-[#ea6c0a] text-white px-8 py-4 rounded-2xl text-sm md:text-base font-black shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                className="w-5 h-5 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016 2.993 2.993 0 002.25-1.016 3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                />
              </svg>
              <span>{t("createShopLink")}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300  ${lang === "ar" ? "rotate-180 group-hover/cta:-translate-x-1" : "group-hover/cta:translate-x-1"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>

          {/* Trust bar */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-xs md:text-sm font-bold text-[#F97316]/80">
            {/* National Access */}
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 21h18" />
                <path d="M3 10h18" />
                <path d="M5 6l7-3 7 3" />
                <path d="M4 10v11" />
                <path d="M20 10v11" />
                <path d="M8 14v3" />
                <path d="M12 14v3" />
                <path d="M16 14v3" />
              </svg>
              <span>{t("features.nationalAccess")}</span>
            </div>

            <span className="hidden md:block w-px h-4 bg-orange-200" />

            {/* Documented Contracts */}
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span>{t("features.documentedContracts")}</span>
            </div>

            <span className="hidden md:block w-px h-4 bg-orange-200" />

            {/* Secure Payment */}
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>{t("features.securePayment")}</span>
            </div>

            <span className="hidden md:block w-px h-4 bg-orange-200" />

            {/* Verified Shops / Partners */}
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>{t("features.verifiedShops")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Grid ─────────────────────────────────────────────────────── */}
      <div
        id="shops-grid"
        className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 my-12 mb-24"
      >
        <ShopsGrid shops={shops} lang={lang} translate={translate()} />
      </div>
    </main>
  );
}
