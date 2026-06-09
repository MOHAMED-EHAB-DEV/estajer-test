import { useEffect, useState, useRef } from "react";
import { Plus } from "@/components/ui/svgs/icons/PlusSvg";
import { Minus } from "@/components/ui/svgs/icons/MinusSvg";
import { useTranslations } from "@/hooks/useTranslations";
import Button from "../ui/Button";

const Faqs = ({ translate, lang, activeCategory }) => {
  const trans = useTranslations(translate);
  const t = (text) => trans(`faqs.${text}`);
  const categoryRefs = useRef({});

  const [openIndex, setOpenIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const faqs = t("faqs");

  const itemsPerPage = 6;
  const hasMore = visibleCount < faqs.length;
  const currentFaqs = faqs.slice(0, visibleCount);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const showMore = () => {
    setVisibleCount((prev) => Math.min(prev + itemsPerPage, faqs.length));
  };

  const showLess = () => {
    setVisibleCount(itemsPerPage);
  };

  useEffect(() => {
    const indexOfItem =
      faqs.findIndex((faq) => faq.categoryId === activeCategory) + 1;

    if (indexOfItem >= itemsPerPage && hasMore) {
      setVisibleCount((prev) => Math.min(prev + indexOfItem, faqs.length));
    }
    toggleFaq(indexOfItem - 1);

    setTimeout(() => {
      const target = categoryRefs.current[indexOfItem - 1];
      if (target) {
        const rect = target.getBoundingClientRect();
        const offset = window.scrollY + rect.top - 80;
        window.scrollTo({ top: offset, behavior: "smooth" });
      }
    }, 150);
  }, [activeCategory]);

  return (
    <>
      <div className="pb-16 flex flex-col gap-12 items-center relative">
        <div className="flex flex-col w-full px-4 max-w-4xl gap-6 items-center">
          <h2 className="text-primary font-IBMPlex font-semibold text-2xl md:text-4xl">
            {t("mainTitle")}
          </h2>
          <p className="text-lg md:text-xl text-center text-[#5B5656]">
            {t("description")}
          </p>
        </div>

        <div className="bg-[#FDE8D9] w-9 h-9 rounded-full absolute hidden md:block -top-6 right-1/3" />
        <div className="bg-[#FDE8D9] w-9 h-9 rounded-full absolute hidden md:block bottom-36 left-[5%]" />
        <div className="bg-[#FDE8D9] w-16 h-16 rounded-full absolute hidden md:block -top-7 left-[8%]" />
        <div className="bg-[#FDE8D9] w-16 h-16 rounded-full absolute hidden md:block top-16 right-[8%]" />
        <div className="bg-[#FDE8D9] w-7 h-7 rounded-full absolute hidden md:block bottom-28 left-[40%]" />
        <div className="bg-[#FDE8D9] w-7 h-7 rounded-full absolute hidden md:block top-80 right-[10%]" />

        <div className="w-full max-w-4xl px-4 space-y-4">
          {currentFaqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl transition-all duration-300 overflow-hidden"
              ref={(el) => (categoryRefs.current[index] = el)}
            >
              <div
                onClick={() => toggleFaq(index)}
                className={`w-full px-6 py-5 flex items-center justify-between gap-3 sm:gap-0 ${
                  openIndex !== index ? "border-b border-b-[#BCBCBC]" : ""
                }`}
              >
                <span className={`font-semibold text-lg text-gray-800`}>
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <Minus
                    className="w-5 h-5 text-primary flex-shrink-0"
                    color="#F48A42"
                    strokeWidth={6}
                  />
                ) : (
                  <Plus
                    strokeWidth={4}
                    className="w-4 h-4 flex-shrink-0"
                    color="#F48A42"
                  />
                )}
              </div>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-5 pt-2 text-gray-600 leading-relaxed whitespace-pre-line">
                  {faq.answer.split("•").map((point, i) => (
                    <p key={i} className="relative pl-4">
                      {point.trim()}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={hasMore ? showMore : showLess}
          className="bg-[#0E0E0E] font-semibold font-IBMPlex text-medium"
        >
          {hasMore ? t("showMore") : t("showLess")}
        </Button>
      </div>
    </>
  );
};

export default Faqs;
