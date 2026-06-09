"use client";

import React, { useState, useEffect } from "react";
import {
  FaSave,
  FaPlus,
  FaImage as ImageIcon,
  FaArrowLeft,
  FaGripVertical,
} from "@/components/ui/svgs/AdminIcons";
import {
  IconBasicInfo,
  IconHeroBanners,
  IconSeo,
  IconSliders,
  IconSliderItem,
  IconOfferBannerItem,
  IconOfferBanners,
  IconHowItWorks,
  IconSectionOrder,
  IconSearchProducts,
} from "@/components/ui/svgs/SidebarIcons";
import { useTranslations } from "@/hooks/useTranslations";
import Button from "@/components/ui/Button";
import { toast } from "@/utils/toast";
import { useRouter } from "next/navigation";
import { revalidateWithTag } from "@/actions/revalidateTag";

// Tab Components
import BasicInfoTab from "./modal/BasicInfoTab";
import SeoTab from "./modal/SeoTab";
import HeroBannersTab from "./modal/HeroBannersTab";
import SlidersTab from "./modal/SlidersTab";
import OfferBannersTab from "./modal/OfferBannersTab";
import HowItWorksTab from "./modal/HowItWorksTab";
import SearchProductsTab from "./modal/SearchProductsTab";
import SectionOrderTab from "./modal/SectionOrderTab";
import { resizeImage } from "@/utils/ImageResizer";

// New Layout Components
import PreviewSidebarLayout from "../shared/PreviewSidebarLayout";
import PartnerPreview from "./PartnerPreview";

