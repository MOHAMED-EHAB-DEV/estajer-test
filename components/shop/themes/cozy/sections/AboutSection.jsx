"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { anyImgUrl } from "@/utils/ImageUrl";
import { useTranslations } from "@/hooks/useTranslations";
import { IconArrow } from "../Icons";

export default function AboutSection({ data, lang, shop, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`sections.about.${key}`);
  const isAr = lang === "ar";

  const name = isAr ? data?.shopNameAr : data?.shopNameEn;
  const description = isAr
    ? data?.aboutDescriptionAr
    : data?.aboutDescriptionEn;
  const logo = data?.aboutImage || shop?.logo;
  const buttonText = isAr
    ? data?.aboutUsButtonTextAr
    : data?.aboutUsButtonTextEn;
  const buttonLink = data?.aboutUsLink || "#products";
  const brandColor = shop?.brandColor || "#F48A42";

  if (!description && !name) return null;

  return (
    <section
      className="bg-[#FCFAF6] py-16 md:py-24 my-6 md:my-12 relative overflow-hidden"
      id="about"
    >
      {/* Organic blob background element */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -start-20 w-80 h-80 rounded-full blur-[80px] opacity-[0.06] pointer-events-none"
        style={{ backgroundColor: brandColor }}
      />

      <div className="max-w-screen-2xl w-full mx-auto px-6 md:px-10 lg:px-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-center">
          {/* Leaf-shaped image block */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm aspect-square">
              {/* Asymmetrical leaf frame background */}
              <div
                className="absolute inset-0 rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-[1rem] rounded-bl-[1rem] opacity-10 transform scale-105"
                style={{ backgroundColor: brandColor }}
              />

              {/* Main leaf-shaped image container */}
              <div className="absolute inset-0 bg-white rounded-tl-[2.8rem] rounded-br-[2.8rem] rounded-tr-[0.8rem] rounded-bl-[0.8rem] border border-neutral-200/50 shadow-md p-6 flex items-center justify-center overflow-hidden">
                {logo ? (
                  <div className="relative w-full h-full">
                    <Image
                      unoptimized
                      src={
                        logo.startsWith("data:")
                          ? logo
                          : anyImgUrl({ src: logo, size: 400 })
                      }
                      alt={name || ""}
                      fill
                      className="object-contain p-4 hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-neutral-300">
                    <span className="text-4xl">🌿</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      Cozy Partner
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Narrative Text block */}
          <div className="lg:col-span-7 flex flex-col gap-5 text-start">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🌱</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                {t("about") || "Boutique Story"}
              </span>
            </div>

            <h2 className="text-2xl md:text-4xl font-extrabold text-neutral-800 leading-snug">
              {name}
            </h2>

            {description && (
              <p className="text-neutral-500 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
                {description}
              </p>
            )}

            <div className="pt-2">
              <Link
                href={buttonLink}
                className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: brandColor }}
              >
                <span>{buttonText || t("browseProducts")}</span>
                <IconArrow
                  size={14}
                  rtl={isAr}
                  className="transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
