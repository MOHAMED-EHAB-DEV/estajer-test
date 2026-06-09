"use client";

import React from "react";
import Product from "../shared/Product";

export const ProductItem = ({
  product,
  lang,
  translate,
  index,
  sm,
  user,
  favoriteProducts,
  toggleFavorite,
}) => {
  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`${sm ? "min-w-0 px-2 md:px-w" : ""} h-full transition-[opacity,transform] duration-500 ease-out transform md:w-[19rem] opacity-100 translate-y-0 `}
    >
      <Product
        sm={true}
        product={product}
        lang={lang}
        translate={translate}
        priority={index < 4}
        user={user}
        favoriteProducts={favoriteProducts}
        toggleFavorite={toggleFavorite}
      />
    </div>
  );
};
