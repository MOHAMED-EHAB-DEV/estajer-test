import Link from "next/link";
import { getUserFromServer } from "@/lib/auth";
import SubscriptionToggle from "./SubscriptionToggle";
import "./unsubscribed.css";

// ─── SEO Metadata ────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL || "https://estajer.com";

  const meta = {
    ar: {
      title: "إدارة الاشتراك في البريد الإلكتروني | استأجر",
      description:
        "قم بإلغاء الاشتراك أو إعادة الاشتراك في رسائل البريد الإلكتروني من منصة استأجر. تحكم كامل في تفضيلات الإشعارات الخاصة بك.",
    },
    en: {
      title: "Manage Email Subscription | Estajer",
      description:
        "Unsubscribe or resubscribe to Estajer platform emails. Full control over your notification preferences.",
    },
  };

  const currentMeta = meta[lang] || meta["ar"];

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
    alternates: {
      canonical: `${siteURL}/${lang}/unsubscribe`,
    },
  };
}

// ─── Stable particle positions (SSR-safe, eliminates hydration mismatch) ─────
const PARTICLES = [
  { left: "8%", top: "12%", delay: "0s", duration: "3.8s" },
  { left: "17%", top: "68%", delay: "0.4s", duration: "4.2s" },
  { left: "25%", top: "35%", delay: "0.8s", duration: "5s" },
  { left: "33%", top: "82%", delay: "1.2s", duration: "3.5s" },
  { left: "41%", top: "20%", delay: "0.3s", duration: "4.7s" },
  { left: "50%", top: "55%", delay: "1.6s", duration: "3.2s" },
  { left: "58%", top: "10%", delay: "0.7s", duration: "5.3s" },
  { left: "66%", top: "75%", delay: "1s", duration: "4s" },
  { left: "74%", top: "42%", delay: "1.4s", duration: "3.6s" },
  { left: "82%", top: "28%", delay: "0.2s", duration: "4.5s" },
  { left: "90%", top: "60%", delay: "1.8s", duration: "5.1s" },
  { left: "5%", top: "48%", delay: "0.6s", duration: "3.9s" },
  { left: "13%", top: "90%", delay: "1.1s", duration: "4.3s" },
  { left: "62%", top: "95%", delay: "0.5s", duration: "3.4s" },
  { left: "78%", top: "88%", delay: "1.3s", duration: "4.8s" },
  { left: "95%", top: "15%", delay: "0.9s", duration: "5.2s" },
  { left: "38%", top: "5%", delay: "1.5s", duration: "3.7s" },
  { left: "54%", top: "38%", delay: "0.1s", duration: "4.1s" },
  { left: "86%", top: "52%", delay: "1.7s", duration: "5.4s" },
  { left: "22%", top: "15%", delay: "0.8s", duration: "3.3s" },
];

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function UnsubscribedEmailPage({ params }) {
  const { lang } = await params;
  const isRtl = lang === "ar";
  const langPrefix = lang === "en" ? "/en" : "";

  const user = await getUserFromServer();
  const isUnsubscribed = user?.unsubscribed ?? false;

  const translations = {
    ar: {
      badge: "إدارة الاشتراك",
      title: "تفضيلات البريد الإلكتروني",
      subtitle:
        "تحكم كامل في رسائل البريد الإلكتروني التي ترغب في تلقيها من منصة استأجر. يمكنك إلغاء الاشتراك أو إعادة تفعيله في أي وقت.",
      whatHappens: "ما الذي يعنيه إلغاء الاشتراك؟",
      point1: "لن تصلك رسائل ترويجية بعد الآن",
      point2: "ستصلك فقط رسائل المعاملات الضرورية",
      point3: "يمكنك إعادة الاشتراك في أي وقت",
      point4: "حسابك لا يزال نشطاً وبصحة جيدة",
      infoNote: "رسائل المعاملات",
      infoDesc:
        "بغض النظر عن تفضيلاتك، ستستمر في تلقي رسائل المعاملات الضرورية مثل تأكيدات الطلبات وإشعارات الأمان.",
      goHome: "الصفحة الرئيسية",
    },
    en: {
      badge: "Manage Subscription",
      title: "Email Preferences",
      subtitle:
        "Full control over the emails you receive from the Estajer platform. Unsubscribe or resubscribe at any time with one click.",
      whatHappens: "What does unsubscribing mean?",
      point1: "No more promotional emails",
      point2: "Only essential transactional emails will be sent",
      point3: "You can resubscribe anytime",
      point4: "Your account remains active and healthy",
      infoNote: "Transactional emails",
      infoDesc:
        "Regardless of your preferences, you will still receive essential transactional emails such as order confirmations and security alerts.",
      goHome: "Go Home",
    },
  };

  const t = translations[lang] || translations["ar"];
  const infoPoints = [t.point1, t.point2, t.point3, t.point4];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* ── Animated background ── */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: "rgba(244, 138, 66, 0.15)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse"
          style={{
            backgroundColor: "rgba(244, 138, 66, 0.1)",
            animationDelay: "1s",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full blur-3xl animate-pulse"
          style={{
            backgroundColor: "rgba(255, 165, 89, 0.08)",
            animationDelay: "2s",
          }}
        />

        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-orange-500/50 rounded-full"
            style={{
              left: p.left,
              top: p.top,
              animation: `float ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23f48a42'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
          }}
        />
      </div>

      {/* ── Main content ── */}
      <div className="relative max-w-3xl w-full">
        {/* Glassmorphism card */}
        <main
          className="backdrop-blur-xl rounded-3xl shadow-2xl border p-8 md:p-12"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderColor: "rgba(244, 138, 66, 0.3)",
            boxShadow: "0 25px 50px -12px rgba(244, 138, 66, 0.15)",
          }}
          role="main"
          aria-labelledby="email-pref-title"
        >
          {/* ── Envelope icon ── */}
          <div className="relative mb-8 flex justify-center" aria-hidden="true">
            <div className="w-36 h-36 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center shadow-lg animate-envelope"
                  style={{
                    background:
                      "linear-gradient(135deg, #f48a42 0%, #e67e22 100%)",
                    boxShadow: "0 10px 40px rgba(244, 138, 66, 0.4)",
                  }}
                >
                  <svg
                    className="w-14 h-14 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
              </div>
              {/* Orbiting ring */}
              <div
                className="absolute inset-0 rounded-full border-2 opacity-30 animate-spin"
                style={{
                  borderColor: "#f48a42",
                  borderStyle: "dashed",
                  animationDuration: "8s",
                }}
              />
            </div>
          </div>

          {/* ── Badge ── */}
          <p
            className="font-bold md:text-lg text-base mb-2 tracking-wide text-center animate-shimmer"
            aria-label={t.badge}
          >
            {t.badge}
          </p>

          {/* ── Heading ── */}
          <h1
            id="email-pref-title"
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center leading-tight"
          >
            {t.title}
          </h1>

          {/* ── Subtitle ── */}
          <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto leading-relaxed text-center">
            {t.subtitle}
          </p>

          {/* ── Interactive subscription toggle (client component) ── */}
          <div className="mb-8">
            <SubscriptionToggle
              initialUnSubscribed={isUnsubscribed}
              lang={lang}
            />
          </div>

          {/* ── Info points ── */}
          <div
            className="mb-8 p-6 rounded-2xl"
            style={{ backgroundColor: "rgba(244, 138, 66, 0.1)" }}
          >
            <h2
              className="text-sm font-semibold mb-4 text-center uppercase tracking-widest"
              style={{ color: "#f48a42" }}
            >
              {t.whatHappens}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list">
              {infoPoints.map((point, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-gray-700 text-sm"
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "#f48a42" }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Transactional emails note ── */}
          <div
            className="mb-8 p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center gap-3"
            style={{
              backgroundColor: "rgba(244, 138, 66, 0.05)",
              borderColor: "rgba(244, 138, 66, 0.2)",
            }}
          >
            <div
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(244, 138, 66, 0.2)" }}
              aria-hidden="true"
            >
              <svg
                className="w-5 h-5"
                style={{ color: "#f48a42" }}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
            </div>
            <div>
              <p
                className="text-sm font-semibold mb-0.5"
                style={{ color: "#f48a42" }}
              >
                {t.infoNote}
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t.infoDesc}
              </p>
            </div>
          </div>

          {/* ── Home link ── */}
          <div className="flex justify-center">
            <Link
              href={langPrefix || "/"}
              className="group flex items-center justify-center gap-2 px-8 py-4 font-medium rounded-xl border-2 transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: "transparent",
                borderColor: "rgba(244, 138, 66, 0.5)",
                color: "#f48a42",
              }}
              aria-label={t.goHome}
            >
              <svg
                className="w-5 h-5 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
              <span>{t.goHome}</span>
            </Link>
          </div>
        </main>

        {/* ── Floating decorative shapes ── */}
        <div
          className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl rotate-12 opacity-20 blur-sm pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #f48a42 0%, #e67e22 100%)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-20 blur-sm pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #e67e22 0%, #f48a42 100%)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute top-1/2 -right-12 w-16 h-16 rounded-xl rotate-45 opacity-25 blur-sm pointer-events-none"
          style={{
            background: "linear-gradient(135deg, #f48a42 0%, #ffa559 100%)",
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
