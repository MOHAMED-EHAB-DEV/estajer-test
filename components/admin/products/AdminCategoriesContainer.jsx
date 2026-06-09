"use client";
import { useTranslations } from "@/hooks/useTranslations";
import { useState, useCallback } from "react";
import FilterOptions from "../orders/FilterOptions";
import Button from "@/components/ui/Button";
import { Add } from "@/components/ui/svgs/icons/AddSvg";
import { Category } from "@/components/ui/svgs/icons/CategorySvg";
import TableCategories from "./TableCategories";
import AddModal from "../AddModal";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";

const AdminCategoriesContainer = ({
  translate,
  initialCategories = [],
  initialMainCategories = [],
}) => {
  const trans = useTranslations(translate);
  const t = (text) => trans(`admin.products.categories.${text}`);

  const [status, setStatus] = useState("all");
  const [dateCreated, setDateCreated] = useState("all");
  const [partner, setPartner] = useState("all");
  const [search, setSearch] = useState("");
  const [showAddCategoryModel, setShowAddCategoryModel] = useState(false);
  const [categories, setCategories] = useState(initialCategories);
  const [mainCategories, setMainCategories] = useState(initialMainCategories);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryData, setCategoryData] = useState({
    nameAr: "",
    nameEn: "",
    key: "",
    status: "active",
    categoryType: "main",
    order: 0,
    hideFromHome: false,
    nana: false,
    seoTitleAr: "",
    seoTitleEn: "",
    seoDescriptionAr: "",
    seoDescriptionEn: "",
    seoKeywordsAr: "",
    seoKeywordsEn: "",
    richContentAr: "",
    richContentEn: "",
  });
  const [categoryImage, setCategoryImage] = useState([]);

  // Fetch categories from API (for refresh after CRUD operations)
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        mainOnly: "true",
        includeSubcategories: "true",
        includeProductCount: "true",
        includeSubcategoryCount: "true",
        ...(status !== "all" && { status }),
        ...(partner === "nana" && { nana: "true" }),
        ...(partner === "estajer" && { nana: "false" }),
      });

      const res = await fetch(`/api/categories?${queryParams}`, {});

      const data = await res.json();
      if (data.success) {
        // Transform data for TableCategories
        const transformedCategories = data.data.map((cat) => ({
          _id: cat._id,
          image: cat.image,
          nameAr: cat.nameAr,
          nameEn: cat.nameEn,
          key: cat.key,
          order: cat.order,
          userCreated: cat.createdBy?.fullName || "غير معروف",
          productsCount: cat.productsCount || 0,
          visits: cat.visits || 0,
          createdAt: new Date(cat.createdAt),
          updatedAt: new Date(cat.updatedAt),
          status: cat.status,
          subcategories:
            cat.subcategories?.map((sub) => ({
              _id: sub._id,
              nameAr: sub.nameAr,
              nameEn: sub.nameEn,
              key: sub.key,
              count: sub.productsCount || 0,
              status: sub.status,
              hideFromHome: sub.hideFromHome || false,
              nana: sub.nana || false,
              order: sub.order || 0,
              seoTitleAr: sub.seoTitleAr || "",
              seoTitleEn: sub.seoTitleEn || "",
              seoDescriptionAr: sub.seoDescriptionAr || "",
              seoDescriptionEn: sub.seoDescriptionEn || "",
              seoKeywordsAr: sub.seoKeywordsAr || "",
              seoKeywordsEn: sub.seoKeywordsEn || "",
              richContentAr: sub.richContentAr || "",
              richContentEn: sub.richContentEn || "",
              image: sub.image,
            })) || [],
          hideFromHome: cat.hideFromHome || false,
          nana: cat.nana || false,
          seoTitleAr: cat.seoTitleAr || "",
          seoTitleEn: cat.seoTitleEn || "",
          seoDescriptionAr: cat.seoDescriptionAr || "",
          seoDescriptionEn: cat.seoDescriptionEn || "",
          seoKeywordsAr: cat.seoKeywordsAr || "",
          seoKeywordsEn: cat.seoKeywordsEn || "",
          richContentAr: cat.richContentAr || "",
          richContentEn: cat.richContentEn || "",
        }));
        setCategories(transformedCategories);
        setMainCategories(
          data.data.map((cat) => ({
            _id: cat._id,
            nameAr: cat.nameAr,
            nameEn: cat.nameEn,
            image: cat.image,
            key: cat.key,
            order: cat.order,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error(ToastMessage(t("fetchError")));
    } finally {
      setLoading(false);
    }
  }, [status, partner, t]);

  // Create category
  const onCreateCategory = async () => {
    try {
      if (!categoryData.nameAr || !categoryData.nameEn) {
        toast.error(ToastMessage(t("modal.nameRequired")));
        return;
      }

      if (!categoryData.key) {
        toast.error(ToastMessage(t("modal.keyRequired")));
        return;
      }

      const isMainCategory = categoryData.categoryType === "main";

      // Main categories require an image
      if (isMainCategory && categoryImage.length === 0) {
        toast.error(ToastMessage(t("modal.imageRequired")));
        return;
      }

      const payload = {
        nameAr: categoryData.nameAr,
        nameEn: categoryData.nameEn,
        key: categoryData.key,
        status: categoryData.status,
        parentCategory: isMainCategory ? null : categoryData.categoryType,
        image: categoryImage[0]?.preview || null,
        order: categoryData.order ?? 0,
        hideFromHome: categoryData.hideFromHome || false,
        nana: categoryData.nana || false,
        seoTitleAr: categoryData.seoTitleAr,
        seoTitleEn: categoryData.seoTitleEn,
        seoDescriptionAr: categoryData.seoDescriptionAr,
        seoDescriptionEn: categoryData.seoDescriptionEn,
        seoKeywordsAr: categoryData.seoKeywordsAr,
        seoKeywordsEn: categoryData.seoKeywordsEn,
        richContentAr: categoryData.richContentAr,
        richContentEn: categoryData.richContentEn,
      };

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(ToastMessage(t("modal.createSuccess")));
        setShowAddCategoryModel(false);
        resetForm();
        fetchCategories();
        await revalidate("/");
        await revalidateWithTag("categories");
      } else {
        toast.error(data.error || ToastMessage(t("modal.createError")));
      }
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error(ToastMessage(t("modal.createError")));
    }
  };

  // Edit category
  const onEditCategory = async () => {
    try {
      if (!editingCategory) return;

      const isMainCategory = categoryData.categoryType === "main";
      const payload = {
        nameAr: categoryData.nameAr,
        nameEn: categoryData.nameEn,
        key: categoryData.key,
        status: categoryData.status,
        parentCategory: isMainCategory ? null : categoryData.categoryType,
        image: categoryImage[0]?.preview || null,
        order: categoryData.order ?? 0,
        hideFromHome: categoryData.hideFromHome || false,
        nana: categoryData.nana || false,
        seoTitleAr: categoryData.seoTitleAr,
        seoTitleEn: categoryData.seoTitleEn,
        seoDescriptionAr: categoryData.seoDescriptionAr,
        seoDescriptionEn: categoryData.seoDescriptionEn,
        seoKeywordsAr: categoryData.seoKeywordsAr,
        seoKeywordsEn: categoryData.seoKeywordsEn,
        richContentAr: categoryData.richContentAr,
        richContentEn: categoryData.richContentEn,
      };

      const res = await fetch(`/api/categories/${editingCategory._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(ToastMessage(t("modal.updateSuccess")));
        setShowAddCategoryModel(false);
        resetForm();
        fetchCategories();
        await revalidate("/");
        await revalidateWithTag("categories");
      } else {
        toast.error(data.error || ToastMessage(t("modal.updateError")));
      }
    } catch (error) {
      console.error("Failed to update category:", error);
      toast.error(ToastMessage(t("modal.updateError")));
    }
  };

  // Delete categories
  const onDeleteCategories = async (ids) => {
    try {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(ToastMessage(t("deleteSuccess")));
        fetchCategories();
        await revalidate("/");
        await revalidateWithTag("categories");
      } else {
        toast.error(data.error || ToastMessage(t("deleteError")));
      }
    } catch (error) {
      console.error("Failed to delete categories:", error);
      toast.error(ToastMessage(t("deleteError")));
    }
  };

  // Delete a single category (subcategory)
  const onDeleteSingleCategory = async (id) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data.success) {
        toast.success(ToastMessage(t("deleteSuccess")));
        fetchCategories();
        await revalidate("/");
        await revalidateWithTag("categories");
      } else {
        toast.error(data.error || ToastMessage(t("deleteError")));
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error(ToastMessage(t("deleteError")));
    }
  };

  // Handle edit button click
  const handleEdit = (category, isSubcategory = false, parentId = null) => {
    setEditingCategory(category);
    setCategoryData({
      nameAr: category.nameAr,
      nameEn: category.nameEn,
      key: category.key,
      status: category.status,
      categoryType: isSubcategory ? parentId : "main",
      order: category.order ?? 0,
      hideFromHome: category.hideFromHome || false,
      nana: category.nana || false,
      seoTitleAr: category.seoTitleAr || "",
      seoTitleEn: category.seoTitleEn || "",
      seoDescriptionAr: category.seoDescriptionAr || "",
      seoDescriptionEn: category.seoDescriptionEn || "",
      seoKeywordsAr: category.seoKeywordsAr || "",
      seoKeywordsEn: category.seoKeywordsEn || "",
      richContentAr: category.richContentAr || "",
      richContentEn: category.richContentEn || "",
    });
    if (category.image) {
      setCategoryImage([{ preview: category.image }]);
    } else {
      setCategoryImage([]);
    }
    setShowAddCategoryModel(true);
  };

  // Reset form
  const resetForm = () => {
    setCategoryData({
      nameAr: "",
      nameEn: "",
      key: "",
      status: "active",
      categoryType: "main",
      order: 0,
      hideFromHome: false,
      nana: false,
      seoTitleAr: "",
      seoTitleEn: "",
      seoDescriptionAr: "",
      seoDescriptionEn: "",
      seoKeywordsAr: "",
      seoKeywordsEn: "",
      richContentAr: "",
      richContentEn: "",
    });
    setCategoryImage([]);
    setEditingCategory(null);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowAddCategoryModel(false);
    resetForm();
  };

  // Filter categories based on search, status, and partner
  const filteredCategories = categories.filter((cat) => {
    // Filter by partner
    if (partner === "nana" && !cat.nana) return false;
    if (partner === "estajer" && cat.nana) return false;
    // Filter by status
    if (status !== "all" && cat.status !== status) return false;
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        cat.nameAr.toLowerCase().includes(searchLower) ||
        cat.nameEn.toLowerCase().includes(searchLower) ||
        cat.key.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    return true;
  });

  return (
    <>
      <FilterOptions
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        statusOptions={[{ key: "all" }, { key: "active" }, { key: "inactive" }]}
        dateAdded={dateCreated}
        setDateAdded={setDateCreated}
        showDate={false}
        showDateAdded={true}
        translate={translate}
        showModal={showAddCategoryModel}
        setShowModal={setShowAddCategoryModel}
        modalTranslate={(text) => t(`modal.${text}`)}
        modalData={categoryData}
        setModalData={setCategoryData}
        modalImages={categoryImage}
        setModalImages={setCategoryImage}
        ModalIcon={Category}
        onModalSubmit={editingCategory ? onEditCategory : onCreateCategory}
        modalKey="categories"
        isModal={false}
        selectedPartner={partner}
        setSelectedPartner={setPartner}
      >
        <Button
          onClick={() => {
            resetForm();
            setShowAddCategoryModel(true);
          }}
          className="py-4 px-12 text-darkNavy font-IBMPlex bg-primary font-semibold text-lg flex items-center justify-center gap-2"
        >
          <Add color="#0D092B" />
          {t("addNewCategory")}
        </Button>
        <AddModal
          isOpen={showAddCategoryModel}
          onClose={handleModalClose}
          t={(text) => t(`modal.${text}`)}
          data={categoryData}
          setData={setCategoryData}
          images={categoryImage}
          setImages={setCategoryImage}
          ModalIcon={Category}
          modalKey="categories"
          translate={translate}
          onSubmit={editingCategory ? onEditCategory : onCreateCategory}
          mainCategories={mainCategories}
          isEditing={!!editingCategory}
        />
      </FilterOptions>
      <TableCategories
        categories={filteredCategories}
        translate={translate}
        loading={loading}
        onDelete={onDeleteCategories}
        onDeleteSingle={onDeleteSingleCategory}
        onEdit={handleEdit}
      />
    </>
  );
};

export default AdminCategoriesContainer;
