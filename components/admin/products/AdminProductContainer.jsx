"use client";
import { useEffect, useState, useRef, useTransition, useMemo } from "react";
import dynamic from "next/dynamic";
import Product from "@/components/shared/Product";
import { useTranslations } from "@/hooks/useTranslations";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Checkbox,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";
import { useRouter } from "next/navigation";
import { GridView, TableView } from "@/components/ui/svgs/Admin";
import TableProducts from "./TableProducts";
import Link from "next/link";
import ProductFilters from "@/components/dashboard/ProductFilters";
import { useSearchParams } from "next/navigation";
import { Delete } from "@/components/ui/svgs/icons/DeleteSvg";
import { MoreVertical } from "@/components/ui/svgs/icons/MoreVerticalSvg";
import { EyeOff } from "@/components/ui/svgs/icons/EyeOffSvg";
import { Check } from "@/components/ui/svgs/icons/CheckSvg";
import { Add } from "@/components/ui/svgs/icons/AddSvg";
import { Minus } from "@/components/ui/svgs/icons/MinusSvg";
import { ChevronDown } from "@/components/ui/svgs/icons/ChevronDownSvg";
import { Plus } from "@/components/ui/svgs/icons/PlusSvg";
import { Edit } from "@/components/ui/svgs/icons/EditSvg";

const AdminBulkEditModal = dynamic(() => import("./AdminBulkEditModal"), {
  ssr: false,
});
const ConfirmModal = dynamic(() => import("../../dashboard/ConfirmModal"), {
  ssr: false,
});
const toastMessages = {
  approve: `تم قبول {count} منتج بنجاح`,
  addToNana: `تم إضافة {count} منتج إلى نعناع بنجاح`,
  removeFromNana: `تم إزالة {count} منتج من نعناع بنجاح`,
  hide: `تم إخفاء {count} منتج بنجاح`,
  unhide: `تم إظهار {count} منتج بنجاح`,
  delete: `تم إزالة {count} منتج بنجاح`,
};

