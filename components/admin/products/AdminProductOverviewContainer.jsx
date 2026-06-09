"use client";
import { useState, Suspense } from "react";
import FilterOptions from "../orders/FilterOptions";
import Cards from "@/components/admin/Cards";
import { Tag, Product } from "@/components/ui/svgs/CardsSvg";
import { ChevronLeft } from "@/components/ui/svgs/icons/ChevronLeftSvg";;
import { useTranslations } from "@/hooks/useTranslations";
import TableProducts from "./TableProducts";
import ProductsCharts from "./ProductsCharts";

const AdminProductOverviewContainer = ({
  translate,
  langPrefix,
  lang,
  products,
  totalProducts,
  totalPages,
  currentPage,
}) => {
  const trans = useTranslations(translate);
  const [ranking, setRanking] = useState("all");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("today");
  const [search, setSearch] = useState("");

  const cards = [
    {
      title: trans("admin.home.cards.newPendingRequests"),
      Icon: Product,
      iconColor: "#F48A42",
      value: 12,
      review: "+10% زيادة عن أمس",
      reviewColor: "#4FD658",
      valueColor: "#0D092B",
    },
    {
      title: trans("admin.home.cards.acceptedRequests"),
      Icon: Product,
      iconColor: "#4FD658",
      value: 125000,
      review: "+10% زيادة عن أمس",
      reviewColor: "#4FD658",
      valueColor: "#4FD658",
    },
    {
      title: trans("admin.home.cards.cancelledRequests"),
      Icon: Product,
      iconColor: "#F55757",
      value: 12,
      review: "+10% زيادة عن أمس",
      reviewColor: "#4FD658",
      valueColor: "#F55757",
    },
    {
      title: trans("admin.home.cards.allRequests"),
      Icon: Product,
      iconColor: "#173DFA",
      value: 106000,
      review: "+50% زيادة عن أمس",
      reviewColor: "#4FD658",
      valueColor: "#173DFA",
    },
    {
      title: trans("admin.products.cards.allCategories"),
      Icon: Tag,
      iconColor: "#9747FF",
      value: 12,
      valueColor: "#0D092B",
      actionText: "عرض",
      ActionIcon: ChevronLeft,
      actionLink: `/${langPrefix}admin/products/categories`, // TODO: Update Link with actual link
    },
    {
      title: trans("admin.products.cards.mostVisitedCategory"),
      Icon: Product,
      iconColor: "#309737",
      value: 12,
      valueColor: "#309737",
      actionText: "عرض",
      ActionIcon: ChevronLeft,
      actionLink: `/${langPrefix}admin/products/categories?filter=mostVisited`, // TODO: Update Link with actual link
    },
    {
      title: trans("admin.products.cards.emptyCategories"),
      Icon: Tag,
      iconColor: "#B82323",
      value: 3,
      valueColor: "#B82323",
      actionText: "عرض",
      ActionIcon: ChevronLeft,
      actionLink: `/${langPrefix}admin/products/categories?filter=emptyCategories`, // TODO: Update Link with actual link
    },
  ];
  return (
    <>
      <FilterOptions
        translate={translate}
        search={search}
        setSearch={setSearch}
        status={status}
        setDate={setDate}
        date={date}
        setStatus={setStatus}
        ranking={ranking}
        setRanking={setRanking}
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
        />
      </Suspense>
      <ProductsCharts />
      <TableProducts
        translate={translate}
        langPrefix={langPrefix}
        lang={lang}
        products={products}
        isAll={false}
        totalProducts={totalProducts}
        totalPages={totalPages}
        initialCurrentPage={currentPage}
      />
    </>
  );
};

export default AdminProductOverviewContainer;
