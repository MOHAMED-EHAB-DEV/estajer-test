import Link from "next/link";
import { getTranslations } from "@/hooks/getTranslations";

// Renter Icon - Person searching for products
const RenterIcon = () => (
  <svg
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-16 h-16 md:w-20 md:h-20"
  >
    <circle cx="40" cy="40" r="40" fill="#FFF5ED" />
    <circle cx="40" cy="28" r="12" fill="#f48a42" />
    <path
      d="M20 60C20 48.954 28.954 40 40 40C51.046 40 60 48.954 60 60"
      stroke="#f48a42"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle cx="55" cy="55" r="10" fill="#1E3A5F" />
    <path
      d="M52 55L58 55M55 52L55 58"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Lessor Icon - Person with products and money
const LessorIcon = () => (
  <svg
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-16 h-16 md:w-20 md:h-20"
  >
    <circle cx="40" cy="40" r="40" fill="#FFF5ED" />
    <rect x="25" y="35" width="30" height="25" rx="3" fill="#f48a42" />
    <rect x="30" y="30" width="20" height="10" rx="2" fill="#1E3A5F" />
    <circle cx="40" cy="47" r="8" fill="#FFF5ED" />
    <text
      x="40"
      y="51"
      textAnchor="middle"
      fill="#f48a42"
      fontWeight="bold"
      fontSize="10"
    >
      $
    </text>
    <path
      d="M55 25L60 20M60 25L55 20"
      stroke="#f48a42"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="20" cy="20" r="5" fill="#f48a42" opacity="0.5" />
  </svg>
);

// Arrow Icon for button
const ArrowIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 12H19M19 12L12 5M19 12L12 19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default async function CallToAction({ lang }) {
  const translate = await getTranslations(lang, ["home"]);
  const t = (value) => translate(`home.ctaSection.${value}`);

  const isRtl = lang === "ar";

  return (
    <section
      id="call-to-action"
      className="pt-10 md:pt-24 pb-16 relative overflow-hidden"
      aria-labelledby="cta-heading"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F9FAFB] via-[#FFF9F0] to-white" />

      <div className="max-w-screen-xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <header className="text-center mb-12 md:mb-16">
          <h2
            id="cta-heading"
            className="font-IBMPlex font-semibold lg:text-[2.5rem] md:text-[2rem] text-[1.7rem] text-darkNavy mb-3"
          >
            {t("title")}
          </h2>
          <p className="text-[#5B5656] lg:text-[1.4rem] md:text-[1.2rem] text-[1rem] max-w-2xl mx-auto">
            {t("description")}
          </p>
        </header>

        {/* CTA Cards Container */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Renter Card */}
          <Link
            href="/register"
            className="group relative bg-white rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-[#f48a42] overflow-hidden"
          >
            {/* Card Background Pattern */}
            <div
              className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#f48a42] to-[#ff9f5a] opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"
              aria-hidden="true"
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <RenterIcon />
              </div>

              {/* Title */}
              <h3 className="font-IBMPlex font-bold text-2xl md:text-3xl text-darkNavy mb-3 group-hover:text-[#f48a42] transition-colors duration-300">
                {t("renter.title")}
              </h3>

              {/* Description */}
              <p className="text-[#5B5656] text-base md:text-lg mb-6 leading-relaxed">
                {t("renter.description")}
              </p>

              {/* Features List */}
              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-sm text-[#5B5656]">
                  <span className="w-2 h-2 rounded-full bg-[#f48a42]" />
                  {t("renter.feature1")}
                </li>
                <li className="flex items-center gap-2 text-sm text-[#5B5656]">
                  <span className="w-2 h-2 rounded-full bg-[#f48a42]" />
                  {t("renter.feature2")}
                </li>
                <li className="flex items-center gap-2 text-sm text-[#5B5656]">
                  <span className="w-2 h-2 rounded-full bg-[#f48a42]" />
                  {t("renter.feature3")}
                </li>
              </ul>

              {/* Button */}
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#f48a42] to-[#ff9f5a] text-white px-6 py-3 rounded-xl font-semibold text-base md:text-lg group-hover:gap-5 transition-all duration-300 shadow-md group-hover:shadow-lg">
                {t("renter.button")}
                <ArrowIcon
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isRtl
                      ? "rotate-180 group-hover:-translate-x-1"
                      : "group-hover:translate-x-1"
                  }`}
                />
              </div>
            </div>
          </Link>

          {/* Lessor Card */}
          <Link
            href="/register"
            className="group relative bg-white rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-[#1E3A5F] overflow-hidden"
          >
            {/* Card Background Pattern */}
            <div
              className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#1E3A5F] to-darkNavy opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"
              aria-hidden="true"
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <LessorIcon />
              </div>

              {/* Title */}
              <h3 className="font-IBMPlex font-bold text-2xl md:text-3xl text-darkNavy mb-3 group-hover:text-[#1E3A5F] transition-colors duration-300">
                {t("lessor.title")}
              </h3>

              {/* Description */}
              <p className="text-[#5B5656] text-base md:text-lg mb-6 leading-relaxed">
                {t("lessor.description")}
              </p>

              {/* Features List */}
              <ul className="space-y-2 mb-8">
                <li className="flex items-center gap-2 text-sm text-[#5B5656]">
                  <span className="w-2 h-2 rounded-full bg-[#1E3A5F]" />
                  {t("lessor.feature1")}
                </li>
                <li className="flex items-center gap-2 text-sm text-[#5B5656]">
                  <span className="w-2 h-2 rounded-full bg-[#1E3A5F]" />
                  {t("lessor.feature2")}
                </li>
                <li className="flex items-center gap-2 text-sm text-[#5B5656]">
                  <span className="w-2 h-2 rounded-full bg-[#1E3A5F]" />
                  {t("lessor.feature3")}
                </li>
              </ul>

              {/* Button */}
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#172950] to-[#274877] text-white px-6 py-3 rounded-xl font-semibold text-base md:text-lg group-hover:gap-5 transition-all duration-300 shadow-md group-hover:shadow-lg">
                {t("lessor.button")}
                <ArrowIcon
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isRtl
                      ? "rotate-180 group-hover:-translate-x-1"
                      : "group-hover:translate-x-1"
                  }`}
                />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
