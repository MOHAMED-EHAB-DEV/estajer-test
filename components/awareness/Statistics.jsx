import { useTranslations } from "@/hooks/useTranslations";
import Button from "@/components/ui/Button";
import Link from "next/link";


const Statistics = ({ translate, lang = "ar" }) => {
  const trans = useTranslations(translate);
  const t = (text) => trans(`awareness.statistics.${text}`);
  const stats = trans("awareness.statistics.stats");

  return (
    <section className="pt-16 md:pt-28 pb-8 md:pb-10 px-4 md:px-8 relative bg-white">
      <div className="max-w-screen-2xl mx-auto text-center relative z-10 w-full">
        {/* Badge */}
        <div className="inline-block px-4 md:px-5 py-1 md:py-1.5 rounded-full border border-primary/20 bg-[#FFF9F5] text-primary text-xs md:text-sm font-IBMPlex font-bold tracking-wide mb-6">
          {t("badge")}
        </div>

        {/* Heading */}
        <h1 className="font-IBMPlex font-bold text-2xl lg:text-[1.8rem] md:text-[1.6rem] text-darkNavy md:mb-4 mb-2">
          {t("title")}
        </h1>

        {/* Subtitle */}
        <p className="text-[#5B5656] lg:text-[1.1rem] md:text-[1.2rem] px-2 text-sm md:mb-16 mb-8 max-w-3xl mx-auto font-IBMPlex leading-relaxed">
          {t("description")}
          <span className="text-primary font-bold mx-1">
            {t("descriptionHighlight")}
          </span>
        </p>

        {/* Stats Box */}
        <div className="bg-[#FFF9F5] rounded-[2.5rem] py-10 md:py-16 w-full mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 relative">
            {Array.isArray(stats) &&
              stats.map((stat, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center justify-center space-y-4 relative ${
                    index !== 0
                      ? "md:before:absolute md:before:top-1/2 md:before:-translate-y-1/2 md:before:start-0 md:before:w-px md:before:h-20 md:before:bg-primary/30"
                      : ""
                  }`}
                >
                  <div className="font-IBMPlex text-3xl md:text-5xl font-black text-primary tracking-tight">
                    {stat.value}
                  </div>
                  <p className="text-darkNavy font-IBMPlex font-bold text-xs md:text-base text-center max-w-[220px]">
                    {stat.label}
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button
            as={Link}
            href={`/${lang}/pricing`}
            className="md:text-lg text-sm py-4 px-6 md:py-7 md:px-12 flex items-center gap-3 font-IBMPlex font-bold shadow-[0_15px_30px_-8px_rgba(244,138,66,0.35)] hover:-translate-y-1 transition-all duration-300 rounded-full group bg-primary text-white"
          >
            <span>{lang === "ar" ? "انضم لـ 800+ شريك ناجح" : "Join 800+ successful partners"}</span>
            <span className="font-black text-xl leading-none transition-transform duration-300 group-hover:-translate-x-1">
              {lang === "ar" ? "←" : "→"}
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Statistics;
