import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "@/hooks/useTranslations";
import Button from "../ui/Button";
import { Search } from "../ui/svgs/icons/SearchSvg";
import { ChevronLeft } from "../ui/svgs/icons/ChevronLeftSvg";
import { ChevronRight } from "../ui/svgs/icons/ChevronRightSvg";;
import {
  EInvoice,
  Security,
  PaymentMethods,
  Estajer,
  Group,
  AllowedSystems,
  ComplaintsCancellations,
} from "../ui/svgs/FaqsIcons";

const categories = [
  {
    nameAr: "الحقوق والأمان",
    nameEn: "Rights & Security",
    Icon: Security,
    categoryId: "rights&security",
  },
  {
    nameAr: "المدفوعات والتحويلات",
    nameEn: "Payments & Transfers",
    Icon: PaymentMethods,
    categoryId: "payments&transfers",
  },
  {
    nameAr: "عمليات التأجير",
    nameEn: "Renting operations",
    Icon: EInvoice,
    categoryId: "rentingOperations",
  },
  {
    nameAr: "عن المنصة",
    nameEn: "About Estajer",
    Icon: Estajer,
    categoryId: "about",
  },
  {
    nameAr: "التسجيل والحساب",
    nameEn: "Registration & Account",
    Icon: Group,
    categoryId: "registration&Account",
  },
  {
    nameAr: "الانظمة المتاحة",
    nameEn: "Available Systems",
    Icon: AllowedSystems,
    categoryId: "availableSystems",
  },
  {
    nameAr: "الشكاوى والإلغاءات",
    nameEn: "Complaints & Cancellations",
    Icon: ComplaintsCancellations,
    categoryId: "Complaints&Cancellations",
  },
];

const TopSection = ({
  translate,
  search,
  setSearch,
  lang,
  activeCategory,
  setActiveCategory,
}) => {
  const trans = useTranslations(translate);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    direction: lang === "en" ? "ltr" : "rtl",
    dragFree: true,
    containScroll: "trimSnaps",
    startIndex: 2,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const onSelect = useCallback((api) => {
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="flex flex-col gap-14 px-6 md:px-0 pt-24 md:gap-20 items-center w-full bg-gradient-to-b from-primary/10 to-white">
      <div className="flex w-full md:w-1/2 flex-col items-center gap-6 md:gap-8">
        <h1 className="font-IBMPlex text-black/80 font-bold text-4xl md:text-5xl">
          {trans("faqs.title")}
        </h1>
        <div className="w-full bg-white border border-[#DCE2EEB2]/70 rounded-full relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={trans("faqs.search.placeholder")}
            className="w-full bg-transparent placeholder:text-[#637381] placeholder:font-IBMPlex placeholder:text-lg pe-32 ps-12 py-6 md:py-5 focus:outline-none"
          />
          <button className="absolute top-1/2 -translate-y-1/2 start-2 md:start-3 p-1 rounded-full hover:bg-black/5 transition-colors">
            <Search className="md:w-6 md:h-6 w-5 h-5" color="#637381" />
          </button>
          <Button
            type="submit"
            className="absolute top-1/2 -translate-y-1/2 end-2 md:end-3 px-6 py-2 md:py-3"
            aria-label={trans("faqs.search.action")}
          >
            {trans("faqs.search.action")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-8 items-center w-full">
        <div className="text-[#FF8D28] text-xl md:text-2xl">
          {trans("faqs.carouselTitle")}
        </div>

        <div className="relative w-full">
          {/* Left button */}
          {((lang === "en" && canScrollPrev) ||
            (lang === "ar" && canScrollNext)) && (
            <button
              onClick={lang === "en" ? scrollPrev : scrollNext}
              className={`absolute top-1/2 -translate-y-1/2 ${
                lang === "en" ? "start-6 md:start-16" : "end-6 md:end-16"
              } z-20 -translate-x-1/2 p-2 rounded-full bg-white border border-[#DCE2EEB2] shadow-[0px_15px_30px_0px_#0000001A] hover:scale-105 transition-transform`}
            >
              <ChevronLeft />
            </button>
          )}

          {/* Right button */}
          {((lang === "en" && canScrollNext) ||
            (lang === "ar" && canScrollPrev)) && (
            <button
              onClick={lang === "en" ? scrollNext : scrollPrev}
              className={`absolute top-1/2 -translate-y-1/2 ${
                lang === "en" ? "end-6 md:end-16" : "start-6 md:start-16"
              } z-20 translate-x-1/2 p-2 rounded-full bg-white border border-[#DCE2EEB2] shadow-[0px_15px_30px_0px_#0000001A] hover:scale-105 transition-transform`}
            >
              <ChevronRight />
            </button>
          )}

          <div
            ref={emblaRef}
            className="overflow-hidden mx-auto max-w-max w-full px-0 md:px-2"
          >
            <div className="flex gap-8 will-change-transform select-none touch-pan-y cursor-grab active:cursor-grabbing px-0 py-4 md:pl-8 md:pr-8">
              {categories.map(({ nameAr, nameEn, Icon, categoryId }, idx) => {
                const isActive = activeCategory === categoryId;
                return (
                  <div
                    key={idx}
                    onClick={() =>
                      isActive
                        ? setActiveCategory("")
                        : setActiveCategory(categoryId)
                    }
                    className={`flex-[0_0_auto] self-center min-w-0 select-none cursor-pointer transition-transform duration-300 ${
                      isActive ? "scale-105" : "scale-100"
                    }`}
                  >
                    <div
                      className={`flex flex-col justify-center items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300 w-[330px] h-[180px] bg-white ${
                        isActive
                          ? "border-[#FF8D28] shadow-[0_8px_30px_rgba(255,141,40,0.12)]"
                          : "border-[#DCE2EEB2]"
                      }`}
                    >
                      <div className="w-16 h-16 flex items-center justify-center rounded-full transition-colors">
                        <Icon
                          className="w-full h-full"
                          color={isActive ? "#FF8D28" : "#D2D2D2"}
                        />
                      </div>
                      <span className="text-center font-IBMPlex font-semibold text-medium md:text-lg text-[#21212191]">
                        {lang === "en" ? nameEn : nameAr}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopSection;
