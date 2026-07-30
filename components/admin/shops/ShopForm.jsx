"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { toast } from "@/utils/toast";
import { useRouter } from "next/navigation";
import { revalidateWithTag } from "@/actions/revalidateTag";
import { useDebounce } from "use-debounce";
import { resizeImage } from "@/utils/ImageResizer";
import { nanoid } from "nanoid";
import {
  getSectionMeta,
  CLASSIC_SECTIONS,
  THEMES,
} from "@/components/shop/themes/registry";
import PlanGate, {
  PlanUpgradeBanner,
  PlanActiveGrowthBanner,
} from "@/components/premium/PlanGate";
import CustomModal from "@/components/ui/CustomModal";
import PremiumCheckoutContainer from "@/components/premium/PremiumCheckoutContainer";

// Shared tab components
import BasicInfoTab from "../partners/modal/BasicInfoTab";
import SeoTab from "../partners/modal/SeoTab";

// New editor components
import PreviewSidebarLayout from "../shared/PreviewSidebarLayout";
import SectionPickerModal from "@/components/shop/editor/SectionPickerModal";
import SectionEditorPanel from "@/components/shop/editor/SectionEditorPanel";
import ActiveSectionsList from "@/components/shop/editor/ActiveSectionsList";

import { IconBasicInfo, IconSeo } from "@/components/ui/svgs/SidebarIcons";

