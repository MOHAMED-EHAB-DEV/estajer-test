"use client";
import GeneralInformation from "./GeneralInformation";
import ImageUploader from "./ImageUploader";
import ProductLocation from "./ProductLocation";
import RentDetails from "./RentDetails";
import Button from "@/components/ui/Button";
import { useUser } from "@/context/UserContext";
import { useEffect, useState, useRef } from "react";
import SupplierModal from "./SupplierModal";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "next/navigation";
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";
import DeliveryCoastModal from "./DeliveryCoastModal";
import NafathAuthModal from "../checkout/NafathAuthModal";
import { useDisclosure } from "@/components/ui/CustomModal";
import AdditionalDetails from "./AdditionalDetails";
import LeaveConfirmationModal from "./LeaveConfirmationModal";
import McpBanner from "./McpBanner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDrawerWithHistory } from "@/hooks/useDrawerWithHistory";
import dynamic from "next/dynamic";
import { Home } from "@/components/ui/svgs/icons/HomeSvg";
import { Search } from "@/components/ui/svgs/icons/SearchSvg";
import { Plus } from "@/components/ui/svgs/icons/PlusSvg";
import { Edit } from "@/components/ui/svgs/icons/EditSvg";
import { Cart } from "@/components/ui/svgs/icons/CartSvg";
import { Menu } from "@/components/ui/svgs/icons/MenuSvg";

const NavbarDrawer = dynamic(() => import("@/components/ui/NavbarDrawer"), {
  ssr: false,
});

const FormContent = ({ children, num, title, description }) => (
  <div
    className={`flex max-w-screen-xl mx-auto md:px-4 ${
      num !== 1 ? "md:mt-4 mt-2" : ""
    }`}
  >
    <div
      className={`hidden md:flex bg-[rgba(253,220,166,0.5)] min-w-48  justify-center ${
        num === 1 ? "rounded-tr-3xl" : ""
      }`}
    >
      <div className="mt-12 bg-[rgba(255,255,255,0.5)] font-IBMPlex font-semibold text-4xl w-28 h-28 rounded-full flex justify-center items-center">
        {num}
      </div>
    </div>
    <div className="grow md:p-10 p-4 bg-white">
      <div className="md:mb-6 mb-3">
        <h1 className="lg:text-[1.7rem] md:text-[1.5rem] text-1.1 font-semibold text-darkNavy font-IBMPlex mb-1 md:mb-2">
          {title}
        </h1>
        <p className="lg:text-[1.3rem] md:text-1.2 text-xs text-darkNavy">
          {description}
        </p>
      </div>
      {children}
    </div>
  </div>
);

