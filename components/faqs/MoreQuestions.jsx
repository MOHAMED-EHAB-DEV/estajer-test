import QuestionMark from "../ui/svgs/QuestionMark";
import { EmailOpenFill, QuestionFill } from "../ui/svgs/FaqsIcons";
import { Cloud } from "../ui/svgs/icons/CloudSvg";;
import { useTranslations } from "@/hooks/useTranslations";

const MoreQuestions = ({ translate, lang }) => {
  const trans = useTranslations(translate);
  const t = (text) => trans(`moreQuestions.${text}`);
  return (
    <div className="w-full bg-[#FFF9F0] relative px-4 md:px-32 py-12 md:py-16">
      <div className={`absolute ${lang === "en" ? "md:top-[83px] md:-left-[11px]" : "md:top-[83px] top-4 -right-36 md:-right-[11px] scale-x-[-1]"}`}>
        <Cloud />
      </div>
      <div className={`flex flex-col md:flex-row md:items-center justify-center md:justify-between w-full ${lang === "en" ? "md:pl-20" : "md:pr-20"} px-2 md:px-0 mx-auto gap-10 md:gap-0`}>
        <div className="flex flex-col gap-6 md:gap-8 w-full md:w-auto text-start">
          <h3 className="font-IBMPlex z-10 text-darkNavy font-semibold text-xl sm:text-2xl md:text-4xl leading-tight">
            {t("title")}
          </h3>
          <div className="flex flex-row flex-wrap items-center gap-4 sm:gap-6 md:gap-10">
            <div className="flex gap-4 items-center w-auto">
              <div className="w-12 h-12 md:w-[70px] md:h-[70px] rounded-full flex items-center justify-center bg-primary p-3 md:p-4 shadow-[0_4px_20px_rgba(244,138,66,0.4)] shrink-0">
                <QuestionFill className="w-full h-full" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-darkNavy text-xs md:text-sm font-medium">{t("browse")}</p>
                <p className="font-IBMPlex font-semibold text-darkNavy text-base md:text-lg leading-tight">
                  {t("faqs")}
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-center w-auto">
              <div className="w-12 h-12 md:w-[70px] md:h-[70px] rounded-full flex items-center justify-center bg-primary p-3 md:p-4 shadow-[0_4px_20px_rgba(244,138,66,0.4)] shrink-0">
                <EmailOpenFill className="w-full h-full" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-darkNavy text-xs md:text-sm font-medium">{t("contactUS")}</p>
                <a href="mailto:info@estajer.com" className="font-IBMPlex font-semibold text-darkNavy text-base md:text-lg leading-tight break-all">
                  info@estajer.com
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden md:block self-center mt-6 md:mt-0">
          <QuestionMark width={250} height={240} className="w-full h-auto" />
        </div>
      </div>
    </div>
  );
};

export default MoreQuestions;
