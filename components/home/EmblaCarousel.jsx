"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import MobileProductCarousel from "./MobileProductCarousel";
import { useUser } from "@/context/UserContext";

const ProductFilters = dynamic(() => import("./ProductFilters"));

export default function EmblaCarousel({
  lang,
  initialProducts,
  translate,
  shops,
}) {
  const { user, favoriteProducts, toggleFavorite } = useUser();
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (filter) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        lang,
        limit: 16,
        compressed: true,
        fields: `images,owner,${
          lang === "ar" ? "nameAr" : "nameEn"
        },rental,rating,pricingModel,location,${
          lang === "ar" ? "addressAr" : "addressEn"
        },lovedCount`,
        ...filter,
      });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/products?${params}`,
        { next: { revalidate: 60 * 60 * 24 * 2 } },
      );
      const data = await res.json();
      return data.success ? setProducts(data.data) : [];
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!shops && (
        <ProductFilters translate={translate} fetchProducts={fetchProducts} />
      )}
      {/* Mobile and Tablet: Carousel */}
      <div>
        <MobileProductCarousel
          loading={loading}
          lang={lang}
          products={products}
          translate={translate}
          user={user}
          favoriteProducts={favoriteProducts}
          toggleFavorite={toggleFavorite}
        />
      </div>
    </>
  );
}
