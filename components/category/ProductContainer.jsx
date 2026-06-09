"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Product from "@/components/shared/Product";
import { useTranslations } from "@/hooks/useTranslations";
import { NoItems } from "@/components/ui/svgs/icons/NoItemsSvg";
import { Edit } from "@/components/ui/svgs/icons/EditSvg";
import { Send } from "@/components/ui/svgs/icons/SendSvg";
import EmptyPlaceholder from "@/components/shared/EmptyPlaceholder";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { revalidateWithTag } from "@/actions/revalidateTag";
import { useUser } from "@/context/UserContext";

// Dynamic import for the bulk edit modal
const BulkEditDeliveryModal = dynamic(
  () => import("@/components/dashboard/BulkEditDeliveryModal"),
  { ssr: false },
);

export default function ProductContainer({
  sm,
  lang,
  category,
  translate,
  initialProducts,
  subCategory,
  addedValue,
  search,
  name,
  lat,
  lng,
  userId,
  shopCategory,
  showAll,
  owner,
  isProfile = false,
  status,
  sortBy,
  limit = 40,
  branch,
  providerId,
}) {
  const { user, favoriteProducts, toggleFavorite } = useUser();
  const trans = useTranslations(translate);
  const t = (text) => trans(`productComponent.${text}`);
  const tBulk = (text) => trans(`bulkEditDelivery.${text}`);
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts || []);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const observer = useRef();
  const lastProductRef = useRef();
  const currentPageRef = useRef(limit / 20);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts || []);
      setHasMore(initialProducts.length >= limit);
      setSelectedProducts([]);
      currentPageRef.current = limit / 20;
    }
  }, [initialProducts, limit]);

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p._id));
    }
  };

  const handleClearSelection = () => {
    setSelectedProducts([]);
  };

  const handleBulkEditSuccess = () => {
    selectedProducts.forEach(async (id) => {
      await revalidateWithTag(`product-${id}`);
    });
    setSelectedProducts([]);
    router.refresh();
  };

  const loadProducts = async () => {
    // Prevent concurrent requests
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    const pageNum = currentPageRef.current + 1;
    currentPageRef.current = pageNum;

    const seenProductIds = products.map((p) => p._id);
    const boundsParam = lat &&
      lng && {
        north: +lat + addedValue,
        south: +lat - addedValue,
        east: +lng + addedValue,
        west: +lng - addedValue,
      };

    const params = new URLSearchParams({
      ...(boundsParam && { bounds: JSON.stringify(boundsParam) }),
      ...(category && {
        category: search
          ? category
          : category
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(""),
      }),
      limit: 20,
      page: pageNum,
      lang,
      ...(showAll && { showAll }),
      ...(userId && { userId }),
      ...(shopCategory && { shopCategory }),
      ...(providerId && { providerId }),
      ...(name && { name }),
      ...(subCategory && { subCategory }),
      ...(status && { status }),
      ...(sortBy && { sortBy }),

      fields: `images,owner,owner,${
        lang === "ar" ? "nameAr" : "nameEn"
      },rental,rating,pricingModel,location,${
        lang === "ar" ? "addressAr" : "addressEn"
      }${owner ? ",lovedCount,rejected,approved,rejectMessage" : ""}`,
      ...(name &&
        seenProductIds.length > 0 && {
          excludeProducts: seenProductIds.join(","),
        }),
      compressed: true,
    });

    try {
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `HTTP error! status: ${res.status}`);
      }
      setProducts((prev) => [...prev, ...data.data]);
      // Use backend pagination info for accurate hasMore calculation
      const { pagination } = data;
      setHasMore(pagination?.hasMore ?? data.data.length === 20);
    } catch (err) {
      setHasMore(false);
      currentPageRef.current = pageNum - 1; // Revert page on error
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      // Don't load more if initial products are less than limit or still loading
      if (initialProducts.length < limit) return;
      if (isLoadingRef.current) return;
      if (entries[0].isIntersecting && hasMore) {
        loadProducts();
      }
    });

    if (lastProductRef.current) {
      observer.current.observe(lastProductRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [hasMore, initialProducts.length, limit, products.length]);

  return (
    <div
      className={`max-w-screen-2xl w-full mx-auto flex flex-col gap-4 ${!owner ? "px-4" : ""} text-white lg:mb-32 mb-24`}
    >
      {/* Bulk Action Bar for Owners */}
      {owner && selectedProducts.length > 0 && (
        <div className="fixed md:bottom-8 bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-200 md:px-6 px-3 md:py-4 py-2.5 flex items-center md:gap-4 gap-2 z-50 animate-slide-up w-[90%] md:w-auto justify-between md:justify-start">
          <div className="flex items-center md:gap-2 gap-1.5 shrink-0">
            <div className="md:w-8 md:h-8 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="md:text-sm text-[11px] font-bold text-[#f48a42]">
                {selectedProducts.length}
              </span>
            </div>
            <span className="md:text-sm text-[11px] font-medium text-gray-700 whitespace-nowrap">
              {tBulk("selectedCount").replace(
                "{count}",
                selectedProducts.length,
              )}
            </span>
          </div>

          <div className="md:h-6 h-4 w-px bg-gray-200 md:block hidden"></div>

          <div className="flex items-center md:gap-3 gap-1.5">
            <Button
              className="md:px-4 px-2.5 md:py-2 py-2 h-auto bg-[#f48a42] text-white md:text-sm text-[11px] font-medium rounded-lg hover:bg-[#e07a32] transition-colors flex items-center md:gap-2 gap-1"
              onPress={() => setShowBulkEditModal(true)}
            >
              <Edit className="md:w-4 md:h-4 w-3.5 h-3.5" color="white" />
              <span className="md:inline hidden">{tBulk("editDelivery")}</span>
              <span className="md:hidden inline">
                {tBulk("editDelivery").split(" ")[0]}
              </span>
            </Button>

            <Button
              className="md:px-4 px-2.5 md:py-2 py-2 h-auto bg-gray-100 text-gray-700 md:text-sm text-[11px] font-medium rounded-lg hover:bg-gray-200 transition-colors"
              onPress={handleClearSelection}
            >
              <span className="md:inline hidden">
                {tBulk("clearSelection")}
              </span>
              <span className="md:hidden inline">
                {tBulk("clearSelection").split(" ")[0]}
              </span>
            </Button>
          </div>
        </div>
      )}

      {/* Select All Button for Owners */}
      {owner && products.length > 0 && (
        <div className="flex justify-end mb-2">
          <Button
            color="transparent"
            className="text-sm text-gray-600 hover:text-[#f48a42] bg-white shadow-sm border border-gray-200 px-4 py-2 rounded-lg"
            onPress={handleSelectAll}
          >
            {selectedProducts.length === products.length
              ? tBulk("deselectAll")
              : tBulk("selectAll")}
          </Button>
        </div>
      )}

      <div
        className={`grid ${
          sm ? "md:gap-x-6 gap-3 md:gap-y-8" : "gap-x-6 gap-y-8"
        } w-full ${
          products.length === 0 && !loading
            ? "items-center"
            : sm
              ? "xl:grid-cols-4 lg:grid-cols-3 grid-cols-2"
              : owner
                ? "2xl:grid-cols-4 xl:grid-cols-3 md:grid-cols-2"
                : "xl:grid-cols-4 lg:grid-cols-3 grid-cols-2"
        }`}
      >
        {products.length === 0 && !loading ? (
          <EmptyPlaceholder
            title={t("noProducts")}
            Icon={NoItems}
            titleClassName="text-[#5B5656]"
            detailsContainerClassName="w-full"
            {...(owner
              ? {
                  actionText: t("addProduct"),
                  url: `/${lang === "ar" ? "" : "en/"}add-product`,
                  ActionIcon: Send,
                }
              : {})}
          />
        ) : (
          products.map((product, idx) => (
            <div
              key={product._id + idx}
              ref={idx === products.length - 1 ? lastProductRef : null}
            >
              <Product
                sm={sm}
                product={product}
                lang={lang}
                translate={translate}
                owner={owner}
                priority={idx < 4}
                branch={branch}
                isSelected={selectedProducts.includes(product._id)}
                onSelect={owner ? handleSelectProduct : undefined}
                user={user}
                favoriteProducts={favoriteProducts}
                toggleFavorite={toggleFavorite}
                providerId={providerId}
              />
            </div>
          ))
        )}
      </div>
      {error && (
        <div className="text-red-500 text-center p-4 bg-red-100 rounded-lg mb-4">
          {error}
        </div>
      )}
      {loading && (
        <div className="text-center py-4 space-y-2">
          <div
            className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-primary rounded-full"
            role="status"
          >
            <span className="sr-only">{t("loading")}</span>
          </div>
          <div className="text-primary">{t("loading")}</div>
        </div>
      )}

      {/* Bulk Edit Delivery Modal */}
      {showBulkEditModal && (
        <BulkEditDeliveryModal
          isOpen={showBulkEditModal}
          onClose={() => setShowBulkEditModal(false)}
          selectedProducts={selectedProducts}
          onSuccess={handleBulkEditSuccess}
          translate={translate}
          lang={lang}
        />
      )}
    </div>
  );
}
