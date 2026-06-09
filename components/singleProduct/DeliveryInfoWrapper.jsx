"use client";
import { useSearchParams } from "next/navigation";
import DeliveryInfo from "./DeliveryInfo";

export default function DeliveryInfoWrapper({ product, lang, translate }) {
  const searchParams = useSearchParams();
  const branchId = searchParams.get("branch");
  const selectedBranch = branchId
    ? product.owner?.branches?.find((b) => b._id === branchId)
    : null;

  const displayLocation = selectedBranch
    ? {
        coordinates: [selectedBranch.location.lng, selectedBranch.location.lat],
      }
    : product.location;

  return (
    <DeliveryInfo
      product={product}
      lang={lang}
      translate={translate}
      displayLocation={displayLocation}
    />
  );
}
