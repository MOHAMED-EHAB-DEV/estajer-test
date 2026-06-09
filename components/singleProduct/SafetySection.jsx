import React from "react";
import { Warning } from "../ui/svgs/icons/WarningSvg";;
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
      <header className="flex gap-4 py-7 justify-center items-center bg-[#FCE7C5] font-semibold text-darkNavy text-[1rem] md:text-[1.5rem] lg:text-[1.8rem]">
        <Warning className="lg:w-10 lg:h-10 w-5 h-5" aria-hidden="true" />
        <h3 id="safety-section-title">{t("title")}</h3>
      </header>
      <div className="bg-[#EAEEF34D] xl:px-12 p-6 py-8 lg:text-[1.45rem] md:text-[1.25rem] text-[0.8rem] text-[#5B5656]">
        <ul role="list" aria-label={t("safetyGuidelines")}>
          <li className="flex gap-4 mb-1" role="listitem">
            <span
              className="min-w-[0.4rem] mt-[0.75rem] h-[0.4rem] rounded-full bg-[#5B5656] P-4 flex"
              aria-hidden="true"
            ></span>
            <span>{t("inspectProduct")}</span>
          </li>
          <li className="flex gap-4 mb-1" role="listitem">
            <span
              className="min-w-[0.4rem] mt-[0.75rem] h-[0.4rem] rounded-full bg-[#5B5656] P-4 flex"
              aria-hidden="true"
            ></span>
            <span>{t("noDelay")}</span>
          </li>
          <li className="flex gap-4 mb-1" role="listitem">
            <span
              className="min-w-[0.4rem]  mt-[0.75rem] h-[0.4rem] rounded-full bg-[#5B5656] P-4 flex"
              aria-hidden="true"
            ></span>
            <span>{t("returnPolicyCondition")}</span>
          </li>
          <li className="flex gap-4 mb-1" role="listitem">
            <span
              className="min-w-[0.4rem]  mt-[0.75rem] h-[0.4rem] rounded-full bg-[#5B5656] P-4 flex"
              aria-hidden="true"
            ></span>
            <span>{t("returnPhotoGuideline")}</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
