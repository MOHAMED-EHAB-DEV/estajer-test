"use client";
import { Select, SelectItem } from "@heroui/select";
import { Location } from "../ui/svgs/icons/LocationSvg";;
import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function DeliverySelect({
  t,
  selectedBranch,
  deliveryType,
  product,
  setDeliveryType,
  setSelectedBranch,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const branchId = searchParams.get("branch");
    if (branchId) {
      const branch = product.owner.branches.find((b) => b._id === branchId);
      if (branch) {
        setSelectedBranch(branch);
        setDeliveryType("receive");
      }
    }
  }, [
    searchParams,
    product.owner.branches,
    setSelectedBranch,
    setDeliveryType,
  ]);

  const handleBranchChange = ({ target }) => {
    const value = target.value;
    const branch = product.owner.branches.find((b) => b._id === value);

    // Update URL query parameter
    const params = new URLSearchParams(searchParams.toString());

    if (branch) {
      setDeliveryType("receive");
      setSelectedBranch(branch);
      params.set("branch", branch._id);
    } else {
      setDeliveryType(value);
      setSelectedBranch(null);
      params.delete("branch");
    }
    // Update URL without page reload
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Select
      disallowEmptySelection
      label={t("deliveryOptions")}
      required
      labelPlacement="outside"
      size="lg"
      radius="sm"
      startContent={<Location className="w-[15px] h-[20px]" />}
      classNames={{
        mainWrapper: "!mt-2",
        trigger:
          "!bg-white border border-primary/70  rounded-xl shadow hover:!bg-white/20",
        base: "!mt-16",
        label:
          "text-darkNavy font-semibold text-[1rem] md:text-[1.2rem] lg:text-[1.4rem] font-IBMPlex mb-4",
      }}
      aria-label={t("deliveryOptions")}
      selectedKeys={[selectedBranch ? selectedBranch._id : deliveryType]}
      onChange={handleBranchChange}
    >
      {product.rental?.delivery?.type && (
        <SelectItem key={product.rental.delivery.type}>
          {t(product.rental.delivery.type)}
        </SelectItem>
      )}
      {product.owner.branches?.map((branch) => (
        <SelectItem key={branch._id}>{`${t("pickupFrom")} ${
          branch.name
        }`}</SelectItem>
      ))}
    </Select>
  );
}
