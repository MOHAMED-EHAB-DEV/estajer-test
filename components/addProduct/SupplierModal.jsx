import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/CustomModal";
import { Input } from "@/components/ui/Input";
import { useState, useEffect } from "react";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import Button from "../ui/Button";

export default function SupplierModal({
  isOpen,
  onClose,
  setUser,
  user,
  translate,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    iban: user?.iban || "",
    unifiedNumber: user?.unifiedNumber || "",
    billingAddress: {
      street: user?.companyDetails?.billingAddress?.street || "",
      city: user?.companyDetails?.billingAddress?.city || "",
      district: user?.companyDetails?.billingAddress?.district || "",
      postalCode: user?.companyDetails?.billingAddress?.postalCode || "",
      buildingNumber: user?.companyDetails?.billingAddress?.buildingNumber || "",
      country: "Saudi Arabia",
    },
  });

  const isCompanyWithTax =
    user?.accountType === "company" && !!user?.companyDetails?.taxCode;
  // User already has IBAN but missing National Address
  const ibanAlreadySet =
    isCompanyWithTax &&
    !!user?.iban &&
    !user?.companyDetails?.billingAddress?.street;
  const totalSteps = isCompanyWithTax && !ibanAlreadySet ? 2 : 1;

  useEffect(() => {
    if (isOpen) {
      // If IBAN already set but national address missing, skip to step 2
      setStep(ibanAlreadySet ? 2 : 1);
      setData({
        iban: user?.iban || "",
        unifiedNumber: user?.unifiedNumber || "",
        billingAddress: {
          street: user?.companyDetails?.billingAddress?.street || "",
          city: user?.companyDetails?.billingAddress?.city || "",
          district: user?.companyDetails?.billingAddress?.district || "",
          postalCode: user?.companyDetails?.billingAddress?.postalCode || "",
          buildingNumber: user?.companyDetails?.billingAddress?.buildingNumber || "",
          country: "Saudi Arabia",
        },
      });
    }
  }, [isOpen, user]);

  const t = (text) => translate(`supplierModal.${text}`);

  const handleIbanChange = (val) => {
    const cleaned = val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24);
    setData((prev) => ({ ...prev, iban: cleaned }));
  };

  const handleUnifiedNumberChange = (val) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 10);
    setData((prev) => ({ ...prev, unifiedNumber: cleaned }));
  };

  const handleBillingAddressChange = (field, val) => {
    setData((prev) => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: val,
      },
    }));
  };

  const validateStep1 = () => {
    const cleanIban = data.iban.replace(/\s/g, "").toUpperCase();
    if (!cleanIban) {
      toast.error(ToastMessage(t("allFieldsRequired")));
      return false;
    }
    if (!/^SA\d{22}$/.test(cleanIban)) {
      toast.error(ToastMessage(t("invalidIban")));
      return false;
    }

    if (user?.accountType === "company") {
      const cleanUnified = data.unifiedNumber.replace(/\D/g, "");
      if (!cleanUnified) {
        toast.error(ToastMessage(t("unifiedNumberCompanyRequired")));
        return false;
      }
      if (cleanUnified.length !== 10 || !cleanUnified.startsWith("7")) {
        toast.error(ToastMessage(t("invalidUnifiedNumber")));
        return false;
      }
    }
    return true;
  };

  const validateStep2 = () => {
    if (isCompanyWithTax) {
      const { street, city, district, postalCode, buildingNumber } =
        data.billingAddress;
      if (
        !street.trim() ||
        !city.trim() ||
        !district.trim() ||
        !postalCode.trim() ||
        !buildingNumber.trim()
      ) {
        toast.error(ToastMessage(t("billingAddressCompanyRequired")));
        return false;
      }
    }
    return true;
  };

  const handleNext = (e) => {
    e?.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    // Don't go back to step 1 if user already has IBAN set
    if (!ibanAlreadySet) setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1 && totalSteps > 1) {
      return handleNext(e);
    }

    // If IBAN already set, skip step 1 validation
    if (!ibanAlreadySet && !validateStep1()) return;
    if (totalSteps > 1 && !validateStep2()) return;

    const cleanIban = data.iban.replace(/\s/g, "").toUpperCase();
    setLoading(true);
    try {
      const requestBody = { iban: cleanIban };
      if (ibanAlreadySet) {
        // Only update national address — IBAN already on file
        requestBody.billingAddressOnly = true;
      }
      if (user?.accountType === "company") {
        requestBody.unifiedNumber = data.unifiedNumber.replace(/\D/g, "");
        if (isCompanyWithTax) {
          requestBody.billingAddress = data.billingAddress;
        }
      }
      if (user?._id) {
        requestBody.userId = user._id;
      }

      const res = await fetch("/api/users/update-iban", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || t("error"));

      setUser(result.data);
      toast.success(ToastMessage(result.message || t("success")));
      onClose();
      onSuccess?.(result.data);
    } catch (err) {
      toast.error(ToastMessage(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      classNames={{
        base: "bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100",
        backdrop: "bg-slate-900/60 backdrop-blur-md",
      }}
    >
      <ModalContent className="max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
          {/* Header */}
          <ModalHeader className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-6 pb-5 flex flex-col gap-4 flex-shrink-0 relative overflow-hidden">
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-11 h-11 bg-white/15 border border-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{t("title")}</h2>
                <p className="text-blue-100/90 text-xs sm:text-sm font-normal mt-0.5">{t("desc")}</p>
              </div>
            </div>

            {totalSteps > 1 && (
              <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-center">
                <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-full backdrop-blur-sm border border-white/10 w-full max-w-sm justify-between">
                  <div
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full text-xs font-semibold transition-all ${
                      step === 1
                        ? "bg-white text-blue-800 shadow-md scale-[1.02]"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 1 ? "bg-blue-800 text-white" : "bg-white/20 text-white"}`}>
                      1
                    </span>
                    <span className="truncate">{t("step1Title")}</span>
                  </div>

                  <svg className="w-4 h-4 text-white/40 flex-shrink-0 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>

                  <div
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full text-xs font-semibold transition-all ${
                      step === 2
                        ? "bg-white text-blue-800 shadow-md scale-[1.02]"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 2 ? "bg-blue-800 text-white" : "bg-white/20 text-white"}`}>
                      2
                    </span>
                    <span className="truncate">{t("step2Title")}</span>
                  </div>
                </div>
              </div>
            )}
          </ModalHeader>

          {/* Body */}
          <ModalBody className="p-6 overflow-y-auto min-h-0 flex-1 space-y-5 bg-slate-50/50">
            {step === 1 && (
              <div className="space-y-5">
                {/* Step Banner */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{t("accountInfo")}</h3>
                    <p className="text-xs text-gray-500">{t("accountInfoDesc")}</p>
                  </div>
                </div>

                {/* Inputs Container */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <Input
                    type="text"
                    labelPlacement="outside"
                    maxLength={24}
                    label={t("iban")}
                    placeholder="SA0000000000000000000000"
                    value={data.iban}
                    onValueChange={handleIbanChange}
                    disabled={loading}
                    classNames={{
                      label: "text-xs font-semibold text-gray-700",
                      input: "text-base tracking-widest font-mono uppercase text-gray-900",
                      inputWrapper:
                        "h-12 border border-gray-300 hover:border-blue-500 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl bg-white transition-all shadow-sm",
                    }}
                    startContent={
                      <div className="flex items-center gap-1.5 text-blue-600 pe-2 border-e border-gray-200">
                        <span className="text-xs font-bold bg-blue-50 px-2 py-0.5 rounded text-blue-700">SA</span>
                      </div>
                    }
                  />

                  {user?.accountType === "company" && (
                    <Input
                      type="text"
                      labelPlacement="outside"
                      inputMode="numeric"
                      maxLength={10}
                      label={t("unifiedNumber")}
                      placeholder="7000000000"
                      value={data.unifiedNumber}
                      onValueChange={handleUnifiedNumberChange}
                      disabled={loading}
                      classNames={{
                        label: "text-xs font-semibold text-gray-700",
                        input: "text-base font-mono tracking-wider text-gray-900",
                        inputWrapper:
                          "h-12 border border-gray-300 hover:border-blue-500 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl bg-white transition-all shadow-sm",
                      }}
                      startContent={
                        <svg
                          className="w-5 h-5 text-gray-400 pe-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h1m-1-4h.01M9 16h.01M9 12h.01M9 8h.01M15 16h.01M15 12h.01M15 8h.01"
                          />
                        </svg>
                      }
                    />
                  )}
                </div>

                {/* Important Notes Banner */}
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-950 text-sm mb-1.5">
                        {t("importantInformationTitle")}
                      </h4>
                      <ul className="text-xs text-amber-800/90 space-y-1 leading-relaxed">
                        {t("importantNotes")?.map((note, index) => (
                          <li key={index} className="flex items-start gap-1.5">
                            <span className="text-amber-500 select-none">•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                        {user?.accountType === "company" && (
                          <li className="flex items-start gap-1.5 font-medium text-amber-900">
                            <span className="text-amber-500 select-none">•</span>
                            <span>{t("companyNote")}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && isCompanyWithTax && (
              <div className="space-y-5">
                {/* Step Banner */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{t("billingAddress")}</h3>
                    <p className="text-xs text-gray-500">{t("billingInfoDesc")}</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <div>
                    <Input
                      type="text"
                      labelPlacement="outside"
                      label={t("street")}
                      placeholder={t("street")}
                      value={data.billingAddress.street}
                      onValueChange={(val) =>
                        handleBillingAddressChange("street", val)
                      }
                      disabled={loading}
                      classNames={{
                        label: "text-xs font-semibold text-gray-700",
                        inputWrapper:
                          "h-11 border border-gray-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl bg-white hover:border-gray-400 transition-all shadow-sm",
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="text"
                      labelPlacement="outside"
                      label={t("city")}
                      placeholder={t("city")}
                      value={data.billingAddress.city}
                      onValueChange={(val) =>
                        handleBillingAddressChange("city", val)
                      }
                      disabled={loading}
                      classNames={{
                        label: "text-xs font-semibold text-gray-700",
                        inputWrapper:
                          "h-11 border border-gray-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl bg-white hover:border-gray-400 transition-all shadow-sm",
                      }}
                    />
                    <Input
                      type="text"
                      labelPlacement="outside"
                      label={t("district")}
                      placeholder={t("district")}
                      value={data.billingAddress.district}
                      onValueChange={(val) =>
                        handleBillingAddressChange("district", val)
                      }
                      disabled={loading}
                      classNames={{
                        label: "text-xs font-semibold text-gray-700",
                        inputWrapper:
                          "h-11 border border-gray-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl bg-white hover:border-gray-400 transition-all shadow-sm",
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="text"
                      labelPlacement="outside"
                      label={t("postalCode")}
                      placeholder={t("postalCode")}
                      value={data.billingAddress.postalCode}
                      onValueChange={(val) =>
                        handleBillingAddressChange("postalCode", val)
                      }
                      disabled={loading}
                      classNames={{
                        label: "text-xs font-semibold text-gray-700",
                        inputWrapper:
                          "h-11 border border-gray-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl bg-white hover:border-gray-400 transition-all shadow-sm",
                      }}
                    />
                    <Input
                      type="text"
                      labelPlacement="outside"
                      label={t("buildingNumber")}
                      placeholder={t("buildingNumber")}
                      value={data.billingAddress.buildingNumber}
                      onValueChange={(val) =>
                        handleBillingAddressChange("buildingNumber", val)
                      }
                      disabled={loading}
                      classNames={{
                        label: "text-xs font-semibold text-gray-700",
                        inputWrapper:
                          "h-11 border border-gray-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl bg-white hover:border-gray-400 transition-all shadow-sm",
                      }}
                    />
                  </div>

                  <div>
                    <Input
                      type="text"
                      labelPlacement="outside"
                      label={t("country")}
                      value={t("saudiArabia")}
                      disabled={true}
                      classNames={{
                        label: "text-xs font-semibold text-gray-700",
                        inputWrapper:
                          "h-11 border border-gray-200 bg-gray-100/80 cursor-not-allowed rounded-xl",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </ModalBody>

          {/* Footer */}
          <ModalFooter className="bg-white p-4 sm:p-5 border-t border-gray-100 flex-shrink-0 shadow-lg">
            <div className="flex justify-between items-center w-full gap-3">
              {step === 2 && !ibanAlreadySet ? (
                <Button
                  type="button"
                  variant="light"
                  onPress={handleBack}
                  disabled={loading}
                  className="border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl px-5 py-2.5 transition-all text-sm"
                >
                  {t("back")}
                </Button>
              ) : (
                <Button
                  type="button"
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  disabled={loading}
                  className="text-gray-500 hover:text-red-600 hover:bg-red-50 font-semibold rounded-xl px-5 py-2.5 transition-all text-sm"
                >
                  {t("cancel")}
                </Button>
              )}

              {step === 1 && totalSteps > 1 ? (
                <Button
                  type="button"
                  onPress={handleNext}
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl px-7 py-2.5 shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-sm flex items-center gap-2"
                >
                  <span>{t("next")}</span>
                  <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Button>
              ) : (
                <Button
                  type="submit"
                  isLoading={loading}
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold rounded-xl px-7 py-2.5 shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-sm flex items-center gap-2"
                >
                  {loading ? (
                    t("loading")
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{t("addData")}</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
