"use client";
import GeneralInformation from "./GeneralInformation";
import ImageUploader from "./ImageUploader";
import ProductLocation from "./ProductLocation";
import RentDetails from "./RentDetails";
import Button from "@/components/ui/Button";
import { useUser } from "@/context/UserContext";
import { useState } from "react";
import SupplierModal from "./SupplierModal";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "next/navigation";
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";
import DeliveryCoastModal from "./DeliveryCoastModal";
import NafathAuthModal from "../checkout/NafathAuthModal";
import { useDisclosure } from "@heroui/react";
import AdditionalDetails from "./AdditionalDetails";
import McpBanner from "./McpBanner";

const FormContent = ({ children, num, title, description }) => (
  <div
    className={`flex max-w-screen-xl mx-auto md:px-4 ${
      num !== 1 ? "mt-4" : ""
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
    <div className="grow md:p-10 px-4 py-8 bg-white">
      <div className="mb-6">
        <h1 className="lg:text-[1.7rem] md:text-[1.5rem] text-[1.3rem] font-semibold text-darkNavy font-IBMPlex mb-1">
          {title}
        </h1>
        <p className="lg:text-[1.3rem] md:text-[1.2rem] text-[1.15rem] text-darkNavy ">
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
  const trans = useTranslations(translate);
  const t = (key) => trans(`addProductPage.${key}`);
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [deliveryCoastModal, setDeliveryCoastModal] = useState(false);
  const [aiMode, setAiMode] = useState(null); // null | "choice" | "mcp" | "ai"

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

  const [productData, setProductData] = useState({
    nameAr: product?.nameAr || "",
    nameEn: product?.nameEn || "",
    quantity: product?.quantity || 1,
    minQuantity: product?.minQuantity || 1,
    status: product?.status || "excellent",
    descriptionAr: product?.descriptionAr || "",
    descriptionEn: product?.descriptionEn || "",
  });

  const [productImages, setProductImages] = useState(
    product?.images ? product.images.map((preview) => preview) : [],
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
    product?.category || categories[0].key,
  );
  const [subCategory, setSubCategory] = useState(
    product?.subCategory || subCategories[categories[0].key][0]?.key || "",
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

  const changeCategory = ({ target: { value } }) => {
    setCategory(value);
    setSubCategory(subCategories[value]?.[0]?.key || "");
  };

  const changeSubCategory = ({ target: { value } }) => setSubCategory(value);

  // ─── AI Apply Handler ───
  const handleAiApply = (suggestion, aiImages) => {
    // Fill basic product data
    if (suggestion.nameAr || suggestion.nameEn) {
      setProductData((prev) => ({
        ...prev,
        nameAr: suggestion.nameAr || prev.nameAr,
        nameEn: suggestion.nameEn || prev.nameEn,
        descriptionAr: suggestion.descriptionAr || prev.descriptionAr,
        descriptionEn: suggestion.descriptionEn || prev.descriptionEn,
      }));
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

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (
      user &&
      !user.nafathVerified &&
      user.accountType !== "admin" &&
      user.accountType !== "company" &&
      !user.skipIbanVerification
    )
      return onOpen();
    if (
      !user.iban &&
      user.accountType !== "admin" &&
      !user.skipIbanVerification
    )
      return setShowSupplierModal(true);

    if (!location?.lat)
      return toast.error(ToastMessage(t("toasts.locationRequired")));
    if (productImages.length === 0)
      return toast.error(ToastMessage(t("toasts.imagesRequired")));
    if (pricingModel === "packages" && rentData.packages.length === 0)
      return toast.error(ToastMessage(t("toasts.packagesRequired")));
    if (
      rentData.delivery.pricingModel === "fixedCity" &&
      rentData.delivery.fixedCityPricing.length === 0
    ) {
      return toast.error(ToastMessage(t("toasts.cityRequired")));
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
          rental: { ...rentData, minDays },
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
            toast.success(
              ToastMessage(
                t(`toasts.product${isEditing ? "Updated" : "Added"}Success`),
              ),
            );
            router.push(
              `/${langPrefix}${
                user?.accountType === "admin" ? "admin" : "dashboard"
              }/products${user?.accountType === "admin" ? "/all" : ""}`,
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
    setUser({ ...user, nafathVerified: true });
    toast.success(ToastMessage("Verification successful!"));
    onClose();
    handleSubmit();
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
        />
      )}

      {!isEditing && (
        <div className="max-w-screen-xl mx-auto md:px-4 mb-6 mt-2">
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden group">
            {/* Background sparkle blur effect */}
            <div className="absolute end-[-40px] top-[-40px] w-32 h-32 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-colors pointer-events-none" />

            <div className="flex items-start gap-4 text-start relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M10 2c0 4.418-3.582 8-8 8 4.418 0 8 3.582 8 8 0-4.418 3.582-8 8-8-4.418 0-8-3.582-8-8z" />
                  <path d="M19 8c0 2.209-1.791 4-4 4 2.209 0 4 1.791 4 4 0-2.209 1.791-4 4-4-2.209 0-4-1.791-4-4z" />
                </svg>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-darkNavy font-IBMPlex text-base md:text-lg">
                    {t("promo.title")}
                  </h3>
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {t("promo.new")}
                  </span>
                </div>
                <p className="text-slate-650 text-xs md:text-sm leading-relaxed max-w-2xl font-medium">
                  {t("promo.description")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAiMode("ai")}
              className="relative z-10 w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all text-sm whitespace-nowrap"
            >
              {t("promo.btn")}
            </button>
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

        <div className="max-w-screen-xl mx-auto px-4 mt-4 mb-20 text-end">
          {!isEditing && (
            <div className="mb-6 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded flex items-center gap-1 text-start">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amber-600"
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
              <p className="text-amber-800 text-sm">{t("reviewNote")}</p>
            </div>
          )}
          <Button
            isLoading={isLoading}
            type="submit"
            className="py-7 min-w-60 text-xl font-IBMPlex"
          >
            {isEditing ? t("buttons.updateProduct") : t("buttons.addProduct")}
          </Button>
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
      />
      <NafathAuthModal
        trans={trans}
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={handleNafathSuccess}
        onError={handleNafathError}
        user={user}
      />
    </>
  );
}
