import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "@/hooks/getTranslations";

export default async function RegisterPromotion({ lang, register }) {
  const translate = await getTranslations(lang);
  const t = (key) => translate(`authPromotion.${key}`);

  const items = [
    t("listItem1"),
    t("listItem2"),
    t("listItem3"),
    t("listItem4"),
  ];

  const langPrefix = lang === "ar" ? "" : "en/";
  return (
    <div className="hidden lg:flex lg:w-1/2 w-full relative justify-center items-center min-h-dvh">
      <div className="w-[600px] max-w-full p-8">
        <Link
          href={`/${langPrefix}`}
          className="flex gap-2 items-center text-2xl"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="white">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.15694 7.71114L1.49994 13.3681L0.0859375 11.9541L5.03594 7.00414L0.0859375 2.05414L1.49994 0.640137L7.15694 6.29714C7.34441 6.48466 7.44972 6.73897 7.44972 7.00414C7.44972 7.2693 7.34441 7.52361 7.15694 7.71114Z"
            />
          </svg>
          <span>{t("backButton")}</span>
        </Link>
        <div className="w-40 aspect-[1.5/1] relative my-8">
          <Image
            src={anyImgUrl({
              src: "logoWhite_l0rabo_hkkqjj",
              size: 500,
            })}
            fill
            alt={t("logoAlt")}
            unoptimized
            className=" w-full object-contain"
          />
        </div>
        <h1 className="text-[2.5rem] leading-[3.5rem] font-semibold font-IBMPlex mb-8">
          {register ? t("registerTitle") : t("loginTitle")}
        </h1>
        <ul className="flex flex-col gap-5 mb-20">
          {items.map((text, i) => (
            <li key={i} className="flex gap-4 text-2xl w-[420px] max-w-full">
              <svg
                className="mt-2"
                width="24"
                height="20"
                viewBox="0 0 24 20"
                fill="white"
              >
                <path d="M7.88868 19.0958L0.390625 11.5977L3.80762 8.18073L7.88868 12.2739L19.818 0.33252L23.235 3.74951L7.88868 19.0958Z" />
              </svg>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
