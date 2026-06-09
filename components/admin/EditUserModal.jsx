"use client";
import { useState, useEffect, useRef } from "react";
import {
  FaTimes,
  BsPerson,
  BsGear,
  BsCheck2,
  BsPencil,
  BsCamera,
} from "@/components/ui/svgs/AdminIcons";
import { toast } from "@/utils/toast";
import { useTranslations } from "@/hooks/useTranslations";
import ToastMessage from "../ui/ToastMessage";
import { formatNumber, validateNumber } from "@/utils/formatNumber";
import { Input } from "@heroui/react";
import ImagePreviewModal from "./ImagePreviewModal";
import NafathAuthModal from "@/components/checkout/NafathAuthModal";
import SupplierModal from "@/components/addProduct/SupplierModal";

function FormInput({ ...props }) {
  return (
    <Input
      labelPlacement="outside"
      classNames={{
        label: "text-base md:text-lg -mt-2 flex items-center",
        base: "max-w-full !mt-0",
        input: "text-sm md:text-base",
        inputWrapper: "md:h-12 h-10 !bg-white border-gray-200 border",
      }}
      {...props}
    />
  );
}

const EditUserModal = ({ user, onClose, onSuccess, translate }) => {
  const trans = useTranslations(translate);
  const t = (key) => trans(`admin.users.editModal.${key}`);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    pathName: "",
    bioAr: "",
    bioEn: "",
    accountType: "personal",
    isVerified: false,
    isRenter: false,
    isBanned: false,
    premium: false,
    hasBranches: false,
    companyDetails: {
      companyName: "",
      registerNumber: "",
      taxCode: "",
    },
    documentCode: "",
    iban: "",
    nationalId: "",
    commission: 15,
    skipIbanVerification: false,
  });
  const [loading, setLoading] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const fileInputRef = useRef(null);

  // IBAN management modal states
  const [nafathModalOpen, setNafathModalOpen] = useState(false);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);

  // Derived flags (from the live user prop, not formData, since iban/nafathVerified are read-only here)
  const isCompany = user?.accountType === "company";
  const isNafathVerified = isCompany || user?.nafathVerified;
  const hasIban = !!user?.iban;

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        pathName: user.pathName || "",
        bioAr: user.bioAr || "",
        bioEn: user.bioEn || "",
        accountType: user.accountType || "personal",
        isVerified: user.isVerified || false,
        isRenter: user.isRenter || false,
        isBanned: user.isBanned || false,
        premium: user.premium || false,
        hasBranches: user.hasBranches || false,
        companyDetails: {
          companyName: user.companyDetails?.companyName || "",
          registerNumber: user.companyDetails?.registerNumber || "",
          taxCode: user.companyDetails?.taxCode || "",
        },
        documentCode: user?.documentCode || "",
        iban: user.iban || "",
        nationalId: user.nationalId || "",
        commission: user.commission || 15,
        skipIbanVerification: user.skipIbanVerification || false,
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("companyDetails.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        companyDetails: { ...prev.companyDetails, [field]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phone: formatNumber(formData.phone),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(ToastMessage("User updated successfully"));
        onSuccess();
      } else toast.error(ToastMessage(data.error || "Failed to update user"));
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(ToastMessage("Failed to update user"));
    } finally {
      setLoading(false);
    }
  };

  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const img = new window.Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          let width = img.width;
          let height = img.height;
          const size = Math.min(width, height);
          const x = (width - size) / 2;
          const y = (height - size) / 2;
          canvas.width = 1000;
          canvas.height = 1000;
          ctx?.drawImage(img, x, y, size, size, 0, 0, 1000, 1000);
          resolve(canvas.toDataURL("image/webp"));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleAdminAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const loadingToast = await toast.loading("Processing image...");
    try {
      const resizedBase64 = await resizeImage(file);
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: resizedBase64 }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(ToastMessage("Avatar updated successfully"));
        onSuccess();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      toast.error(ToastMessage(err.message || "Error updating avatar"));
    } finally {
      toast.dismiss(loadingToast);
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative mx-auto w-full max-w-4xl shadow-2xl md:rounded-2xl rounded-xl bg-white max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white md:p-6 p-4 md:rounded-t-2xl rounded-t-xl border-b border-blue-500 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="md:w-10 md:h-10 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <BsPencil className="md:w-5 md:h-5 w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold">{t("title")}</h3>
                <p className="text-blue-100 text-xs md:text-sm">
                  Update user information and settings
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
            >
              <FaTimes className="md:w-5 md:h-5 w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="md:p-8 p-4">
          <form onSubmit={handleSubmit} className="md:space-y-8 space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAdminAvatarChange}
              accept="image/*"
              className="hidden"
            />
            {/* Current Avatar Section (Always Visible) */}
            <div className="bg-blue-50 rounded-xl md:p-6 p-4 border border-blue-200">
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => setFullScreenImage(user.avatar)}
                  >
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="md:w-20 md:h-20 w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                      <BsPencil className="text-white md:w-5 md:h-5 w-4 h-4" />
                    </div>
                    {loading && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-10">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm md:text-base">User Avatar</h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      Click image for full-screen, pencil to upload
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white md:px-4 md:py-2 px-3 py-1.5 md:text-sm text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <BsCamera className="md:w-4 md:h-4 w-3 h-3" />
                  Change Image
                </button>
              </div>
            </div>

            {/* Profile Image Moderation */}
            {(user.profileImageStatus === "rejected" ||
              user.reviewRequested) && (
              <div className="bg-red-50 rounded-xl md:p-6 p-4 border border-red-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="md:w-8 md:h-8 w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                    <BsGear className="md:w-4 md:h-4 w-3 h-3 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">
                      Profile Image Review
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      Review rejected profile images
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-4">
                  <div className="flex flex-col items-center">
                    <p className="font-semibold mb-2 text-xs md:text-sm">Current Avatar</p>
                    <div className="relative group">
                      <img
                        src={user.avatar}
                        alt="Current"
                        className="md:w-32 md:h-32 w-24 h-24 rounded-full object-cover border cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setFullScreenImage(user.avatar)}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-blue-600 text-white md:p-2 p-1.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                      >
                        <BsCamera className="md:w-4 md:h-4 w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {user.rejectedImage && (
                    <div className="flex flex-col items-center">
                      <p className="font-semibold mb-2 text-red-600 text-xs md:text-sm">
                        Rejected Image
                      </p>
                      <img
                        src={user.rejectedImage}
                        alt="Rejected"
                        className="md:w-32 md:h-32 w-24 h-24 rounded-full object-cover border border-red-500 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setFullScreenImage(user.rejectedImage)}
                      />
                      <p className="text-xs text-red-500 mt-2 text-center">
                        {user.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  {user.rejectedImage && (
                    <button
                      type="button"
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await fetch(`/api/users/${user._id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              avatar: user.rejectedImage,
                              profileImageStatus: "approved",
                              rejectedImage: null,
                              rejectionReason: null,
                              reviewRequested: false,
                            }),
                          });
                          toast.success(
                            ToastMessage("Image approved successfully"),
                          );
                          onSuccess();
                        } catch (e) {
                          toast.error(ToastMessage("Failed"));
                        }
                        setLoading(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                    >
                      Approve Rejected Image
                    </button>
                  )}
                  {user.reviewRequested && (
                    <button
                      type="button"
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await fetch(`/api/users/${user._id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              reviewRequested: false,
                            }),
                          });
                          toast.success(ToastMessage("Rejection confirmed"));
                          onSuccess();
                        } catch (e) {
                          toast.error(ToastMessage("Failed"));
                        }
                        setLoading(false);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
                    >
                      Confirm Rejection
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl md:p-6 p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="md:w-8 md:h-8 w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BsPerson className="md:w-4 md:h-4 w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    {t("personalInformation")}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {t("personalInfoDescription")}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    {t("fullName")} <span className="text-red-500">*</span>
                  </label>
                  <FormInput
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    isRequired
                    placeholder={t("enterFullName")}
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    {t("email")} <span className="text-red-500">*</span>
                  </label>
                  <FormInput
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    isRequired
                    placeholder={t("enterEmail")}
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    {t("phone")}
                  </label>
                  <FormInput
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    validate={(value) =>
                      !validateNumber(value) && t("invalidPhoneError")
                    }
                    onChange={handleInputChange}
                    placeholder={t("enterPhone")}
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    {t("username")}
                  </label>
                  <FormInput
                    type="text"
                    name="pathName"
                    value={formData.pathName}
                    onChange={handleInputChange}
                    placeholder={t("enterUsername")}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    {t("address")}
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm text-xs md:text-sm"
                    placeholder={t("enterAddress")}
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    {t("bioAr")}
                  </label>
                  <textarea
                    name="bioAr"
                    value={formData.bioAr}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm text-xs md:text-sm"
                    placeholder={t("enterBioAr")}
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    {t("bioEn")}
                  </label>
                  <textarea
                    name="bioEn"
                    value={formData.bioEn}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm text-xs md:text-sm"
                    placeholder={t("enterBioEn")}
                  />
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl md:p-6 p-4 border border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="md:w-8 md:h-8 w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                  <BsGear className="md:w-4 md:h-4 w-3 h-3 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    {t("accountSettings")}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {t("accountSettingsDescription")}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    {t("accountType")}
                  </label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleInputChange}
                    className="w-full md:px-4 md:py-1 px-3 py-0.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm text-xs md:text-sm"
                  >
                    <option value="personal">
                      {trans("admin.users.personal")}
                    </option>
                    <option value="company">
                      {trans("admin.users.company")}
                    </option>
                    <option value="admin">{trans("admin.users.admin")}</option>
                  </select>
                </div>

                {/* IBAN Management */}
                <div className="md:col-span-2">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-3">
                    {t("iban")}
                  </label>
                  <div className="space-y-3">
                    {/* Nafath Verification Status (only for personal accounts) */}
                    {!isCompany && (
                      <div
                        className={`flex items-center justify-between md:p-4 p-3 rounded-xl border-s-4 ${
                          isNafathVerified
                            ? "bg-green-50 border-green-500"
                            : "bg-red-50 border-red-400"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isNafathVerified ? (
                            <svg
                              className="md:w-5 md:h-5 w-4 h-4 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="md:w-5 md:h-5 w-4 h-4 text-red-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                          <div>
                            <p className="text-xs md:text-sm font-semibold text-gray-800">
                              Nafath Verification
                            </p>
                            <p className="text-[10px] md:text-xs text-gray-500">
                              {isNafathVerified
                                ? "Identity verified"
                                : "Not verified yet"}
                            </p>
                          </div>
                        </div>
                        {!isNafathVerified && (
                          <button
                            type="button"
                            onClick={() => setNafathModalOpen(true)}
                            className="md:px-4 md:py-2 px-3 py-1.5 bg-blue-600 text-white text-xs md:text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Verify Now
                          </button>
                        )}
                      </div>
                    )}

                    {/* IBAN Status */}
                    <div
                      className={`flex items-center justify-between md:p-4 p-3 rounded-xl border-s-4 ${
                        hasIban
                          ? "bg-green-50 border-green-500"
                          : "bg-amber-50 border-amber-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {hasIban ? (
                          <svg
                            className="md:w-5 md:h-5 w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="md:w-5 md:h-5 w-4 h-4 text-amber-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                        <div>
                          <p className="text-xs md:text-sm font-semibold text-gray-800">
                            Bank Account (IBAN)
                          </p>
                          <p className="text-[10px] md:text-xs text-gray-500">
                            {hasIban ? `${user?.iban}` : "No IBAN added yet"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!isCompany && !isNafathVerified) {
                            toast.error(
                              ToastMessage(
                                "User must complete Nafath verification first",
                              ),
                            );
                            return;
                          }
                          setSupplierModalOpen(true);
                        }}
                        className={`md:px-4 md:py-2 px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg transition-colors ${
                          isCompany || isNafathVerified
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {hasIban ? "Update IBAN" : "Add IBAN"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    {t("nationalId")}
                  </label>
                  <FormInput
                    type="text"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleInputChange}
                    placeholder={t("enterNationalId")}
                  />
                </div>

                {formData.accountType === "personal" && (
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                      {t("documentCode")}
                    </label>
                    <FormInput
                      type="text"
                      name="documentCode"
                      value={formData.documentCode}
                      onChange={handleInputChange}
                      placeholder={t("enterDocumentCode")}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Commission (%)
                  </label>
                  <FormInput
                    type="number"
                    name="commission"
                    value={formData.commission}
                    onChange={handleInputChange}
                    placeholder="Enter commission percentage"
                    min="0"
                    max="100"
                  />
                  <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                    Commission percentage for transactions (0-100%)
                  </p>
                </div>
              </div>
            </div>

            {/* Status Settings */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl md:p-6 p-4 border border-purple-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="md:w-8 md:h-8 w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BsGear className="md:w-4 md:h-4 w-3 h-3 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    {t("statusSettings")}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {t("statusSettingsDescription")}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 md:gap-6 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isVerified"
                      checked={formData.isVerified}
                      onChange={handleInputChange}
                      className="md:w-5 md:h-5 w-4 h-4 rounded border-2 border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">
                          ✓
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          {t("verifiedAccount")}
                        </span>
                        <p className="text-xs text-gray-500">
                          {t("verifiedDescription")}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isBanned"
                      checked={formData.isBanned}
                      onChange={handleInputChange}
                      className="md:w-5 md:h-5 w-4 h-4 rounded border-2 border-gray-300 text-red-600 focus:ring-red-500 focus:ring-2"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 text-xs font-bold">
                          ⛔
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          {t("bannedAccount")}
                        </span>
                        <p className="text-xs text-gray-500">
                          {t("bannedDescription")}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="premium"
                      checked={formData.premium}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded border-2 border-gray-300 text-yellow-600 focus:ring-yellow-500 focus:ring-2"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 text-xs font-bold">
                          ⭐
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          {t("premiumAccount")}
                        </span>
                        <p className="text-xs text-gray-500">
                          {t("premiumDescription")}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasBranches"
                      checked={formData.hasBranches}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-bold">
                          🏢
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          {t("hasBranches")}
                        </span>
                        <p className="text-xs text-gray-500">
                          {t("hasBranchesDescription")}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="skipIbanVerification"
                      checked={formData.skipIbanVerification}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded border-2 border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-2"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 text-xs font-bold">
                          💳
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          {t("skipIbanVerification")}
                        </span>
                        <p className="text-xs text-gray-500">
                          {t("skipIbanVerificationDescription")}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Company Details (if company account) */}
            {formData.accountType === "company" && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t("companyDetails")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("companyName")}
                    </label>
                    <FormInput
                      type="text"
                      name="companyDetails.companyName"
                      value={formData.companyDetails.companyName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("registerNumber")}
                    </label>
                    <FormInput
                      type="text"
                      name="companyDetails.registerNumber"
                      value={formData.companyDetails.registerNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("taxCode")}
                    </label>
                    <FormInput
                      type="text"
                      name="companyDetails.taxCode"
                      value={formData.companyDetails.taxCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-sm"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 border-2 border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t("updating")}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <BsCheck2 className="w-4 h-4" />
                    <span>{t("updateUser")}</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ImagePreviewModal
        previewImage={fullScreenImage}
        onClose={() => setFullScreenImage(null)}
      />

      {/* Nafath Modal for admin-initiated verification */}
      {!isCompany && (
        <NafathAuthModal
          isOpen={nafathModalOpen}
          onClose={() => setNafathModalOpen(false)}
          onSuccess={() => {
            toast.success(ToastMessage("Nafath verified successfully"));
            setNafathModalOpen(false);
            onSuccess();
          }}
          onError={(err) => toast.error(ToastMessage(err))}
          user={user}
          trans={trans}
        />
      )}

      {/* Supplier / IBAN Modal for admin */}
      <SupplierModal
        isOpen={supplierModalOpen}
        onClose={() => setSupplierModalOpen(false)}
        setUser={() => {
          onSuccess();
        }}
        user={user}
        translate={trans}
      />
    </div>
  );
};

export default EditUserModal;
