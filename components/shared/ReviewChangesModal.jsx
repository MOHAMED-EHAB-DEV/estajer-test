"use client";
import { useState, useEffect, useRef } from "react";
import CustomModal from "@/components/ui/CustomModal";
import Button from "@/components/ui/Button";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";
import { useRouter } from "next/navigation";
import Image from "next/image";

function areImagesChanged(oldImages, newImages) {
  if (!newImages) return false;
  if (!oldImages && newImages.length > 0) return true;
  const oldList = oldImages || [];
  if (oldList.length !== newImages.length) return true;
  for (let i = 0; i < newImages.length; i++) {
    const oldUrl = oldList[i]?.preview || oldList[i];
    const newUrl = newImages[i]?.preview || newImages[i];
    if (oldUrl !== newUrl) return true;
  }
  return false;
}

/** Word-level LCS diff — returns null if strings are too long (fallback to plain). */
function computeWordDiff(oldStr, newStr) {
  const oldWords = (oldStr || "").split(/\s+/).filter(Boolean);
  const newWords = (newStr || "").split(/\s+/).filter(Boolean);
  const m = oldWords.length;
  const n = newWords.length;
  if (m * n > 80000) return null; // safety limit for very long descriptions
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        oldWords[i - 1] === newWords[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const ops = [];
  let i = m,
    j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      ops.unshift({ type: "equal", word: oldWords[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.unshift({ type: "added", word: newWords[j - 1] });
      j--;
    } else {
      ops.unshift({ type: "removed", word: oldWords[i - 1] });
      i--;
    }
  }
  return ops;
}

function DiffText({ ops, side, plain }) {
  if (!ops) {
    // fallback: plain text
    return (
      <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
        <span
          className={
            side === "old" ? "text-gray-500" : "text-gray-800 font-medium"
          }
        >
          {plain || "—"}
        </span>
      </p>
    );
  }
  const tokens =
    side === "old"
      ? ops.filter((op) => op.type !== "added")
      : ops.filter((op) => op.type !== "removed");
  return (
    <p className="text-sm leading-relaxed break-words h-full max-h-32 overflow-y-auto">
      {tokens.map((op, idx) => (
        <span key={idx}>
          {idx > 0 ? " " : ""}
          {op.type === "removed" ? (
            <mark className="bg-red-50 text-red-500 rounded px-0.5">
              {op.word}
            </mark>
          ) : op.type === "added" ? (
            <mark className="bg-green-50 text-green-700 rounded px-0.5 font-semibold">
              {op.word}
            </mark>
          ) : (
            <span
              className={side === "old" ? "text-gray-500" : "text-gray-800"}
            >
              {op.word}
            </span>
          )}
        </span>
      ))}
      {tokens.length === 0 && <span className="text-gray-400">—</span>}
    </p>
  );
}

function FieldRow({ label, oldVal, newVal }) {
  if (newVal === undefined || newVal === null) return null;
  const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
  if (!changed) return null;

  const ops = computeWordDiff(oldVal, newVal);

  return (
    <div className="mb-3 rounded-2xl border border-gray-100 shadow-sm">
      {/* Field label bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-primary/8 border-b border-[#F48A42]/15">
        <span className="text-xs font-bold text-gray-600 tracking-wide">
          {label}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 border border-[#F48A42]/20 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-primary rounded-full" />
          تم تعديله
        </span>
      </div>
      {/* Before / After columns */}
      <div className="grid grid-cols-2">
        {/* Current (old) */}
        <div className="p-4 bg-gray-50 border-e border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">
            الحالي
          </p>
          <DiffText ops={ops} side="old" plain={oldVal} />
        </div>
        {/* New value */}
        <div className="p-4 bg-white">
          <p className="text-[10px] font-bold text-primary mb-2 uppercase tracking-widest">
            الجديد
          </p>
          <DiffText ops={ops} side="new" plain={newVal} />
        </div>
      </div>
    </div>
  );
}

function ImagesRow({ oldImages, newImages }) {
  if (!areImagesChanged(oldImages, newImages)) return null;
  return (
    <div className="mb-3 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-primary/8 border-b border-[#F48A42]/15">
        <span className="text-xs font-bold text-gray-600 tracking-wide">
          الصور / Images
        </span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 border border-[#F48A42]/20 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-primary rounded-full" />
          تعديل
        </span>
      </div>
      <div className="grid grid-cols-2">
        {/* Current images */}
        <div className="p-4 bg-gray-50 border-e border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest">
            الحالية
          </p>
          <div className="flex flex-wrap gap-2">
            {oldImages?.slice(0, 4).map((img, i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 relative ring-1 ring-gray-200"
              >
                <Image
                  src={img.preview}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
            {!oldImages?.length && <p className="text-sm text-gray-400">—</p>}
          </div>
        </div>
        {/* New images */}
        <div className="p-4 bg-white">
          <p className="text-[10px] font-bold text-primary mb-3 uppercase tracking-widest">
            الجديدة
          </p>
          <div className="flex flex-wrap gap-2">
            {newImages?.slice(0, 4).map((img, i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 relative ring-2 ring-[#F48A42]/30"
              >
                <Image
                  src={img.preview}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReviewChangesModal({
  isOpen,
  onClose,
  product,
  onDone,
}) {
  const [rejectMessage, setRejectMessage] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullProduct, setFullProduct] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const router = useRouter();
  const textareaRef = useRef(null);

  const handleShowRejectInput = () => {
    setShowRejectInput(true);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 80);
  };

  useEffect(() => {
    if (isOpen && product?._id) {
      let active = true;
      const fetchFullProduct = async () => {
        setIsFetching(true);
        try {
          const res = await fetch(
            `/api/products/${product._id}?bothLangs=true&showAll=true`,
          );
          const resData = await res.json();
          if (active && resData.success) {
            setFullProduct(resData.data);
          }
        } catch (error) {
          console.error("Error fetching full product for review:", error);
        } finally {
          if (active) setIsFetching(false);
        }
      };
      fetchFullProduct();
      return () => {
        active = false;
      };
    } else {
      setFullProduct(null);
      setShowRejectInput(false);
      setRejectMessage("");
    }
  }, [isOpen, product?._id]);

  const activeProduct = fullProduct || product;
  const pc = activeProduct?.pendingChanges;

  if (!pc) return null;

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/products/${activeProduct._id}/approve-changes`,
        {
          method: "POST",
        },
      );
      const data = await res.json();
      if (data.success) {
        await revalidateWithTag(`product-${activeProduct._id}`);
        await revalidate("/");
        toast.success(ToastMessage("تم قبول التعديلات بنجاح"));
        onDone?.(activeProduct._id, "approved");
        onClose();
        router.refresh();
      } else {
        toast.error(ToastMessage(data.error || "حدث خطأ ما"));
      }
    } catch {
      toast.error(ToastMessage("حدث خطأ ما"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectMessage.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/products/${activeProduct._id}/reject-changes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: rejectMessage }),
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success(ToastMessage("تم رفض التعديلات"));
        onDone?.(activeProduct._id, "rejected");
        onClose();
        router.refresh();
      } else {
        toast.error(ToastMessage(data.error || "حدث خطأ ما"));
      }
    } catch {
      toast.error(ToastMessage("حدث خطأ ما"));
    } finally {
      setIsLoading(false);
    }
  };

  const changedCount = fullProduct
    ? [
        pc.nameAr !== undefined &&
          JSON.stringify(pc.nameAr) !== JSON.stringify(fullProduct.nameAr),
        pc.nameEn !== undefined &&
          JSON.stringify(pc.nameEn) !== JSON.stringify(fullProduct.nameEn),
        pc.descriptionAr !== undefined &&
          JSON.stringify(pc.descriptionAr) !==
            JSON.stringify(fullProduct.descriptionAr),
        pc.descriptionEn !== undefined &&
          JSON.stringify(pc.descriptionEn) !==
            JSON.stringify(fullProduct.descriptionEn),
        pc.category !== undefined &&
          JSON.stringify(pc.category) !== JSON.stringify(fullProduct.category),
        pc.subCategory !== undefined &&
          JSON.stringify(pc.subCategory) !==
            JSON.stringify(fullProduct.subCategory),
        areImagesChanged(fullProduct.images, pc.images),
      ].filter(Boolean).length
    : 0;

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      className="bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-darkNavy">مراجعة التعديلات</h3>
          <p className="text-xs text-gray-500 font-normal mt-0.5">
            {activeProduct.nameAr || activeProduct.name}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col min-h-0">
        {isFetching || !fullProduct ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 my-auto">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6366f1]" />
            <p className="text-sm text-gray-500 font-medium">
              جاري تحميل بيانات المنتج...
            </p>
          </div>
        ) : (
          <>
            {/* Summary strip */}
            <div className="flex items-center gap-2.5 mb-5 p-3.5 rounded-2xl bg-primary/8 border border-[#F48A42]/15">
              <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">
                  {changedCount} {changedCount === 1 ? "حقل" : "حقول"} تم
                  تعديلها
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  راجع التغييرات أدناه ثم وافق أو ارفض
                </p>
              </div>
            </div>

            {pc.rejectMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-start flex gap-2.5 items-start">
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-red-800 font-IBMPlex">
                    سبب الرفض السابق
                  </p>
                  <p className="text-sm text-red-700 mt-1 font-medium leading-relaxed">
                    {pc.rejectMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Column headers */}
            <div className="grid grid-cols-2 mb-2 px-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                الحالي
              </p>
              <p className="text-[11px] font-bold text-primary uppercase tracking-widest">
                الجديد
              </p>
            </div>

            <FieldRow
              label="الاسم بالعربي"
              oldVal={fullProduct.nameAr}
              newVal={pc.nameAr}
            />
            <FieldRow
              label="الاسم بالإنجليزي"
              oldVal={fullProduct.nameEn}
              newVal={pc.nameEn}
            />
            <FieldRow
              label="الوصف بالعربي"
              oldVal={fullProduct.descriptionAr}
              newVal={pc.descriptionAr}
            />
            <FieldRow
              label="الوصف بالإنجليزي"
              oldVal={fullProduct.descriptionEn}
              newVal={pc.descriptionEn}
            />
            <FieldRow
              label="التصنيف"
              oldVal={fullProduct.category}
              newVal={pc.category}
            />
            <FieldRow
              label="التصنيف الفرعي"
              oldVal={fullProduct.subCategory}
              newVal={pc.subCategory}
            />
            <ImagesRow oldImages={fullProduct.images} newImages={pc.images} />

            {showRejectInput && (
              <div className="mt-4 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  سبب الرفض
                </label>
                <textarea
                  ref={textareaRef}
                  placeholder="اكتب سبب رفض التعديلات..."
                  value={rejectMessage}
                  onChange={(e) => setRejectMessage(e.target.value)}
                  rows={4}
                  required
                  className="w-full rounded-2xl border border-gray-200 p-3.5 text-sm focus:border-red-500 focus:outline-none transition-colors"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <Button
          variant="light"
          color="default"
          onPress={onClose}
          isDisabled={isLoading || isFetching}
        >
          إلغاء
        </Button>
        {!showRejectInput ? (
          <>
            <Button
              color="danger"
              variant="flat"
              onPress={handleShowRejectInput}
              isDisabled={isLoading || isFetching}
            >
              رفض التعديلات
            </Button>
            <Button
              color="success"
              className="text-white bg-emerald-600 hover:bg-emerald-700"
              onPress={handleApprove}
              isLoading={isLoading}
              isDisabled={isFetching}
            >
              قبول التعديلات
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="flat"
              color="default"
              onPress={() => setShowRejectInput(false)}
              isDisabled={isLoading}
            >
              رجوع
            </Button>
            <Button
              color="danger"
              className="bg-red-600 hover:bg-red-700 text-white"
              onPress={handleReject}
              isDisabled={!rejectMessage.trim() || isLoading}
              isLoading={isLoading}
            >
              تأكيد الرفض
            </Button>
          </>
        )}
      </div>
    </CustomModal>
  );
}
