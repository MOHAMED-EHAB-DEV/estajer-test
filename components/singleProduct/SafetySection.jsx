import React from "react";
import { Warning } from "../ui/svgs/icons/WarningSvg";
import { getTranslations } from "@/hooks/getTranslations";

export default async function SafetySection({ lang }) {
  const translate = await getTranslations(lang);
  const t = (value) => translate(`product.safety.${value}`);
  return (
    <section
      className="border-[#F48A42] border rounded-2xl overflow-hidden"
      aria-labelledby="safety-section-title"
      role="region"
    >
      <header className="flex gap-3 md:gap-4 py-5 md:py-6 justify-center items-center bg-orangeHighlight font-semibold text-darkNavy text-0.95 md:text-1.2 lg:text-1.35">
        <Warning
          className="lg:w-7 lg:h-7 md:w-6 md:h-6 w-5 h-5"
          aria-hidden="true"
        />
        <h3 id="safety-section-title">{t("title")}</h3>
      </header>
      <div className="bg-[#EAEEF34D] xl:px-8 p-5 md:p-6 lg:text-1.1 md:text-base text-0.85 text-mutedGray">
        <ul
          role="list"
          aria-label={t("safetyGuidelines")}
          className="space-y-3"
        >
          <li className="flex gap-3 items-start" role="listitem">
            <span
              className="w-1.5 h-1.5 min-w-[6px] mt-[0.65rem] rounded-full bg-mutedGray shrink-0"
              aria-hidden="true"
            ></span>
            <span>{t("inspectProduct")}</span>
          </li>
          <li className="flex gap-3 items-start" role="listitem">
            <span
              className="w-1.5 h-1.5 min-w-[6px] mt-[0.65rem] rounded-full bg-mutedGray shrink-0"
              aria-hidden="true"
            ></span>
            <span>{t("noDelay")}</span>
          </li>
          <li className="flex gap-3 items-start" role="listitem">
            <span
              className="w-1.5 h-1.5 min-w-[6px] mt-[0.65rem] rounded-full bg-mutedGray shrink-0"
              aria-hidden="true"
            ></span>
            <span>{t("returnPolicyCondition")}</span>
          </li>
          <li className="flex gap-3 items-start" role="listitem">
            <span
              className="w-1.5 h-1.5 min-w-[6px] mt-[0.65rem] rounded-full bg-mutedGray shrink-0"
              aria-hidden="true"
            ></span>
            <span>{t("returnPhotoGuideline")}</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
