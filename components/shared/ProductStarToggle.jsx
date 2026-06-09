"use client";
import Button from "../ui/Button";
import { Star } from "../ui/svgs/icons/StarSvg";
import { useRouter } from "next/navigation";
import { toast } from "@/utils/toast";
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";
import ToastMessage from "../ui/ToastMessage";

export default function ProductStarToggle({ product }) {
  const router = useRouter();

  const handleToggleMain = async (productId, isMain) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({ isMain: !isMain }),
      });
      const data = await res.json();
      if (!data.success)
        return toast.error(
          ToastMessage(data.error || "Error updating product"),
        );
      await revalidateWithTag(`product-${data.data._id}`);
      await revalidate("/");
      toast.success(
        ToastMessage(
          !isMain
            ? "تم تعيين المنتج كمنتج رئيسي"
            : "تم إلغاء تعيين المنتج كمنتج رئيسي",
        ),
      );
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle main status", error);
      toast.error(ToastMessage("حدث خطأ ما"));
    }
  };

  return (
    <div className="absolute top-0 end-0 z-10 md:p-4 p-2">
      <Button
        color="transparent"
        className="min-w-0 md:w-12 md:h-12 w-10 h-10 md:p-3 p-2 bg-[#EAEEF3] rounded-full"
        onPress={() => handleToggleMain(product._id, product.isMain)}
        title={product.isMain ? "إلغاء المنتج الرئيسي" : "تعيين كمنتج رئيسي"}
      >
        <Star
          size={18}
          filled={product.isMain}
          className="md:w-[18px] w-4 h-auto"
        />
      </Button>
    </div>
  );
}
