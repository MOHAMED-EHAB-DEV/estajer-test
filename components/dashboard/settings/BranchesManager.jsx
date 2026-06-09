"use client";
import { useState } from "react";
import { Input } from "@heroui/react";
import Button from "../../ui/Button";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import { FaTrash } from "@/components/ui/svgs/AdminIcons";
import ProductLocation from "../../addProduct/ProductLocation";
import { revalidateWithTag } from "@/actions/revalidateTag";

function FormInput({ ...props }) {
  return (
    <Input
      labelPlacement="outside"
      classNames={{
        mainWrapper: "mt-14",
        label: "text-lg -mt-2 flex items-center",
        base: "max-w-full !mt-0",
        input: "text-base",
        inputWrapper: "bg-gray-100 h-12",
      }}
      {...props}
    />
  );
}

export default function BranchesManager({ user, setUser, t, lang, translate }) {
  const Lang = lang === "ar" ? "ar" : "en";
  const Lang2 = lang === "ar" ? "en" : "ar";

  const emptyAddress = {
    country: "",
    governorate: "",
    city: "",
    neighborhood: "",
  };

  const [branchNameAr, setBranchNameAr] = useState("");
  const [branchNameEn, setBranchNameEn] = useState("");
  const [branchAddress, setBranchAddress] = useState(emptyAddress);
  const [branchLocation, setBranchLocation] = useState({});
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingBranch, setEditingBranch] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Function to get address in the other language
  const getAddressInOtherLang = async (location, targetLang) => {
    try {
      const response = await fetch(
        `/api/geocode/reverse?lat=${location.lat}&lng=${location.lng}&lang=${targetLang}`,
      );
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        const addressUpdates = {};
        const typeToField = {
          country: "country",
          administrative_area_level_1: "governorate",
          administrative_area_level_2: "city",
          locality: "city",
          neighborhood: "neighborhood",
          sublocality_level_1: "neighborhood",
          administrative_area_level_3: "neighborhood",
        };

        addressComponents?.forEach((component) => {
          const { types, long_name } = component;
          const componentType = types.find((type) => typeToField[type]);
          if (componentType) {
            const field = typeToField[componentType];
            if (!addressUpdates[field]) {
              addressUpdates[field] = long_name;
            }
          }
        });
        return { ...emptyAddress, ...addressUpdates };
      }
      return emptyAddress;
    } catch (error) {
      console.error("Error fetching address in other language:", error);
      return emptyAddress;
    }
  };

  const revalidateProducts = async () => {
    try {
      const res = await fetch(`/api/products?userId=${user._id}&fields=_id`);
      const data = await res.json();
      if (data.success) {
        await Promise.all(
          data.data.map((product) =>
            revalidateWithTag(`product-${product._id}`),
          ),
        );
      }
    } catch (error) {
      console.error("Error revalidating products:", error);
    }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    if (!branchNameAr.trim() || !branchNameEn.trim()) {
      toast.error(ToastMessage(t("branches.error")));
      return;
    }

    setLoading(true);
    try {
      // Get address in the other language
      const addressInOtherLang = branchLocation.lat
        ? await getAddressInOtherLang(branchLocation, Lang2)
        : emptyAddress;

      const response = await fetch(`/api/users/${user._id}/branches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: {
            ar: branchNameAr.trim(),
            en: branchNameEn.trim(),
          },
          address: {
            [Lang]: branchAddress,
            [Lang2]: addressInOtherLang,
          },
          location: branchLocation,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(ToastMessage(t("branches.addSuccess")));
        setUser(data.data);
        setBranchNameAr("");
        setBranchNameEn("");
        setBranchAddress(emptyAddress);
        setBranchLocation({});
        await revalidateProducts();
      } else {
        toast.error(ToastMessage(data.error || t("branches.error")));
      }
    } catch (error) {
      console.error("Error adding branch:", error);
      toast.error(ToastMessage(t("branches.error")));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBranch = async (branchId) => {
    if (!editingBranch?.name?.ar?.trim() || !editingBranch?.name?.en?.trim()) {
      toast.error(ToastMessage(t("branches.error")));
      return;
    }

    setUpdatingId(branchId);
    try {
      // Get address in the other language
      const addressInOtherLang = editingBranch.location?.lat
        ? await getAddressInOtherLang(editingBranch.location, Lang2)
        : emptyAddress;

      const response = await fetch(
        `/api/users/${user._id}/branches/${branchId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: {
              ar: editingBranch.name.ar.trim(),
              en: editingBranch.name.en.trim(),
            },
            address: {
              [Lang]: editingBranch.address || emptyAddress,
              [Lang2]: addressInOtherLang,
            },
            location: editingBranch.location || {},
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success(ToastMessage(t("branches.updateSuccess")));
        setUser(data.data);
        setEditingBranch(null);
        await revalidateProducts();
      } else {
        toast.error(ToastMessage(data.error || t("branches.error")));
      }
    } catch (error) {
      console.error("Error updating branch:", error);
      toast.error(ToastMessage(t("branches.error")));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteBranch = async (branchId) => {
    if (!confirm(t("branches.confirmDelete"))) return;

    setDeletingId(branchId);
    try {
      const response = await fetch(
        `/api/users/${user._id}/branches/${branchId}`,
        { method: "DELETE" },
      );

      const data = await response.json();

      if (data.success) {
        toast.success(ToastMessage(t("branches.deleteSuccess")));
        setUser(data.data);
        await revalidateProducts();
      } else {
        toast.error(ToastMessage(data.error || t("branches.error")));
      }
    } catch (error) {
      console.error("Error deleting branch:", error);
      toast.error(ToastMessage(t("branches.error")));
    } finally {
      setDeletingId(null);
    }
  };

  const copyBranchLink = (branchId) => {
    const link = `${window.location.origin}/${
      lang === "ar" ? "" : "en/"
    }profile/${user.pathName}/products?branch=${branchId}`;
    navigator.clipboard.writeText(link);
    toast.success(ToastMessage(t("branches.linkCopied")));
  };

  const startEditingBranch = (branch) => {
    setEditingBranch({
      _id: branch._id,
      name: {
        ar: branch.name?.ar || "",
        en: branch.name?.en || "",
      },
      address: branch.address?.[Lang] || emptyAddress,
      location: branch.location || {},
    });
  };

  const cancelEditing = () => {
    setEditingBranch(null);
  };

  if (!user.hasBranches) return null;

  return (
    <div className="md:p-10 p-6 bg-white rounded-lg mt-6">
      <h2 className="lg:text-[1.8rem] md:text-[1.6rem] text-[1.2rem] font-semibold text-darkNavy font-IBMPlex mb-1 mt-0">
        {t("branches.title")}
      </h2>

      {/* Add New Branch Form */}
      <form onSubmit={handleAddBranch}>
        <div className="flex flex-col md:flex-row md:gap-4 gap-1 w-full">
          <div className="w-full md:w-1/2">
            <FormInput
              label={`${t("branches.branchName")} (العربية)`}
              name="branchNameAr"
              value={branchNameAr}
              onChange={(e) => setBranchNameAr(e.target.value)}
              placeholder={t("branches.branchName")}
              isRequired={false}
            />
          </div>
          <div className="w-full md:w-1/2">
            <FormInput
              label={`${t("branches.branchName")} (English)`}
              name="branchNameEn"
              value={branchNameEn}
              onChange={(e) => setBranchNameEn(e.target.value)}
              placeholder={t("branches.branchName")}
              isRequired={false}
            />
          </div>
        </div>

        <div className="w-full mt-4">
          <div className="md:text-lg text-base mb-2">
            {t("branches.branchLocation")}
            <span className="text-sm text-gray-500 ms-2">
              (
              {lang === "ar"
                ? "سيتم جلب العنوان بالإنجليزية تلقائياً"
                : "Address in Arabic will be fetched automatically"}
              )
            </span>
          </div>
          <ProductLocation
            lang={Lang}
            address={branchAddress}
            setAddress={setBranchAddress}
            emptyLocation={emptyAddress}
            markerPosition={branchLocation}
            setMarkerPosition={setBranchLocation}
            translate={translate}
          />
        </div>

        <div className="text-end mt-8">
          <Button
            isLoading={loading}
            type="submit"
            className="py-6 min-w-40 text-lg font-IBMPlex"
          >
            {t("branches.addBranch")}
          </Button>
        </div>
      </form>

      {/* Branches List */}
      {user.branches && user.branches.length > 0 ? (
        <div className="space-y-6 mt-10">
          {user.branches.map((branch) => (
            <div
              key={branch._id}
              className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              {editingBranch && editingBranch._id === branch._id ? (
                // Edit Mode
                <div>
                  <div className="flex flex-col md:flex-row md:gap-4 gap-1 w-full mb-4">
                    <div className="w-full md:w-1/2">
                      <FormInput
                        label={`${t("branches.branchName")} (العربية)`}
                        name="editBranchNameAr"
                        value={editingBranch.name.ar}
                        onChange={(e) =>
                          setEditingBranch({
                            ...editingBranch,
                            name: { ...editingBranch.name, ar: e.target.value },
                          })
                        }
                        placeholder={t("branches.branchName")}
                        isRequired={false}
                      />
                    </div>
                    <div className="w-full md:w-1/2">
                      <FormInput
                        label={`${t("branches.branchName")} (English)`}
                        name="editBranchNameEn"
                        value={editingBranch.name.en}
                        onChange={(e) =>
                          setEditingBranch({
                            ...editingBranch,
                            name: { ...editingBranch.name, en: e.target.value },
                          })
                        }
                        placeholder={t("branches.branchName")}
                        isRequired={false}
                      />
                    </div>
                  </div>

                  <div className="w-full mt-4">
                    <div className="md:text-lg text-base mb-2">
                      {t("branches.branchLocation")}
                      <span className="text-sm text-gray-500 ms-2">
                        (
                        {lang === "ar"
                          ? "سيتم جلب العنوان بالإنجليزية تلقائياً"
                          : "Address in Arabic will be fetched automatically"}
                        )
                      </span>
                    </div>
                    <ProductLocation
                      lang={Lang}
                      address={editingBranch.address}
                      setAddress={(address) =>
                        setEditingBranch({ ...editingBranch, address })
                      }
                      emptyLocation={emptyAddress}
                      markerPosition={editingBranch.location}
                      setMarkerPosition={(location) =>
                        setEditingBranch({ ...editingBranch, location })
                      }
                      translate={translate}
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-6 justify-end">
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                      type="button"
                    >
                      {t("branches.cancel")}
                    </button>
                    <Button
                      onClick={() => handleUpdateBranch(branch._id)}
                      isLoading={updatingId === branch._id}
                      className="px-4 py-2"
                      type="button"
                    >
                      {t("branches.save")}
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-lg">
                          {branch.name?.[lang] ||
                            branch.name?.ar ||
                            branch.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(branch.createdAt).toLocaleDateString("ar")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditingBranch(branch)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t("branches.edit")}
                        type="button"
                      >
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => copyBranchLink(branch._id)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title={t("branches.copyLink")}
                        type="button"
                      >
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="9"
                            y="9"
                            width="13"
                            height="13"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteBranch(branch._id)}
                        disabled={deletingId === branch._id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title={t("branches.delete")}
                        type="button"
                      >
                        {deletingId === branch._id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Display branch address and location if available */}
                  {(branch.address?.ar || branch.address?.en) && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        {t("branches.address")}:
                      </div>
                      <div className="space-y-2">
                        {branch.address?.ar && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">العربية:</span>{" "}
                            {[
                              branch.address.ar.neighborhood,
                              branch.address.ar.city,
                              branch.address.ar.governorate,
                              branch.address.ar.country,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        )}
                        {branch.address?.en && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">English:</span>{" "}
                            {[
                              branch.address.en.neighborhood,
                              branch.address.en.city,
                              branch.address.en.governorate,
                              branch.address.en.country,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        )}
                      </div>
                      {branch.location?.lat && branch.location?.lng && (
                        <div className="text-xs text-gray-500 mt-2">
                          {t("branches.coordinates")}:{" "}
                          {branch.location.lat.toFixed(6)},{" "}
                          {branch.location.lng.toFixed(6)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 mt-6">
          {t("branches.noBranches")}
        </div>
      )}
    </div>
  );
}