export default function PartnerForm({
  partner,
  lang,
  translate,
  isEditing = false,
  categories,
  subCategories,
}) {
  const router = useRouter();
  const trans = useTranslations(translate);
  const t = (key) => trans(`admin.partners.${key}`);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [focusedSliderIdx, setFocusedSliderIdx] = useState(null);
  const [focusedOfferIdx, setFocusedOfferIdx] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    slug: "",
    logo: "",
    descriptionEn: "",
    heroTitleAr: "",
    heroTitleEn: "",
    heroDescriptionAr: "",
    heroDescriptionEn: "",
    seoTitleAr: "",
    seoTitleEn: "",
    seoDescriptionAr: "",
    seoDescriptionEn: "",
    seoKeywordsAr: "",
    seoKeywordsEn: "",
    ogImage: "",
    isActive: true,
    heroBanners: [],
    sliders: [],
    offerBanners: [],
    aboutUsOrder: 1,
    howItWorksOrder: 4,
    offerBannersOrder: 2,
    howItWorks: {
      sectionTitleAr: "",
      sectionTitleEn: "",
      estajerSide: { titleAr: "", titleEn: "", itemsAr: [], itemsEn: [] },
      partnerSide: { titleAr: "", titleEn: "", itemsAr: [], itemsEn: [] },
      sharedBenefits: { titleAr: "", titleEn: "", itemsAr: [], itemsEn: [] },
    },
    allowedProducts: [],
  });

  useEffect(() => {
    if (partner) {
      setFormData({
        ...partner,
        heroBanners: partner.heroBanners || [],
        aboutUsOrder: partner.aboutUsOrder || 1,
        howItWorksOrder: partner.howItWorksOrder || 4,
        offerBannersOrder: partner.offerBannersOrder || 2,
        sliders:
          partner.sliders?.map((s) => ({ ...s, products: s.products || [] })) ||
          [],
        offerBanners: Array.isArray(partner.offerBanners)
          ? partner.offerBanners.length > 0 && !partner.offerBanners[0].banners
            ? [
                {
                  titleAr: "عروض حصرية",
                  titleEn: "Exclusive Offers",
                  banners: partner.offerBanners,
                  order: partner.offerBannersOrder || 2,
                },
              ]
            : partner.offerBanners
          : [],
        ogImage: partner.ogImage || "",
        heroTitleAr: partner.heroTitleAr || "",
        heroTitleEn: partner.heroTitleEn || "",
        heroDescriptionAr: partner.heroDescriptionAr || "",
        heroDescriptionEn: partner.heroDescriptionEn || "",
        allowedProducts: partner.allowedProducts || [],
        howItWorks: partner.howItWorks || {
          sectionTitleAr: "",
          sectionTitleEn: "",
          estajerSide: { titleAr: "", titleEn: "", itemsAr: [], itemsEn: [] },
          partnerSide: { titleAr: "", titleEn: "", itemsAr: [], itemsEn: [] },
          sharedBenefits: {
            titleAr: "",
            titleEn: "",
            itemsAr: [],
            itemsEn: [],
          },
        },
      });

      if (isEditing && partner._id) {
        const fetchAllowedProducts = async () => {
          try {
            const res = await fetch(
              `/api/products?providerId=${partner._id}&limit=2000&fetch=all&lang=${lang}&compressed=true&fields=images,owner,nameAr,nameEn,rental,rating,category`,
            );
            const data = await res.json();
            if (data.success) {
              setFormData((prev) => ({
                ...prev,
                allowedProducts: data.data,
              }));
            }
          } catch (error) {
            console.error("Failed to fetch allowed products:", error);
          }
        };
        fetchAllowedProducts();
      }
    }
  }, [partner, isEditing, lang]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "nameEn" && !partner && !formData.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^\w-]+/g, ""),
      }));
    }
  };

  const handleImageUpload = async (
    e,
    field,
    index = null,
    subField = null,
    bannerIndex = null,
  ) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const resized = await resizeImage(file);
      const base64 = resized.preview;

      if (index !== null && subField !== null) {
        if (bannerIndex !== null) {
          setFormData((prev) => {
            const newArray = [...prev[field]];
            const newBanners = [...newArray[index].banners];
            newBanners[bannerIndex] = {
              ...newBanners[bannerIndex],
              [subField]: base64,
            };
            newArray[index] = { ...newArray[index], banners: newBanners };
            return { ...prev, [field]: newArray };
          });
        } else {
          setFormData((prev) => {
            const newArray = [...prev[field]];
            newArray[index] = { ...newArray[index], [subField]: base64 };
            return { ...prev, [field]: newArray };
          });
        }
      } else {
        setFormData((prev) => ({ ...prev, [field]: base64 }));
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(error.message || "Failed to process image");
    }
  };

  // --- Hero Banner Handlers ---
  const addHeroBanner = () => {
    setFormData((prev) => ({
      ...prev,
      heroBanners: [
        ...prev.heroBanners,
        {
          imageAr: "",
          imageEn: "",
          link: "",
          altAr: "",
          altEn: "",
          order: prev.heroBanners.length,
        },
      ],
    }));
  };

  const removeHeroBanner = (index) => {
    setFormData((prev) => ({
      ...prev,
      heroBanners: prev.heroBanners.filter((_, i) => i !== index),
    }));
  };

  const handleBannerChange = (field, index, subField, value) => {
    setFormData((prev) => {
      const newArray = prev[field].map((item, i) =>
        i === index ? { ...item, [subField]: value } : item,
      );
      return { ...prev, [field]: newArray };
    });
  };

  // --- Slider Handlers ---
  const addSlider = () => {
    setFormData((prev) => {
      const newSliders = [
        ...prev.sliders,
        {
          titleAr: "",
          titleEn: "",
          products: [],
          displayMode: "slider",
          order: 3,
        },
      ];
      const newIdx = newSliders.length - 1;
      setFocusedSliderIdx(newIdx);
      setActiveSection("sliders");

      // Scroll to newly added slider in preview
      setTimeout(() => {
        const element = document.getElementById(
          `preview-section-slider-${newIdx}`,
        );
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);

      return { ...prev, sliders: newSliders };
    });
  };

  const removeSlider = (index) => {
    setFormData((prev) => ({
      ...prev,
      sliders: prev.sliders.filter((_, i) => i !== index),
    }));
    setFocusedSliderIdx(null);
  };

  const handleSliderChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      sliders: prev.sliders.map((slider, i) =>
        i === index ? { ...slider, [field]: value } : slider,
      ),
    }));
  };

  const addProductToSlider = (sliderIndex, product) => {
    setFormData((prev) => ({
      ...prev,
      sliders: prev.sliders.map((slider, i) =>
        i === sliderIndex && !slider.products.some((p) => p._id === product._id)
          ? slider.products.length < 20
            ? { ...slider, products: [...slider.products, product] }
            : (toast.error(t("maxProductsReached")), slider)
          : slider,
      ),
    }));
  };

  const removeProductFromSlider = (sliderIndex, productId) => {
    setFormData((prev) => ({
      ...prev,
      sliders: prev.sliders.map((slider, i) =>
        i === sliderIndex
          ? {
              ...slider,
              products: slider.products.filter((p) => p._id !== productId),
            }
          : slider,
      ),
    }));
  };

  const reorderProductsInSlider = (sliderIndex, fromIndex, toIndex) => {
    setFormData((prev) => {
      const newSliders = prev.sliders.map((slider, i) => {
        if (i !== sliderIndex) return slider;
        const products = [...slider.products];
        const [moved] = products.splice(fromIndex, 1);
        products.splice(toIndex, 0, moved);
        return { ...slider, products };
      });
      return { ...prev, sliders: newSliders };
    });
  };

  // --- Offer Banner Handlers ---
  const addOfferBannerSection = () => {
    setFormData((prev) => {
      const newOfferBanners = [
        ...prev.offerBanners,
        {
          titleAr: "",
          titleEn: "",
          banners: [],
          order: 2,
        },
      ];
      const newIdx = newOfferBanners.length - 1;
      setFocusedOfferIdx(newIdx);
      setActiveSection("offer-banners");

      // Scroll to newly added banner section in preview
      setTimeout(() => {
        const element = document.getElementById(
          `preview-section-banner-${newIdx}`,
        );
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);

      return { ...prev, offerBanners: newOfferBanners };
    });
  };

  const removeOfferBannerSection = (index) => {
    setFormData((prev) => ({
      ...prev,
      offerBanners: prev.offerBanners.filter((_, i) => i !== index),
    }));
    setFocusedOfferIdx(null);
  };

  const handleOfferBannerSectionChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      offerBanners: prev.offerBanners.map((section, i) =>
        i === index ? { ...section, [field]: value } : section,
      ),
    }));
  };

  const addBannerToSection = (sectionIndex) => {
    setFormData((prev) => ({
      ...prev,
      offerBanners: prev.offerBanners.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              banners: [
                ...section.banners,
                {
                  imageAr: "",
                  imageEn: "",
                  link: "",
                  altAr: "",
                  altEn: "",
                  ctaTextAr: "",
                  ctaTextEn: "",
                  order: section.banners.length,
                },
              ],
            }
          : section,
      ),
    }));
  };

  const removeBannerFromSection = (sectionIndex, bannerIndex) => {
    setFormData((prev) => ({
      ...prev,
      offerBanners: prev.offerBanners.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              banners: section.banners.filter((_, bi) => bi !== bannerIndex),
            }
          : section,
      ),
    }));
  };

  const handleBannerChangeInSection = (
    sectionIndex,
    bannerIndex,
    field,
    value,
  ) => {
    setFormData((prev) => ({
      ...prev,
      offerBanners: prev.offerBanners.map((section, si) =>
        si === sectionIndex
          ? {
              ...section,
              banners: section.banners.map((banner, bi) =>
                bi === bannerIndex ? { ...banner, [field]: value } : banner,
              ),
            }
          : section,
      ),
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const url = isEditing ? `/api/partners/${partner._id}` : "/api/partners";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        ...formData,
        heroBanners: formData.heroBanners.map((banner) => ({
          ...banner,
          link: banner.link
            ? banner.link
                .replace("https://estajer.com", "")
                .replace("/en/", "/")
            : "",
        })),
        offerBanners: formData.offerBanners.map((section) => ({
          ...section,
          banners: section.banners.map((banner) => ({
            ...banner,
            link: banner.link
              ? banner.link
                  .replace("https://estajer.com", "")
                  .replace("/en/", "/")
              : "",
          })),
        })),
        sliders: formData.sliders.map((s) => ({
          ...s,
          products: s.products.map((p) => (p._id ? p._id : p)),
        })),
        allowedProducts: formData.allowedProducts.map((p) =>
          p._id ? p._id : p,
        ),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        if (isEditing) await revalidateWithTag(`partner-${formData.slug}`);
        toast.success(isEditing ? t("updateSuccess") : t("createSuccess"));
        router.push(`/${lang}/admin/partners`);
        router.refresh();
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define sidebar sections
  const sidebarSections = [
    {
      id: "hero-banners",
      label: t("heroBanners"),
      icon: <IconHeroBanners size={16} />,
    },
    {
      id: "basic-info",
      label: t("basicInfo"),
      icon: <IconBasicInfo size={16} />,
    },
    {
      id: "offer-banners",
      label: t("offerBanners"),
      icon: <IconOfferBanners size={16} />,
    },
    {
      id: "sliders",
      label: t("productSliders"),
      icon: <IconSliders size={16} />,
    },
    {
      id: "search-products",
      label: t("assignedSearchProducts"),
      icon: <IconSearchProducts size={16} />,
    },
    {
      id: "how-it-works",
      label: t("howItWorks.title"),
      icon: <IconHowItWorks size={16} />,
    },
    {
      id: "seo",
      label: t("seoData"),
      icon: <IconSeo size={16} />,
    },
    {
      id: "section-order",
      label: t("sectionOrder"),
      icon: <IconSectionOrder size={16} />,
    },
  ];

  // Render active section content
  const renderSectionContent = () => {
    switch (activeSection) {
      case "basic-info":
        return (
          <BasicInfoTab
            formData={formData}
            handleInputChange={handleInputChange}
            handleImageUpload={handleImageUpload}
            t={t}
          />
        );
      case "hero-banners":
        return (
          <HeroBannersTab
            formData={formData}
            addHeroBanner={addHeroBanner}
            removeHeroBanner={removeHeroBanner}
            handleBannerChange={handleBannerChange}
            handleInputChange={handleInputChange}
            handleImageUpload={handleImageUpload}
            t={t}
          />
        );
      case "seo":
        return (
          <SeoTab
            formData={formData}
            handleInputChange={handleInputChange}
            handleImageUpload={handleImageUpload}
            t={t}
          />
        );
      case "sliders":
        return (
          <SlidersTab
            formData={formData}
            addSlider={addSlider}
            removeSlider={removeSlider}
            handleSliderChange={handleSliderChange}
            addProductToSlider={addProductToSlider}
            removeProductFromSlider={removeProductFromSlider}
            reorderProductsInSlider={reorderProductsInSlider}
            lang={lang}
            translate={translate}
            t={t}
            categories={categories}
            subCategories={subCategories}
            onEditSlider={(idx) => {
              setFocusedSliderIdx(idx);
              const element = document.getElementById(
                `preview-section-slider-${idx}`,
              );
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          />
        );
      case "search-products":
        return (
          <SearchProductsTab
            formData={formData}
            setFormData={setFormData}
            lang={lang}
            translate={translate}
            t={t}
            categories={categories}
            subCategories={subCategories}
          />
        );
      case "offer-banners":
        return (
          <OfferBannersTab
            formData={formData}
            addOfferBannerSection={addOfferBannerSection}
            removeOfferBannerSection={removeOfferBannerSection}
            handleOfferBannerSectionChange={handleOfferBannerSectionChange}
            addBannerToSection={addBannerToSection}
            removeBannerFromSection={removeBannerFromSection}
            handleBannerChangeInSection={handleBannerChangeInSection}
            handleImageUpload={handleImageUpload}
            t={t}
            lang={lang}
            onEditOffer={(idx) => {
              setFocusedOfferIdx(idx);
              const element = document.getElementById(
                `preview-section-banner-${idx}`,
              );
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          />
        );
      case "how-it-works":
        return (
          <HowItWorksTab formData={formData} setFormData={setFormData} t={t} />
        );
      case "section-order":
        return (
          <SectionOrderTab
            formData={formData}
            setFormData={setFormData}
            lang={lang}
            t={t}
          />
        );
      default:
        return null;
    }
  };

  const renderNestedContent = () => {
    if (activeSection === "sliders" && focusedSliderIdx !== null) {
      return (
        <SlidersTab
          formData={formData}
          addSlider={addSlider}
          removeSlider={removeSlider}
          handleSliderChange={handleSliderChange}
          addProductToSlider={addProductToSlider}
          removeProductFromSlider={removeProductFromSlider}
          reorderProductsInSlider={reorderProductsInSlider}
          lang={lang}
          translate={translate}
          t={t}
          categories={categories}
          subCategories={subCategories}
          mode="edit"
          sliderIndex={focusedSliderIdx}
        />
      );
    }
    if (activeSection === "offer-banners" && focusedOfferIdx !== null) {
      return (
        <OfferBannersTab
          formData={formData}
          addOfferBannerSection={addOfferBannerSection}
          removeOfferBannerSection={removeOfferBannerSection}
          handleOfferBannerSectionChange={handleOfferBannerSectionChange}
          addBannerToSection={addBannerToSection}
          removeBannerFromSection={removeBannerFromSection}
          handleBannerChangeInSection={handleBannerChangeInSection}
          handleImageUpload={handleImageUpload}
          t={t}
          lang={lang}
          mode="edit"
          sectionIndex={focusedOfferIdx}
        />
      );
    }
    return null;
  };

  return (
    <PreviewSidebarLayout
      title={isEditing ? t("editPartner") : t("addPartner")}
      subtitle={formData.nameAr || formData.nameEn || t("partnerConfiguration")}
      sections={sidebarSections}
      activeSection={activeSection}
      setActiveSection={(id) => {
        setActiveSection(id);
        setFocusedSliderIdx(null);
        setFocusedOfferIdx(null);
      }}
      activeSectionContent={renderSectionContent()}
      nestedPanelContent={renderNestedContent()}
      nestedTitle={
        focusedSliderIdx !== null
          ? `${t("productSliders")} - ${
              lang === "ar"
                ? formData.sliders[focusedSliderIdx]?.titleAr ||
                  `#${focusedSliderIdx + 1}`
                : formData.sliders[focusedSliderIdx]?.titleEn ||
                  `#${focusedSliderIdx + 1}`
            }`
          : focusedOfferIdx !== null
            ? `${t("offerBanners")} - ${
                lang === "ar"
                  ? formData.offerBanners[focusedOfferIdx]?.titleAr ||
                    `#${focusedOfferIdx + 1}`
                  : formData.offerBanners[focusedOfferIdx]?.titleEn ||
                    `#${focusedOfferIdx + 1}`
              }`
            : null
      }
      onNestedBack={() => {
        setFocusedSliderIdx(null);
        setFocusedOfferIdx(null);
      }}
      onSave={handleSubmit}
      isSubmitting={isSubmitting}
      onBack={() => router.back()}
      previewContent={
        <PartnerPreview
          formData={formData}
          lang={lang}
          translate={translate}
          categoriesData={categories}
          subCategoriesData={subCategories}
        />
      }
      t={t}
      lang={lang}
    />
  );
}
