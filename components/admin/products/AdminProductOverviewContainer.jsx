"use client";
import { useState, Suspense, useEffect, useTransition, useMemo } from "react";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";
import FilterOptions from "../orders/FilterOptions";
import Cards from "@/components/admin/Cards";
import { Tag, Product } from "@/components/ui/svgs/CardsSvg";
import { ChevronLeft } from "@/components/ui/svgs/icons/ChevronLeftSvg";
import { useTranslations } from "@/hooks/useTranslations";
import TableProducts from "./TableProducts";
import ProductsCharts from "./ProductsCharts";

const AdminProductOverviewContainer = ({
  lang,
  translate,
  initialProducts,
  admin,
  name,
  status: initialStatus,
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
  initialStats,
  langPrefix,
}) => {
  const trans = useTranslations(translate);
  const [selectedRange, setSelectedRange] = useState({
    from: null,
    to: null,
  });
  const [dateAdded, setDateAdded] = useState("all");
  const [search, setSearch] = useState("");

  const [products, setProducts] = useState(initialProducts || []);
  const [stats, setStats] = useState(initialStats || null);

  useEffect(() => {
    setProducts(initialProducts || []);
    setStats(initialStats || null);
  }, [initialProducts, initialStats]);

  const [isInitialMount, setIsInitialMount] = useState(true);

  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParamsHook = useSearchParams();

  const productsMap = useMemo(() => {
    return new Map(products.map((p) => [p._id, p]));
  }, [products]);

  const checkSelectedInNana = (selectedProducts) => {
    if (!selectedProducts || selectedProducts.size === 0) return false;
    return [...selectedProducts].every((id) => productsMap.get(id)?.nana);
  };

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
    if (!selectedProducts || selectedProducts.size === 0) return "noSelected";
    const prods = [...selectedProducts].filter((id) => productsMap.has(id));
    if (prods.length === 0) return "noSelected";
    return prods.reduce(
      (prev, id) => {
        const prod = productsMap.get(id);
        return prev === getStatus(prod) ? prev : "mixed";
      },
      getStatus(productsMap.get(prods[0])),
    );
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

  const toastMessages = {
    approve: `تم قبول {count} منتج بنجاح`,
    addToNana: `تم إضافة {count} منتج إلى نعناع بنجاح`,
    removeFromNana: `تم إزالة {count} منتج من نعناع بنجاح`,
    hide: `تم إخفاء {count} منتج بنجاح`,
    unhide: `تم إظهار {count} منتج بنجاح`,
    delete: `تم إزالة {count} منتج بنجاح`,
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

  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }

    const params = new URLSearchParams(searchParamsHook.toString());

    if (search) params.set("name", search);
    else params.delete("name");

    const formatDate = (date) => {
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const y = date.getFullYear();
      return `${d}/${m}/${y}`;
    };

    if (selectedRange?.from) {
      params.set("startDate", formatDate(selectedRange.from));
    } else {
      params.delete("startDate");
    }

    if (selectedRange?.to) {
      params.set("endDate", formatDate(selectedRange.to));
    } else {
      params.delete("endDate");
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [search, selectedRange]);

  const cards = [
    {
      title: trans("admin.home.cards.newPendingProducts"),
      Icon: Product,
      iconColor: "#F48A42",
      value: stats?.newPendingProducts || 0,
      review: stats?.newPendingProducts > 0 ? "منتجات جديدة في انتظار الموافقة" : "لا توجد منتجات جديدة",
      reviewColor: stats?.newPendingProducts > 0 ? "#F48A42" : "#6B7280",
      valueColor: "#0D092B",
    },
    {
      title: trans("admin.home.cards.newPendingEditedProducts"),
      Icon: Product,
      iconColor: "#6366f1",
      value: stats?.newPendingEditedProducts || 0,
      review: stats?.newPendingEditedProducts > 0 ? "تعديلات في انتظار الموافقة" : "لا توجد تعديلات معلقة",
      reviewColor: stats?.newPendingEditedProducts > 0 ? "#6366f1" : "#6B7280",
      valueColor: "#6366f1",
    },
    {
      title: trans("admin.home.cards.acceptedProducts"),
      Icon: Product,
      iconColor: "#4FD658",
      value: stats?.acceptedProducts || 0,
      review: stats?.acceptedProducts > 0 ? "منتجات مقبولة" : "لا توجد منتجات مقبولة",
      reviewColor: stats?.acceptedProducts > 0 ? "#4FD658" : "#6B7280",
      valueColor: "#4FD658",
    },
    {
      title: trans("admin.home.cards.cancelledProducts"),
      Icon: Product,
      iconColor: "#F55757",
      value: stats?.cancelledProducts || 0,
      review: stats?.cancelledProducts > 0 ? "منتجات ملغية" : "لا توجد منتجات ملغية",
      reviewColor: stats?.cancelledProducts > 0 ? "#F55757" : "#6B7280",
      valueColor: "#F55757",
    },
    {
      title: trans("admin.home.cards.allProducts"),
      Icon: Product,
      iconColor: "#173DFA",
      value: stats?.allProducts || 0,
      review: "إجمالي المنتجات",
      reviewColor: "#173DFA",
      valueColor: "#173DFA",
    },
    {
      title: trans("admin.products.cards.allCategories"),
      Icon: Tag,
      iconColor: "#9747FF",
      value: stats?.categoriesCount || 0,
      valueColor: "#0D092B",
      actionText: "عرض",
      ActionIcon: ChevronLeft,
      actionLink: `/${langPrefix}admin/products/categories`,
    },
    {
      title: trans("admin.products.cards.mostVisitedCategory"),
      Icon: Product,
      iconColor: "#309737",
      value: stats?.mostVisitedCategory?.name || "-",
      review: stats?.mostVisitedCategory
        ? `${stats.mostVisitedCategory.visits} زيارة`
        : "",
      reviewColor: "#309737",
      valueColor: "#309737",
      valueClassNames: "text-xs lg:text-sm",
      actionText: "عرض",
      ActionIcon: ChevronLeft,
      actionLink: `/${langPrefix}admin/products/categories?filter=mostVisited`,
    },
    {
      title: trans("admin.products.cards.emptyCategories"),
      Icon: Tag,
      iconColor: "#B82323",
      value: stats?.emptyCategories || 0,
      valueColor: "#B82323",
      actionText: "عرض",
      ActionIcon: ChevronLeft,
      actionLink: `/${langPrefix}admin/products/categories?filter=emptyCategories`,
    },
  ];
  return (
    <>
      <FilterOptions
        translate={translate}
        search={search}
        setSearch={setSearch}
        showStatus={false}
        selectedRange={selectedRange}
        onRangeSelect={setSelectedRange}
        dateAdded={dateAdded}
        setDateAdded={setDateAdded}
        isShowPrintButton={false}
        lang={lang}
      />

      <Suspense
        fallback={
          <Cards translate={trans} langPrefix={langPrefix} placeholder />
        }
      >
        <Cards
          translate={trans}
          langPrefix={langPrefix}
          cards={cards}
          filterValue={dateAdded}
        />
      </Suspense>
      <ProductsCharts stats={stats} />
      <TableProducts
        translate={translate}
        langPrefix={langPrefix}
        lang={lang}
        products={products}
        isAll={false}
        totalProducts={totalProducts}
        totalPages={totalPages}
        initialCurrentPage={initialCurrentPage}
        loading={isPending}
        onRestore={handleResetStatus}
        handleSelected={handleSelected}
        checkSelectedInNana={checkSelectedInNana}
        checkSelectedStatus={checkSelectedStatus}
      />
    </>
  );
};

export default AdminProductOverviewContainer;
