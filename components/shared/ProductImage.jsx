import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";
import Link from "next/link";

export default function ProductImage({
  product,
  lang,
  owner,
  sm,
  priority = false,
  getUrlName,
  branch,
  providerId,
  currentStatus = {},
}) {
  const langPrefix = lang === "ar" ? "" : "en/";

  // Generate SEO-optimized alt text
  const generateAltText = () => {
    const productName = product.name;
    if (lang === "ar") return `${productName} للإيجار | استأجر`;
    else return `${productName} for rent | Estajer`;
  };
  return (
    <Link
      href={`/${langPrefix}${
        owner
          ? currentStatus?.type === "approved"
            ? `products/${getUrlName(product.name)}_ref_`
            : "my-products/preview/"
          : `products/${getUrlName(product.name)}_ref_`
      }${product._id}${
        branch || providerId
          ? `?${new URLSearchParams({
              ...(branch && { branch }),
              ...(providerId && { providerId }),
            }).toString()}`
          : ""
      }`}
      className={`w-full aspect-[1/.9] relative group overflow-hidden rounded-lg select-none`}
      aria-label={
        lang === "ar"
          ? `عرض تفاصيل ${product.name}`
          : `View details of ${product.name}`
      }
      title={
        lang === "ar"
          ? `عرض تفاصيل ${product.name}`
          : `View details of ${product.name}`
      }
    >
      {/* Dynamic gradient background */}
      <div
        className="absolute inset-0 opacity-95 group-hover:opacity-90 transition-opacity duration-300"
        style={{
          background:
            product?.images?.[0]?.gradientStyle ||
            "linear-gradient(135deg, rgb(255 255 255), rgb(255 255 255))",
        }}
        aria-hidden="true"
      />

      {/* Product image */}
      <Image
        unoptimized
        fill
        src={anyImgUrl({
          src: product.images[0].preview,
          size: 358,
          quality: 90,
          aspectRatio: "1:.9",
        })}
        alt={generateAltText()}
        title={product.name}
        className="h-full w-full object-contain relative z-10 group-hover:scale-105 transition-transform duration-300"
        loading={priority ? "eager" : "lazy"}
        priority={priority}
      />

      {/* Rating section */}
      {product.rating?.average > 0 && (
        <>
          {/* Original gradient overlay */}
          <div className="absolute bottom-0 start-0 w-full h-24 bg-gradient-to-t from-[#06002CCC] to-[rgba(6, 0, 44, 0)] mix-blend-multiply z-20"></div>
          <div
            className={`${
              sm ? "md:start-2 start-0 text-sm md:text-base" : "start-2"
            } absolute bottom-2 w-full z-30 md:p-4 p-2`}
          >
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, idx) => (
                <svg
                  key={idx}
                  className={sm ? "w-4 h-4 md:w-5 md:h-5" : "w-5 h-5"}
                  viewBox="0 0 22 22"
                  fill={idx < product.rating?.average ? "#F48A42" : "#E5E5E5"}
                >
                  <path d="M9.45776 2.07373C10.016 0.355663 12.4466 0.355665 13.0048 2.07373L14.2667 5.95732C14.5163 6.72566 15.2323 7.24586 16.0402 7.24586H20.1237C21.9301 7.24586 22.6812 9.5575 21.2198 10.6193L17.9162 13.0195C17.2626 13.4944 16.9891 14.3361 17.2388 15.1044L18.5006 18.988C19.0588 20.7061 17.0925 22.1348 15.631 21.0729L12.3274 18.6727C11.6738 18.1979 10.7888 18.1979 10.1352 18.6727L6.83161 21.0729C5.37014 22.1348 3.40374 20.7061 3.96198 18.988L5.22383 15.1044C5.47348 14.3361 5.19999 13.4944 4.5464 13.0195L1.24282 10.6193C-0.218649 9.5575 0.532448 7.24586 2.33892 7.24586H6.42238C7.23026 7.24586 7.94626 6.72566 8.19591 5.95732L9.45776 2.07373Z" />
                </svg>
              ))}
              <span className="text-white leading-3 mt-1">
                {product.rating?.average.toFixed(1)}
              </span>
            </div>
          </div>
        </>
      )}
    </Link>
  );
}
