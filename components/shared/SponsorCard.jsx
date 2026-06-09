"use client";
import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import { Star } from "@/components/ui/svgs/icons/StarSvg";
import { Tag } from "@/components/ui/svgs/icons/TagSvg";
import { ProductsIcon } from "@/components/ui/svgs/icons/ProductsIconSvg";
import { ProductRequests } from "@/components/ui/svgs/icons/ProductRequestsSvg";
import { Furniture } from "@/components/ui/svgs/icons/FurnitureSvg";
import { Car } from "@/components/ui/svgs/icons/CarSvg";
import { Love } from "@/components/ui/svgs/icons/LoveSvg";;
import { useTranslations } from "@/hooks/useTranslations";

export default function SponsorCard({ sponsor, lang, translate }) {
  const trans = useTranslations(translate);
  const t = (value) => trans(`sponsors.${value}`);

  // Get category icon and color based on category
  const getCategoryIcon = (category) => {
    const iconMap = {
      furniture: { Icon: Furniture, color: "#0D092B" },
      automotive: { Icon: Car, color: "#F48A42" },
      electronics: { Icon: ProductsIcon, color: "#2563EB" },
      fashion: { Icon: Tag, color: "#EC4899" },
      food: { Icon: Love, color: "#10B981" },
      health: { Icon: Star, color: "#8B5CF6" },
      beauty: { Icon: Love, color: "#F59E0B" },
      sports: { Icon: ProductsIcon, color: "#EF4444" },
      books: { Icon: Tag, color: "#6B7280" },
      home: { Icon: Furniture, color: "#059669" },
      toys: { Icon: Love, color: "#F97316" },
      jewelry: { Icon: Star, color: "#DC2626" },
      other: { Icon: ProductsIcon, color: "#6B7280" },
    };
    return iconMap[category] || iconMap["other"];
  };

  const { Icon, color } = getCategoryIcon(sponsor.category);
  const langPrefix = lang === "ar" ? "" : "en/";

  // Get product and request counts (these should be included in the API response)
  const productsCount = sponsor.productsCount || 0;
  const ordersCount = sponsor.ordersCount || 0;

  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Header with avatar and basic info */}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            {sponsor.user?.avatar ? (
              <Image
                src={anyImgUrl({
                  src: sponsor.user.avatar,
                  size: 200,
                })}
                alt={sponsor.user.name}
                className="w-full h-full object-cover"
                width={64}
                height={64}
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <Icon className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {sponsor.user?.shopName || sponsor.user?.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Star filled={true} className="w-4 h-4" />
              <span className="text-sm text-gray-600">5.0</span>
              <span className="text-gray-300">•</span>
              <Tag className="w-4 h-4" />
              <span className="text-sm text-gray-600 capitalize">
                {sponsor.category}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {sponsor.user?.shopDescription ||
            `متخصصون في ${sponsor.category}. نوفر لك أفضل المنتجات والخدمات بجودة عالية وأسعار مناسبة.`}
        </p>

        {/* Stats */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <ProductsIcon className="w-5 h-5 text-gray-500" />
            <div className="text-sm">
              <span className="font-medium text-gray-900">{productsCount}</span>
              <span className="text-gray-500 ml-1">{t("products")}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ProductRequests className="w-5 h-5 text-gray-500" />
            <div className="text-sm">
              <span className="font-medium text-gray-900">{ordersCount}</span>
              <span className="text-gray-500 ml-1">{t("requests")}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link
            href={`/${langPrefix}profile/${sponsor.user?._id}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg text-center transition-colors duration-200"
          >
            {t("viewProfile")}
          </Link>

          <Link
            href={`/${langPrefix}products?userId=${sponsor.user?._id}`}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg text-center transition-colors duration-200"
          >
            {t("viewProducts")}
          </Link>
        </div>
      </div>

      {/* Sponsor badge */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2">
        <div className="flex items-center justify-center gap-2">
          <Star filled={true} className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-medium">
            {t("sponsoredShop")}
          </span>
        </div>
      </div>
    </div>
  );
}
