import React from "react";
import { getTranslations } from "@/hooks/getTranslations";
import CommonSearchCarousel from "./CommonSearchCarousel";

export default async function CommonSearch({ lang }) {
  const translate = await getTranslations(lang, ["home"]);
  return (
    <div className="hidden md:block bg-darkNavy md:py-0 py-6">
      <div className="max-w-screen-2xl mx-auto lg:px-10 md:px-8 px-4 gap-[3%] gap-y-5 items-center">
        <CommonSearchCarousel translate={translate()} lang={lang} />
      </div>
    </div>
  );
}
