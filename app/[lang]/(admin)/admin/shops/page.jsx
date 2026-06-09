import ShopContainer from "@/components/admin/shops/ShopContainer";
import { getTranslations } from "@/hooks/getTranslations";
import React from "react";
import { ShoppingBag } from "@/components/ui/svgs/AdminIcons";

export default async function ShopsPage({ params }) {
  const { lang } = await params;
  const t = await getTranslations(lang);

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-darkNavy">
          <ShoppingBag className="text-primary w-8 h-8" />
          {t("admin.shops.title")}
        </h1>
        <p className="text-neutral-500 max-w-2xl">
          {t("admin.shops.description")}
        </p>
      </div>

      <ShopContainer lang={lang} translate={t()} />
    </div>
  );
}
