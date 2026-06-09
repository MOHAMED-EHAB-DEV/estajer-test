"use client";
import GeneralInformation from "./GeneralInformation";
import Button from "@/components/ui/Button";
import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import { useTranslations } from "@/hooks/useTranslations";
import UserLocation from "../dashboard/settings/UserLocation";
import ImageUploader from "../addProduct/ImageUploader";
import { useRouter } from "next/navigation";

const FormContent = ({ children, num, title, description }) => (
  <div
    className={`flex max-w-screen-xl mx-auto px-4 ${num !== 1 ? "mt-4" : ""}`}
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

export default function AddRequestForm({
  lang,
  translate,
  request,
  isEditing,
}) {
  const router = useRouter();
  const trans = useTranslations(translate);
  const t = (key) => trans(`addProductPage.${key}`);
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const Lang = lang === "ar" ? "Ar" : "En";
  const Lang2 = lang === "ar" ? "En" : "Ar";
  const langPrefix = lang === "ar" ? "" : "en/";

  const [address, setAddress] = useState("");
  const [requestData, setRequestData] = useState({
    nameAr: request?.nameAr || "",
    nameEn: request?.nameEn || "",
    quantity: request?.quantity || 1,
    descriptionAr: request?.descriptionAr || "",
    descriptionEn: request?.descriptionEn || "",
  });
  const [location, setLocation] = useState({});

  useEffect(() => {
    if (user) {
      setAddress(user?.address);
      setLocation(user?.location || {});
    }
  }, [user]);

  const [productImages, setProductImages] = useState(
    request?.images ? request.images.map((url) => ({ preview: url })) : [],
  );

  const handleChange = ({ target: { type, name, value } }) =>
    setRequestData({
      ...requestData,
      [name]: type === "number" ? +value : value,
    });

  const setAddress2 = (fun) =>
    fetch(
      `/api/geocode/reverse?lat=${location.lat}&lng=${location.lng}&lang=${Lang2}`,
    )
      .then(async (res) => {
        const data = await res.json();
        if (data.status === "OK" && data.results.length > 0) {
          const formattedAddress = data.results[0].formatted_address;
          fun(formattedAddress);
        }
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });

  const addProduct = (e) => {
    e.preventDefault();
    if (productImages.length === 0)
      return toast.error(ToastMessage(t("toasts.imagesRequired")));
    if (!location?.lat)
      return toast.error(ToastMessage(t("toasts.locationRequired")));

    setIsLoading(true);
    setAddress2((address2) => {
      fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...requestData,
          productImages,
          [`address${Lang}`]: address,
          [`address${Lang2}`]: address2,
          location,
        }),
      })
        .then((res) => {
          if (res.ok) {
            toast.success(ToastMessage(t("toasts.productAddedSuccess")));
            router.push(
              `/${langPrefix}${user.accountType === "admin" ? "admin/requests" : "dashboard/product-requests"}`,
            );
          } else {
            toast.error(ToastMessage(t("common.errorSomethingWentWrong")));
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error(ToastMessage(t("common.errorSomethingWentWrong")));
        })
        .finally(() => setIsLoading(false));
    });
  };
  const editProduct = (e) => {
    e.preventDefault();
    if (!location?.lat)
      return toast.error(ToastMessage(t("toasts.locationRequired")));
    setIsLoading(true);
    setAddress2((address2) => {
      fetch(`/api/requests/${request._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...requestData,
          productImages,
          [`address${Lang}`]: address,
          [`address${Lang2}`]: address2,
          location,
        }),
      })
        .then((res) => {
          if (res.ok) {
            toast.success(ToastMessage(t("toasts.productUpdatedSuccess")));
            router.push(`/${langPrefix}dashboard/product-requests`);
          } else {
            toast.error(ToastMessage(t("common.errorSomethingWentWrong")));
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error(ToastMessage(t("common.errorSomethingWentWrong")));
        })
        .finally(() => setIsLoading(false));
    });
  };
  return (
    <>
      <form onSubmit={isEditing ? editProduct : addProduct}>
        <FormContent
          num={1}
          title={t("formSteps.step1.title")}
          description={t("formSteps.step1.description")}
        >
          <GeneralInformation
            lang={lang}
            data={requestData}
            handleChange={handleChange}
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
          <UserLocation
            lang={lang}
            address={address}
            setAddress={(address) => setAddress(address)}
            markerPosition={location}
            setMarkerPosition={(location) => setLocation(location)}
          />
        </FormContent>

        <div className="max-w-screen-xl mx-auto px-4 mt-10 mb-20 text-end">
          <Button
            isLoading={isLoading}
            type="submit"
            className="py-7 min-w-60 text-xl font-IBMPlex"
          >
            {isEditing ? t("buttons.updateProduct") : trans("request.button")}
          </Button>
        </div>
      </form>
    </>
  );
}
