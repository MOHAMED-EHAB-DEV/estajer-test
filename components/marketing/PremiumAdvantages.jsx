import React from "react";
import { useTranslations } from "@/hooks/useTranslations";
import Link from "next/link";

const PremiumAdvantages = ({ translate, lang }) => {
  const trans = useTranslations(translate);
  const t = (key) => trans(`marketing.premiumAdvantages.${key}`);

  const CardShadowOverlay = () => (
    <div className="absolute top-0 right-0 pointer-events-none z-0">
      <svg width="150" height="150" fill="none" viewBox="0 0 150 150">
        <path
          fill="url(#paint0_radial_4442_6047)"
          d="M0 0h132c9.941 0 18 8.059 18 18v132h-50C44.772 150 0 105.228 0 50z"
        ></path>
        <defs>
          <radialGradient
            id="paint0_radial_4442_6047"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="translate(150)scale(212.132)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F48A42" stopOpacity="0.09"></stop>
            <stop offset="0.65" stopColor="#FB923C" stopOpacity="0"></stop>
          </radialGradient>
        </defs>
      </svg>
    </div>
  );

  const cards = [
    {
      icon: (
        <svg width="28" height="30" fill="none" viewBox="0 0 28 30">
          <path
            fill="currentColor"
            d="M6.105 4.149q2.42 0 3.888 1.699 1.47 1.67 1.47 4.723t-1.383 4.781q-1.354 1.7-3.975 1.7-1.554 0-2.736-.778-1.18-.778-1.843-2.218-.662-1.469-.662-3.485 0-3.053 1.353-4.723 1.354-1.7 3.888-1.7m.058 3.427q-.605 0-.835.835-.23.807-.23 2.218 0 1.382.23 2.217t.835.836.835-.807q.23-.835.23-2.246t-.23-2.218q-.23-.835-.835-.835m15.552-3.14L10.31 25H6.134L17.54 4.437zm.029 7.892q1.613 0 2.822.778 1.209.748 1.872 2.188.663 1.412.663 3.456 0 3.054-1.383 4.781-1.353 1.7-3.974 1.7-1.556 0-2.736-.778t-1.843-2.218q-.663-1.468-.663-3.485 0-3.053 1.354-4.723 1.353-1.7 3.888-1.699m.057 3.427q-.604 0-.835.835-.23.807-.23 2.218 0 1.382.23 2.218.23.834.835.835.606 0 .836-.807.23-.834.23-2.246 0-1.44-.23-2.246-.231-.807-.836-.807"
          ></path>
        </svg>
      ),
      title: t("card1Title"),
      desc: t("card1Desc"),
      tag: t("card1Tag"),
    },
    {
      icon: (
        <svg width="37" height="29" fill="none" viewBox="0 0 37 29">
          <path
            fill="currentColor"
            d="M34.987 6.694c1.856 3.037.169 7.2-3.319 7.65-.281.056-.506.056-.787.056a5.56 5.56 0 0 1-4.163-1.856 5.56 5.56 0 0 1-4.163 1.856 5.65 5.65 0 0 1-4.162-1.856c-1.012 1.125-2.475 1.856-4.106 1.856a5.56 5.56 0 0 1-4.163-1.856A5.56 5.56 0 0 1 5.962 14.4c-.282 0-.507 0-.788-.056C1.687 13.894 0 9.73 1.912 6.694l3.6-5.85A1.95 1.95 0 0 1 7.087 0h22.725c.618 0 1.181.338 1.518.844zM30.88 16.2c.338 0 .675 0 1.013-.056.337 0 .619-.113.956-.169V27c0 1.013-.843 1.8-1.8 1.8H5.85c-1.012 0-1.8-.787-1.8-1.8V15.975c.281.056.563.113.9.169s.675.056 1.013.056q.843 0 1.687-.169v5.57h21.6v-5.57a7.6 7.6 0 0 0 1.632.17"
          ></path>
        </svg>
      ),
      title: t("card2Title"),
      desc: t("card2Desc"),
      tag: t("card2Tag"),
    },
    {
      icon: (
        <svg width="25" height="25" fill="none" viewBox="0 0 25 25">
          <g
            stroke="currentColor"
            strokeMiterlimit="10"
            strokeWidth="2.5"
            clipPath="url(#clip0_4442_6032)"
          >
            <path d="M18.938 3.344A11.198 11.198 0 0 1 12.5 23.698M6.062 21.656a11.198 11.198 0 0 1 6.437-20.354"></path>
            <path d="m19.624 7.417-1.02-4.073h4.072M5.374 17.594l1.021 4.062H2.322M19.625 12.5a7.83 7.83 0 0 1-7.125 4.073A7.83 7.83 0 0 1 5.375 12.5 7.83 7.83 0 0 1 12.5 8.427a7.83 7.83 0 0 1 7.125 4.073Z"></path>
            <path d="M12.5 13.52a1.02 1.02 0 1 0 0-2.041 1.02 1.02 0 0 0 0 2.042Z"></path>
          </g>
          <defs>
            <clipPath id="clip0_4442_6032">
              <path fill="#fff" d="M0 0h25v25H0z"></path>
            </clipPath>
          </defs>
        </svg>
      ),
      title: t("card3Title"),
      desc: t("card3Desc"),
      tag: t("card3Tag"),
    },
    {
      icon: (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path
            d="M25.1875 20.75C25.5938 20.75 26 21.1562 26 21.5625V23.1875C26 23.6445 25.5938 24 25.1875 24H1.625C0.710938 24 0 23.2891 0 22.375V5.3125C0 4.90625 0.355469 4.5 0.8125 4.5H2.4375C2.84375 4.5 3.25 4.90625 3.25 5.3125V20.75H25.1875ZM23.5625 6.125C23.9688 6.125 24.375 6.53125 24.3242 6.9375V12.9805C24.3242 14.0469 23.0547 14.6055 22.293 13.8438L20.6172 12.168L15.7422 17.043C15.1328 17.7031 14.0664 17.7031 13.457 17.043L9.75 13.3359L7.36328 15.6719C7.05859 15.9766 6.55078 15.9766 6.24609 15.6719L5.07812 14.5039C4.77344 14.1992 4.77344 13.6914 5.07812 13.3867L8.58203 9.88281C9.19141 9.22266 10.2578 9.22266 10.8672 9.88281L14.625 13.5898L18.332 9.88281L16.6562 8.20703C15.8945 7.44531 16.4531 6.125 17.5195 6.125H23.5625Z"
            fill="currentColor"
          />
        </svg>
      ),
      title: t("card4Title"),
      desc: t("card4Desc"),
      tag: t("card4Tag"),
    },
  ];

  return (
    <section
      className="py-16 md:py-24 bg-white font-sans"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16 flex flex-col items-center">
          <div className="inline-flex items-center justify-center px-6 py-2 bg-[#FFF5EC] border border-[#FDE5D0] rounded-full mb-6 font-bold text-xs md:text-sm text-[#F97316] shadow-sm">
            {t("badge")}
          </div>
          <h2 className="text-2xl md:text-[2.25rem] font-bold text-[#1F2937] mb-2 md:mb-4">
            {t("title")}
          </h2>
          <p className="text-[#6B7280] text-sm md:text-lg font-medium">
            {t("subtitle")}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 xl:gap-8 mb-12 md:mb-16">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden border border-[#FCE6D6] bg-white rounded-[24px] pb-4 pt-3 px-3 md:p-8 flex flex-col items-start  transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1"
            >
              <CardShadowOverlay />
              <div className="relative z-10 w-full flex flex-col h-full items-start">
                <div className="mb-2 md:mb-6 w-10 h-10 md:w-14 md:h-14 p-2 md:p-0  bg-[#FFF5EC] rounded-[16px] text-[#F97316] flex items-center justify-center">
                  {card.icon}
                </div>
                <h3 className="text-[16px] md:text-[1.15rem] font-bold text-[#111827] mb-3">
                  {card.title}
                </h3>
                <p className="text-[#6B7280] text-xs md:text-[0.95rem] min-h-[40px] min-w-[40px] md:min-h-[60px] md:min-w-[60px] max-h-[60px] overflow-hidden line-clamp-2 leading-[1.7] mb-2 md:mb-6">
                  {card.desc}
                </p>
                <div className="mt-auto bg-[#FFF5EC] text-[#F97316] border border-[#FDE5D0] rounded-full md:px-4 px-3 py-2 text-[10px] md:text-[13px] font-semibold">
                  {card.tag}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Link
            href={`/${lang}/pricing`}
            className="bg-[#F97316] text-white font-bold text-[0.9rem] md:text-xl py-3 px-8 md:py-4 md:px-10 inline-flex items-center justify-center gap-3 rounded-full hover:bg-orange-600 hover:-translate-y-1 hover:shadow-xl active:scale-95 transition-all w-full sm:w-auto"
          >
            <span>{lang === "ar" ? "اشترك معنا" : "Join Us"}</span>
            <span className="font-black text-xl leading-none transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
              {lang === "ar" ? "←" : "→"}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PremiumAdvantages;
