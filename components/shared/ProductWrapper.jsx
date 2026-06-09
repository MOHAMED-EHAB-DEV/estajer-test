"use client";
import { useSearchParams } from "next/navigation";
import Product from "./Product";
import { useUser } from "@/context/UserContext";

export default function ProductWrapper({
  product,
  lang,
  translate,
  sm,
  admin,
  owner,
  priority,
}) {
  const searchParams = useSearchParams();
  const branch = searchParams.get("branch");
  const { user, favoriteProducts, toggleFavorite } = useUser();

  return (
    <Product
      product={product}
      lang={lang}
      translate={translate}
      branch={branch}
      sm={sm}
      admin={admin}
      owner={owner}
      priority={priority}
      user={user}
      favoriteProducts={favoriteProducts}
      toggleFavorite={toggleFavorite}
    />
  );
}
