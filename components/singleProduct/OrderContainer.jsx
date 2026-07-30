import { Suspense } from "react";
import { getTranslations } from "@/hooks/getTranslations";
import OrderForm from "./OrderForm";

export default async function OrderContainer({ product, lang, shopSlug }) {
  const translate = await getTranslations(lang);

  return (
    <div className="md:border-[#9393A1] md:border md:rounded-2xl md:overflow-hidden">
      <Suspense fallback={<div className="h-64 flex items-center justify-center animate-pulse bg-gray-50 rounded-2xl" />}>
        <OrderForm
          product={product}
          lang={lang}
          translate={{
            singleProduct: { order: translate("singleProduct.order") },
            productComponent: translate("productComponent"),
            unit: translate("unit"),
            saleUnit: translate("saleUnit"),
            addProductPage: { common: translate("addProductPage.common") },
          }}
          shopSlug={shopSlug}
        />
      </Suspense>
    </div>
  );
}
