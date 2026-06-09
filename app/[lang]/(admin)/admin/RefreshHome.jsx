"use client";
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";
import Button from "@/components/ui/Button";

export default function RefreshHome() {
  return (
    <div>
      <Button onPress={async () => await revalidate("/")}>
        تحديث الصفحة الرئيسية
      </Button>
      <Button onPress={async () => await revalidateWithTag("everyProduct")}>
        تحديث كل المنتجات
      </Button>
    </div>
  );
}
