"use client";
import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { usePathname } from "next/navigation";
import { cn, translatePathSegments } from "@/lib/utils";
import { ChevronLeft } from "@/components/ui/svgs/icons/ChevronLeftSvg";
import { Home2 } from "@/components/ui/svgs/icons/Home2Svg";;

const TitleWithSegments = ({
  translate,
  title,
  titleClassNames = "",
  isMain = false,
  segments = null,
}) => {
  const pathname = usePathname();
  const trans = useTranslations(translate);
  const t = (text) => trans(`titles.${text}`);
  const translatedPathSegments =
    segments || (isMain ? [] : translatePathSegments(pathname, t));
  return (
    <div className="flex flex-col md:gap-[18px] gap-2 justify-center">
      <h1
        className={cn(
          "font-IBMPlex font-semibold md:text-[32px] text-xl text-darkNavy",
          titleClassNames,
        )}
      >
        {title}
      </h1>

      <div className="flex flex-wrap md:gap-[10px] gap-1 items-center">
        {(isMain || segments) && (
          <Link
            href={pathname.includes("admin") ? "/admin" : "/"}
            className="flex items-center md:gap-[10px] gap-1"
          >
            <Home2 className="md:w-5 md:h-5 w-4 h-4" />
            <div className="ps-1 flex items-center justify-center text-darkNavy font-NotoSansArabic text-xs md:text-lg">
              {t("home")}
            </div>
            <ChevronLeft className="md:w-4 md:h-4 w-3.5 h-3.5" />
          </Link>
        )}
        {isMain && !segments ? (
          <div className="flex items-center md:gap-[10px] gap-1">
            <div className="flex items-center justify-center text-darkNavy font-NotoSansArabic text-xs md:text-lg">
              {title}
            </div>
          </div>
        ) : (
          translatedPathSegments.map((segment, idx) => (
            <div key={idx} className="flex items-center md:gap-[10px] gap-1">
              <Link
                href={segment.href}
                className="flex hover:decoration-transparent items-center justify-center text-darkNavy font-NotoSansArabic text-xs md:text-lg hover:underline"
              >
                {segment.text}
              </Link>
              {segment !==
                translatedPathSegments[translatedPathSegments.length - 1] && (
                <ChevronLeft className="md:w-4 md:h-4 w-3.5 h-3.5" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default TitleWithSegments;
