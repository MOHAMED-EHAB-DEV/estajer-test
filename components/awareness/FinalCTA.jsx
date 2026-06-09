import { useTranslations } from "@/hooks/useTranslations";
import Button from "../ui/Button";
import Link from "next/link";
import { Cloud } from "../ui/svgs/icons/CloudSvg";
import SectionTitle from "@/components/shared/SectionTitle";

const UnderlineSvg = () => (
  <svg
    width="200"
    height="4"
    fill="none"
    viewBox="0 0 270 4"
    className="w-full h-auto"
  >
    <rect
      width="270"
      height="4"
      fill="url(#paint0_linear_CTA_UNDERLINE)"
      opacity="0.6"
      rx="2"
    />
    <defs>
      <linearGradient
        id="paint0_linear_CTA_UNDERLINE"
        x1="0"
        x2="270"
        y1="2"
        y2="2"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FB923C" stopOpacity="0" />
        <stop offset="0.5" stopColor="#FB923C" />
        <stop offset="1" stopColor="#FB923C" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24">
    <path
      stroke="#F97316"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m9 12 2 2 4-4m5.618-4.016A11.96 11.96 0 0 1 12 2.944a11.96 11.96 0 0 1-8.618 3.04A12 12 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016"
    />
  </svg>
);

const LockIcon = () => (
  <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24">
    <path
      stroke="#F97316"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2m10-10V7a4 4 0 1 0-8 0v4z"
    />
  </svg>
);

const CreditCardIcon = () => (
  <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24">
    <path
      stroke="#F97316"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3"
    />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24">
    <path
      stroke="#F97316"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.003 5.003 0 0 0-9.288 0M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0m6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0M7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0"
    />
  </svg>
);

const LongDivider = () => (
  <svg
    width="836"
    height="1"
    fill="none"
    viewBox="0 0 836 1"
    className="w-full h-px"
  >
    <path fill="url(#paint0_linear_CTA_DIV_UP_B)" d="M0 0h836v1H0z" />
    <defs>
      <linearGradient
        id="paint0_linear_CTA_DIV_UP_B"
        x1="0"
        x2="836"
        y1="0.5"
        y2="0.5"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FED7AA" stopOpacity="0" />
        <stop offset="0.25" stopColor="#FED7AA" />
        <stop offset="0.5" stopColor="#E7E5E4" />
        <stop offset="0.75" stopColor="#FED7AA" />
        <stop offset="1" stopColor="#FED7AA" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

const FinalCTA = ({ translate, lang }) => {
  const trans = useTranslations(translate);
  const t = (text) => trans(`awareness.finalCTA.${text}`);
  const features = trans("awareness.finalCTA.features");
  const featureIcons = [ShieldIcon, LockIcon, CreditCardIcon, UsersIcon];

  return (
    <section className="pt-16 md:pt-20 pb-12 md:pb-16 bg-[#FFF9F0] relative overflow-hidden">
      {/* Top-right cloud - matches WhyEstajer cloud pattern */}
      <div className="absolute top-0 right-0 select-none pointer-events-none">
        <Cloud className="w-[200px] md:w-[434px] h-auto" />
      </div>
      {/* Bottom-left cloud */}
      <div className="absolute bottom-0 left-0 select-none pointer-events-none">
        <Cloud
          className="w-[250px] md:w-[652px] h-auto scale-x-[-1]"
          fill="#FEECDA"
        />
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 relative z-10 flex flex-col items-center">
        {/* Header — aligned with home page */}
        <div className="text-center mb-6 md:mb-14 max-w-4xl mx-auto">
          <SectionTitle title={t("title")} main={true} />
          <div className="relative inline-block mt-1">
            <span className="font-IBMPlex font-semibold lg:text-[2.2rem] md:text-[1.85rem] text-[1.4rem] text-primary">
              {t("titleHighlight")}
            </span>
            {t("titleSuffix") && (
              <span className="font-IBMPlex font-semibold lg:text-[2.2rem] md:text-[1.85rem] text-[1.4rem] text-darkNavy">
                {" "}
                {t("titleSuffix")}
              </span>
            )}
            <div className="mt-1 flex justify-center">
              <div className="w-40">
                <UnderlineSvg />
              </div>
            </div>
          </div>
          <p className="text-[#5B5656] lg:text-[1.2rem] md:text-[1.1rem] text-sm font-IBMPlex md:mt-6 mt-2 leading-relaxed max-w-2xl mx-auto">
            {t("subtitlePart1")}
            <span className="text-darkNavy font-semibold">
              {t("subtitleHighlight")}
            </span>
            {t("subtitlePart2")}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-2 md:flex-row items-center gap-2 md:gap-4 mb-8 md:mb-16">
          <Button
            as={Link}
            href={`/contact`}
            variant="bordered"
            className="px-5 md:py-7 md:px-10 text-[13px] md:text-base font-IBMPlex font-semibold border-primary/20 text-primary bg-white hover:bg-gray-50 transition-all"
          >
            {t("contactUs")}
          </Button>
          <Button
            as={Link}
            href={`/${lang}/pricing`}
            className="px-5 md:py-7 md:px-12 text-[13px] md:text-base font-IBMPlex font-semibold shadow-[0_15px_40px_-8px_rgba(244,138,66,0.45)] active:scale-95 transition-all flex items-center md:gap-3 gap-1 group"
          >
            {t("createStore")}
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              {lang === "ar" ? "←" : "→"}
            </span>
          </Button>
        </div>

        {/* Divider */}
        <div className="w-full max-w-5xl px-4 mb-2 md:mb-14">
          <LongDivider />
        </div>

        {/* Feature icons — matches WhyEstajer icons grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-2 md:gap-0 w-full max-w-4xl pb-4 md:pb-12">
          {Array.isArray(features) &&
            features.map((feature, index) => {
              const Icon = featureIcons[index];
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center md:gap-3 gap-0 group"
                >
                  <div className="w-12 h-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <Icon />
                  </div>
                  <span className="text-[#5B5656] font-IBMPlex text-xs md:text-base">
                    {feature.label}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
