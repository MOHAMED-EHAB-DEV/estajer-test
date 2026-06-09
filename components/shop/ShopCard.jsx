"use client";

import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";

const VerifiedIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path
      fillRule="evenodd"
      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

const ArrowIcon = ({ isRtl }) => (
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`w-4 h-4 transition-transform duration-300 ${isRtl ? "rotate-180 group-hover/card:-translate-x-0.5" : "group-hover/card:translate-x-0.5"}`}
  >
    <path
      fillRule="evenodd"
      d="M3 10a.75.75 0 01.75-.75h10.638l-3.96-3.96a.75.75 0 111.06-1.06l5.25 5.25a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06l3.96-3.96H3.75A.75.75 0 013 10z"
      clipRule="evenodd"
    />
  </svg>
);

export default function ShopCard({ shop, lang, t }) {
  const isRtl = lang === "ar";
  const href = `/${lang === "ar" ? "" : "en/"}shops/${shop.slug}`;

  return (
    <Link
      href={href}
      className="group/card relative flex flex-col bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 h-full"
    >
      {/* Hero banner or gradient fallback */}
      <div className="relative h-24 md:h-44 overflow-hidden bg-gradient-to-br from-primary/10 via-orange-50 to-amber-50 shrink-0">
        {shop.heroBanners?.[0] ? (
          <Image
            unoptimized
            src={anyImgUrl({
              src: isRtl
                ? shop.heroBanners[0].imageAr
                : shop.heroBanners[0].imageEn,
              size: 600,
              quality: 80,
            })}
            alt={shop.name || ""}
            fill
            className="object-cover transition-transform duration-500 group-hover/card:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-orange-100/60 to-amber-100/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      {/* Logo — overlapping */}
      <div className="absolute start-3 md:start-5 top-[4rem] md:top-[7.5rem] z-10">
        <div className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-white md:shadow-xl shadow-md border-2 border-white overflow-hidden flex items-center justify-center">
          {shop.logo ? (
            <Image
              unoptimized
              src={anyImgUrl({ src: shop.logo, size: 80 })}
              alt={shop.name || ""}
              width={80}
              height={80}
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <span className="text-primary font-black text-xl md:text-2xl">
                {(shop.name || "?")[0]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pt-7 md:pt-12 pb-3 md:pb-5 px-3 md:px-5 flex flex-col gap-2 md:gap-3 flex-1">
        {/* Name + verified */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 md:gap-2">
          <h2 className="text-sm md:text-lg font-black text-darkNavy leading-tight line-clamp-1">
            {shop.name}
          </h2>
          <span className="w-fit shrink-0 flex items-center gap-1 bg-primary/10 text-primary px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold border border-primary/20">
            <VerifiedIcon />
            {t("verifiedShop")}
          </span>
        </div>

        {/* Description */}
        {shop.description && (
          <p className="text-[10px] md:text-sm text-neutral-500 leading-relaxed line-clamp-2 flex-1">
            {shop.description}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-2 md:gap-3 mt-auto">
          {shop.sliders?.length > 0 && (
            <span className="text-[10px] md:text-xs text-neutral-400 font-medium">
              {shop.sliders.reduce((a, s) => a + (s.products?.length || 0), 0)}{" "}
              {t("products")}
            </span>
          )}
          {shop.categories?.length > 0 && (
            <span className="text-[10px] md:text-xs text-neutral-400 font-medium">
              {shop.categories.length} {t("categories")}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-neutral-100">
          <span className="text-[10px] md:text-sm font-bold text-primary group-hover/card:underline">
            {t("browseShop")}
          </span>
          <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover/card:bg-primary group-hover/card:text-white transition-colors duration-200">
            <ArrowIcon isRtl={isRtl} />
          </span>
        </div>
      </div>
    </Link>
  );
}
