import React from "react";
import { Cloud2 } from "../ui/svgs/icons/Cloud2Svg";
import { Plus } from "../ui/svgs/icons/PlusSvg";;
import { FindIcon } from "../ui/svgs/FindIcon";
import Button from "../ui/Button";
import { getTranslations } from "@/hooks/getTranslations";
import Link from "next/link";

export default async function RequestProduct({ lang }) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const translate = await getTranslations(lang, ["home"]);
  const t = (value) => translate(`home.requestSection.${value}`);
  const t2 = (value) => translate(`ui.button.${value}`);

  return (
    <div className="bg-primary">
      <div className="max-w-screen-2xl mx-auto px-4 py-12 md:py-32 text-white relative z-10 overflow-x-hidden">
        <div className="lg:text-[3.5rem] md:text-[3rem] text-[1.8rem] font-IBMPlex font-semibold mb-4">
          {t("title")}
        </div>
        <div className="lg:text-[2.3rem] md:text-[2rem] text-[1rem] mb-10 lg:w-7/12 md:w-8/12">
          {t("description")}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-6">
          <Button
            as={Link}
            href={`/${langPrefix}request-product`}
            className="font-semibold gap-2 ps-12 pe-14 bg-darkNavy !opacity-100 md:py-7 md:text-lg"
          >
            <Plus color="#F48A42" /> {t2("requestProduct")}
          </Button>
          <Button
            as={Link}
            variant="bordered"
            href={`/${langPrefix}requests`}
            className="font-semibold ps-8 pe-10 border-darkNavy text-darkNavy hover:bg-darkNavy hover:text-white !opacity-100 md:py-7 md:text-lg"
          >
            {t2("viewRequestedProducts")}
          </Button>
        </div>
      </div>
      <div className="max-w-screen-3xl w-full relative m-auto">
        <div className="absolute bottom-0 opacity-70 md:-start-2 start-0">
          <div
            {...(lang === "en" ? { className: "-scale-x-100 md:w-max" } : {})}
          >
            <Cloud2 />
          </div>
        </div>
        <div className="absolute md:-bottom-2 -bottom-0 max-w-[704px] w-7/12 end-0">
          <FindIcon />
        </div>
      </div>
    </div>
  );
}
