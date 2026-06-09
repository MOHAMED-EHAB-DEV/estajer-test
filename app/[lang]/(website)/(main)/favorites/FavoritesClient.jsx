"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { useUser } from "@/context/UserContext";
import Product from "@/components/shared/Product";
import { useEffect, useState } from "react";

export default function FavoritesClient({ lang, translate }) {
  const { favoriteProducts, user, toggleFavorite } = useUser();
  const trans = useTranslations(translate);
  const t = (value) => trans(`favorites.${value}`);

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`/api/favorites?lang=${lang}`);
        const data = await response.json();
        if (data.success) setFavorites(data.favorites);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {favoriteProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 mb-6 md:text-3xl text-xl">
            {t("noFavorites")}
          </p>
          <p className="text-gray-500 md:text-xl text-lg mb-8">
            {t("addFavoritesHint")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map(
            (product) =>
              favoriteProducts.includes(product._id) && (
                <Product
                  key={product._id}
                  product={product}
                  translate={translate}
                  lang={lang}
                  toggleFavorite={toggleFavorite}
                  user={user}
                  favoriteProducts={favoriteProducts}
                />
              ),
          )}
        </div>
      )}
    </div>
  );
}