export default function AddProductForm({
  lang,
  translate,
  categories,
  subCategories,
  product,
  isEditing,
}) {
  const langPrefix = lang === "ar" ? "" : "en/";
  const router = useRouter();
  const pathname = usePathname();
  const trans = useTranslations(translate);
  const t = (key) => trans(`addProductPage.${key}`);
  const tn = (key) => trans(`mobileNav.${key}`);
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [deliveryCoastModal, setDeliveryCoastModal] = useState(false);
  const [aiMode, setAiMode] = useState(null); // null | "choice" | "mcp" | "ai"

  const {
    isOpen: navOpen,
    onOpen: onNavOpen,
    onOpenChange: onNavOpenChange,
  } = useDrawerWithHistory();

  const homeHref = lang === "ar" ? "/" : "/en";
  const searchHref = `/${langPrefix}search/products`;
  const cartHref = `/${langPrefix}cart`;

  // Section 5 state
  const [useCases, setUseCases] = useState(
    product?.useCases?.length
      ? product.useCases.map((uc, i) => ({ ...uc, id: uc.id || i + 1 }))
      : [{ id: 1, nameAr: "", nameEn: "" }],
  );
  const [specs, setSpecs] = useState(
    product?.specs?.length
      ? product.specs.map((s, i) => ({ ...s, id: s.id || i + 1 }))
      : [{ id: 1, keyAr: "", keyEn: "", valueAr: "", valueEn: "" }],
  );
  const [features, setFeatures] = useState(
    product?.features?.length
      ? product.features.map((f, i) => ({ ...f, id: f.id || i + 1 }))
      : [{ id: 1, titleAr: "", titleEn: "", descAr: "", descEn: "" }],
  );
  const [seoData, setSeoData] = useState({
    titleAr: product?.seoTitleAr || "",
    titleEn: product?.seoTitleEn || "",
    descriptionAr: product?.seoDescriptionAr || "",
    descriptionEn: product?.seoDescriptionEn || "",
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const emptyLocation = {
    country: "",
    governorate: "",
    city: "",
    neighborhood: "",
  };
  const Lang = lang === "ar" ? "Ar" : "En";
  const Lang2 = lang === "ar" ? "En" : "Ar";
  const [address, setAddress] = useState(
    product?.[`address${Lang}`] || emptyLocation,
  );

  // For approved products: prefer pendingChanges values so the user
  // sees what they last submitted, not the live public values.
  const pc = product?.pendingChanges;

  const [productData, setProductData] = useState({
    nameAr: pc?.nameAr ?? product?.nameAr ?? "",
    nameEn: pc?.nameEn ?? product?.nameEn ?? "",
    quantity: product?.quantity || 1,
    minQuantity: product?.minQuantity || 1,
    status: product?.status || "excellent",
    descriptionAr: pc?.descriptionAr ?? product?.descriptionAr ?? "",
    descriptionEn: pc?.descriptionEn ?? product?.descriptionEn ?? "",
    saleUnit: product?.saleUnit || "",
  });

  const [productImages, setProductImages] = useState(
    pc?.images?.length
      ? pc.images
      : product?.images
        ? product.images.map((preview) => preview)
        : [],
  );
  const [location, setLocation] = useState(
    product?.location?.coordinates
      ? {
          lng: product.location.coordinates[0],
          lat: product.location.coordinates[1],
        }
      : null,
  );
  const [services, setServices] = useState(product?.services || []);
  const [category, setCategory] = useState(
    pc?.category ?? product?.category ?? "",
  );
  const [subCategory, setSubCategory] = useState(
    pc?.subCategory ?? product?.subCategory ?? "",
  );

  const [rentData, setRentData] = useState({
    value: product?.rental?.value || "",
    insurance: product?.rental?.insurance || 0,
    delivery: {
      cost: product?.rental?.delivery?.cost || 0,
      type: product?.rental?.delivery?.type || "delivery",
      pricingModel: product?.rental?.delivery?.pricingModel || "fixedCity",
      fixedCityPricing:
        product?.rental?.delivery?.fixedCityPricing?.length > 0
          ? product?.rental?.delivery?.fixedCityPricing
          : [
              {
                id: new Date().getTime(),
                cityAr: "",
                cityEn: "",
                governorateAr: "",
                governorateEn: "",
                displayName: "",
                isGovernorate: false,
                price: "",
              },
            ],
    },
    discountTiers: product?.rental?.discountTiers || [],
    quantityDiscountTiers: product?.rental?.quantityDiscountTiers || [],
    packages: (product?.rental?.packages || []).map((pkg) => ({
      ...pkg,
      unit: pkg.unit || "days",
    })),
  });
  const [pricingModel, setPricingModel] = useState(
    product?.pricingModel || "perDay",
  );

  const [minDays, setMinDays] = useState(product?.rental?.minDays || 1);

  const isDirty =
    !isEditing &&
    (!!productData.nameAr?.trim() ||
      !!productData.nameEn?.trim() ||
      !!productData.descriptionAr?.trim() ||
      productImages.length > 0 ||
      !!rentData.value ||
      !!location?.lat);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const allowNavigationRef = useRef(false);
  const isSubmittingRef = useRef(false);

  // Restore text draft on mount for new products
  useEffect(() => {
    if (isEditing) return;
    try {
      const saved = localStorage.getItem("estajer_product_text_draft");
      if (saved) {
        const draft = JSON.parse(saved);
        setProductData((prev) => ({
          ...prev,
          nameAr: draft.nameAr ?? prev.nameAr,
          nameEn: draft.nameEn ?? prev.nameEn,
          descriptionAr: draft.descriptionAr ?? prev.descriptionAr,
          descriptionEn: draft.descriptionEn ?? prev.descriptionEn,
        }));
      }
    } catch (e) {}
  }, [isEditing]);

  // Auto-save text draft or remove if all empty
  useEffect(() => {
    if (isEditing || isSubmittingRef.current) return;
    const hasText =
      !!productData.nameAr?.trim() ||
      !!productData.nameEn?.trim() ||
      !!productData.descriptionAr?.trim() ||
      !!productData.descriptionEn?.trim();

    try {
      if (hasText) {
        localStorage.setItem(
          "estajer_product_text_draft",
          JSON.stringify({
            nameAr: productData.nameAr,
            nameEn: productData.nameEn,
            descriptionAr: productData.descriptionAr,
            descriptionEn: productData.descriptionEn,
          }),
        );
      } else {
        localStorage.removeItem("estajer_product_text_draft");
      }
    } catch (e) {}
  }, [
    isEditing,
    productData.nameAr,
    productData.nameEn,
    productData.descriptionAr,
    productData.descriptionEn,
  ]);

  // Show browser alert on reload or navigate away if form has unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty && !isSubmittingRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Intercept browser Back button when form is dirty
  useEffect(() => {
    if (!isDirty) return;

    window.history.pushState({ isFormDirty: true }, "", window.location.href);

    const handlePopState = () => {
      if (allowNavigationRef.current) return;
      window.history.pushState({ isFormDirty: true }, "", window.location.href);
      setShowLeaveModal(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isDirty]);

  const handleConfirmLeave = () => {
    allowNavigationRef.current = true;
    setShowLeaveModal(false);
    window.history.go(-2);
  };

  const handleStayOnPage = () => {
    setShowLeaveModal(false);
  };

  const changeCategory = ({ target: { value } }) => {
    setCategory(value);
    setSubCategory(subCategories[value]?.[0]?.key || "");
  };

  const changeSubCategory = ({ target: { value } }) => setSubCategory(value);

  // ─── AI Apply Handler ───
  const handleAiApply = (suggestion, aiImages) => {
    // Fill basic product data
    if (
      suggestion.nameAr ||
      suggestion.nameEn ||
      suggestion.quantity !== undefined ||
      suggestion.minQuantity !== undefined
    ) {
      setProductData((prev) => {
        const nextQty =
          suggestion.quantity !== undefined
            ? +suggestion.quantity
            : prev.quantity;
        let nextMinQty =
          suggestion.minQuantity !== undefined
            ? +suggestion.minQuantity
            : prev.minQuantity;

        if (nextMinQty > nextQty) nextMinQty = nextQty;

        return {
          ...prev,
          nameAr: suggestion.nameAr || prev.nameAr,
          nameEn: suggestion.nameEn || prev.nameEn,
          descriptionAr: suggestion.descriptionAr || prev.descriptionAr,
          descriptionEn: suggestion.descriptionEn || prev.descriptionEn,
          quantity: nextQty,
          minQuantity: nextMinQty,
        };
      });
    }
    // Fill rental data + discounts + delivery
    setRentData((prev) => {
      const updated = { ...prev };
      if (suggestion.rentalValue) {
        updated.value = suggestion.rentalValue;
      }
      if (suggestion.insurance !== undefined) {
        updated.insurance = suggestion.insurance;
      }
      if (suggestion.delivery) {
        updated.delivery = {
          ...prev.delivery,
          type: suggestion.delivery.type || prev.delivery.type,
          pricingModel:
            suggestion.delivery.pricingModel || prev.delivery.pricingModel,
          cost:
            suggestion.delivery.cost !== undefined
              ? suggestion.delivery.cost
              : prev.delivery.cost,
          fixedCityPricing: suggestion.delivery.fixedCityPricing
            ? suggestion.delivery.fixedCityPricing.map((item, idx) => ({
                id: Date.now() + idx + 500,
                cityAr: item.cityAr || "",
                cityEn: item.cityEn || "",
                governorateAr: item.governorateAr || "",
                governorateEn: item.governorateEn || "",
                displayName: item.displayName || item.cityAr || "",
                isGovernorate: !!item.isGovernorate,
                price: item.price || 0,
              }))
            : prev.delivery.fixedCityPricing,
        };
      }
      if (suggestion.discountTiers) {
        updated.discountTiers = suggestion.discountTiers.map((tier, i) => ({
          id: Date.now() + i,
          minDays: tier.minDays,
          discount: tier.discount,
          discountType: tier.discountType || "percentage",
          dateRanges: [],
        }));
      }
      return updated;
    });

    if (suggestion.pricingModel) setPricingModel(suggestion.pricingModel);

    // Fill category & subcategory
    if (suggestion.category) {
      const catKey = suggestion.category;
      const matchedCat = categories.find((c) => c.key === catKey);
      if (matchedCat) {
        setCategory(catKey);
        if (suggestion.subCategory) {
          setSubCategory(suggestion.subCategory);
        } else {
          setSubCategory(subCategories[catKey]?.[0]?.key || "");
        }
      }
    }

    // Fill services
    if (suggestion.services?.length) {
      setServices(
        suggestion.services.map((svc, i) => ({
          id: Date.now() + i + 1000,
          nameAr: svc.nameAr,
          nameEn: svc.nameEn,
          price: svc.price || 0,
          quantity: svc.quantity || 1,
          pricingType: svc.pricingType || "perDay",
        })),
      );
    }

    // Apply images from AI modal (already in base64 webp preview list)
    if (aiImages?.length) {
      setProductImages(aiImages);
    }

    // Fill coordinates/location map marker position
    if (
      suggestion.location &&
      suggestion.location.lat &&
      suggestion.location.lng
    ) {
      setLocation({
        lat: suggestion.location.lat,
        lng: suggestion.location.lng,
      });
    }

    // Fill address components
    const resolvedAddress =
      lang === "ar" ? suggestion.addressAr : suggestion.addressEn;
    if (resolvedAddress) {
      setAddress({
        country: resolvedAddress.country || "",
        governorate: resolvedAddress.governorate || "",
        city: resolvedAddress.city || "",
        neighborhood: resolvedAddress.neighborhood || "",
      });
    }
    toast.success(ToastMessage(trans("addProductPage.aiAssist.applied")));
  };

  const handleChange = ({ target: { type, name, value } }) => {
    // Reset SEO fields if main fields change
    if (name === "nameAr" && seoData.titleAr)
      setSeoData((prev) => ({ ...prev, titleAr: "" }));
    if (name === "nameEn" && seoData.titleEn)
      setSeoData((prev) => ({ ...prev, titleEn: "" }));
    if (name === "descriptionAr" && seoData.descriptionAr)
      setSeoData((prev) => ({ ...prev, descriptionAr: "" }));
    if (name === "descriptionEn" && seoData.descriptionEn)
      setSeoData((prev) => ({ ...prev, descriptionEn: "" }));

    setProductData({
      ...productData,
      [name]: type === "number" ? +value : value,
    });
  };

  const setAddress2 = (fun) =>
    fetch(
      `/api/geocode/reverse?lat=${location.lat}&lng=${location.lng}&lang=${Lang2}`,
    )
      .then(async (res) => {
        const data = await res.json();
        if (data.status === "OK" && data.results.length > 0) {
          const addressComponents = data.results[0].address_components;
          const address2 = {};
          addressComponents?.forEach((component) => {
            const { types, long_name } = component;
            const typeToField = {
              country: "country",
              administrative_area_level_1: "governorate",
              administrative_area_level_2: "city",
              administrative_area_level_3: "neighborhood",
            };
            const field = typeToField[types[0]];
            if (field) address2[field] = long_name;
          });
          fun(address2);
        }
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });

  const handleSubmit = async (e, currentUser = null) => {
    if (e && e.preventDefault) e.preventDefault();

    const activeUser = currentUser || user;

    if (
      activeUser &&
      !activeUser.nafathVerified &&
      activeUser.accountType !== "admin" &&
      activeUser.accountType !== "company" &&
      !activeUser.skipIbanVerification
    )
      return onOpen();
    const isCompanyWithTax =
      activeUser?.accountType === "company" &&
      !!activeUser?.companyDetails?.taxCode;
    const bAddr = activeUser?.companyDetails?.billingAddress;
    const hasBillingAddr =
      !isCompanyWithTax ||
      (!!bAddr?.street &&
        !!bAddr?.city &&
        !!bAddr?.district &&
        !!bAddr?.postalCode &&
        !!bAddr?.buildingNumber);

    if (
      (!activeUser?.iban || !hasBillingAddr) &&
      activeUser?.accountType !== "admin" &&
      !activeUser?.skipIbanVerification
    )
      return setShowSupplierModal(true);

    if (!location?.lat)
      return toast.error(ToastMessage(t("toasts.locationRequired")));
    if (!address?.city) {
      const errorMsg =
        lang === "ar"
          ? "المدينة مطلوبة لتحديد موقع المنتج بشكل صحيح"
          : "City is required to specify the product location correctly";
      return toast.error(ToastMessage(errorMsg));
    }
    if (productImages.length === 0)
      return toast.error(ToastMessage(t("toasts.imagesRequired")));
    if (pricingModel === "packages" && rentData.packages.length === 0)
      return toast.error(ToastMessage(t("toasts.packagesRequired")));
    if (
      rentData.delivery.type === "delivery" &&
      rentData.delivery.pricingModel === "fixedCity"
    ) {
      if (rentData.delivery.fixedCityPricing.length === 0) {
        return toast.error(ToastMessage(t("toasts.cityRequired")));
      }
      const hasInvalidCity = rentData.delivery.fixedCityPricing.some(
        (c) => !c.cityAr?.trim() && !c.governorateAr?.trim(),
      );
      if (hasInvalidCity) {
        const errorMsg =
          lang === "ar"
            ? "يرجى اختيار مدينة صالحة من الاقتراحات لكل مدن التسعير"
            : "Please select a valid city from the suggestions for all pricing cities";
        return toast.error(ToastMessage(errorMsg));
      }
    }
    const isValid = rentData.discountTiers.every((item) =>
      item.dateRanges.every((range) => range.from && range.to),
    );
    if (!isValid)
      return toast.error(ToastMessage(t("toasts.discountDateRequired")));
    setIsLoading(true);
    setAddress2((address2) => {
      fetch(`/api/products${isEditing ? `/${product._id}` : ""}`, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productData,
          productImages,
          [`address${Lang}`]: address,
          [`address${Lang2}`]: address2,
          location,
          services,
          category,
          subCategory,
          rental: {
            ...rentData,
            minDays,
            ...(rentData.saleUnit && { saleUnit: rentData.saleUnit }),
          },
          pricingModel,
          useCases: useCases.filter(
            (uc) => uc.nameAr?.trim() && uc.nameEn?.trim(),
          ),
          specs: specs.filter(
            (s) =>
              s.keyAr?.trim() &&
              s.keyEn?.trim() &&
              s.valueAr?.trim() &&
              s.valueEn?.trim(),
          ),
          features: features.filter(
            (f) =>
              f.titleAr?.trim() &&
              f.titleEn?.trim() &&
              f.descAr?.trim() &&
              f.descEn?.trim(),
          ),
          seoTitleAr: seoData.titleAr,
          seoTitleEn: seoData.titleEn,
          seoDescriptionAr: seoData.descriptionAr,
          seoDescriptionEn: seoData.descriptionEn,
        }),
      })
        .then((res) => {
          res.json().then(async (data) => {
            if (!data.success)
              return toast.error(
                ToastMessage(
                  data.error ||
                    `Error ${isEditing ? "updating" : "adding"} product`,
                ),
              );
            if (isEditing) await revalidateWithTag(`product-${data.data._id}`);
            if (isEditing) await revalidate("/");
            const isPendingReview =
              isEditing && data.data?.pendingChanges?.needsReview;
            toast.success(
              ToastMessage(
                t(
                  `toasts.product${
                    isPendingReview
                      ? "UpdatedPendingReview"
                      : isEditing
                        ? "Updated"
                        : "Added"
                  }Success`,
                ),
              ),
            );
            isSubmittingRef.current = true;
            try {
              localStorage.removeItem("estajer_product_text_draft");
            } catch (e) {}
            router.push(
              `/${langPrefix}${
                activeUser?.accountType === "admin" ? "admin" : "dashboard"
              }/products${activeUser?.accountType === "admin" ? "/all" : ""}`,
            );
          });
        })
        .catch((err) => {
          console.error(err);
          toast.error(ToastMessage(t("common.errorSomethingWentWrong")));
        })
        .finally(() => setIsLoading(false));
    });
  };

  const handleNafathSuccess = () => {
    const updatedUser = { ...user, nafathVerified: true };
    setUser(updatedUser);
    toast.success(ToastMessage("Verification successful!"));
    onClose();
    handleSubmit(null, updatedUser);
  };

  const handleSupplierSuccess = (updatedUserData) => {
    const updatedUser = updatedUserData || { ...user };
    setUser(updatedUser);
    handleSubmit(null, updatedUser);
  };

  const handleNafathError = (error) => toast.error(ToastMessage(error));

  return (
    <>
      {!isEditing && (
        <McpBanner
          lang={lang}
          translate={translate}
          categories={categories}
          subCategories={subCategories}
          onAiApply={handleAiApply}
          mode={aiMode}
          setMode={setAiMode}
          user={user}
          setUser={setUser}
        />
      )}

      {/* ── Pending-changes banners (editing approved products only) ── */}
      {isEditing && pc?.needsReview && (
        <div className="max-w-screen-xl mx-auto md:px-4 mb-4 mt-2">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-2xl p-4">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-amber-800 text-sm font-medium">
              {trans("addProductPage.pendingChanges.pendingReviewNote")}
            </p>
          </div>
        </div>
      )}

      {isEditing && !pc?.needsReview && pc?.rejectMessage && (
        <div className="max-w-screen-xl mx-auto md:px-4 mb-4 mt-2">
          <div className="flex items-start gap-3 bg-red-50 border border-red-300 rounded-2xl p-4">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
              />
            </svg>
            <div>
              <p className="text-red-800 text-sm font-semibold mb-0.5">
                {trans("addProductPage.pendingChanges.rejectedTitle")}
              </p>
              <p className="text-red-700 text-sm">{pc.rejectMessage}</p>
            </div>
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="max-w-screen-xl mx-auto md:px-4 mb-4 md:mb-6 mt-2">
          <div className="bg-gradient-to-r from-[#f6eee0] via-[#f6efea] to-[#f6f6f6] border border-amber-500/20 rounded-2xl md:rounded-3xl p-3 md:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-5 relative overflow-hidden group">
            {/* Background sparkle blur effect */}
            <div className="absolute end-[-40px] top-[-40px] w-32 h-32 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-colors pointer-events-none" />

            <div className="flex items-start gap-3 md:gap-4 text-start relative z-10">
              <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                <svg
                  className="w-4 h-4 md:w-6 md:h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M10 2c0 4.418-3.582 8-8 8 4.418 0 8 3.582 8 8 0-4.418 3.582-8 8-8-4.418 0-8-3.582-8-8z" />
                  <path d="M19 8c0 2.209-1.791 4-4 4 2.209 0 4 1.791 4 4 0-2.209 1.791-4 4-4-2.209 0-4-1.791-4-4z" />
                </svg>
              </div>
              <div className="space-y-0.5 md:space-y-1">
                <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                  <h3 className="font-bold text-darkNavy font-IBMPlex text-sm md:text-lg">
                    {t("promo.title")}
                  </h3>
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[9px] md:text-[10px] px-2 md:px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {t("promo.new")}
                  </span>
                </div>
                <p className="text-slate-650 text-[11px] md:text-sm leading-relaxed max-w-2xl font-medium">
                  {t("promo.description")}
                </p>
              </div>
            </div>

            <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
              <Link
                target="_blank"
                href="https://www.youtube.com/watch?v=Ss8Udvi1s5U&t=1s"
                className="flex gap-1.5 md:gap-2 rounded-xl md:rounded-2xl border-2 border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-700 font-bold px-3 md:px-6 py-2 md:py-3 h-auto active:scale-95 transition-all text-xs md:text-sm whitespace-nowrap group"
              >
                <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <svg
                    className="w-2 h-2 md:w-2.5 md:h-2.5 text-amber-600 fill-current transition-transform group-hover:scale-110"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                {t("promo.howTo")}
              </Link>
              <button
                type="button"
                onClick={() => setAiMode("ai")}
                className="relative z-10 flex-1 sm:flex-none sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all text-xs md:text-sm whitespace-nowrap"
              >
                {t("promo.btn")}
              </button>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <FormContent
          num={1}
          title={t("formSteps.step1.title")}
          description={t("formSteps.step1.description")}
        >
          <GeneralInformation
            selectedSubCategory={subCategory}
            changeSubCategory={changeSubCategory}
            selectedCategory={category}
            subCategories={subCategories[category]}
            changeCategory={changeCategory}
            categories={categories}
            handleChange={handleChange}
            data={productData}
            lang={lang}
            translate={translate}
          />
        </FormContent>
        <FormContent
          num={2}
          title={t("formSteps.step2.title")}
          description={t("formSteps.step2.description")}
        >
          <ImageUploader
            lang={lang}
            files={productImages}
            setFiles={setProductImages}
            translate={translate}
          />
        </FormContent>
        <FormContent
          num={3}
          title={t("formSteps.step3.title")}
          description={t("formSteps.step3.description")}
        >
          <ProductLocation
            lang={lang}
            emptyLocation={emptyLocation}
            address={address}
            setAddress={setAddress}
            markerPosition={location}
            setMarkerPosition={setLocation}
            translate={translate}
          />
        </FormContent>
        <FormContent
          num={4}
          title={t("formSteps.step4.title")}
          description={t("formSteps.step4.description")}
        >
          <RentDetails
            lang={lang}
            rentData={rentData}
            setRentData={setRentData}
            minDays={minDays}
            setMinDays={setMinDays}
            services={services}
            setServices={setServices}
            quantity={productData.quantity}
            translate={translate}
            location={location}
            address={address}
            setDeliveryCoastModal={setDeliveryCoastModal}
            pricingModel={pricingModel}
            setPricingModel={setPricingModel}
            commission={user?.commission || 15}
            saleUnit={productData.saleUnit}
            setProductData={setProductData}
          />
        </FormContent>

        <AdditionalDetails
          user={user}
          lang={lang}
          translate={translate}
          useCases={useCases}
          setUseCases={setUseCases}
          specs={specs}
          setSpecs={setSpecs}
          features={features}
          setFeatures={setFeatures}
          seoData={seoData}
          setSeoData={setSeoData}
          productData={productData}
          isEditing={isEditing}
        />

        <div className="max-w-screen-xl mx-auto px-4 md:mt-4 mt-2 mb-28 md:mb-20 text-end">
          {!isEditing && (
            <div className="mb-4 md:mb-6 p-2.5 md:p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded flex items-center gap-2 text-start">
              <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-amber-800 text-xs md:text-sm">
                {t("reviewNote")}
              </p>
            </div>
          )}
          {/* Desktop submit button */}
          <div>
            <Button
              isLoading={isLoading}
              type="submit"
              startContent={
                isEditing ? (
                  <Edit className="w-4 h-4 md:w-6 md:h-6" color="#fff" />
                ) : (
                  <Plus className="w-5 h-5 md:w-6 md:h-6" color="#fff" />
                )
              }
              className="md:py-7 py-3.5 w-full md:w-auto md:min-w-60 md:text-xl text-base font-IBMPlex"
            >
              {isEditing ? t("buttons.updateProduct") : t("buttons.addProduct")}
            </Button>
          </div>
        </div>

        {/* ══ Mobile-only bottom bar ══ */}
        <div className="block md:hidden fixed bottom-0 start-0 end-0 z-50 shadow-lg">
          <div
            className="bg-white/95 backdrop-blur-md"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            {/* ── Row 1: Action buttons ── */}
            <div className="flex items-center gap-2 px-3 pt-2 pb-1.5 border-t border-gray-100 shadow-sm">
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setAiMode("choice")}
                  aria-label={lang === "ar" ? "أضف بـ AI" : "AI Add"}
                  className="flex items-center justify-center gap-1.5 px-3 h-10 rounded-xl border border-amber-300/90 text-amber-800 font-bold text-xs shadow-sm active:scale-95 transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <svg
                    className="w-4 h-4 text-amber-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M10 2c0 4.418-3.582 8-8 8 4.418 0 8 3.582 8 8 0-4.418 3.582-8 8-8-4.418 0-8-3.582-8-8z" />
                    <path d="M19 8c0 2.209-1.791 4-4 4 2.209 0 4 1.791 4 4 0-2.209 1.791-4 4-4-2.209 0-4-1.791-4-4z" />
                  </svg>
                  <span>{lang === "ar" ? "أضف بـ AI" : "AI Add"}</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                aria-label={
                  isEditing
                    ? t("buttons.updateProduct")
                    : t("buttons.addProduct")
                }
                className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl font-bold text-white text-sm tracking-wide transition-all active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50"
                style={{
                  background:
                    "linear-gradient(130deg, #F48A42 0%, #d96e1c 100%)",
                  boxShadow:
                    "0 2px 10px rgba(244,138,66,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                {isLoading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    {isEditing ? (
                      <Edit className="w-3.5 h-3.5" color="#fff" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" color="#fff" />
                    )}
                    <span>
                      {isEditing
                        ? t("buttons.updateProduct")
                        : t("buttons.addProduct")}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* ── Row 2: Navigation icons ── */}
            <nav
              aria-label={tn("ariaLabel")}
              className="grid grid-cols-5 items-center justify-items-center px-2 py-0.5"
            >
              {/* Home */}
              <Link
                href={homeHref}
                title={tn("homeTitle")}
                aria-label={tn("home")}
                aria-current={pathname === homeHref ? "page" : undefined}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              >
                <Home
                  color={pathname === homeHref ? "#F48A42" : "#0d092b"}
                  aria-hidden="true"
                />
              </Link>

              {/* Search */}
              <Link
                href={searchHref}
                title={tn("searchTitle")}
                aria-label={tn("search")}
                aria-current={pathname === searchHref ? "page" : undefined}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              >
                <Search
                  color={pathname === searchHref ? "#F48A42" : "#0d092b"}
                  className="min-w-5 h-5"
                  aria-hidden="true"
                  strokeWidth={6}
                />
              </Link>

              {/* Add product — center circle */}
              <Link
                href={`/${langPrefix}add-product`}
                aria-label={tn("addProduct")}
                className="flex flex-col items-center justify-center h-8 w-8 rounded-full bg-primary !opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <Plus color="#fff" size={16} aria-hidden="true" />
                <span className="sr-only">{tn("addProduct")}</span>
              </Link>

              {/* Cart */}
              <Link
                href={cartHref}
                title={tn("cartTitle")}
                aria-label={tn("cart")}
                aria-current={pathname === cartHref ? "page" : undefined}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              >
                <Cart
                  color={pathname === cartHref ? "#F48A42" : "#0d092b"}
                  circle={false}
                  size={36}
                  aria-hidden="true"
                />
              </Link>

              {/* Menu */}
              <button
                type="button"
                onClick={onNavOpen}
                aria-label={tn("menu")}
                aria-expanded={navOpen}
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 min-w-0 rounded-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              >
                <Menu aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </form>
      <DeliveryCoastModal
        cost={rentData.delivery.cost}
        isModalOpen={deliveryCoastModal}
        setIsModalOpen={setDeliveryCoastModal}
        translate={translate}
        location={location}
        lang={lang}
      />
      <SupplierModal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        setUser={setUser}
        user={user}
        translate={trans}
        onSuccess={handleSupplierSuccess}
      />
      <NafathAuthModal
        trans={trans}
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={handleNafathSuccess}
        onError={handleNafathError}
        user={user}
      />
      <LeaveConfirmationModal
        isOpen={showLeaveModal}
        onStay={handleStayOnPage}
        onLeave={handleConfirmLeave}
        trans={trans}
      />
      {navOpen && (
        <NavbarDrawer
          open={navOpen}
          user={user}
          setOpen={onNavOpenChange}
          lang={lang}
          trans={trans}
        />
      )}
    </>
  );
}