export default function AdminProductContainer({
  lang,
  translate,
  initialProducts,
  admin,
  name,
  status,
  category,
  subCategory,
  sortBy,
  nana,
  userId,
  limit = 40,
  hasMoreServer,
  totalProducts,
  totalPages,
  initialCurrentPage,
  startDate,
  endDate,
  view = "grid",
  categories,
  subCategories,
  queryParams,
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`productComponent.${text}`);
  const langPrefix = lang === "ar" ? "" : "en/";
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(hasMoreServer);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rejectMessage, setRejectMessage] = useState("");
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [rangeSelectionMode, setRangeSelectionMode] = useState(false);
  const [firstSelectedIndex, setFirstSelectedIndex] = useState(null);
  const [isPrintLoading, setIsPrintLoading] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [modalData, setModalData] = useState({ show: false });

  const observer = useRef();
  const lastProductRef = useRef();
  const currentPageRef = useRef(limit / 20);
  const isLoadingRef = useRef(false);
  const router = useRouter();

  const productsMap = useMemo(() => {
    return new Map(products.map((p) => [p._id, p]));
  }, [products]);

  const checkSelectedInNana = (selectedProducts) => {
    if (selectedProducts.size === 0) return false;
    return [...selectedProducts].every((id) => productsMap.get(id)?.nana);
  };
  const allSelectedInNana = checkSelectedInNana(selectedProducts);

  const getStatus = (product) => {
    if (!product) return "unknown";
    const { deleted, hidden, rejected, approved } = product;
    if (deleted) return "deleted";
    if (hidden) return "hidden";
    if (rejected) return "rejected";
    if (approved) return "approved";
    return "pendingApproval";
  };
  const checkSelectedStatus = (selectedProducts) => {
    if (selectedProducts.size === 0) return "noSelected";
    const prods = [...selectedProducts].filter((id) => productsMap.has(id)); // ← filter first
    if (prods.length === 0) return "noSelected"; // ← add this
    return prods.reduce(
      (prev, id) => {
        const prod = productsMap.get(id);
        return prev === getStatus(prod) ? prev : "mixed";
      },
      getStatus(productsMap.get(prods[0])),
    );
  };
  const allSelectedStatus = checkSelectedStatus(selectedProducts);

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts || []);
      setHasMore(hasMoreServer);
      currentPageRef.current = limit / 20;
      setSelectedProducts(new Set());
      setSelectAll(false);
      setRangeSelectionMode(false);
      setFirstSelectedIndex(null);
    }
  }, [initialProducts, hasMoreServer, limit]);

  const handleExportExcel = async () => {
    try {
      setIsPrintLoading(true);
      const params = new URLSearchParams(searchParams.toString());

      const response = await fetch(`/api/products/export?${params.toString()}`);
      if (!response.ok) throw new Error("فشل في تصدير البيانات");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `products-${new Date().toLocaleDateString("en").replaceAll("/", "-")}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(ToastMessage("تم تصدير المنتجات بنجاح"));
    } catch (error) {
      console.error("Export error:", error);
      toast.error(ToastMessage("حدث خطأ أثناء تصدير البيانات"));
    } finally {
      setIsPrintLoading(false);
    }
  };
  // Update selectAll state when products or selectedProducts change
  useEffect(() => {
    if (products.length > 0)
      setSelectAll(selectedProducts.size === products.length);
    else setSelectAll(false);
  }, [products.length, selectedProducts.size]);

  const loadProducts = async () => {
    // Prevent concurrent requests
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    const pageNum = currentPageRef.current + 1;
    currentPageRef.current = pageNum;

    const seenProductIds = products.map((p) => p._id);

    const params = new URLSearchParams({
      limit: 20,
      page: pageNum,
      lang,
      showAll: true,
      compressed: true,
      owner: true,
      fields: `images,owner,${
        lang === "ar" ? "nameAr" : "nameEn"
      },rental,rating,pricingModel,location,${
        lang === "ar" ? "addressAr" : "addressEn"
      },rejected,approved,deleted,hidden,rejectMessage,category,subCategory,quantity,minQuantity,status,isMain,nana`,
      ...(name && { name }),
      ...(status && status !== "all" && { status }),
      ...(category && category !== "all" && { category }),
      ...(subCategory && subCategory !== "all" && { subCategory }),
      ...(sortBy && { sortBy }),
      ...(userId && { userId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(name &&
        seenProductIds.length > 0 && {
          excludeProducts: seenProductIds.join(","),
        }),
    });

    try {
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `HTTP error! status: ${res.status}`);
      }
      setProducts((prev) => [...prev, ...data.data]);
      // Use backend pagination info for accurate hasMore calculation
      const { pagination } = data;
      setHasMore(pagination?.hasMore ?? data.data.length === 20);
    } catch (err) {
      currentPageRef.current = pageNum - 1; // Revert page on error
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      // Don't load more if initial products are less than limit or still loading
      if (initialProducts.length < limit) return;
      if (isLoadingRef.current) return;
      if (entries[0].isIntersecting && hasMore) {
        loadProducts();
      }
    });

    if (lastProductRef.current) {
      observer.current.observe(lastProductRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [hasMore, initialProducts.length, limit, products.length]);

  const handleApprove = (id) =>
    startTransition(async () => {
      try {
        const res = await fetch(`/api/products/${id}/approve`, {
          method: "POST",
        });
        const data = await res.json();
        if (data.success) {
          setProducts(products.filter((p) => p._id !== id));
          // Remove from selected products if it was selected
          const newSelected = new Set(selectedProducts);
          newSelected.delete(id);
          setSelectedProducts(newSelected);
          toast.success(ToastMessage("تم قبول المنتج بنجاح"));
          await revalidate("/");
          await revalidateWithTag(`product-${data._id}`);
          router.refresh();
        }
      } catch (error) {
        toast.error(ToastMessage("حدث خطأ ما"));
      }
    });

  const handleRejectModalOpen = (product) => setSelectedProduct(product);

  const handleRejectModalClose = () => {
    setSelectedProduct(null);
    setRejectMessage("");
  };

  const handleReject = () => {
    if (!selectedProduct || !rejectMessage) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/products/${selectedProduct._id}/reject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: rejectMessage }),
        });
        const data = await res.json();
        if (data.success) {
          setProducts(products.filter((p) => p._id !== selectedProduct._id));
          // Remove from selected products if it was selected
          const newSelected = new Set(selectedProducts);
          newSelected.delete(selectedProduct._id);
          setSelectedProducts(newSelected);
          toast.success(ToastMessage("تم رفض المنتج بنجاح"));
          handleRejectModalClose();
          // await revalidate("/");
          await revalidateWithTag(`product-${data._id}`);
          router.refresh();
        }
      } catch (error) {
        toast.error(ToastMessage("حدث خطأ ما"));
      }
    });
  };

  const handleResetStatus = (id) =>
    startTransition(async () => {
      try {
        const res = await fetch(`/api/products/${id}/reset-status`, {
          method: "POST",
        });
        const data = await res.json();
        if (data.success) {
          setProducts(products.map((p) => (p._id === id ? data.data : p)));
          await revalidateWithTag(`product-${id}`);
          toast.success(ToastMessage("تم استعادة حالة المنتج بنجاح"));
          router.refresh();
        } else {
          toast.error(ToastMessage(data.error || "Error"));
        }
      } catch (error) {
        toast.error(ToastMessage("حدث خطأ ما"));
      }
    });

  const handleSelectProduct = (productId) => {
    const currentIndex = products.findIndex((p) => p._id === productId);
    const newSelected = new Set(selectedProducts);

    if (rangeSelectionMode) {
      if (firstSelectedIndex === null) {
        // First product in range selection
        setFirstSelectedIndex(currentIndex);
        toast.info(
          ToastMessage(
            "تم تحديد المنتج الأول. اختر المنتج الثاني لتحديد النطاق",
          ),
        );
      } else {
        // Second product - select range
        const startIndex = Math.min(firstSelectedIndex, currentIndex);
        const endIndex = Math.max(firstSelectedIndex, currentIndex);
        let addedProducts = 0;

        for (let i = startIndex; i <= endIndex; i++) {
          if (newSelected.has(products[i]._id))
            newSelected.delete(products[i]._id);
          else if (
            allSelectedStatus === getStatus(products[i]) ||
            allSelectedStatus === "noSelected"
          ) {
            newSelected.add(products[i]._id);
            addedProducts++;
          } else {
            break;
          }
        }
        toast.info(
          `بعض المنتجات لم يتم تحديدها بسبب ان كل المنتجات المحدده مقبولة وهذه المنتجات مرفوضه او رفضه`,
        );

        // Reset range selection mode
        setRangeSelectionMode(false);
        setFirstSelectedIndex(null);
        toast.success(ToastMessage(`تم تحديد ${addedProducts} منتجات`));
      }
    } else {
      const product = products.filter((p) => p._id === productId);
      // Normal click: toggle single product
      if (newSelected.has(productId)) newSelected.delete(productId);
      else if (
        allSelectedStatus === getStatus(product[0]) ||
        allSelectedStatus === "noSelected"
      ) {
        newSelected.add(product[0]._id);
      } else {
        toast.info(
          `المنتج ${product[0].name} لم يتم تحديده بسبب ان كل المنتجات المحدده مقبولة وهو مرفوض او العكس`,
        );
      }
    }

    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts(new Set());
      setSelectAll(false);
    } else {
      setSelectedProducts(new Set(products.map((p) => p._id)));
      setSelectAll(true);
    }
    // Reset range selection when using select all
    setRangeSelectionMode(false);
    setFirstSelectedIndex(null);
  };

  const handleRangeSelection = () => {
    setRangeSelectionMode(!rangeSelectionMode);
    setFirstSelectedIndex(null);
    if (rangeSelectionMode) {
      toast.info(ToastMessage("تم إلغاء وضع التحديد المتتالي"));
    } else {
      toast.info(
        ToastMessage(
          "وضع التحديد المتتالي مفعل. اختر منتجين لتحديد النطاق بينهما",
        ),
      );
    }
  };

  const handleSelected = async (
    action,
    selectedProducts,
    setSelectedProducts,
  ) => {
    if (selectedProducts.size === 0) return;

    startTransition(async () => {
      try {
        const res = await fetch("/api/products/selected", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productIds: Array.from(selectedProducts),
            action,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setProducts(products.filter((p) => !selectedProducts.has(p._id)));
          if (action === "approve") {
            selectedProducts.forEach(async (id) => {
              await revalidateWithTag(`product-${id}`);
            });
            await revalidate("/");
          }
          setSelectedProducts(new Set());
          setSelectAll(false);
          toast.success(
            ToastMessage(
              toastMessages[action].replace("{count}", selectedProducts.size),
            ),
          );
          router.refresh();
        }
      } catch (error) {
        toast.error(ToastMessage("حدث خطأ ما"));
      }
    });
  };
  const handleBulkDelete = () => {
    if (selectedProducts.size === 0) return;
    setModalData({
      show: true,
      title: t("confirmDeleteTitle"),
      message: t("confirmDeleteMessage"),
      confirmText: t("delete"),
      cancelText: t("cancel"),
      type: "delete",
      onConfirm: async () => {
        await handleSelected("delete", selectedProducts, setSelectedProducts);
        setModalData({ show: false });
      },
    });
  };

  return (
    <>
      <ProductFilters
        lang={lang}
        categories={categories}
        subCategories={subCategories}
        translate={translate}
        initialProducts={initialProducts}
        queryName={name}
        queryStatus={status}
        queryCategory={category}
        querySubCategory={subCategory}
        querySortBy={sortBy}
        queryUserId={userId}
        nana={nana}
        queryParams={queryParams}
        admin={true}
        onPrint={handleExportExcel}
        isPrintLoading={isPrintLoading}
      />
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-2 md:gap-4 text-white lg:mb-32 mb-16 md:mb-24">
        {/* Total Products Count */}
        <div className={`flex mb-1 md:mb-2 gap-2 md:gap-4 items-center`}>
          <div className="flex items-center gap-0.5 md:gap-1">
            <Link
              className={`p-1 flex items-center justify-center cursor-pointer transition-colors duration-400 ease-out ${
                view === "grid" ? "bg-white rounded-lg" : "bg-transparent"
              }`}
              href={`${langPrefix}/admin/products/all`}
            >
              <GridView />
            </Link>
            <Link
              className={`p-1 flex items-center justify-center cursor-pointer transition-colors duration-400 ease-out ${
                view === "table" ? "bg-white rounded-lg" : "bg-transparent"
              }`}
              href={`${langPrefix}/admin/products/all-table`}
            >
              <TableView />
            </Link>
          </div>
          {products.length > 0 && view === "grid" && (
            <>
              {products.length > 0 && (
                <div className="flex items-center gap-1 md:gap-2">
                  <Checkbox
                    isSelected={selectAll}
                    onValueChange={handleSelectAll}
                    color="primary"
                  >
                    <span className="text-xs md:text-sm font-medium text-gray-900">
                      تحديد الكل ({products.length})
                    </span>
                  </Checkbox>
                </div>
              )}
              <span className="text-xs md:text-sm text-end text-gray-600">
                عرض {products.length} من أصل {totalProducts} منتج
              </span>
            </>
          )}
        </div>
        {products.length > 0 && view === "grid" && (
          <div className="absolute top-0 md:top-8 end-6 flex gap-1 md:gap-2 flex-wrap justify-end mb-2 md:mb-4">
            <Button
              size="sm"
              color={rangeSelectionMode ? "primary" : "default"}
              variant={rangeSelectionMode ? "solid" : "solid"}
              onPress={handleRangeSelection}
              className="text-xs md:text-sm h-8 md:h-10"
            >
              {rangeSelectionMode ? "إلغاء التحديد المتتالي" : "تحديد متتالي"}
            </Button>
            <Button
              size="sm"
              color="primary"
              onPress={() =>
                handleSelected("approve", selectedProducts, setSelectedProducts)
              }
              isDisabled={
                isPending ||
                selectedProducts.size === 0 ||
                allSelectedStatus === "approved"
              }
              className="text-xs md:text-sm h-8 md:h-10"
            >
              قبول المنتجات المحددة ({selectedProducts.size})
            </Button>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  color="primary"
                  className="bg-white border-1 border-primary text-primary hover:bg-primary-50 px-2 md:px-4 min-w-8 md:min-w-10 h-8 md:h-10 transition-all duration-200 shadow-sm text-xs md:text-sm"
                  endContent={<ChevronDown className="w-3 h-3 md:w-4 md:h-4" />}
                >
                  إجراءات محددة ({selectedProducts.size})
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Actions"
                variant="flat"
                className="min-w-[200px]"
                disabledKeys={[
                  ...(selectedProducts.size === 0 || isPending
                    ? ["nana", "hide", "delete"]
                    : []),
                ]}
              >
                <DropdownItem
                  key="nana"
                  onPress={() =>
                    handleSelected(
                      allSelectedInNana ? "removeFromNana" : "addToNana",
                      selectedProducts,
                      setSelectedProducts,
                    )
                  }
                  startContent={
                    allSelectedInNana ? (
                      <Delete
                        className="text-danger w-3.5 h-3.5 md:w-4 md:h-4"
                        color="currentColor"
                      />
                    ) : (
                      <Plus
                        className="text-warning w-3.5 h-3.5 md:w-4 md:h-4"
                        color="currentColor"
                      />
                    )
                  }
                >
                  {allSelectedInNana ? "ازالة من" : "اضافة الي"} نعناع
                </DropdownItem>
                <DropdownItem
                  key="hide"
                  onPress={() =>
                    handleSelected(
                      allSelectedStatus === "hidden" ? "unhide" : "hide",
                      selectedProducts,
                      setSelectedProducts,
                    )
                  }
                  startContent={
                    <EyeOff
                      className="text-default-500 w-3.5 h-3.5 md:w-4 md:h-4"
                      color="currentColor"
                    />
                  }
                >
                  {allSelectedStatus === "hidden" ? "إظهار" : "إخفاء"} المنتجات
                  المحددة
                </DropdownItem>
                <DropdownItem
                  key="bulkEdit"
                  onPress={() => setShowBulkEditModal(true)}
                  isDisabled={selectedProducts.size === 0}
                  startContent={
                    <Edit
                      className="text-warning w-3.5 h-3.5 md:w-4 md:h-4"
                      color="currentColor"
                    />
                  }
                >
                  تعديل جماعي للمنتجات المحددة
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  onPress={handleBulkDelete}
                  startContent={
                    <Delete
                      className="text-danger w-3.5 h-3.5 md:w-4 md:h-4"
                      color="currentColor"
                    />
                  }
                >
                  إزالة المنتجات المحددة
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        )}

        <div
          className={`w-full ${
            view === "grid"
              ? "grid gap-x-4 gap-y-6 md:gap-x-6 md:gap-y-8 2xl:grid-cols-4 xl:grid-cols-3 grid-cols-2"
              : ""
          }`}
        >
          {products.length === 0 && !loading ? (
            <div className="text-2xl col-span-full text-center py-40 text-gray-500">
              {t("noProducts")}
            </div>
          ) : view === "grid" ? (
            products.map((product, idx) => (
              <div
                key={product._id + idx}
                ref={idx === products.length - 1 ? lastProductRef : null}
              >
                <Product
                sm={true}
                  product={product}
                  lang={lang}
                  translate={translate}
                  admin={admin}
                  onApprove={handleApprove}
                  onReject={handleRejectModalOpen}
                  isPending={isPending}
                  isSelected={selectedProducts.has(product._id)}
                  onSelect={handleSelectProduct}
                  isFirstSelected={
                    rangeSelectionMode && firstSelectedIndex === idx
                  }
                />
              </div>
            ))
          ) : (
            <TableProducts
              translate={translate}
              lang={lang}
              langPrefix={langPrefix}
              products={products}
              totalProducts={totalProducts}
              totalPages={totalPages}
              initialCurrentPage={initialCurrentPage}
              onRestore={handleResetStatus}
              handleSelected={handleSelected}
              checkSelectedInNana={checkSelectedInNana}
              checkSelectedStatus={checkSelectedStatus}
            />
          )}
        </div>
        {error && (
          <div className="text-red-500 text-center p-4 bg-red-100 rounded-lg mb-4">
            {error}
          </div>
        )}
        {loading && (
          <div className="text-center py-4 space-y-2">
            <div
              className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-primary rounded-full"
              role="status"
            >
              <span className="sr-only">{t("loading")}</span>
            </div>
            <div className="text-primary">{t("loading")}</div>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedProduct}
        onClose={handleRejectModalClose}
        placement="center"
        size="2xl"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">رفض المنتج</ModalHeader>
          <ModalBody>
            <Textarea
              label="سبب الرفض"
              placeholder="اكتب سبب رفض المنتج..."
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
              minRows={3}
              isRequired
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={handleRejectModalClose}
            >
              إلغاء
            </Button>
            <Button
              color="danger"
              onPress={handleReject}
              isDisabled={!rejectMessage || isPending}
            >
              تأكيد الرفض
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {showBulkEditModal && (
        <AdminBulkEditModal
          isOpen={showBulkEditModal}
          onClose={() => setShowBulkEditModal(false)}
          selectedProductIds={Array.from(selectedProducts)}
          products={products}
          categories={categories}
          subCategories={subCategories}
          lang={lang}
          translate={translate}
          onSuccess={() => {
            setShowBulkEditModal(false);
            setSelectedProducts(new Set());
            setSelectAll(false);
            router.refresh();
          }}
        />
      )}
      {modalData.show && (
        <ConfirmModal
          t={t}
          isOpen={modalData.show}
          onClose={() => setModalData({ show: false })}
          {...modalData}
        />
      )}
    </>
  );
}
