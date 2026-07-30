"use client";
import { anyImgUrl } from "@/utils/ImageUrl";
import Image, { getImageProps } from "next/image";
import { useState, memo } from "react";
import dynamic from "next/dynamic";
import { Eye } from "../ui/svgs/icons/EyeSvg";

// Dynamic import for ImageModal to improve performance
const ImageModal = dynamic(() => import("./ImageModal"), {
  loading: () => null,
  ssr: false,
});

function ImagesContainer({ product, requested, isModel, lang }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product?.images?.length) return null;

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const hasMoreThan5Images = product.images.length > 5;
  const displayedImages = product.images.slice(1, 5);

  // Generate SEO-optimized alt text for images
  const generateAltText = (imageIndex = 0) => {
    const productName = product.name;
    if (imageIndex === 0) {
      return lang === "ar"
        ? `${productName} - الصورة الرئيسية للإيجار | استأجر`
        : `${productName} - Main image for rent | Estajer`;
    }
    return lang === "ar"
      ? `${productName} - صورة ${imageIndex + 1} للإيجار | استأجر`
      : `${productName} - Image ${imageIndex + 1} for rent | Estajer`;
  };

  const mainImgSrc = requested ? product.images[0] : product.images[0]?.preview;
  const imgSmallMobile = anyImgUrl({ src: mainImgSrc, size: 400, quality: 60 });
  const imgMobile = anyImgUrl({ src: mainImgSrc, size: 500, quality: 60 });
  const imgLargeMobile = anyImgUrl({ src: mainImgSrc, size: 768, quality: 60 });
  const imgDesktop = anyImgUrl({ src: mainImgSrc, size: 900, quality: 60 });

  return (
    <figure
      id="product-images"
      className={`grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-4 md:mt-8 ${
        isModel ? "" : "lg:gap-8"
      }`}
      itemScope
      itemType="https://schema.org/ImageGallery"
      role="img"
      aria-label={
        lang === "ar" ? `صور ${product.name}` : `Images of ${product.name}`
      }
    >
      {product.images?.map((img, idx) => (
        <link key={idx} itemProp="image" href={img.preview} />
      ))}
      <div
        className="lg:rounded-3xl rounded-xl overflow-hidden aspect-[1/.65] relative cursor-pointer group"
        onClick={() => handleImageClick(0)}
        role="button"
        tabIndex={0}
        aria-label={lang === "ar" ? "عرض الصورة الرئيسية" : "View main image"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleImageClick(0);
          }
        }}
      >
        <div
          className="absolute inset-0 opacity-95 group-hover:opacity-90 transition-opacity duration-300"
          style={{
            background:
              product.images[0]?.gradientStyle ||
              "linear-gradient(135deg, rgb(255 255 255), rgb(255 255 255))",
          }}
        />

        {/* Preload the main LCP image for better discovery */}
        <link
          rel="preload"
          as="image"
          href={imgSmallMobile}
          media="(max-width: 400px)"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href={imgMobile}
          media="(min-width: 401px) and (max-width: 500px)"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href={imgLargeMobile}
          media="(min-width: 501px) and (max-width: 768px)"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href={imgDesktop}
          media="(min-width: 769px)"
          fetchPriority="high"
        />
        <picture className="absolute inset-0 w-full h-full">
          <source media="(max-width: 400px)" srcSet={imgSmallMobile} />
          <source
            media="(min-width: 401px) and (max-width: 500px)"
            srcSet={imgMobile}
          />
          <source
            media="(min-width: 501px) and (max-width: 768px)"
            srcSet={imgLargeMobile}
          />
          <source media="(min-width: 769px)" srcSet={imgDesktop} />
          <img
            src={imgDesktop}
            alt={generateAltText(0)}
            title={generateAltText(0)}
            fetchPriority="high"
            loading="eager"
            className={`h-full w-full ${
              requested ? "object-cover" : "object-contain"
            }`}
            itemProp="image"
          />
        </picture>

        {/* Hover overlay for main image */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-full md:px-2 md:py-[13px] py-2 px-2">
            <Eye className="md:w-7 w-5 md:h-7 h-5" />
          </div>
        </div>
      </div>
      <div
        className={`grid grid-cols-2 gap-4 ${isModel ? "" : "lg:gap-8"}`}
        role="group"
        aria-label={lang === "ar" ? "صور إضافية" : "Additional images"}
      >
        {displayedImages.map((image, idx) => {
          const imageIndex = idx + 1;
          const isLastImage =
            idx === displayedImages.length - 1 && hasMoreThan5Images;

          const thumbImgSrc = requested ? image : image.preview;
          const thumbMobileUrl = anyImgUrl({
            src: thumbImgSrc,
            size: 250,
            quality: 60,
          });
          const thumbDesktopUrl = anyImgUrl({
            src: thumbImgSrc,
            size: 500,
            quality: 60,
          });

          return (
            <div
              className={`lg:rounded-3xl rounded-xl overflow-hidden relative lg:aspect-[1/.9] aspect-[1/.75] cursor-pointer group ${
                idx >= 2 ? "hidden lg:block" : ""
              }`}
              key={idx}
              onClick={() => handleImageClick(imageIndex)}
              role="button"
              tabIndex={0}
              aria-label={
                lang === "ar"
                  ? `عرض الصورة ${imageIndex + 1}`
                  : `View image ${imageIndex + 1}`
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleImageClick(imageIndex);
                }
              }}
            >
              <div
                className="absolute inset-0 opacity-100 group-hover:opacity-80 transition-opacity duration-300"
                style={{
                  background:
                    image.gradientStyle ||
                    "linear-gradient(135deg, rgb(255 255 255), rgb(255 255 255))",
                }}
              />
              <picture className="absolute inset-0 w-full h-full">
                <source media="(max-width: 500px)" srcSet={thumbMobileUrl} />
                <source media="(min-width: 501px)" srcSet={thumbDesktopUrl} />
                <img
                  src={thumbDesktopUrl}
                  alt={generateAltText(imageIndex)}
                  title={generateAltText(imageIndex)}
                  loading="lazy"
                  fetchPriority="low"
                  className={`h-full w-full ${
                    requested ? "object-cover" : "object-contain"
                  }`}
                />
              </picture>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-[13px]">
                  <Eye />
                </div>
              </div>

              {/* "See All" overlay for last image when there are more than 5 images (Desktop) */}
              {isLastImage && (
                <div className="absolute inset-0 bg-black/60 flex-col items-center justify-center text-white hidden lg:flex">
                  <span className="font-semibold text-lg">
                    {lang === "ar" ? "عرض الكل" : "See All"}
                  </span>
                  <span className="text-sm opacity-90">
                    +{product.images.length - 5}{" "}
                    {lang === "ar" ? "اخرين" : "more"}
                  </span>
                </div>
              )}

              {/* "See All" overlay for mobile (3rd image total / 2nd image in grid) */}
              {idx === 1 && product.images.length > 3 && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white lg:hidden">
                  <span className="font-semibold text-lg">
                    {lang === "ar" ? "عرض الكل" : "See All"}
                  </span>
                  <span className="text-sm opacity-90">
                    +{product.images.length - 3}{" "}
                    {lang === "ar" ? "اخرين" : "more"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Image Modal */}
      {isModalOpen && (
        <ImageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          images={product.images}
          initialIndex={selectedImageIndex}
          productName={product.name}
          requested={requested}
          lang={lang}
        />
      )}
    </figure>
  );
}

export default memo(ImagesContainer);
