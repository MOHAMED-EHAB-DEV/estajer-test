"use client";
import { Love } from "../ui/svgs/icons/LoveSvg";

export default function ProductFavoriteButton({
  product,
  favoriteProducts = [],
  toggleFavorite,
}) {
  return (
    <div className="absolute top-0 end-0 z-10 p-4">
      <button
        type="button"
        onClick={() => toggleFavorite(product._id)}
        className="shadow rounded-full"
        aria-label="add to favorites"
      >
        <Love
          filled={favoriteProducts.includes(product._id)}
          className="md:w-10 w-7 h-auto"
        />
      </button>
    </div>
  );
}
