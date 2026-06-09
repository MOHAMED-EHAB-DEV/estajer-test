"use client";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const ProductTour = dynamic(() => import("./ProductTour"), {
  ssr: false,
});

export default function ProductTourContainer({ lang, translate, product }) {
  const searchParams = useSearchParams();
  const tour = searchParams.get("tour");

  if (tour !== "true") return null;

  return <ProductTour lang={lang} translate={translate} product={product} />;
}
