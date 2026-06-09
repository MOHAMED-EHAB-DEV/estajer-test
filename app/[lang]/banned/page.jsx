import Link from "next/link";
import "./banned.css";

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { lang } = await params;
  const siteURL = process.env.NEXT_PUBLIC_APP_URL;

  const meta = {
    ar: {
      title: "تم حظر الحساب | استأجر",
      description: "تم حظر حسابك بسبب انتهاك شروط الخدمة.",
    },
    en: {
      title: "Account Banned | Estajer",
      description:
        "Your account has been banned from the platform due to a violation of our terms of service.",
    },
  };

  const currentMeta = meta[lang] || meta["ar"];

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export default async function Page({ params }) {
  const { lang } = await params;
  const isRtl = lang === "ar";
  const langPrefix = lang === "en" ? "/en" : "";

  const translations = {
    ar: {
      banned: "تم حظر الحساب",
      title: "لقد تم حظرك من المنصة",
      subtitle:
        "نأسف لإبلاغك بأنه تم تعليق حسابك بسبب انتهاك شروط الخدمة. إذا كنت تعتقد أن هذا خطأ، يرجى التواصل معنا.",
      contactUs: "تواصل معنا",
      goHome: "الصفحة الرئيسية",
      reasons: "أسباب الحظر المحتملة",
      reason1: "انتهاك شروط الخدمة",
      reason2: "نشاط مشبوه على الحساب",
      reason3: "سلوك غير لائق",
      reason4: "مخالفة سياسات المنصة",
    },
    en: {
      banned: "Account Banned",
      title: "You have been banned from the platform",
      subtitle:
        "We regret to inform you that your account has been suspended due to a violation of our terms of service. If you believe this is a mistake, please contact us.",
      contactUs: "Contact Us",
      goHome: "Go Home",
      reasons: "Possible Ban Reasons",
      reason1: "Terms of service violation",
      reason2: "Suspicious account activity",
      reason3: "Inappropriate behavior",
      reason4: "Platform policy violation",
    },
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs with orange theme */}
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

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-orange-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23f48a42'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
          }}
        />
      </div>

      <div className="relative max-w-3xl w-full">
        {/* Main card with glassmorphism */}
        <div
          className="backdrop-blur-xl rounded-3xl shadow-2xl border p-8 md:p-12"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderColor: "rgba(244, 138, 66, 0.2)",
            boxShadow: "0 25px 50px -12px rgba(244, 138, 66, 0.15)",
          }}
        >
          {/* Animated ban icon */}
          <div className="relative mb-8 flex justify-center">
            <div className="w-36 h-36 relative">
              {/* Main icon container */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center shadow-lg animate-bounce-slow"
                  style={{
                    background:
                      "linear-gradient(135deg, #f48a42 0%, #e67e22 100%)",
                    boxShadow: "0 10px 40px rgba(244, 138, 66, 0.4)",
                  }}
                >
                  {/* Ban icon */}
                  <svg
                    className="w-14 h-14 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Text content */}
          <p
            className="font-bold md:text-lg text-base mb-2 tracking-wide text-center"
            style={{ color: "#f48a42" }}
          >
            {t.banned}
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            {t.title}
          </h1>

          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto leading-relaxed text-center">
            {t.subtitle}
          </p>

          {/* Reasons section */}
          <div
            className="mb-8 p-6 rounded-2xl"
            style={{ backgroundColor: "rgba(244, 138, 66, 0.1)" }}
          >
            <h3
              className="text-sm font-semibold mb-4 text-center"
              style={{ color: "#f48a42" }}
            >
              {t.reasons}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[t.reason1, t.reason2, t.reason3, t.reason4].map(
                (reason, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-gray-300 text-sm"
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: "#f48a42" }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{reason}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`${langPrefix}/contact`}
              className="group flex items-center justify-center gap-2 px-8 py-4 text-white font-medium rounded-xl shadow-lg transition-all duration-300 w-full sm:w-auto hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #f48a42 0%, #e67e22 100%)",
                boxShadow: "0 10px 30px rgba(244, 138, 66, 0.3)",
              }}
            >
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
              <span>{t.contactUs}</span>
            </Link>

            <Link
              href={langPrefix || "/"}
              className="group flex items-center justify-center gap-2 px-8 py-4 font-medium rounded-xl border-2 transition-all duration-300 w-full sm:w-auto hover:scale-105"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(244, 138, 66, 0.3)",
                color: "#f48a42",
              }}
            >
              <svg
                className="w-5 h-5 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
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
        </div>

        {/* Floating decorative elements */}
        <div
          className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl rotate-12 opacity-20 blur-sm"
          style={{
            background: "linear-gradient(135deg, #f48a42 0%, #e67e22 100%)",
          }}
        />
        <div
          className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-20 blur-sm"
          style={{
            background: "linear-gradient(135deg, #e67e22 0%, #f48a42 100%)",
          }}
        />
        <div
          className="absolute top-1/2 -right-12 w-16 h-16 rounded-xl rotate-45 opacity-25 blur-sm"
          style={{
            background: "linear-gradient(135deg, #f48a42 0%, #ffa559 100%)",
          }}
        />
      </div>
    </div>
  );
}
