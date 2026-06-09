"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { toast } from "@/utils/toast";
import { useRouter } from "next/navigation";
import { revalidateWithTag } from "@/actions/revalidateTag";
import { useDebounce } from "use-debounce";
import {
  IconBasicInfo,
  IconHeroBanners,
  IconSeo,
  IconSliders,
  IconOfferBannerItem,
  IconOfferBanners,
  IconHowItWorks,
  IconSectionOrder,
  IconCategories,
} from "@/components/ui/svgs/SidebarIcons";

// Tab Components
import BasicInfoTab from "../partners/modal/BasicInfoTab";
import SeoTab from "../partners/modal/SeoTab";
import HeroBannersTab from "../partners/modal/HeroBannersTab";
import ShopSlidersTab from "./modal/ShopSlidersTab";
import OfferBannersTab from "../partners/modal/OfferBannersTab";
import HowItWorksTab from "../partners/modal/HowItWorksTab";
import SectionOrderTab from "../partners/modal/SectionOrderTab";
import ShopCategoriesTab from "./modal/ShopCategoriesTab";
import { resizeImage } from "@/utils/ImageResizer";
import { FaStar as IconReviews } from "@/components/ui/svgs/AdminIcons";

// New Layout Components
import PreviewSidebarLayout from "../shared/PreviewSidebarLayout";
import ShopPreview from "./ShopPreview";

