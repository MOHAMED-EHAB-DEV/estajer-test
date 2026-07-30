"use client";

import React from "react";
import {
  FaImage as ImageIcon,
  FaUpload,
  FaChevronRight,
} from "@/components/ui/svgs/AdminIcons";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { Autocomplete, AutocompleteItem } from "@/components/ui/Autocomplete";
import PlanGate from "@/components/premium/PlanGate";

export default function BasicInfoTab({
  formData,
  handleInputChange,
  handleImageUpload,
  t,
  isAdmin = false,
  isEditing = false,
  userSearchTerm,
  setUserSearchTerm,
  handleUserSelect,
  setAutocompleteOpen,
  loadingUsers,
  users,
  shop,
  onlyOwner = false,
  userPlan = null,
  lang = "ar",
  onUpgrade,
}) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-6">
      {/* Registration/Owner Section */}
      {isAdmin && (
        <div className="bg-gradient-to-br from-[#fef7f2] to-white p-5 rounded-2xl border border-primary/10 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1 px-1">
            <div className="w-1 h-4 rounded-full bg-primary" />
            <h4 className="text-[13px] font-bold text-primary uppercase tracking-wider">
              {t("owner")}
            </h4>
          </div>

          <div className="flex flex-col gap-1.5">
            <Autocomplete
              label={t("selectOwner")}
              aria-label={t("selectOwner")}
              placeholder={t("searchOwner")}
              inputValue={userSearchTerm}
              onInputChange={setUserSearchTerm}
              selectedKey={formData.owner}
              onSelectionChange={handleUserSelect}
              onOpenChange={setAutocompleteOpen}
              isLoading={loadingUsers}
              allowsCustomValue={false}
              menuTrigger="input"
              defaultFilter={() => true}
              isDisabled={isEditing}
              items={users}
              variant="flat"
              radius="lg"
              classNames={{
                base: "bg-white rounded-xl shadow-sm border border-neutral-200/60 overflow-hidden",
                listboxWrapper: "max-h-[250px]",
                popoverContent: "z-50 rounded-2xl border-neutral-200 shadow-xl p-1",
              }}
              clearButtonProps={{
                onPress: () => handleUserSelect(null),
              }}
            >
              {(user) => (
                <AutocompleteItem
                  textValue={user.fullName}
                  key={user._id}
                  value={user._id}
                >
                  <div className="flex flex-col gap-0.5 py-1">
                    <span className="font-bold text-darkNavy text-[13px]">
                      {user.fullName}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {user.email}
                    </span>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>
            <p className="text-[10px] text-neutral-400 px-1 italic">
              {t("ownerDesc") ||
                "Assign this profile to a specific user account"}
            </p>
          </div>
        </div>
      )}

      {!onlyOwner && (
        <>
          {/* Identity Card */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/60 flex flex-col gap-5 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-semibold text-darkNavy/80 px-1">
                    {t("nameAr")}
                  </label>
                  <input
                    name="nameAr"
                    value={formData.nameAr || ""}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/20 text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all shadow-sm shadow-black/[0.01]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-semibold text-darkNavy/80 px-1">
                    {t("nameEn")}
                  </label>
                  <input
                    name="nameEn"
                    value={formData.nameEn || ""}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/20 text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all shadow-sm shadow-black/[0.01]"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-semibold text-darkNavy/80 px-1">
                  {t("slug")}
                </label>
                <div className="relative group/slug">
                  <input
                    name="slug"
                    value={formData.slug || ""}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all pe-12"
                    required
                  />
                  <div className="absolute end-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white border border-neutral-100 px-2 py-1 rounded-lg text-[9px] font-bold text-primary shadow-sm">
                    AUTO
                  </div>
                </div>
              </div>

              {/* Custom Domain */}
              <div className="flex flex-col gap-1.5">
                <PlanGate
                  userPlan={isAdmin ? "growth" : userPlan}
                  lang={lang}
                  label="نطاق مخصص"
                  onUpgrade={onUpgrade}
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-semibold text-darkNavy/80 px-1">
                      {t("domain")}
                    </label>
                    <div className="relative group/domain">
                      <input
                        name="domain"
                        value={formData.domain || ""}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          const cleanedVal = rawValue
                            .trim()
                            .replace(/^(https?:\/\/)/i, "")
                            .split("/")[0];
                          e.target.value = cleanedVal;
                          handleInputChange(e);
                        }}
                        placeholder="example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all"
                        dir="ltr"
                      />
                    </div>
                    <p className="text-[10px] text-neutral-400 px-1 italic">
                      {t("domainHint")}
                    </p>
                  </div>
                </PlanGate>
              </div>
            </div>

            {/* Logo Uploader */}
            <div className="pt-2 border-t border-neutral-50 mt-1">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-neutral-200 relative overflow-hidden group/logo hover:border-primary/40 transition-all bg-neutral-50 flex items-center justify-center cursor-pointer shadow-sm">
                  {formData.logo ? (
                    <>
                      <Image
                        unoptimized
                        src={
                          formData.logo.startsWith("data:")
                            ? formData.logo
                            : anyImgUrl({
                                src: formData.logo,
                                size: 160,
                                quality: 90,
                              })
                        }
                        alt="logo"
                        fill
                        className="object-contain p-2 group-hover/logo:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                    </>
                  ) : (
                    <div className="text-neutral-300 group-hover/logo:text-primary transition-colors flex flex-col items-center gap-1">
                      <ImageIcon size={22} />
                      <span className="text-[8px] font-bold uppercase tracking-widest mt-0.5">
                        LOGO
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleImageUpload(e, "logo")}
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <p className="text-[12.5px] font-bold text-darkNavy/80 leading-tight">
                    {t("logoDesc")}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                    {t("logoHint")}
                  </p>
                  <button className="text-primary text-[11px] font-bold mt-2 flex items-center gap-1 hover:underline">
                    {t("chooseFile")} <FaChevronRight size={8} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
