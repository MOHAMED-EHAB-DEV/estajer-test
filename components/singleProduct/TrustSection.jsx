const STEPS = [
  {
    icon: (
      <img
        src="/svgs/product/money.svg"
        alt=""
        aria-hidden="true"
        className="w-[22px] h-[22px]"
        loading="lazy"
      />
    ),
    key: "step1",
  },
  {
    icon: (
      <img
        src="/svgs/product/vault.svg"
        alt=""
        aria-hidden="true"
        className="w-[22px] h-[22px]"
        loading="lazy"
      />
    ),
    key: "step2",
  },
  {
    icon: (
      <img
        src="/svgs/product/box.svg"
        alt=""
        aria-hidden="true"
        className="w-[22px] h-[22px]"
        loading="lazy"
      />
    ),
    key: "step3",
  },
  {
    icon: (
      <img
        src="/svgs/product/check-shield.svg"
        alt=""
        aria-hidden="true"
        className="w-[22px] h-[22px]"
        loading="lazy"
      />
    ),
    key: "step4",
  },
];

import { useTranslations } from "@/hooks/useTranslations";

export default function TrustSection({ translate }) {
  const trans = useTranslations(translate);
  const t = (value) => trans(value);

  return (
    <section className="mb-16 md:mb-24" aria-label={t("ariaLabel")}>
      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Left — Heading */}
        <div>
          <span className="inline-flex items-center gap-2 bg-[#fff7ed] text-primary border border-[#fed7aa] rounded-full px-4 py-1.5 text-sm font-bold mb-4">
            <img
              src="/svgs/product/shield-badge.svg"
              alt=""
              aria-hidden="true"
              className="w-3.5 h-3.5"
              loading="lazy"
            />
            {t("badge")}
          </span>

          <h2 className="text-[1.3rem] md:text-[1.8rem] font-black text-[#1a1a2e] leading-snug mb-4">
            {t("titlePart1")}
            <br />
            <span className="text-primary">{t("titlePart2")}</span>
          </h2>

          <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-6">
            {t("description")}
          </p>

          <div className="p-3 pe-4 rounded-xl bg-gradient-to-r from-[#fff7ed] to-[#fff7ed]/10 border border-[#F48A42]/20 inline-flex items-center gap-2 shadow-sm shadow-[#F48A42]/5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <img
                src="/svgs/product/check-shield.svg"
                alt=""
                aria-hidden="true"
                className="w-5 h-5"
                loading="lazy"
              />
            </div>
            <span className="text-xs md:text-sm font-semibold text-[#1a1a2e]">
              {t("cta")}
            </span>
          </div>
        </div>

        {/* Right — Vertical timeline */}
        <div className="relative">
          {/* Vertical track */}
          <div className="absolute start-[22px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-[#F48A42]/30 via-[#F48A42]/50 to-[#F48A42]/10" />

          <div className="space-y-4">
            {STEPS.map((step, i) => (
              <div key={i} className="relative flex items-center gap-4">
                {/* Icon node */}
                <div className="relative z-10 w-11 h-11 rounded-2xl bg-white border-2 border-[#F48A42]/30 flex items-center justify-center flex-shrink-0 shadow-sm">
                  {step.icon}
                </div>

                {/* Card */}
                <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-[#F48A42]/20 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#1a1a2e] text-sm">
                      {t(`steps.${step.key}.title`)}
                    </span>
                    <span className="text-[10px] font-semibold text-primary bg-[#fff7ed] border border-[#fed7aa] px-2 py-0.5 rounded-full">
                      {t(`steps.${step.key}.status`)}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {t(`steps.${step.key}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
