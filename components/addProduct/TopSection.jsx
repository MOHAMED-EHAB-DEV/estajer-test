import React from "react";
import { Cloud } from "../ui/svgs/icons/CloudSvg";;
import { getTranslations } from "@/hooks/getTranslations";

export default async function TopSection({ lang, title, description }) {
  const translate = await getTranslations(lang);
  const t = (text) => translate(`search.${text}`);

  return (
    <div className="relative mt-10 mb-10">
      <div className="max-w-screen-3xl w-full relative m-auto">
        <div className="max-w-[315px] md:max-w-[630px] absolute top-1 -start-12">
          <div {...(lang === "en" ? { className: "-scale-x-100 w-max" } : {})}>
            <Cloud />
          </div>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto flex justify-between items-center px-4 relative">
        <div>
          <h1 className="lg:text-[2.2rem] md:text-[2rem] text-[1.7rem]  font-semibold text-darkNavy font-IBMPlex">
            {title || t("addProduct")}
          </h1>
          <p className="lg:text-[1.4rem] md:text-[1.3rem] text-[1.2rem] text-darkNavy ">
            {description || t("availableCars")}
          </p>
        </div>
      </div>
    </div>
  );
}
