"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useTranslations } from "@/hooks/useTranslations";
import { toast } from "@/utils/toast";
import ToastMessage from "../../ui/ToastMessage";
import Button from "../../ui/Button";
import NafathAuthModal from "../../checkout/NafathAuthModal";
import SupplierModal from "../../addProduct/SupplierModal";
import UserLocation from "./UserLocation";

export default function RenterSettingsForm({ lang, translate }) {
  const { user, setUser } = useUser();
  const trans = useTranslations(translate);
  const t = (text) => trans(`dashboard.renterSettings.${text}`);

  // Modal states
  const [nafathModalOpen, setNafathModalOpen] = useState(false);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Location state
  const [address, setAddress] = useState("");
  const [markerPosition, setMarkerPosition] = useState({});
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  useEffect(() => {
    if (user) {
      setAddress(user.address || "");
      setMarkerPosition(user.location || {});
    }
  }, [user]);

  // Check validation status
  const isCompany = user?.accountType === "company";
  const isNafathVerified = isCompany || user?.nafathVerified;
  const hasIban = user?.iban;
  const hasLocation = user?.location?.lat && user?.location?.lng;

  // Handle Nafath verification success
  const handleNafathSuccess = (data) => {
    setUser((prev) => ({ ...prev, nafathVerified: true }));
    toast.success(ToastMessage(t("nafathSuccess")));
    setNafathModalOpen(false);
  };

  // Handle Nafath verification error
  const handleNafathError = (error) => {
    toast.error(ToastMessage(error || t("nafathError")));
  };

  // Handle location update
  const handleLocationUpdate = async () => {
    if (!address || !markerPosition.lat || !markerPosition.lng) {
      toast.error(ToastMessage(t("locationRequired")));
      return;
    }

    setIsUpdatingLocation(true);
    try {
      const res = await fetch("/api/users/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          location: markerPosition,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || t("locationUpdateError"));

      setUser(result.data);
      toast.success(ToastMessage(t("locationUpdateSuccess")));
      setLocationModalOpen(false);
    } catch (err) {
      toast.error(ToastMessage(err.message));
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const getStatusIcon = (isValid) => {
    return isValid ? (
      <svg
        className="w-6 h-6 text-green-600"
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
        className="w-6 h-6 text-red-600"
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
    );
  };

  return (
    <div>
      <h1 className="lg:text-[1.8rem] md:text-[1.6rem] text-[1.2rem] font-semibold md:mb-6 mb-2">
        {t("title")}
      </h1>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Nafath Verification Card - Hidden for company accounts */}
        {!isCompany && (
          <div className="bg-white rounded-lg shadow-md p-6 border-s-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                {getStatusIcon(isNafathVerified)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t("nafathVerification")}
                  </h3>
                  <p className="text-gray-600">
                    {isNafathVerified
                      ? t("nafathVerified")
                      : t("nafathNotVerified")}
                  </p>
                </div>
              </div>
              {!isNafathVerified && (
                <Button
                  onClick={() => setNafathModalOpen(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  {t("verifyNow")}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* IBAN Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-s-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {getStatusIcon(hasIban)}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("bankAccount")}
                </h3>
                <p className="text-gray-600">
                  {hasIban ? t("ibanAdded") : t("ibanNotAdded")}
                </p>
              </div>
            </div>
            {!hasIban && (
              <Button
                onClick={() => {
                  if (!isCompany && !isNafathVerified) {
                    toast.error(ToastMessage(t("nafathRequiredForIban")));
                    return;
                  }
                  setSupplierModalOpen(true);
                }}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  isCompany || isNafathVerified
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {t("addIban")}
              </Button>
            )}
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-s-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {getStatusIcon(hasLocation)}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("location")}
                </h3>
                <p className="text-gray-600">
                  {hasLocation ? t("locationAdded") : t("locationNotAdded")}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setLocationModalOpen(true)}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
            >
              {hasLocation ? t("updateLocation") : t("addLocation")}
            </Button>
          </div>
        </div>

        {/* Overall Status */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("overallStatus")}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>{t("completionRate")}</span>
              <span className="font-semibold">
                {Math.round(
                  isCompany
                    ? (((hasIban ? 1 : 0) + (hasLocation ? 1 : 0)) / 2) * 100
                    : (((isNafathVerified ? 1 : 0) +
                        (hasIban ? 1 : 0) +
                        (hasLocation ? 1 : 0)) /
                        3) *
                        100,
                )}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    isCompany
                      ? (((hasIban ? 1 : 0) + (hasLocation ? 1 : 0)) / 2) * 100
                      : (((isNafathVerified ? 1 : 0) +
                          (hasIban ? 1 : 0) +
                          (hasLocation ? 1 : 0)) /
                          3) *
                        100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {!isCompany && (
        <NafathAuthModal
          isOpen={nafathModalOpen}
          onClose={() => setNafathModalOpen(false)}
          onSuccess={handleNafathSuccess}
          onError={handleNafathError}
          user={user}
          trans={trans}
        />
      )}

      <SupplierModal
        isOpen={supplierModalOpen}
        onClose={() => setSupplierModalOpen(false)}
        setUser={setUser}
        user={user}
        translate={trans}
      />

      {/* Location Modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t("updateLocationTitle")}</h2>
              <button
                onClick={() => setLocationModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <UserLocation
              lang={lang}
              address={address}
              setAddress={setAddress}
              markerPosition={markerPosition}
              setMarkerPosition={setMarkerPosition}
              required={false}
              errorMessage=""
            />

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setLocationModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleLocationUpdate}
                disabled={isUpdatingLocation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdatingLocation ? "Saving..." : t("saveLocation")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
