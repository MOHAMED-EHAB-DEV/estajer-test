"use client";
import { useUser } from "@/context/UserContext";
import { Love } from "../ui/svgs/icons/LoveSvg";

export default function ProductTitle({ product, requested, lang }) {
  const { favoriteProducts, toggleFavorite } = useUser();

  return (
    <header
      id="product-title"
      className="flex justify-between items-center mb-2 lg:mb-4"
    >
      <h1
        className="font-IBMPlex lg:text-[2rem] md:text-[1.8rem] text-[1.2rem] font-semibold"
        itemProp="name"
      >
        {lang === "ar" ? "تأجير " : "Rental "} {product.name}
      </h1>
      {!requested && (
        <button
          type="button"
          onClick={() => toggleFavorite(product._id)}
          className="shadow rounded-full p-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={
            favoriteProducts.includes(product._id)
              ? lang === "ar"
                ? "إزالة من المفضلة"
                : "Remove from favorites"
              : lang === "ar"
                ? "إضافة إلى المفضلة"
                : "Add to favorites"
          }
          title={
            favoriteProducts.includes(product._id)
              ? lang === "ar"
                ? "إزالة من المفضلة"
                : "Remove from favorites"
              : lang === "ar"
                ? "إضافة إلى المفضلة"
                : "Add to favorites"
          }
        >
          <Love
            filled={favoriteProducts.includes(product._id)}
            aria-hidden="true"
          />
        </button>
      )}
    </header>
  );
}
