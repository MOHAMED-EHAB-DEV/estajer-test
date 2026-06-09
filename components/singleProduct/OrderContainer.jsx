import { Suspense } from "react";
import { getTranslations } from "@/hooks/getTranslations";
import OrderForm from "./OrderForm";

export default async function OrderContainer({ product, lang }) {
  const translate = await getTranslations(lang);

  return (
    <div className="md:border-[#9393A1] md:border md:rounded-2xl md:overflow-hidden">
      <Suspense fallback={null}>
        <OrderForm product={product} lang={lang} translate={translate()} />
      </Suspense>
    </div>
  );
}
