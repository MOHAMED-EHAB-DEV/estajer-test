"use client";

import React from "react";
import OfferBannersTab from "@/components/admin/partners/modal/OfferBannersTab";

export default function OfferBannersEditor({
  data,
  onDataChange,
  formData,
  onDeleteSection,
  lang,
  t,
  translate,
}) {
  return (
    <OfferBannersTab
      formData={{ ...formData, offerBanners: [data] }}
      addOfferBannerSection={() => {}}
      removeOfferBannerSection={onDeleteSection}
      handleOfferBannerSectionChange={(_, field, value) =>
        onDataChange((prev) => ({ ...prev, [field]: value }))
      }
      addBannerToSection={() =>
        onDataChange((prev) => ({
          ...prev,
          banners: [
            ...(prev.banners || []),
            {
              imageAr: "",
              imageEn: "",
              link: "",
              altAr: "",
              altEn: "",
              ctaTextAr: "",
              ctaTextEn: "",
              order: (prev.banners || []).length,
            },
          ],
        }))
      }
      removeBannerFromSection={(_, bi) =>
        onDataChange((prev) => ({
          ...prev,
          banners: (prev.banners || []).filter((_, i) => i !== bi),
        }))
      }
      handleBannerChangeInSection={(_, bi, field, value) => {
        onDataChange((prev) => {
          const arr = [...(prev.banners || [])];
          arr[bi] = { ...arr[bi], [field]: value };
          return { ...prev, banners: arr };
        });
      }}
      handleImageUpload={(
        e,
        field,
        sectionIndex,
        subField,
        bannerIndex,
      ) => {
        const file = e.target.files[0];
        if (!file) return;
        import("@/utils/ImageResizer").then(({ resizeImage }) =>
          resizeImage(file).then((resized) => {
            onDataChange((prev) => {
              const arr = [...(prev.banners || [])];
              arr[bannerIndex] = {
                ...arr[bannerIndex],
                [subField]: resized.preview,
              };
              return { ...prev, banners: arr };
            });
          }),
        );
      }}
      lang={lang}
      t={t}
      translate={translate}
      mode="edit"
      sectionIndex={0}
    />
  );
}
