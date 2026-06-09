"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import Button from "@/components/ui/Button";
import { Add } from "@/components/ui/svgs/icons/AddSvg";
import { Send } from "@/components/ui/svgs/icons/SendSvg";
import ImageUploader from "@/components/addProduct/ImageUploader";
import HeroSlider from "@/components/home/HeroSlider";
import { useTranslations } from "@/hooks/useTranslations";
import revalidate from "@/actions/revalidateTag";
import {
  Switch,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";

export default function HeroSliderContainer({
  translate,
  lang,
  initialSlides = [],
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans("heroSlider.admin." + key);
  const isRtl = lang === "ar";

  const [sliders, setSliders] = useState(initialSlides);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("images"); // "images" | "texts" | "position" | "cta"

  // Form State
  const [formData, setFormData] = useState({
    altAr: "",
    altEn: "",
    link: "",
    order: 0,
    active: true,
    titleAr: "",
    titleEn: "",
    subtitleAr: "",
    subtitleEn: "",
    buttonTextAr: "",
    buttonTextEn: "",
    textPosition: "start",
    textColor: "#ffffff",
    imagePositionX: "center",
    imagePositionY: "center",
  });

  const [imagesAr, setImagesAr] = useState([]);
  const [imagesEn, setImagesEn] = useState([]);

  // Fetch all sliders
  const fetchSliders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hero-slides?all=true");
      const data = await res.json();
      if (data.success) {
        setSliders(data.data.sort((a, b) => a.order - b.order));
      }
    } catch (error) {
      console.error("Failed to fetch sliders:", error);
      toast.error(ToastMessage(t("fetchError")));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (initialSlides && initialSlides.length > 0) {
      setSliders(initialSlides);
    }
  }, [initialSlides]);

  // Construct draft slide for live preview
  const draftSlide = useMemo(() => {
    const imgAr = imagesAr[0]?.preview || "";
    const imgEn = imagesEn[0]?.preview || "";
    return {
      _id: editingId || "draft-slide-id",
      image:
        imgAr ||
        "https://assets.estajer.com/estajer/images/cover_tl93ps?w=1600&q=85",
      imageEn:
        imgEn ||
        imgAr ||
        "https://assets.estajer.com/estajer/images/cover_tl93ps?w=1600&q=85",
      link: formData.link || "#",
      altAr: formData.altAr || "Draft Alt Text",
      altEn: formData.altEn || "Draft Alt Text",
      titleAr: formData.titleAr,
      titleEn: formData.titleEn,
      subtitleAr: formData.subtitleAr,
      subtitleEn: formData.subtitleEn,
      buttonTextAr: formData.buttonTextAr,
      buttonTextEn: formData.buttonTextEn,
      textPosition: formData.textPosition,
      textColor: formData.textColor,
      imagePositionX: formData.imagePositionX,
      imagePositionY: formData.imagePositionY,
      isDraft: true,
    };
  }, [formData, imagesAr, imagesEn, editingId]);

  // Combine saved slides and draft slide for live preview list
  const previewSlides = useMemo(() => {
    const draftImageExists =
      imagesAr.length > 0 ||
      formData.titleAr ||
      formData.titleEn ||
      formData.subtitleAr ||
      formData.subtitleEn;
    if (!draftImageExists && sliders.length > 0) return sliders;

    if (editingId) {
      // Replace the one being edited with draft preview
      return sliders.map((slide) =>
        slide._id === editingId ? draftSlide : slide,
      );
    } else {
      // Append new draft preview
      return [...sliders, draftSlide];
    }
  }, [sliders, draftSlide, editingId, imagesAr, formData]);

  const resetForm = () => {
    setFormData({
      altAr: "",
      altEn: "",
      link: "",
      order: 0,
      active: true,
      titleAr: "",
      titleEn: "",
      subtitleAr: "",
      subtitleEn: "",
      buttonTextAr: "",
      buttonTextEn: "",
      textPosition: "start",
      textColor: "#ffffff",
      imagePositionX: "center",
      imagePositionY: "center",
    });
    setImagesAr([]);
    setImagesEn([]);
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setActiveTab("images");
    setIsModalOpen(true);
  };

  const handleOpenEditField = (fieldName) => {
    if (sliders.length > 0 && !editingId) {
      handleEdit(sliders[0]);
    }
    setActiveTab(fieldName);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (imagesAr.length === 0) {
      return toast.error(ToastMessage(t("arImageRequired")));
    }
    if (imagesEn.length === 0) {
      return toast.error(ToastMessage(t("enImageRequired")));
    }

    try {
      setActionLoading(true);
      const sanitizedLink = formData.link
        .replace("https://estajer.com", "")
        .replace("/en/", "/");

      const payload = {
        ...formData,
        link: sanitizedLink,
        image: imagesAr[0].preview,
        imageEn: imagesEn[0].preview,
      };

      const url = editingId
        ? `/api/hero-slides/${editingId}`
        : "/api/hero-slides";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          ToastMessage(editingId ? t("updateSuccess") : t("saveSuccess")),
        );
        setIsModalOpen(false);
        resetForm();
        fetchSliders();
        await revalidate("/");
      } else {
        toast.error(ToastMessage(data.error || t("saveError")));
      }
    } catch (err) {
      console.error(err);
      toast.error(ToastMessage(t("error")));
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (slide) => {
    setEditingId(slide._id);
    setFormData({
      altAr: slide.altAr,
      altEn: slide.altEn,
      link: slide.link,
      order: slide.order,
      active: slide.active,
      titleAr: slide.titleAr || "",
      titleEn: slide.titleEn || "",
      subtitleAr: slide.subtitleAr || "",
      subtitleEn: slide.subtitleEn || "",
      buttonTextAr: slide.buttonTextAr || "",
      buttonTextEn: slide.buttonTextEn || "",
      textPosition: slide.textPosition || "start",
      textColor: slide.textColor || "#ffffff",
      imagePositionX: slide.imagePositionX || "center",
      imagePositionY: slide.imagePositionY || "center",
    });
    setImagesAr([{ preview: slide.image }]);
    setImagesEn([{ preview: slide.imageEn }]);
    setActiveTab("images");
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      setLoading(true);
      const res = await fetch("/api/hero-slides", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(ToastMessage(t("deleteSuccess")));
        if (editingId === id) resetForm();
        fetchSliders();
        await revalidate("/");
      }
    } catch (err) {
      console.error(err);
      toast.error(ToastMessage(t("deleteError")));
    } finally {
      setLoading(false);
    }
  };

  const handleOrderChange = async (slide, direction) => {
    const index = sliders.findIndex((s) => s._id === slide._id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sliders.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const targetSlide = sliders[targetIndex];

    try {
      setLoading(true);
      const tempOrder = slide.order;

      const update1 = fetch(`/api/hero-slides/${slide._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...slide, order: targetSlide.order }),
      });

      const update2 = fetch(`/api/hero-slides/${targetSlide._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...targetSlide, order: tempOrder }),
      });

      await Promise.all([update1, update2]);
      fetchSliders();
      await revalidate("/");
    } catch (err) {
      console.error(err);
      toast.error(ToastMessage(t("orderError")));
    } finally {
      setLoading(false);
    }
  };

  const handleActiveToggle = async (slide) => {
    try {
      const updated = { ...slide, active: !slide.active };
      const res = await fetch(`/api/hero-slides/${slide._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        fetchSliders();
        await revalidate("/");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: "images", label: t("tabBackground") },
    { id: "texts", label: t("tabTexts") },
    { id: "position", label: t("tabAlignment") },
    { id: "cta", label: t("tabCta") },
  ];

  const xPositions = ["left", "center", "right"];
  const yPositions = ["top", "center", "bottom"];

  return (
    <div className="flex flex-col gap-10">
      {/* 1. Live Preview Section at the Top */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col gap-4">
        <div className="flex justify-between items-center px-2">
          <div>
            <h2 className="text-xl font-bold text-darkNavy font-IBMPlex">
              {t("editorTitle")}
            </h2>
            <p className="text-xs text-gray-400 mt-1">{t("editorTip")}</p>
          </div>
          {editingId && (
            <span className="px-4 py-1.5 bg-yellow-100 border border-yellow-200 text-yellow-800 text-sm font-semibold rounded-full animate-pulse">
              {t("activeEdit")}
            </span>
          )}
        </div>
        <div className="w-full rounded-2xl overflow-hidden shadow-inner border border-gray-100 relative group/slider">
          <HeroSlider
            banners={previewSlides}
            lang={lang}
            fallbackData={{
              titleAr: trans("heroSlider.mainTitle"),
              titleEn: trans("heroSlider.mainTitle"),
              subtitleAr: trans("heroSlider.subtitle"),
              subtitleEn: trans("heroSlider.subtitle"),
            }}
            isAdminMode={true}
            onEditField={handleOpenEditField}
            onEditImages={() => handleOpenEditField("images")}
            onEditPosition={() => handleOpenEditField("position")}
            translate={translate}
          />
        </div>
      </div>

      {/* 2. Slide List & Call-To-Action Button Section */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h3 className="text-xl font-bold text-darkNavy font-IBMPlex">
            {t("inventoryTitle")}
          </h3>
          <Button
            onClick={handleOpenAdd}
            className="py-3 px-6 font-IBMPlex bg-primary font-semibold text-base flex items-center justify-center gap-2 rounded-full shadow-md transition-all duration-300"
          >
            <Add color="currentColor" />
            {t("createNew")}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : sliders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">{t("noSlides")}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sliders.map((slide, idx) => (
              <div
                key={slide._id}
                className={`flex flex-col rounded-2xl border bg-white overflow-hidden transition-all duration-300 ${
                  editingId === slide._id
                    ? "border-primary shadow-lg ring-1 ring-primary/30"
                    : "border-gray-100 hover:border-gray-200 hover:shadow-md"
                }`}
              >
                {/* Visual Thumbnail */}
                <div className="relative aspect-[2/1] w-full bg-gray-50 border-b border-gray-100">
                  <img
                    src={slide.image}
                    alt={slide.altAr}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-2.5 start-2.5 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                    {t("order")}: {slide.order}
                  </div>
                  {!slide.active && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center text-white font-bold text-sm">
                      {t("inactive")}
                    </div>
                  )}
                </div>

                {/* Details Footer */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <h4 className="font-semibold text-sm text-darkNavy line-clamp-1">
                    {isRtl
                      ? slide.titleAr || slide.altAr
                      : slide.titleEn || slide.altEn}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-1">
                    {slide.link}
                  </p>

                  <div className="flex justify-between items-center mt-auto border-t border-gray-50 pt-3">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOrderChange(slide, "up")}
                        disabled={idx === 0}
                        className="p-1.5 rounded bg-gray-50 hover:bg-gray-100 disabled:opacity-40"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOrderChange(slide, "down")}
                        disabled={idx === sliders.length - 1}
                        className="p-1.5 rounded bg-gray-50 hover:bg-gray-100 disabled:opacity-40"
                      >
                        ▼
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <Switch
                        size="sm"
                        isSelected={slide.active}
                        onChange={() => handleActiveToggle(slide)}
                      />
                      <button
                        type="button"
                        onClick={() => handleEdit(slide)}
                        className="text-xs text-blue-500 hover:text-blue-700 hover:underline font-semibold"
                      >
                        {t("edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(slide._id)}
                        className="text-xs text-red-500 hover:text-red-700 hover:underline font-semibold"
                      >
                        {t("delete")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Universal Visual Settings Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        size="3xl"
        scrollBehavior="inside"
        backdrop="opaque"
        classNames={{
          backdrop: "bg-black/10 backdrop-blur-sm",
          base: "border-none bg-white rounded-3xl",
          header: "border-b border-gray-100 p-6 mx-2",
          closeButton:
            "absolute top-6 end-6 text-xl p-1 hover:bg-gray-100 rounded-full",
        }}
      >
        <ModalContent>
          <ModalHeader className="text-2xl font-bold font-IBMPlex text-darkNavy flex flex-col gap-2">
            <div>{editingId ? t("modalTitleEdit") : t("modalTitleNew")}</div>

            {/* Elegant Custom Tab Header */}
            <div className="flex border-b border-gray-100 mt-4 gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 border-b-2 font-semibold text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-400 hover:text-darkNavy"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </ModalHeader>

          <ModalBody className="py-6 px-8 flex flex-col gap-6 max-h-[60vh] overflow-y-auto">
            {/* Tab 1: Background Images */}
            {activeTab === "images" && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-darkNavy">
                      {t("labelBgAr")} <span className="text-red-500">*</span>
                    </label>
                    <ImageUploader
                      files={imagesAr}
                      setFiles={setImagesAr}
                      translate={translate}
                      sm={true}
                      isThumbnail={true}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-darkNavy">
                      {t("labelBgEn")} <span className="text-red-500">*</span>
                    </label>
                    <ImageUploader
                      files={imagesEn}
                      setFiles={setImagesEn}
                      translate={translate}
                      sm={true}
                      isThumbnail={true}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-50 pt-4 mt-2">
                  <Input
                    isRequired
                    label={t("labelAltAr")}
                    placeholder={t("placeholderAlt")}
                    value={formData.altAr}
                    onChange={(e) =>
                      setFormData({ ...formData, altAr: e.target.value })
                    }
                    labelPlacement="outside"
                  />
                  <Input
                    isRequired
                    label={t("labelAltEn")}
                    placeholder={t("placeholderAlt")}
                    value={formData.altEn}
                    onChange={(e) =>
                      setFormData({ ...formData, altEn: e.target.value })
                    }
                    labelPlacement="outside"
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Texts Content */}
            {activeTab === "texts" && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label={t("labelTitleAr")}
                    placeholder={t("placeholderTitle")}
                    value={formData.titleAr}
                    onChange={(e) =>
                      setFormData({ ...formData, titleAr: e.target.value })
                    }
                    labelPlacement="outside"
                  />
                  <Input
                    label={t("labelTitleEn")}
                    placeholder={t("placeholderTitle")}
                    value={formData.titleEn}
                    onChange={(e) =>
                      setFormData({ ...formData, titleEn: e.target.value })
                    }
                    labelPlacement="outside"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-50 pt-6">
                  <Input
                    label={t("labelSubAr")}
                    placeholder={t("placeholderSub")}
                    value={formData.subtitleAr}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitleAr: e.target.value })
                    }
                    labelPlacement="outside"
                  />
                  <Input
                    label={t("labelSubEn")}
                    placeholder={t("placeholderSub")}
                    value={formData.subtitleEn}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitleEn: e.target.value })
                    }
                    labelPlacement="outside"
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Alignment Controls */}
            {activeTab === "position" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* 3x3 Visual Focus Grid Alignment for Background Images */}
                <div className="flex flex-col items-center gap-3">
                  <label className="text-sm font-bold text-darkNavy self-start">
                    {t("labelAlignmentGrid")}
                  </label>
                  <div className="grid grid-cols-3 gap-2 w-44 h-44 bg-gray-100 p-2 rounded-2xl border border-gray-200">
                    {yPositions.map((y) =>
                      xPositions.map((x) => {
                        const isSelected =
                          formData.imagePositionX === x &&
                          formData.imagePositionY === y;
                        return (
                          <button
                            key={`${x}-${y}`}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                imagePositionX: x,
                                imagePositionY: y,
                              })
                            }
                            className={`w-full h-full rounded-xl transition-all duration-300 border flex items-center justify-center cursor-pointer ${
                              isSelected
                                ? "bg-primary border-primary text-white shadow-md scale-105"
                                : "bg-white border-gray-200 hover:bg-gray-50 text-gray-300"
                            }`}
                            title={`${x} ${y}`}
                          >
                            <div
                              className={`w-3 h-3 rounded-full ${isSelected ? "bg-white" : "bg-gray-300"}`}
                            />
                          </button>
                        );
                      }),
                    )}
                  </div>
                  <span className="text-xs text-gray-400 font-semibold mt-1">
                    {t("labelSelectedAlign")}: {formData.imagePositionX} -{" "}
                    {formData.imagePositionY}
                  </span>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Text alignment selector */}
                  <Select
                    label={t("labelTextPosition")}
                    selectedKeys={[formData.textPosition]}
                    onChange={(e) =>
                      setFormData({ ...formData, textPosition: e.target.value })
                    }
                    labelPlacement="outside"
                  >
                    <SelectItem key="start" value="start">
                      {t("alignStart")}
                    </SelectItem>
                    <SelectItem key="center" value="center">
                      {t("alignCenter")}
                    </SelectItem>
                    <SelectItem key="end" value="end">
                      {t("alignEnd")}
                    </SelectItem>
                  </Select>

                  {/* Text Color Input */}
                  <Input
                    label={t("labelTextColor")}
                    type="color"
                    value={formData.textColor}
                    onChange={(e) =>
                      setFormData({ ...formData, textColor: e.target.value })
                    }
                    labelPlacement="outside"
                    className="h-10"
                  />
                </div>
              </div>
            )}

            {/* Tab 4: CTA Button & Redirect Link */}
            {activeTab === "cta" && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label={t("labelCtaAr")}
                    placeholder={t("placeholderCta")}
                    value={formData.buttonTextAr}
                    onChange={(e) =>
                      setFormData({ ...formData, buttonTextAr: e.target.value })
                    }
                    labelPlacement="outside"
                  />
                  <Input
                    label={t("labelCtaEn")}
                    placeholder={t("placeholderCta")}
                    value={formData.buttonTextEn}
                    onChange={(e) =>
                      setFormData({ ...formData, buttonTextEn: e.target.value })
                    }
                    labelPlacement="outside"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-50 pt-6">
                  <div className="col-span-1 md:col-span-2">
                    <Input
                      label={t("labelRedirectLink")}
                      placeholder={t("placeholderRedirectLink")}
                      value={formData.link}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                      labelPlacement="outside"
                    />
                  </div>
                  <div>
                    <Input
                      label={t("labelSortOrder")}
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: parseInt(e.target.value) || 0,
                        })
                      }
                      labelPlacement="outside"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <Switch
                    isSelected={formData.active}
                    onValueChange={(val) =>
                      setFormData({ ...formData, active: val })
                    }
                    color="primary"
                  />
                  <span className="text-sm font-semibold text-darkNavy">
                    {t("labelActiveSlider")}
                  </span>
                </div>
              </div>
            )}
          </ModalBody>

          <ModalFooter className="border-t border-gray-100 p-6 flex justify-between">
            <Button
              color="transparent text-gray-400 hover:text-darkNavy font-semibold text-base"
              onPress={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              {t("btnCancel")}
            </Button>
            <Button
              onPress={handleSave}
              isLoading={actionLoading}
              className="bg-primary px-8 py-3.5 font-bold rounded-full flex items-center gap-2 shadow-lg"
            >
              {editingId ? t("btnSave") : t("btnCreate")}
              <Send size={18} />
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