export default function ShopForm({
  shop,
  lang,
  translate,
  isEditing = false,
  categories,
  subCategories,
  isAdmin = false,
  userPlan = null, // "starter" | "growth" | null (null = admin, no restriction)
}) {
  const router = useRouter();
  const trans = useTranslations(translate);
  const t = (key) => trans(`admin.shops.${key}`);

  const iframeRef = useRef(null);
  const iframeReady = useRef(false);
  // Uses the (preview) route group — no admin layout, clean viewport
  const previewUrl = `/${lang}/shop-preview`;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState(null); // "seo" | section instanceId
  const [activeSectionInstance, setActiveSectionInstance] = useState(null); // the actual section object
  const [showPicker, setShowPicker] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  // Form State
  const [formData, setFormData] = useState(() => {
    const defaultSections = CLASSIC_SECTIONS.map((s, i) => ({
      instanceId: s.id,
      themeId: "classic",
      sectionType: s.id,
      order: s.id === "header" ? -100 : s.id === "footer" ? 1000 : i,
      data: { ...s.defaults },
    }));

    const defaultValues = {
      owner: "",
      nameAr: "",
      nameEn: "",
      slug: "",
      logo: "",
      descriptionAr: "",
      descriptionEn: "",
      brandColor: "#f48a42",
      seoTitleAr: "",
      seoTitleEn: "",
      seoDescriptionAr: "",
      seoDescriptionEn: "",
      seoKeywordsAr: "",
      seoKeywordsEn: "",
      ogImage: "",
      isActive: true,
    };

    if (!shop) return { ...defaultValues, sections: defaultSections };

    return {
      ...defaultValues,
      ...shop,
      owner: shop.owner?._id || shop.owner || "",
      sections: shop.sections?.length > 0 ? shop.sections : defaultSections,
      brandColor: shop.brandColor || "#f48a42",
    };
  });
  // User Autocomplete State
  const [userSearchTerm, setUserSearchTerm] = useState(
    shop?.owner?.fullName || "",
  );
  const [users, setUsers] = useState(shop?.owner ? [shop.owner] : []);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [debouncedUserSearch] = useDebounce(userSearchTerm, 700);

  // ── postMessage bridge: keep iframe in sync with formData ──────────────
  const sendToIframe = useCallback(
    (data) => {
      if (!iframeRef.current?.contentWindow) return;

      iframeRef.current.contentWindow.postMessage(
        {
          type: "SHOP_PREVIEW_UPDATE",
          payload: {
            formData: data,
            lang,
            translate,
            categoriesData: categories,
            subCategoriesData: subCategories,
          },
        },
        "*",
      );
    },
    [lang, translate, categories, subCategories],
  );

  useEffect(() => {
    if (iframeReady.current && formData) {
      sendToIframe(formData);
    }
  }, [formData, sendToIframe]);

  // Auto-pick first product for productHighlight sections if empty
  useEffect(() => {
    if (!formData.owner) return;

    const emptyHighlightSections = formData.sections.filter(
      (s) =>
        s.sectionType === "productHighlight" &&
        !s.data?.product &&
        !s.data?.isManuallyCleared,
    );

    if (emptyHighlightSections.length === 0) return;

    let isMounted = true;

    const fetchFirstProduct = async () => {
      try {
        const res = await fetch(
          `/api/products?userId=${formData.owner}&limit=1`,
        );
        const result = await res.json();
        if (isMounted && result.success && result.data?.length > 0) {
          const firstProduct = result.data[0];

          // Formulate default product highlight properties
          const hasTaxCode = !!firstProduct.owner?.companyDetails?.taxCode;
          const basePrice =
            firstProduct.pricingModel === "packages"
              ? firstProduct.rental?.packages?.[0]?.price
              : firstProduct.rental?.value;
          const priceWithTax = hasTaxCode
            ? Math.round(basePrice * 1.15)
            : basePrice;

          const hasDiscount =
            firstProduct.rental?.discountTiers &&
            firstProduct.pricingModel !== "packages" &&
            firstProduct.rental.discountTiers.length > 0;
          const discountPrice = hasDiscount
            ? firstProduct.rental.discountTiers[0].discountPrice
            : null;
          const discountPriceWithTax = hasDiscount
            ? hasTaxCode
              ? Math.round(discountPrice * 1.15)
              : discountPrice
            : null;

          const formattedProduct = {
            ...firstProduct,
            name:
              firstProduct.name ||
              (lang === "ar" ? firstProduct.nameAr : firstProduct.nameEn),
            description:
              firstProduct.description ||
              (lang === "ar"
                ? firstProduct.descriptionAr
                : firstProduct.descriptionEn),
          };

          setFormData((prev) => ({
            ...prev,
            sections: prev.sections.map((s) => {
              if (
                s.sectionType === "productHighlight" &&
                !s.data?.product &&
                !s.data?.isManuallyCleared
              ) {
                return {
                  ...s,
                  data: {
                    ...s.data,
                    product: formattedProduct,
                    manualNameAr:
                      s.data.manualNameAr ||
                      firstProduct.nameAr ||
                      firstProduct.name ||
                      "",
                    manualNameEn:
                      s.data.manualNameEn ||
                      firstProduct.nameEn ||
                      firstProduct.name ||
                      "",
                    manualDescriptionAr:
                      s.data.manualDescriptionAr ||
                      firstProduct.descriptionAr ||
                      firstProduct.description ||
                      "",
                    manualDescriptionEn:
                      s.data.manualDescriptionEn ||
                      firstProduct.descriptionEn ||
                      firstProduct.description ||
                      "",
                    manualPrice:
                      s.data.manualPrice || String(priceWithTax || 0),
                    manualDiscountPrice:
                      s.data.manualDiscountPrice ||
                      (discountPriceWithTax
                        ? String(discountPriceWithTax)
                        : ""),
                    manualImage:
                      s.data.manualImage ||
                      firstProduct.images?.[0]?.preview ||
                      firstProduct.images?.[0] ||
                      "",
                    manualImageGradientStyle:
                      s.data.manualImageGradientStyle ||
                      firstProduct.images?.[0]?.gradientStyle ||
                      "",
                  },
                };
              }
              return s;
            }),
          }));

          // Keep activeSectionInstance in sync if it is a productHighlight
          setActiveSectionInstance((prev) => {
            if (
              prev?.sectionType === "productHighlight" &&
              !prev.data?.product &&
              !prev.data?.isManuallyCleared
            ) {
              return {
                ...prev,
                data: {
                  ...prev.data,
                  product: formattedProduct,
                  manualNameAr:
                    prev.data.manualNameAr ||
                    firstProduct.nameAr ||
                    firstProduct.name ||
                    "",
                  manualNameEn:
                    prev.data.manualNameEn ||
                    firstProduct.nameEn ||
                    firstProduct.name ||
                    "",
                  manualDescriptionAr:
                    prev.data.manualDescriptionAr ||
                    firstProduct.descriptionAr ||
                    firstProduct.description ||
                    "",
                  manualDescriptionEn:
                    prev.data.manualDescriptionEn ||
                    firstProduct.descriptionEn ||
                    firstProduct.description ||
                    "",
                  manualPrice:
                    prev.data.manualPrice || String(priceWithTax || 0),
                  manualDiscountPrice:
                    prev.data.manualDiscountPrice ||
                    (discountPriceWithTax ? String(discountPriceWithTax) : ""),
                  manualImage:
                    prev.data.manualImage ||
                    firstProduct.images?.[0]?.preview ||
                    firstProduct.images?.[0] ||
                    "",
                  manualImageGradientStyle:
                    prev.data.manualImageGradientStyle ||
                    firstProduct.images?.[0]?.gradientStyle ||
                    "",
                },
              };
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("Error fetching default product highlight:", err);
      }
    };

    fetchFirstProduct();

    return () => {
      isMounted = false;
    };
  }, [formData.owner, formData.sections.length, lang]);

  // Listen for iframe READY signal, then send current data
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "SHOP_PREVIEW_READY") {
        iframeReady.current = true;
        sendToIframe(formData);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendToIframe]);

  useEffect(() => {
    if (!isAdmin || !autocompleteOpen || isEditing) return;
    if (!debouncedUserSearch) return setUsers([]);
    const searchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetch(
          `/api/users?search=${encodeURIComponent(debouncedUserSearch)}&limit=10&client=true`,
        );
        const data = await res.json();
        if (data.success) setUsers(data.data);
      } catch {
      } finally {
        setLoadingUsers(false);
      }
    };
    searchUsers();
  }, [debouncedUserSearch, isAdmin, autocompleteOpen, isEditing]);

  const handleUserSelect = (userId) => {
    if (userId) {
      const u = users.find((u) => u._id === userId);
      if (u) {
        setFormData((p) => ({ ...p, owner: userId }));
        setUserSearchTerm(u.fullName);
      }
    } else {
      setFormData((p) => ({ ...p, owner: "" }));
      setUserSearchTerm("");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "nameEn" && !isEditing && !formData.slug) {
      setFormData((p) => ({
        ...p,
        slug: value
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^\w-]+/g, ""),
      }));
    }
  };

  const handleImageUpload = async (e, field, isSection = false) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const resized = await resizeImage(file);
      if (isSection && activeSectionInstance) {
        updateSectionData(activeSectionInstance.instanceId, {
          ...activeSectionInstance.data,
          [field]: resized.preview,
          ...(resized.gradientStyle
            ? { [`${field}GradientStyle`]: resized.gradientStyle }
            : {}),
        });
      } else {
        setFormData((p) => ({
          ...p,
          [field]: resized.preview,
          ...(resized.gradientStyle
            ? { [`${field}GradientStyle`]: resized.gradientStyle }
            : {}),
        }));
      }
    } catch {
      toast.error(t("failedToProcessImage"));
    }
  };

  // ── Section Management ──────────────────────────────────────────────────
  const addSection = ({ themeId, section: sectionMeta }) => {
    const effectivePlan = isAdmin ? "growth" : userPlan;
    if (effectivePlan === "starter" && themeId !== "classic") {
      toast.error(
        lang === "ar"
          ? "ترقية الباقة مطلوبة لتفعيل هذا الثيم"
          : "Upgrade required to activate this theme",
      );
      return;
    }
    const existingIdx = formData.sections.findIndex(
      (s) => s.sectionType === sectionMeta.id && !sectionMeta.allowMultiple,
    );

    if (existingIdx > -1) {
      const existingSection = formData.sections[existingIdx];
      const updatedSection = {
        ...existingSection,
        themeId,
        data: { ...sectionMeta.defaults },
      };
      setFormData((p) => {
        const updated = [...p.sections];
        updated[existingIdx] = updatedSection;
        return { ...p, sections: updated };
      });
      setActiveSectionInstance(updatedSection);
      setActiveSection(updatedSection.instanceId);
    } else {
      const newSection = {
        instanceId: nanoid(),
        themeId,
        sectionType: sectionMeta.id,
        order: formData.sections.length,
        data: { ...sectionMeta.defaults },
      };
      setFormData((p) => ({ ...p, sections: [...p.sections, newSection] }));
      setActiveSectionInstance(newSection);
      setActiveSection(newSection.instanceId);
    }
  };

  const deleteSection = (instanceId) => {
    setFormData((p) => ({
      ...p,
      sections: p.sections
        .filter((s) => s.instanceId !== instanceId)
        .map((s, i) => ({ ...s, order: i })),
    }));
    if (activeSectionInstance?.instanceId === instanceId) {
      setActiveSectionInstance(null);
      setActiveSection(null);
    }
  };

  const moveSection = (idx, direction) => {
    setFormData((p) => {
      const arr = [...p.sections];
      const swapIdx = idx + direction;
      if (swapIdx < 0 || swapIdx >= arr.length) return p;
      [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
      return { ...p, sections: arr.map((s, i) => ({ ...s, order: i })) };
    });
  };

  const reorderSections = (sourceIdx, destIdx) => {
    setFormData((p) => {
      const arr = [...p.sections];
      const [removed] = arr.splice(sourceIdx, 1);
      arr.splice(destIdx, 0, removed);
      return { ...p, sections: arr.map((s, i) => ({ ...s, order: i })) };
    });
  };

  const updateSectionData = (instanceId, newData) => {
    setFormData((p) => ({
      ...p,
      sections: p.sections.map((s) => {
        if (s.instanceId === instanceId) {
          const updatedData =
            typeof newData === "function" ? newData(s.data || {}) : newData;
          return { ...s, data: updatedData };
        }
        return s;
      }),
    }));
    // Keep activeSectionInstance in sync
    setActiveSectionInstance((prev) => {
      if (prev?.instanceId === instanceId) {
        const updatedData =
          typeof newData === "function" ? newData(prev.data || {}) : newData;
        return { ...prev, data: updatedData };
      }
      return prev;
    });
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.owner) return toast.error(t("selectOwnerError"));
    setIsSubmitting(true);
    try {
      const url = isEditing
        ? `/api/shops/${shop?._id || shop?.owner?._id}`
        : "/api/shops";
      const method = isEditing ? "PUT" : "POST";

      // Serialize product refs inside sections
      const payload = {
        ...formData,
        sections: formData.sections.map((s) => ({
          ...s,
          data: serializeSectionData(s),
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
        toast.success(isEditing ? t("shopUpdated") : t("shopCreated"));
        router.refresh();
      } else {
        toast.error(data.error || t("somethingWentWrong"));
      }
    } catch {
      toast.error(t("errorOccurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert product objects to IDs for submission
  const serializeSectionData = (section) => {
    const d = { ...section.data };
    if (d.products) d.products = d.products.map((p) => p._id || p);
    if (d.product) d.product = d.product._id || d.product;
    if (d.categories) {
      d.categories = d.categories.map((cat) => ({
        ...cat,
        allowedProducts: (cat.allowedProducts || []).map((p) => p._id || p),
      }));
    }
    return d;
  };

  // ── Sidebar static sections ─────────────────────────────────────────────
  const staticSections = [
    {
      id: "basicInfo",
      label: t("basicInfo"),
      icon: <IconBasicInfo size={16} />,
    },
    { id: "seo", label: t("seoData"), icon: <IconSeo size={16} /> },
  ];

  const renderStaticContent = () => {
    switch (activeSection) {
      case "basicInfo":
        return (
          <BasicInfoTab
            formData={formData}
            handleInputChange={handleInputChange}
            handleImageUpload={handleImageUpload}
            t={(key) => trans(`admin.shops.${key}`)}
            isAdmin={isAdmin}
            isEditing={isEditing}
            userSearchTerm={userSearchTerm}
            setUserSearchTerm={setUserSearchTerm}
            handleUserSelect={handleUserSelect}
            setAutocompleteOpen={setAutocompleteOpen}
            loadingUsers={loadingUsers}
            users={users}
            userPlan={isAdmin ? "growth" : userPlan}
            lang={lang}
            onUpgrade={() => setShowUpgradeModal(true)}
          />
        );
      case "seo":
        return (
          <SeoTab
            formData={formData}
            handleInputChange={handleInputChange}
            handleImageUpload={handleImageUpload}
            t={(key) => trans(`admin.shops.${key}`)}
            userPlan={isAdmin ? "growth" : userPlan}
            lang={lang}
            onUpgrade={() => setShowUpgradeModal(true)}
          />
        );
      default:
        return null;
    }
  };

  const isStaticSection =
    activeSection === "seo" || activeSection === "basicInfo";

  const sidebarFooterContent = (
    <div className="flex flex-col gap-2">
      {/* Brand Color Picker */}
      <PlanGate
        userPlan={isAdmin ? "growth" : userPlan}
        lang={lang}
        label="تغيير لون العلامة التجارية"
        onUpgrade={() => setShowUpgradeModal(true)}
      >
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl shadow-sm bg-white"
          style={{
            border: "1px solid hsl(220 15% 88%)",
          }}
        >
          <input
            type="color"
            value={formData.brandColor || "#f48a42"}
            onChange={(e) =>
              setFormData((p) => ({ ...p, brandColor: e.target.value }))
            }
            className="w-8 h-8 rounded-lg cursor-pointer p-0.5"
            style={{
              border: "1px solid hsl(220 15% 82%)",
              background: "transparent",
            }}
            title="Brand Color"
          />
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-bold"
              style={{ color: "hsl(225 35% 18%)" }}
            >
              {t("brandColor")}
            </p>
            <p
              className="text-[10px] font-mono"
              style={{ color: "hsl(220 10% 55%)" }}
            >
              {formData.brandColor}
            </p>
          </div>
        </div>
      </PlanGate>

      {/* Add Section Button */}
      <button
        type="button"
        onClick={() => setShowPicker(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-bold"
        style={{
          background: "hsl(var(--primary-hsl, 24 89% 61%) / 0.05)",
          border: "1.5px dashed hsl(var(--primary-hsl, 24 89% 61%) / 0.3)",
          color: "var(--color-primary, #f48a42)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background =
            "hsl(var(--primary-hsl, 24 89% 61%) / 0.1)";
          e.currentTarget.style.borderColor =
            "hsl(var(--primary-hsl, 24 89% 61%) / 0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            "hsl(var(--primary-hsl, 24 89% 61%) / 0.05)";
          e.currentTarget.style.borderColor =
            "hsl(var(--primary-hsl, 24 89% 61%) / 0.3)";
        }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path
            fillRule="evenodd"
            d="M10 3a.75.75 0 01.75.75V9h5.25a.75.75 0 010 1.5H10.75v5.25a.75.75 0 01-1.5 0V10.5H4a.75.75 0 010-1.5h5.25V3.75A.75.75 0 0110 3z"
            clipRule="evenodd"
          />
        </svg>
        {t("addSection")}
      </button>
    </div>
  );

  const shopUrl = formData.slug
    ? formData.domain
      ? `https://${formData.domain}`
      : `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "")}/${lang === "ar" ? "" : "en/"}shops/${formData.slug}`
    : "";

  const headerRightExtra =
    isEditing && shopUrl ? (
      <div className="flex items-center gap-1">
        {/* Copy link button */}
        <button
          type="button"
          title={lang === "ar" ? "نسخ رابط المتجر" : "Copy shop link"}
          onClick={() => {
            navigator.clipboard.writeText(shopUrl);
            toast.success(lang === "ar" ? "تم نسخ الرابط" : "Link copied");
          }}
          className="h-9 px-3 hidden md:flex rounded-lg items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-800 transition-colors border border-neutral-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>

        {/* Visit live shop button */}
        <a
          href={shopUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 px-3.5 rounded-lg flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs border border-neutral-200 transition-colors"
        >
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            className="w-3.5 h-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          <span className="hidden lg:inline">
            {lang === "ar" ? "زيارة المتجر" : "Visit Shop"}
          </span>
        </a>
      </div>
    ) : null;

  return (
    <>
      <PreviewSidebarLayout
        title={isEditing ? t("editShop") : t("addShop")}
        subtitle={formData.nameAr || formData.nameEn || ""}
        sections={staticSections}
        activeSection={activeSection}
        headerRightExtra={headerRightExtra}
        nestedTitle={
          activeSectionInstance
            ? lang === "ar"
              ? getSectionMeta(
                  activeSectionInstance.themeId,
                  activeSectionInstance.sectionType,
                )?.label.ar
              : getSectionMeta(
                  activeSectionInstance.themeId,
                  activeSectionInstance.sectionType,
                )?.label.en
            : null
        }
        setActiveSection={(id) => {
          setActiveSection(id);
          if (id === null || id === "seo") {
            setActiveSectionInstance(null);
          }
        }}
        activeSectionContent={
          isStaticSection ? (
            renderStaticContent()
          ) : activeSectionInstance ? (
            <SectionEditorPanel
              section={activeSectionInstance}
              formData={formData}
              setFormData={setFormData}
              setActiveSectionInstance={setActiveSectionInstance}
              onDataChange={(newData) =>
                updateSectionData(activeSectionInstance.instanceId, newData)
              }
              onDeleteSection={() =>
                deleteSection(activeSectionInstance.instanceId)
              }
              handleImageUpload={handleImageUpload}
              lang={lang}
              translate={translate}
              t={t}
              categories={categories}
              subCategories={subCategories}
              userPlan={isAdmin ? "growth" : userPlan}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          ) : null
        }
        nestedPanelContent={null}
        onSave={handleSubmit}
        isSubmitting={isSubmitting}
        onBack={() => router.back()}
        previewUrl={previewUrl}
        iframeRef={iframeRef}
        t={t}
        lang={lang}
        sidebarFooter={
          <div className="flex flex-col gap-3">
            {!isAdmin && userPlan === "starter" && (
              <PlanUpgradeBanner
                lang={lang}
                onUpgrade={() => setShowUpgradeModal(true)}
              />
            )}
            {!isAdmin && userPlan === "growth" && (
              <PlanActiveGrowthBanner lang={lang} />
            )}
            {sidebarFooterContent}
            {/* Upgrade banner for Starter plan users */}

            {/* Sections label */}
            <p
              className="text-[9px] font-bold uppercase tracking-widest px-0.5 mt-1"
              style={{ color: "hsl(220 10% 45%)" }}
            >
              {t("pageSections")}
            </p>
            <ActiveSectionsList
              sections={formData.sections}
              lang={lang}
              activeSectionInstanceId={activeSectionInstance?.instanceId}
              onEdit={(section) => {
                setActiveSectionInstance(section);
                setActiveSection(section.instanceId);
              }}
              onDelete={deleteSection}
              onMoveUp={(idx) => moveSection(idx, -1)}
              onMoveDown={(idx) => moveSection(idx, 1)}
              onReorder={reorderSections}
              translate={translate}
            />
          </div>
        }
      />

      {/* Section Picker Modal (Option B — Full Screen) */}
      {showPicker && (
        <SectionPickerModal
          lang={lang}
          translate={translate}
          existingSections={formData.sections}
          onSelect={addSection}
          onAddAll={(themeId) => {
            const effectivePlan = isAdmin ? "growth" : userPlan;
            if (effectivePlan === "starter" && themeId !== "classic") {
              toast.error(
                lang === "ar"
                  ? "ترقية الباقة مطلوبة لتفعيل هذا الثيم"
                  : "Upgrade required to activate this theme",
              );
              return;
            }
            const theme = THEMES.find((t) => t.id === themeId);
            if (!theme) return;
            const newSections = theme.sections.map((s, i) => ({
              instanceId: s.id,
              themeId,
              sectionType: s.id,
              order: s.id === "header" ? -100 : s.id === "footer" ? 1000 : i,
              data: { ...s.defaults },
            }));
            setFormData((p) => ({ ...p, sections: newSections }));
          }}
          onClose={() => setShowPicker(false)}
          userPlan={isAdmin ? "growth" : userPlan}
          onUpgrade={() => {
            setShowPicker(false);
            setShowUpgradeModal(true);
          }}
        />
      )}

      {/* Upgrade CustomModal */}
      <CustomModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        size="4xl"
      >
        <PremiumCheckoutContainer
          lang={lang}
          translate={translate}
          isModal={true}
          onClose={() => setShowUpgradeModal(false)}
        />
      </CustomModal>
    </>
  );
}
