"use client";
import Image from "next/image";
import { X } from "../ui/svgs/icons/XSvg";
import { ProductsIcon } from "../ui/svgs/icons/ProductsIconSvg";
import { Search } from "../ui/svgs/icons/SearchSvg";
import { Currency } from "../ui/svgs/icons/CurrencySvg";
import { anyImgUrl } from "@/utils/ImageUrl";

export default function ProductSearch({
  showProductSearch,
  setShowProductSearch,
  productSearchQuery,
  setProductSearchQuery,
  currentPathProductId,
  sendCurrentProduct,
  pathname,
  loadingProducts,
  availableProducts,
  sendProduct,
  t,
}) {
  if (!showProductSearch) return null;

  return (
    <div className="absolute bottom-[80px] start-3 end-3 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-gray-100 z-[100] flex flex-col max-h-[70%] overflow-hidden animate-in slide-in-from-bottom-3 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <ProductsIcon width={16} height={10} color="#f48a42" />
          </div>
          <span className="text-sm font-bold text-darkNavy">
            {t("chat.selectProduct")}
          </span>
        </div>
        <button
          onClick={() => setShowProductSearch(false)}
          className="text-gray-400 hover:text-gray-600 transition-opacity hover:opacity-60"
        >
          <X size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-50">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 peer-focus:text-primary transition-colors" />
          <input
            type="text"
            placeholder={t("chat.searchProducts")}
            value={productSearchQuery}
            onChange={(e) => setProductSearchQuery(e.target.value)}
            className="peer w-full ps-9 pe-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2">
        {currentPathProductId && !productSearchQuery && (
          <div className="px-3 pb-2 mb-1 border-b border-gray-50">
            <div className="text-[10px] uppercase font-bold text-gray-300 mb-2 tracking-widest px-1">
              {t("chat.currentPageProduct")}
            </div>
            <button
              onClick={sendCurrentProduct}
              className="w-full text-start px-3 py-2.5 rounded-xl border border-primary/15 bg-primary/5 hover:bg-primary/10 transition-all flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                <ProductsIcon width={20} height={12} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-darkNavy group-hover:text-primary transition-colors truncate">
                  {t("chat.sendCurrentProduct")}
                </div>
                <div className="text-[10px] text-gray-400 truncate mt-0.5">
                  {pathname}
                </div>
              </div>
            </button>
          </div>
        )}

        <div className="px-3">
          <div className="text-[10px] uppercase font-bold text-gray-300 mb-2 tracking-widest px-1">
            {t("chat.availableProducts")}
          </div>
          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-400 animate-pulse">
                {t("chat.searching")}
              </span>
            </div>
          ) : availableProducts.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {availableProducts.map((p) => (
                <button
                  key={p._id}
                  onClick={() => sendProduct(p)}
                  className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-start group"
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                    <Image
                      fill
                      unoptimized
                      src={anyImgUrl({
                        src: p.images?.[0]?.preview || p.images?.[0],
                        size: 150,
                      })}
                      alt={p.name}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-darkNavy truncate group-hover:text-primary transition-colors">
                      {p.name}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-extrabold text-primary">
                        {p.rental?.value}
                      </span>
                      <Currency className="w-3.5 h-3.5" color="#f48a42" />
                      {p.address?.city && (
                        <span className="text-[10px] text-gray-300 font-medium">
                          {p.address.city}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <Search className="w-7 h-7 text-gray-200 mx-auto mb-3" />
              <p className="text-xs text-gray-400">
                {t("chat.noProductsFound")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