export default function ShopForm({
  shop,
  lang,
  translate,
  isEditing = false,
  categories,
  subCategories,
  isAdmin = false,
}) {
  const router = useRouter();
  const trans = useTranslations(translate);
  const t = (key) => trans(`admin.shops.${key}`);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [focusedSliderIdx, setFocusedSliderIdx] = useState(null);
  const [focusedOfferIdx, setFocusedOfferIdx] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    owner: "",
    nameAr: "",
    nameEn: "",
    slug: "",
    logo: "",
    descriptionAr: "",
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
    shopCategoriesOrder: 3,
    reviewsOrder: 5,
    showReviews: false,
    categories: [],
    howItWorks: {
      sectionTitleAr: "",
      sectionTitleEn: "",
      estajerSide: { titleAr: "", titleEn: "", itemsAr: [], itemsEn: [] },
      partnerSide: { titleAr: "", titleEn: "", itemsAr: [], itemsEn: [] },
      sharedBenefits: { titleAr: "", titleEn: "", itemsAr: [], itemsEn: [] },
    },
  });

  // User Autocomplete State
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [debouncedUserSearch] = useDebounce(userSearchTerm, 700);

  useEffect(() => {
    if (shop) {
      setFormData({
        ...shop,
        owner: shop.owner?._id || shop.owner || "",
        heroBanners: shop.heroBanners || [],
        aboutUsOrder: shop.aboutUsOrder || 1,
        howItWorksOrder: shop.howItWorksOrder || 4,
        shopCategoriesOrder: shop.shopCategoriesOrder || 3,
        reviewsOrder: shop.reviewsOrder || 5,
        showReviews: shop.showReviews || false,
        sliders:
          shop.sliders?.map((s) => ({ ...s, products: s.products || [] })) ||
          [],
        categories:
          shop.categories?.map((c) => ({
            ...c,
            allowedProducts: c.allowedProducts || [],
          })) || [],
        offerBanners: Array.isArray(shop.offerBanners) ? shop.offerBanners : [],
        ogImage: shop.ogImage || "",
        howItWorks: shop.howItWorks || {
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

      if (shop.owner) {
        setUsers([shop.owner]);
        setUserSearchTerm(shop.owner.fullName || "");
      }
    }
  }, [shop]);

  useEffect(() => {
    if (!isAdmin || !autocompleteOpen || isEditing) return;
    if (!debouncedUserSearch) return setUsers([]);

    const searchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await fetch(
          `/api/users?search=${encodeURIComponent(
            debouncedUserSearch,
          )}&limit=10&client=true`,
        );
        const data = await response.json();
        if (data.success) setUsers(data.data);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };
    searchUsers();
  }, [debouncedUserSearch, isAdmin, autocompleteOpen, isEditing]);

  const handleUserSelect = (userId) => {
    if (userId) {
      const selectedUserData = users.find((u) => u._id === userId);
      if (selectedUserData) {
        setFormData((prev) => ({ ...prev, owner: userId }));
        setUserSearchTerm(selectedUserData.fullName);
      }
    } else {
      setFormData((prev) => ({ ...prev, owner: "" }));
      setUserSearchTerm("");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "nameEn" && !isEditing && !formData.slug) {
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

      setFormData((prev) => {
        const newData = { ...prev };
        if (index !== null && subField !== null) {
          if (bannerIndex !== null) {
            const newOfferBanners = [...newData.offerBanners];
            const newBanners = [...newOfferBanners[index].banners];
            newBanners[bannerIndex] = {
              ...newBanners[bannerIndex],
              [subField]: base64,
            };
            newOfferBanners[index] = {
              ...newOfferBanners[index],
              banners: newBanners,
            };
            newData.offerBanners = newOfferBanners;
          } else {
            const newArray = [...newData[field]];
            newArray[index] = { ...newArray[index], [subField]: base64 };
            newData[field] = newArray;
          }
        } else {
          newData[field] = base64;
        }
        return newData;
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to process image");
    }
  };

  // Banner/Slider Handlers
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
      const newArray = [...prev[field]];
      newArray[index] = { ...newArray[index], [subField]: value };
      return { ...prev, [field]: newArray };
    });
  };

  const addSlider = () => {
    setFormData((prev) => {
      const newSliders = [
        ...prev.sliders,
        {
          titleAr: "",
          titleEn: "",
          products: [],
          type: "manual",
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
          element.scrollIntoView({ behavior: "smooth", block: "center" });
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
    setFormData((prev) => {
      const newSliders = [...prev.sliders];
      newSliders[index] = { ...newSliders[index], [field]: value };
      return { ...prev, sliders: newSliders };
    });
  };
  const addProductToSlider = (sliderIndex, product) => {
    setFormData((prev) => {
      const newSliders = [...prev.sliders];
      if (
        !newSliders[sliderIndex].products.some((p) => p._id === product._id)
      ) {
        if (newSliders[sliderIndex].products.length < 20) {
          newSliders[sliderIndex].products = [
            ...newSliders[sliderIndex].products,
            product,
          ];
        } else {
          toast.error(t("maxProductsReached"));
        }
      }
      return { ...prev, sliders: newSliders };
    });
  };
  const removeProductFromSlider = (sliderIndex, productId) => {
    setFormData((prev) => {
      const newSliders = [...prev.sliders];
      newSliders[sliderIndex].products = newSliders[
        sliderIndex
      ].products.filter((p) => p._id !== productId);
      return { ...prev, sliders: newSliders };
    });
  };
  const reorderProductsInSlider = (sliderIndex, fromIndex, toIndex) => {
    setFormData((prev) => {
      const newSliders = [...prev.sliders];
      const products = [...newSliders[sliderIndex].products];
      const [moved] = products.splice(fromIndex, 1);
      products.splice(toIndex, 0, moved);
      newSliders[sliderIndex].products = products;
      return { ...prev, sliders: newSliders };
    });
  };

  // Offer Banner Handlers
  const addOfferBannerSection = () => {
    setFormData((prev) => {
      const newOfferBanners = [
        ...prev.offerBanners,
        { titleAr: "", titleEn: "", banners: [], order: 2 },
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
          element.scrollIntoView({ behavior: "smooth", block: "center" });
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
    setFormData((prev) => {
      const newOffers = [...prev.offerBanners];
      newOffers[index] = { ...newOffers[index], [field]: value };
      return { ...prev, offerBanners: newOffers };
    });
  };
  const addBannerToSection = (sectionIndex) => {
    setFormData((prev) => {
      const newOffers = [...prev.offerBanners];
      newOffers[sectionIndex].banners = [
        ...newOffers[sectionIndex].banners,
        {
          imageAr: "",
          imageEn: "",
          link: "",
          altAr: "",
          altEn: "",
          ctaTextAr: "",
          ctaTextEn: "",
          order: newOffers[sectionIndex].banners.length,
        },
      ];
      return { ...prev, offerBanners: newOffers };
    });
  };
  const removeBannerFromSection = (sectionIndex, bannerIndex) => {
    setFormData((prev) => {
      const newOffers = [...prev.offerBanners];
      newOffers[sectionIndex].banners = newOffers[sectionIndex].banners.filter(
        (_, i) => i !== bannerIndex,
      );
      return { ...prev, offerBanners: newOffers };
    });
  };
  const handleBannerChangeInSection = (
    sectionIndex,
    bannerIndex,
    field,
    value,
  ) => {
    setFormData((prev) => {
      const newOffers = [...prev.offerBanners];
      const newBanners = [...newOffers[sectionIndex].banners];
      newBanners[bannerIndex] = { ...newBanners[bannerIndex], [field]: value };
      newOffers[sectionIndex].banners = newBanners;
      return { ...prev, offerBanners: newOffers };
    });
  };

  const handleSubmit = async () => {
    if (!formData.owner) return toast.error("Please select a shop owner");
    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/shops/${shop?._id || shop?.owner?._id}`
        : "/api/shops";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        ...formData,
        sliders: formData.sliders.map((s) => ({
          ...s,
          products: s.products.map((p) => p._id || p),
        })),
        categories: formData.categories.map((c) => ({
          ...c,
          allowedProducts: c.allowedProducts.map((p) => p._id || p),
        })),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        if (isEditing) await revalidateWithTag(`shop-${formData.slug}`);
        toast.success(isEditing ? "Shop updated" : "Shop created");
        if (isAdmin) {
          router.push(`/${lang}/admin/shops`);
        } else {
          router.push(`/${lang}/dashboard/my-shop`);
        }
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
      id: "sliders",
      label: t("productSliders"),
      icon: <IconSliders size={16} />,
    },
    {
      id: "categories",
      label: t("shopCategories"),
      icon: <IconCategories size={16} />,
    },
    {
      id: "reviews",
      label: t("showReviews"),
      icon: <IconReviews size={16} />,
    },
    {
      id: "offer-banners",
      label: t("offerBanners"),
      icon: <IconOfferBanners size={16} />,
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
            isAdmin={isAdmin}
            isEditing={isEditing}
            userSearchTerm={userSearchTerm}
            setUserSearchTerm={setUserSearchTerm}
            handleUserSelect={handleUserSelect}
            setAutocompleteOpen={setAutocompleteOpen}
            loadingUsers={loadingUsers}
            users={users}
            shop={true}
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
            t={(key) => trans(`admin.partners.${key}`)}
          />
        );
      case "sliders":
        return (
          <ShopSlidersTab
            formData={formData}
            addSlider={addSlider}
            removeSlider={removeSlider}
            handleSliderChange={handleSliderChange}
            addProductToSlider={addProductToSlider}
            removeProductFromSlider={removeProductFromSlider}
            reorderProductsInSlider={reorderProductsInSlider}
            lang={lang}
            translate={translate}
            categories={categories}
            subCategories={subCategories}
            ownerId={formData.owner}
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
      case "categories":
        return (
          <ShopCategoriesTab
            formData={formData}
            setFormData={setFormData}
            handleImageUpload={handleImageUpload}
            lang={lang}
            translate={translate}
            t={t}
            categories={categories}
            subCategories={subCategories}
          />
        );
      case "reviews":
        return (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col gap-4 bg-gradient-to-br from-[#fef7f2] to-white p-5 rounded-2xl border border-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-primary/5 shrink-0">
                    <IconReviews size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[14px] font-bold text-darkNavy truncate">
                      {t("showReviews")}
                    </h4>
                    <p className="text-[10px] text-neutral-500 mt-0.5 whitespace-normal">
                      {t("showReviewsDesc")}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ms-2">
                  <input
                    type="checkbox"
                    name="showReviews"
                    checked={formData.showReviews || false}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-sm"></div>
                </label>
              </div>
            </div>
          </div>
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
            lang={lang}
            t={t}
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
            shop={true}
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
        <ShopSlidersTab
          formData={formData}
          addSlider={addSlider}
          removeSlider={removeSlider}
          handleSliderChange={handleSliderChange}
          addProductToSlider={addProductToSlider}
          removeProductFromSlider={removeProductFromSlider}
          reorderProductsInSlider={reorderProductsInSlider}
          lang={lang}
          translate={translate}
          categories={categories}
          subCategories={subCategories}
          ownerId={formData.owner}
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
          lang={lang}
          t={t}
          mode="edit"
          sectionIndex={focusedOfferIdx}
        />
      );
    }
    return null;
  };

  return (
    <PreviewSidebarLayout
      title={isEditing ? t("editShop") : t("addShop")}
      subtitle={formData.nameAr || formData.nameEn || ""}
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
        <ShopPreview
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
