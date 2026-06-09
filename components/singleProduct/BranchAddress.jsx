"use client";
import { useSearchParams } from "next/navigation";

export default function BranchAddress({ product, requested }) {
  const searchParams = useSearchParams();
  const branchId = searchParams.get("branch");
  const selectedBranch = branchId
    ? product.owner?.branches?.find((b) => b._id === branchId)
    : null;

  const displayAddress = selectedBranch
    ? selectedBranch.address
    : product.address;

  const text = requested
    ? typeof displayAddress === "string"
      ? displayAddress
      : displayAddress?.city
    : `${displayAddress?.city ?? ""}${
        displayAddress?.neighborhood ? ` - ${displayAddress.neighborhood}` : ""
      }`;

  return <>{text}</>;
}
