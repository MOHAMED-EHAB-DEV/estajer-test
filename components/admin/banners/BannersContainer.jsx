"use client";
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import Button from "@/components/ui/Button";
import { Add } from "@/components/ui/svgs/icons/AddSvg";
import BannerModal from "./BannerModal";
import TableBanners from "./TableBanners";
import { useTranslations } from "@/hooks/useTranslations";
import revalidate from "@/actions/revalidateTag";

export default function BannersContainer({ translate, lang }) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`admin.banners.${text}`);

  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerData, setBannerData] = useState({
    altAr: "",
    altEn: "",
    link: "",
    order: 0,
    active: true,
    nana: false,
    place: "home",
    categoryId: "",
    userId: "",
  });
  const [bannerImage, setBannerImage] = useState([]);
  const [bannerImageEn, setBannerImageEn] = useState([]);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/home-banners?all=true");
      const data = await res.json();
      if (data.success) {
        setBanners(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch banners:", error);
      toast.error(ToastMessage("خطأ في جلب البيانات"));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories?all=true");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
    fetchCategories();
  }, [fetchBanners, fetchCategories]);

  const resetForm = () => {
    setBannerData({
      altAr: "",
      altEn: "",
      link: "",
      order: 0,
      active: true,
      nana: false,
      place: "home",
      categoryId: "",
      userId: "",
    });
    setBannerImage([]);
    setBannerImageEn([]);
    setEditingBanner(null);
  };

  const handleCreate = async () => {
    try {
      if (bannerImage.length === 0)
        return toast.error(ToastMessage("الصورة العربية مطلوبة"));
      if (bannerImageEn.length === 0)
        return toast.error(ToastMessage("الصورة الإنجليزية مطلوبة"));

      const sanitizedLink = bannerData.link
        .replace("https://estajer.com", "")
        .replace("/en/", "/");

      const payload = {
        ...bannerData,
        link: sanitizedLink,
        image: bannerImage[0].preview,
        imageEn: bannerImageEn[0].preview,
        categoryId: bannerData.categoryId || null,
        userId: bannerData.userId || null,
      };

      const res = await fetch("/api/home-banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(ToastMessage("تمت الإضافة بنجاح"));
        setShowModal(false);
        resetForm();
        fetchBanners();
        await revalidate("/");
      } else {
        toast.error(ToastMessage(data.error || "فشل في الإضافة"));
      }
    } catch (error) {
      console.error(error);
      toast.error(ToastMessage("حدث خطأ"));
    }
  };

  const handleUpdate = async () => {
    try {
      const sanitizedLink = bannerData.link
        .replace("https://estajer.com", "")
        .replace("/en/", "/");

      const payload = {
        ...bannerData,
        link: sanitizedLink,
        image: bannerImage[0]?.preview || editingBanner.image,
        imageEn: bannerImageEn[0]?.preview || editingBanner.imageEn,
        categoryId: bannerData.categoryId || null,
        userId: bannerData.userId || null,
      };

      const res = await fetch(`/api/home-banners/${editingBanner._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(ToastMessage("تم التحديث بنجاح"));
        setShowModal(false);
        resetForm();
        fetchBanners();
        await revalidate("/");
      } else {
        toast.error(ToastMessage(data.error || "فشل في التحديث"));
      }
    } catch (error) {
      console.error(error);
      toast.error(ToastMessage("حدث خطأ"));
    }
  };

  const handleDelete = async (ids) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      const res = await fetch("/api/home-banners", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(ToastMessage("تم الحذف بنجاح"));
        fetchBanners();
        await revalidate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error(ToastMessage("حدث خطأ"));
    }
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setBannerData({
      altAr: banner.altAr,
      altEn: banner.altEn,
      link: banner.link,
      order: banner.order,
      active: banner.active,
      nana: banner.nana ?? false,
      place: banner.place || "home",
      categoryId: banner.categoryId || "",
      userId: banner.userId || "",
    });
    setBannerImage([{ preview: banner.image }]);
    setBannerImageEn(banner.imageEn ? [{ preview: banner.imageEn }] : []);
    setShowModal(true);
  };

  // Mock translations if they don't exist
  const bannerTranslations = {
    addTitle: "إضافة بانر جديد",
    editTitle: "تعديل البانر",
    altAr: "النص البديل (عربي)",
    altArPlaceholder: "أدخل النص البديل بالعربية",
    altEn: "النص البديل (إنجليزي)",
    altEnPlaceholder: "أدخل النص البديل بالإنجليزية",
    link: "الرابط",
    linkPlaceholder: "أدخل رابط البانر",
    order: "الترتيب",
    orderPlaceholder: "0",
    active: "نشط",
    nana: "نعناع",
    image: "الصورة (عربي)",
    imageEn: "الصورة (إنجليزي)",
    add: "إضافة",
    update: "تحديث",
    cancel: "إلغاء",
    mainCategoryId: "التصنيف الرئيسي",
    mainCategoryPlaceholder: "اختر التصنيف الرئيسي",
    subCategoryId: "التصنيف الفرعي",
    subCategoryPlaceholder: "اختر التصنيف الفرعي (اختياري)",
    profile: "الملف الشخصي",
    userSelection: "اختيار المستخدم",
    userPlaceholder: "ابحث عن مستخدم بالاسم أو الإيميل أو الهاتف",
  };

  const modalT = (key) => bannerTranslations[key] || t(key);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-darkNavy">
          إدارة بانرات الصفحة الرئيسية
        </h1>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="py-4 px-8 text-darkNavy font-IBMPlex bg-primary font-semibold text-lg flex items-center justify-center gap-2"
        >
          <Add color="#0D092B" />
          إضافة بانر جديد
        </Button>
      </div>

      <TableBanners
        banners={banners}
        loading={loading}
        onEdit={openEditModal}
        onDelete={handleDelete}
        translate={trans}
      />

      <BannerModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        t={modalT}
        translate={translate}
        data={bannerData}
        setData={setBannerData}
        images={bannerImage}
        setImages={setBannerImage}
        imagesEn={bannerImageEn}
        setImagesEn={setBannerImageEn}
        ModalIcon={Add}
        isEditing={!!editingBanner}
        onSubmit={editingBanner ? handleUpdate : handleCreate}
        categories={categories}
      />
    </div>
  );
}
