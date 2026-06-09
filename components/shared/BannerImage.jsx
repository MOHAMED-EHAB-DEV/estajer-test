"use client";

import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";

export default function BannerImage({ banner, lang, isMultiple }) {
  const imageSrc =
    lang === "en" && banner.imageEn ? banner.imageEn : banner.image;
  const altText = lang === "ar" ? banner.altAr : banner.altEn;

  const getImageUrl = (size) =>
    anyImgUrl({
      src: imageSrc,
      size: size,
      quality: 90,
    });

  return (
    <Image
      src={getImageUrl(isMultiple ? 800 : 1500)}
      loader={({ width }) =>
        getImageUrl(width > 800 ? (isMultiple ? 800 : 1500) : 800)
      }
      alt={altText}
      fill
      priority
      className="object-cover w-full h-full"
    />
  );
}
