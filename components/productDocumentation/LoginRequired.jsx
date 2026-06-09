import Link from "next/link";

export default function LoginRequired({ langPrefix, redirectPath, t }) {
  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4 sm:p-8 bg-gradient-to-br from-[#f48a42]/[0.03] via-[#f48a42]/[0.05] to-[#f48a42]/[0.03]">
      <div className="relative max-w-[420px] w-full p-8 sm:p-10 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_10px_15px_-3px_rgba(0,0,0,0.08),0_20px_25px_-5px_rgba(0,0,0,0.05)] border border-white/80 overflow-hidden text-center">
        {/* Decorative background elements */}
        <div className="absolute w-[300px] h-[300px] -top-[150px] -right-[100px] rounded-full bg-gradient-to-br from-[#f48a42]/15 to-[#f48a42]/10 pointer-events-none" />
        <div className="absolute w-[200px] h-[200px] -bottom-[80px] -left-[80px] rounded-full bg-gradient-to-br from-[#f48a42]/12 to-[#f48a42]/8 pointer-events-none" />
        <div className="absolute w-[100px] h-[100px] top-1/2 -left-[30px] rounded-full bg-gradient-to-br from-[#f48a42]/15 to-[#f48a42]/10 pointer-events-none" />

        {/* Lock Icon */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="relative z-10 w-20 h-20 flex items-center justify-center bg-gradient-to-br from-[#f48a42] via-[#f48a42] to-[#e67a32] rounded-[20px] shadow-[0_8px_32px_rgba(244,138,66,0.3),0_4px_12px_rgba(244,138,66,0.2)]">
            <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="16" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute z-0 w-[100px] h-[100px] border-2 border-[#f48a42]/20 rounded-[24px] animate-[pulse-ring_2s_ease-out_infinite]" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-[1.75rem] font-bold text-gray-800 mb-3 tracking-tight leading-tight">
            {t.productDocumentation.loginTitle}
          </h1>
          <p className="text-base text-gray-500 mb-8 leading-relaxed">
            {t.productDocumentation.loginDescription}
          </p>

          {/* Features list */}
          <div className="flex flex-col gap-3 mb-8 p-5 bg-gradient-to-br from-[#f48a42]/[0.04] to-[#f48a42]/[0.06] rounded-2xl border border-[#f48a42]/10">
            <div className="flex items-center gap-3 text-sm text-gray-600 text-start">
              <svg
                className="shrink-0 w-5 h-5 text-emerald-500"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M9 12L11 14L15 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <span>{t.productDocumentation.pageTitle}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 text-start">
              <svg
                className="shrink-0 w-5 h-5 text-emerald-500"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M9 12L11 14L15 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <span>{t.productDocumentation.pageDescription}</span>
            </div>
          </div>

          {/* Login Button */}
          <Link
            href={`/${langPrefix}login?page=${redirectPath}`}
            className="group inline-flex items-center justify-center gap-3 w-full py-4 px-8 bg-gradient-to-r from-[#f48a42] via-[#f48a42] to-[#e67a32] text-white text-base font-semibold rounded-xl shadow-[0_4px_14px_rgba(244,138,66,0.35),0_2px_6px_rgba(244,138,66,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(244,138,66,0.4),0_4px_12px_rgba(244,138,66,0.25)] active:translate-y-0"
          >
            <span className="relative z-10">
              {t.productDocumentation.loginButton}
            </span>
            <svg
              className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M5 12H19M19 12L12 5M19 12L12 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
