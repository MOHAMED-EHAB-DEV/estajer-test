import { GoogleTagManager } from "@next/third-parties/google";
import Link from "next/link";

export const metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export function NotFoundContent({ lang }) {
  return (
    <section className="min-h-screen bg-gradient-to-br from-white via-[#f7f9fc] to-[#eff2f7] flex items-center justify-center relative overflow-hidden p-6 md:p-8">
      {/* Custom Animations Data */}

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full opacity-[0.18] blur-[20px] w-[400px] h-[400px] bg-gradient-to-br from-[#f48a42] to-[#ff6b6b] -top-[100px] -right-[100px]"></div>
        <div
          className="absolute rounded-full opacity-[0.18] blur-[20px] w-[300px] h-[300px] bg-gradient-to-br from-[#f48a42] to-[#ffd93d] -bottom-[50px] -left-[50px]"
          style={{ animationDelay: "-5s" }}
        ></div>
        <div
          className="absolute rounded-full opacity-[0.18] blur-[20px] w-[200px] h-[200px] bg-gradient-to-br from-[#ff6b6b] to-[#f48a42] top-1/2 left-[10%]"
          style={{ animationDelay: "-10s" }}
        ></div>
        <div
          className="absolute rounded-full opacity-[0.18] blur-[20px] w-[150px] h-[150px] bg-gradient-to-br from-[#f48a42] to-[#38bdf8] top-[20%] right-[15%]"
          style={{ animationDelay: "-7s" }}
        ></div>
        <div
          className="absolute rounded-full opacity-[0.18] blur-[20px] w-[100px] h-[100px] bg-gradient-to-br from-[#ffd93d] to-[#f48a42] bottom-[20%] right-[30%]"
          style={{ animationDelay: "-12s" }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="text-center z-10 max-w-[600px] w-full">
        {/* Large 404 Text with Gradient */}
        <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
          <span className="text-[clamp(6rem,20vw,12rem)] font-black bg-gradient-to-br from-[#f48a42] via-[#ff7d2d] to-[#f48a42] bg-clip-text text-transparent drop-shadow-[0_10px_20px_rgba(244,138,66,0.2)] leading-none animate-pulse">
            4
          </span>
          <div
            className="w-[clamp(5rem,15vw,10rem)] h-[clamp(5rem,15vw,10rem)] rounded-full bg-gradient-to-br from-[rgba(244,138,66,0.2)] to-[rgba(255,125,45,0.2)] flex items-center justify-center relative animate-pulse"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="w-[75%] h-[75%] rounded-full bg-white flex items-center justify-center shadow-[inset_0_2px_10px_rgba(244,138,66,0.15),0_5px_15px_rgba(0,0,0,0.05)]">
              <div className="w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#f48a42] to-[#ff7d2d] animate-spin-slow shadow-[0_0_15px_rgba(244,138,66,0.4)]"></div>
            </div>
          </div>
          <span className="text-[clamp(6rem,20vw,12rem)] font-black bg-gradient-to-br from-[#f48a42] via-[#ff7d2d] to-[#f48a42] bg-clip-text text-transparent drop-shadow-[0_10px_20px_rgba(244,138,66,0.2)] leading-none animate-pulse">
            4
          </span>
        </div>

        {/* Glass Card */}
        <div className="bg-white/70 backdrop-blur-[10px] rounded-[32px] border border-white/80 p-10 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] mb-10">
          <div className="flex flex-col gap-5">
            <h1 className="text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold text-[#1e293b] m-0 tracking-tight">
              {lang === "ar" ? "الصفحة غير موجودة" : "Page Not Found"}
            </h1>
            <p className="text-[clamp(1rem,2.5vw,1.125rem)] text-[#64748b] leading-relaxed m-0 max-w-[480px] mx-auto">
              {lang === "ar"
                ? "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. دعنا نساعدك في العودة إلى المسار الصحيح."
                : "Oops! The page you're looking for doesn't exist or has been moved. Let us help you find your way back."}
            </p>

            <div className="flex flex-wrap gap-4 justify-center mt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-[0.625rem] px-8 py-4 bg-white text-[#475569] border border-[#e2e8f0] rounded-2xl font-semibold shadow-sm transition-all duration-400 hover:bg-[#f8fafc] hover:text-[#1e293b] hover:border-[#cbd5e1] hover:-translate-y-1 hover:shadow-lg w-full sm:w-auto justify-center"
              >
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5 rtl:rotate-180"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
                  />
                </svg>
                <span>{lang === "ar" ? "رجوع" : "Go Back"}</span>
              </Link>

              <Link
                href="/"
                className="inline-flex items-center gap-[0.625rem] px-8 py-4 bg-[#f48a42] text-white rounded-2xl font-semibold shadow-[0_10px_20px_rgba(244,138,66,0.25)] transition-all duration-400 hover:bg-[#ff7d2d]  hover:scale-[1.02] hover:shadow-[0_15px_30px_rgba(244,138,66,0.35)] w-full sm:w-auto justify-center"
              >
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
                <span>
                  {lang === "ar" ? "الصفحة الرئيسية" : "Take Me Home"}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Helpful Links */}
        <div className="mt-4">
          <p className="text-[#94a3b8] text-[0.813rem] font-bold mb-6 uppercase tracking-[0.1em]">
            {lang === "ar" ? "روابط مفيدة" : "Helpful Links"}
          </p>
          <div className="flex justify-center gap-6 md:gap-10 flex-wrap">
            <Link
              href="/search/products"
              className="flex flex-col items-center gap-3 transition-all duration-300 hover:text-[#f48a42] hover:-translate-y-[6px] group text-[#64748b]"
            >
              <div className="w-14 h-14 rounded-[18px] bg-white border border-[#e2e8f0] flex items-center justify-center shadow-sm transition-all duration-300 group-hover:bg-[#fff7ed] group-hover:border-[#ffedd5] group-hover:shadow-[0_10px_15px_rgba(244,138,66,0.1)]">
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-[26px] h-[26px]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <span className="text-sm font-semibold">
                {lang === "ar" ? "البحث" : "Search"}
              </span>
            </Link>
            <Link
              href="/search/products"
              className="flex flex-col items-center gap-3 transition-all duration-300 hover:text-[#f48a42] hover:-translate-y-[6px] group text-[#64748b]"
            >
              <div className="w-14 h-14 rounded-[18px] bg-white border border-[#e2e8f0] flex items-center justify-center shadow-sm transition-all duration-300 group-hover:bg-[#fff7ed] group-hover:border-[#ffedd5] group-hover:shadow-[0_10px_15px_rgba(244,138,66,0.1)]">
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-[26px] h-[26px]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                  />
                </svg>
              </div>
              <span className="text-sm font-semibold">
                {lang === "ar" ? "الفئات" : "Categories"}
              </span>
            </Link>
            <Link
              href="/contact"
              className="flex flex-col items-center gap-3 transition-all duration-300 hover:text-[#f48a42] hover:-translate-y-[6px] group text-[#64748b]"
            >
              <div className="w-14 h-14 rounded-[18px] bg-white border border-[#e2e8f0] flex items-center justify-center shadow-sm transition-all duration-300 group-hover:bg-[#fff7ed] group-hover:border-[#ffedd5] group-hover:shadow-[0_10px_15px_rgba(244,138,66,0.1)]">
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-[26px] h-[26px]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <span className="text-sm font-semibold">
                {lang === "ar" ? "المساعدة" : "Help"}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function NotFound() {
  const lang = "ar";

  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <head>
        <GoogleTagManager gtmId="GTM-W7PNC244" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="m-0 p-0">
        <NotFoundContent lang={lang} />
      </body>
    </html>
  );
}
