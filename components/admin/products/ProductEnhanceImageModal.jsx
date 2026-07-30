"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import Button from "@/components/ui/Button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/CustomModal";

const DEFAULT_PROMPT =
  "Keep the main product in this image exactly as it is, do not change any details of the item itself. Completely remove the messy background and replace it with a pure, solid white background (#FFFFFF). Add a subtle, realistic drop shadow beneath the product to ground it. Professional e-commerce catalog photography style, highly detailed, clean minimalist look.";

export default function ProductEnhanceImageModal({
  isOpen,
  onClose,
  product,
  onImageUpdated,
}) {
  const [originalImageUrl, setOriginalImageUrl] = useState(
    product?.images?.[0]?.preview,
  );
  const [originalAspect, setOriginalAspect] = useState(1);
  const [processedAspect, setProcessedAspect] = useState(1);
  const [cropTarget, setCropTarget] = useState("processed"); // "original" | "processed"

  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [resultImage, setResultImage] = useState(null);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Crop & Lightbox states
  const [cropMode, setCropMode] = useState(false);
  const [cropRatio, setCropRatio] = useState("free");
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const [cropZoom, setCropZoom] = useState(100);
  const [lightboxImage, setLightboxImage] = useState(null);

  const imgAspect =
    cropTarget === "original" ? originalAspect : processedAspect;

  const initCropBox = (aspect = imgAspect, ratio = cropRatio) => {
    if (ratio === "free") {
      setCropBox({ x: 0, y: 0, w: 100, h: 100 });
      return;
    }

    let targetRatio = 1;
    if (ratio === "4:3") targetRatio = 4 / 3;
    if (ratio === "3:4") targetRatio = 3 / 4;

    let w = 100;
    let h = w * (aspect / targetRatio);

    if (h > 100) {
      const scale = 100 / h;
      w = w * scale;
      h = 100;
    }
    if (w > 100) {
      const scale = 100 / w;
      h = h * scale;
      w = 100;
    }

    setCropBox({
      x: Math.max(0, (100 - w) / 2),
      y: Math.max(0, (100 - h) / 2),
      w,
      h,
    });
  };

  const handleRatioChange = (ratio) => {
    setCropRatio(ratio);
    if (ratio === "free") {
      setCropBox({ x: 0, y: 0, w: 100, h: 100 });
      return;
    }

    let targetRatio = 1;
    if (ratio === "4:3") targetRatio = 4 / 3;
    if (ratio === "3:4") targetRatio = 3 / 4;

    let w = 100;
    let h = w * (imgAspect / targetRatio);

    if (h > 100) {
      const scale = 100 / h;
      w = w * scale;
      h = 100;
    }
    if (w > 100) {
      const scale = 100 / w;
      h = h * scale;
      w = 100;
    }

    setCropBox({
      x: Math.max(0, (100 - w) / 2),
      y: Math.max(0, (100 - h) / 2),
      w,
      h,
    });
  };

  const handleWidthChange = (val) => {
    if (cropRatio === "free") {
      setCropBox((prev) => ({
        ...prev,
        w: val,
        x: Math.min(prev.x, 100 - val),
      }));
    } else {
      let targetRatio = 1;
      if (cropRatio === "4:3") targetRatio = 4 / 3;
      if (cropRatio === "3:4") targetRatio = 3 / 4;

      let w = val;
      let h = w * (imgAspect / targetRatio);

      if (h > 100) {
        const scale = 100 / h;
        w = w * scale;
        h = 100;
      }

      setCropBox((prev) => ({
        w,
        h,
        x: Math.min(prev.x, 100 - w),
        y: Math.min(prev.y, 100 - h),
      }));
    }
  };

  const handleHeightChange = (val) => {
    if (cropRatio === "free") {
      setCropBox((prev) => ({
        ...prev,
        h: val,
        y: Math.min(prev.y, 100 - val),
      }));
    }
  };

  const handleMouseDown = (e, action = "drag") => {
    e.preventDefault();
    e.stopPropagation();

    const isTouch = e.type.startsWith("touch");
    const startClientX = isTouch ? e.touches[0].clientX : e.clientX;
    const startClientY = isTouch ? e.touches[0].clientY : e.clientY;

    const startX = cropBox.x;
    const startY = cropBox.y;
    const startW = cropBox.w;
    const startH = cropBox.h;

    const container = document.getElementById("crop-container");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const containerW = rect.width;
    const containerH = rect.height;

    const handleMouseMove = (moveEvent) => {
      const currentX = moveEvent.type.startsWith("touch")
        ? moveEvent.touches[0].clientX
        : moveEvent.clientX;
      const currentY = moveEvent.type.startsWith("touch")
        ? moveEvent.touches[0].clientY
        : moveEvent.clientY;

      const dx = ((currentX - startClientX) / containerW) * 100;
      const dy = ((currentY - startClientY) / containerH) * 100;

      if (action === "drag") {
        setCropBox((prev) => ({
          ...prev,
          x: Math.max(0, Math.min(100 - prev.w, startX + dx)),
          y: Math.max(0, Math.min(100 - prev.h, startY + dy)),
        }));
      } else {
        let newX = startX;
        let newY = startY;
        let newW = startW;
        let newH = startH;

        if (action.includes("right")) {
          newW = Math.max(10, Math.min(100 - startX, startW + dx));
        } else if (action.includes("left")) {
          const maxW = startX + startW;
          newW = Math.max(10, Math.min(maxW, startW - dx));
          newX = maxW - newW;
        }

        if (action.includes("bottom")) {
          newH = Math.max(10, Math.min(100 - startY, startH + dy));
        } else if (action.includes("top")) {
          const maxH = startY + startH;
          newH = Math.max(10, Math.min(maxH, startH - dy));
          newY = maxH - newH;
        }

        if (cropRatio !== "free") {
          let targetRatio = 1;
          if (cropRatio === "4:3") targetRatio = 4 / 3;
          if (cropRatio === "3:4") targetRatio = 3 / 4;

          if (action.includes("right") || action.includes("left")) {
            newH = newW * (imgAspect / targetRatio);
            if (action.includes("top")) {
              newY = startY + startH - newH;
            }
          } else {
            newW = newH * (targetRatio / imgAspect);
            if (action.includes("left")) {
              newX = startX + startW - newW;
            }
          }

          if (newX < 0 || newY < 0 || newX + newW > 100 || newY + newH > 100) {
            return;
          }
        }

        setCropBox({
          x: Math.max(0, newX),
          y: Math.max(0, newY),
          w: newW,
          h: newH,
        });
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener(
        isTouch ? "touchmove" : "mousemove",
        handleMouseMove,
      );
      document.removeEventListener(
        isTouch ? "touchend" : "mouseup",
        handleMouseUp,
      );
    };

    document.addEventListener(
      isTouch ? "touchmove" : "mousemove",
      handleMouseMove,
    );
    document.addEventListener(isTouch ? "touchend" : "mouseup", handleMouseUp);
  };

  const handleApplyCrop = () => {
    const srcImg =
      cropTarget === "original" ? originalImageUrl : resultImage?.preview;
    if (!srcImg) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = srcImg;
    img.onload = () => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      // 1. Create a temporary canvas of full natural dimensions
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = naturalWidth;
      tempCanvas.height = naturalHeight;
      const tempCtx = tempCanvas.getContext("2d");

      // Fill with solid white
      tempCtx.fillStyle = "#ffffff";
      tempCtx.fillRect(0, 0, naturalWidth, naturalHeight);

      // Draw the image scaled by cropZoom and centered
      const s = cropZoom / 100;
      const drawW = s * naturalWidth;
      const drawH = s * naturalHeight;
      const drawX = ((1 - s) * naturalWidth) / 2;
      const drawY = ((1 - s) * naturalHeight) / 2;
      tempCtx.drawImage(img, drawX, drawY, drawW, drawH);

      // 2. Crop selection from the temporary canvas
      const cropX = (cropBox.x / 100) * naturalWidth;
      const cropY = (cropBox.y / 100) * naturalHeight;
      const cropW = (cropBox.w / 100) * naturalWidth;
      const cropH = (cropBox.h / 100) * naturalHeight;

      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = cropW;
      finalCanvas.height = cropH;
      const finalCtx = finalCanvas.getContext("2d");

      finalCtx.drawImage(
        tempCanvas,
        cropX,
        cropY,
        cropW,
        cropH,
        0,
        0,
        cropW,
        cropH,
      );

      const croppedBase64 = finalCanvas.toDataURL("image/webp", 0.95);

      if (cropTarget === "original") {
        setOriginalImageUrl(croppedBase64);
        setResultImage(null);
        setStatus("idle");
      } else {
        setResultImage({
          ...resultImage,
          preview: croppedBase64,
        });
      }
      setCropMode(false);
      toast.success(ToastMessage("تم تطبيق قص الصورة"));
    };
  };

  const centerHorizontally = () => {
    setCropBox((prev) => ({
      ...prev,
      x: (100 - prev.w) / 2,
    }));
  };

  const centerVertically = () => {
    setCropBox((prev) => ({
      ...prev,
      y: (100 - prev.h) / 2,
    }));
  };

  const centerBoth = () => {
    setCropBox((prev) => ({
      ...prev,
      x: (100 - prev.w) / 2,
      y: (100 - prev.h) / 2,
    }));
  };

  const handleEnhance = async () => {
    setStatus("loading");
    setResultImage(null);
    setErrorMsg("");

    try {
      const isOriginalCropped =
        originalImageUrl && originalImageUrl.startsWith("data:image/");
      const res = await fetch("/api/ai/enhance-product-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          prompt,
          base64Image: isOriginalCropped ? originalImageUrl : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "حدث خطأ ما، حاول مرة أخرى.");
        setStatus("error");
        return;
      }

      setResultImage(data.image);
      setStatus("done");
      toast.success(ToastMessage("تم معالجة الصورة بنجاح"));
    } catch (err) {
      setErrorMsg("فشل الاتصال بالخادم.");
      setStatus("error");
    }
  };

  const handleConfirm = async () => {
    const activeImage =
      resultImage ||
      (originalImageUrl && originalImageUrl.startsWith("data:image/")
        ? { preview: originalImageUrl }
        : null);
    if (!activeImage) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/ai/enhance-product-image", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          image: activeImage,
        }),
      });

      const data = (await res.ok) ? await res.json() : null;

      if (!res.ok || !data?.success) {
        toast.error(
          ToastMessage(data?.error || "فشل حفظ الصورة في قاعدة البيانات"),
        );
        setStatus("done");
        return;
      }

      if (onImageUpdated) {
        onImageUpdated(resultImage);
      }
      toast.success(ToastMessage("تم حفظ وتحديث صورة المنتج بنجاح"));
      setStatus("idle");
      setResultImage(null);
      onClose();
    } catch (err) {
      toast.error(ToastMessage("فشل الاتصال بالخادم لحفظ الصورة"));
      setStatus("done");
    }
  };

  const handleClose = () => {
    setCropMode(false);
    onClose();
  };

  const renderCropOverlay = () => {
    return (
      <div className="absolute inset-0 bg-transparent overflow-hidden">
        {/* Dim overlay outside the crop box */}
        <div
          className="absolute border-2 border-dashed border-violet-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-all duration-75 cursor-move animate-fadeIn"
          style={{
            left: `${cropBox.x}%`,
            top: `${cropBox.y}%`,
            width: `${cropBox.w}%`,
            height: `${cropBox.h}%`,
          }}
          onMouseDown={(e) => handleMouseDown(e, "drag")}
          onTouchStart={(e) => handleMouseDown(e, "drag")}
        >
          {/* Inner corner indicator lines */}
          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-violet-600"></div>
          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-violet-600"></div>
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-violet-600"></div>
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-violet-600"></div>

          {/* Corner Resizing Handles */}
          <div
            className="absolute top-0 left-0 w-5 h-5 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize bg-transparent z-20"
            onMouseDown={(e) => handleMouseDown(e, "top-left")}
            onTouchStart={(e) => handleMouseDown(e, "top-left")}
          />
          <div
            className="absolute top-0 right-0 w-5 h-5 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize bg-transparent z-20"
            onMouseDown={(e) => handleMouseDown(e, "top-right")}
            onTouchStart={(e) => handleMouseDown(e, "top-right")}
          />
          <div
            className="absolute bottom-0 left-0 w-5 h-5 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize bg-transparent z-20"
            onMouseDown={(e) => handleMouseDown(e, "bottom-left")}
            onTouchStart={(e) => handleMouseDown(e, "bottom-left")}
          />
          <div
            className="absolute bottom-0 right-0 w-5 h-5 translate-x-1/2 translate-y-1/2 cursor-nwse-resize bg-transparent z-20"
            onMouseDown={(e) => handleMouseDown(e, "bottom-right")}
            onTouchStart={(e) => handleMouseDown(e, "bottom-right")}
          />
        </div>
      </div>
    );
  };

  const isLoading = status === "loading";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      size="3xl"
      backdrop="blur"
      scrollBehavior="inside"
      className="mx-2 max-h-[92vh]"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-0.5 p-3 md:p-4 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            {/* Sparkle icon */}
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-violet-500 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
              <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z" />
              <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />
            </svg>
            <span className="text-sm md:text-base font-bold text-gray-800">
              تفريغ خلفية الصورة بالذكاء الاصطناعي
            </span>
          </div>
          <p className="text-[11px] md:text-xs text-gray-500 font-normal">
            سيقوم الذكاء الاصطناعي بإزالة الخلفية واستبدالها بخلفية بيضاء نظيفة
          </p>
        </ModalHeader>

        <ModalBody className="gap-3 p-3 md:p-5 overflow-y-auto">
          {/* Image comparison */}
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            {/* Original */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  الأصلية
                </span>
              </div>
              <div className="aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center relative select-none">
                {originalImageUrl && !cropMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCropTarget("original");
                      setCropMode(true);
                      setCropZoom(100);
                      setTimeout(() => initCropBox(originalAspect), 0);
                    }}
                    title="قص الصورة الأصلية"
                    className="absolute top-2 end-2 z-20 p-1.5 md:p-2 bg-white/90 backdrop-blur-md hover:bg-white text-gray-700 hover:text-violet-600 rounded-lg md:rounded-xl shadow-md border border-gray-200/80 transition-all hover:scale-105 active:scale-95 flex items-center justify-center group/crop"
                  >
                    <svg
                      className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600 group-hover/crop:text-violet-600 transition-colors"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 2v14a2 2 0 0 0 2 2h14" />
                      <path d="M18 22V8a2 2 0 0 0-2-2H2" />
                    </svg>
                  </button>
                )}
                {originalImageUrl ? (
                  <div
                    id={
                      cropMode && cropTarget === "original"
                        ? "crop-container"
                        : undefined
                    }
                    className="relative max-w-full max-h-full bg-white flex items-center justify-center group cursor-zoom-in"
                    style={
                      cropMode && cropTarget === "original"
                        ? { aspectRatio: originalAspect }
                        : undefined
                    }
                  >
                    <img
                      src={originalImageUrl}
                      alt="الصورة الأصلية"
                      className={`w-full h-full object-contain ${cropMode && cropTarget === "original" ? "transition-transform duration-100 ease-out" : ""}`}
                      style={{
                        transform:
                          cropMode && cropTarget === "original"
                            ? `scale(${cropZoom / 100})`
                            : "none",
                        transformOrigin: "center",
                      }}
                      onLoad={(e) => {
                        const { naturalWidth, naturalHeight } = e.currentTarget;
                        setOriginalAspect(naturalWidth / naturalHeight);
                      }}
                      onClick={() =>
                        (!cropMode || cropTarget !== "original") &&
                        setLightboxImage(originalImageUrl)
                      }
                    />
                    {!cropMode && (
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="text-white text-[10px] md:text-xs bg-black/60 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full font-medium">
                          تكبير
                        </span>
                      </div>
                    )}
                    {cropMode &&
                      cropTarget === "original" &&
                      renderCropOverlay()}
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs md:text-sm">لا توجد صورة</span>
                )}
              </div>
            </div>

            {/* Result */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  بعد المعالجة
                </span>
              </div>
              <div className="aspect-square rounded-xl overflow-hidden border-2 border-dashed border-violet-200 bg-gray-50 flex items-center justify-center relative select-none">
                {status === "done" && resultImage && !cropMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCropTarget("processed");
                      setCropMode(true);
                      setCropZoom(100);
                      setTimeout(() => initCropBox(processedAspect), 0);
                    }}
                    title="قص الصورة المعالجة"
                    className="absolute top-2 end-2 z-20 p-1.5 md:p-2 bg-white/90 backdrop-blur-md hover:bg-white text-gray-700 hover:text-violet-600 rounded-lg md:rounded-xl shadow-md border border-gray-200/80 transition-all hover:scale-105 active:scale-95 flex items-center justify-center group/crop"
                  >
                    <svg
                      className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600 group-hover/crop:text-violet-600 transition-colors"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 2v14a2 2 0 0 0 2 2h14" />
                      <path d="M18 22V8a2 2 0 0 0-2-2H2" />
                    </svg>
                  </button>
                )}
                {isLoading && (
                  <div className="flex flex-col items-center gap-2 md:gap-3 p-2 md:p-4 text-center z-10">
                    <div className="relative">
                      <div className="w-9 h-9 md:w-12 md:h-12 rounded-full border-3 md:border-4 border-violet-100 border-t-violet-500 animate-spin" />
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5 text-violet-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
                        <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z" />
                        <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />
                      </svg>
                    </div>
                    <span className="text-xs md:text-sm text-gray-500">
                      جاري معالجة الصورة...
                    </span>
                    <span className="text-[10px] md:text-xs text-gray-400">
                      قد يستغرق 20-40 ثانية
                    </span>
                  </div>
                )}

                {status === "done" && resultImage && (
                  <div
                    id={
                      cropMode && cropTarget === "processed"
                        ? "crop-container"
                        : undefined
                    }
                    className="relative max-w-full max-h-full bg-white flex items-center justify-center group cursor-zoom-in"
                    style={
                      cropMode && cropTarget === "processed"
                        ? { aspectRatio: processedAspect }
                        : undefined
                    }
                  >
                    <img
                      src={resultImage.preview}
                      alt="الصورة بعد المعالجة"
                      className={`w-full h-full object-contain ${cropMode && cropTarget === "processed" ? "transition-transform duration-100 ease-out" : ""}`}
                      style={{
                        transform:
                          cropMode && cropTarget === "processed"
                            ? `scale(${cropZoom / 100})`
                            : "none",
                        transformOrigin: "center",
                      }}
                      onLoad={(e) => {
                        const { naturalWidth, naturalHeight } = e.currentTarget;
                        setProcessedAspect(naturalWidth / naturalHeight);
                      }}
                      onClick={() =>
                        (!cropMode || cropTarget !== "processed") &&
                        setLightboxImage(resultImage.preview)
                      }
                    />
                    {!cropMode && (
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="text-white text-[10px] md:text-xs bg-black/60 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full font-medium">
                          تكبير
                        </span>
                      </div>
                    )}
                    {cropMode &&
                      cropTarget === "processed" &&
                      renderCropOverlay()}
                  </div>
                )}

                {status === "error" && (
                  <div className="flex flex-col items-center gap-1.5 p-3 text-center z-10">
                    <svg
                      className="w-6 h-6 md:w-8 md:h-8 text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-xs md:text-sm text-red-500">{errorMsg}</span>
                  </div>
                )}

                {status === "idle" && (
                  <span className="text-gray-300 text-xs md:text-sm">
                    ستظهر النتيجة هنا
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Crop controls block */}
          {cropMode && (
            <div className="bg-violet-50/50 border border-violet-100 rounded-xl p-2.5 md:p-3.5 flex flex-col gap-2 md:gap-3 text-xs">
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <span className="text-xs md:text-sm font-semibold text-violet-800">
                  خيارات قص الصورة
                </span>
                <div className="flex items-center gap-1">
                  {["free", "1:1", "4:3", "3:4"].map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => handleRatioChange(ratio)}
                      className={`px-2 py-0.5 md:px-2.5 md:py-1 text-[11px] md:text-xs font-semibold rounded-md md:rounded-lg transition-all ${
                        cropRatio === ratio
                          ? "bg-violet-500 text-white shadow-sm"
                          : "bg-white border border-violet-200 text-violet-600 hover:bg-violet-50"
                      }`}
                    >
                      {ratio === "free" ? "حر" : ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-2 gap-2 md:gap-3 text-[11px] md:text-xs text-gray-600">
                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between font-medium">
                    <span className="truncate">العرض (W):</span>
                    <span>{Math.round(cropBox.w)}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={cropBox.w}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-full accent-violet-500 h-1.5 cursor-ew-resize"
                  />
                </div>

                {cropRatio === "free" && (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between font-medium">
                      <span className="truncate">الارتفاع (H):</span>
                      <span>{Math.round(cropBox.h)}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={cropBox.h}
                      onChange={(e) =>
                        handleHeightChange(Number(e.target.value))
                      }
                      className="w-full accent-violet-500 h-1.5 cursor-ns-resize"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between font-medium">
                    <span className="truncate">الأفقي (X):</span>
                    <span>
                      {Math.round(
                        100 - cropBox.w > 0
                          ? (cropBox.x / (100 - cropBox.w)) * 100
                          : 0,
                      )}
                      %
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={
                      100 - cropBox.w > 0
                        ? Math.round((cropBox.x / (100 - cropBox.w)) * 100)
                        : 0
                    }
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCropBox((prev) => ({
                        ...prev,
                        x: (val / 100) * (100 - prev.w),
                      }));
                    }}
                    className="w-full accent-violet-500 h-1.5"
                  />
                </div>

                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between font-medium">
                    <span className="truncate">الرأسي (Y):</span>
                    <span>
                      {Math.round(
                        100 - cropBox.h > 0
                          ? (cropBox.y / (100 - cropBox.h)) * 100
                          : 0,
                      )}
                      %
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={
                      100 - cropBox.h > 0
                        ? Math.round((cropBox.y / (100 - cropBox.h)) * 100)
                        : 0
                    }
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCropBox((prev) => ({
                        ...prev,
                        y: (val / 100) * (100 - prev.h),
                      }));
                    }}
                    className="w-full accent-violet-500 h-1.5"
                  />
                </div>

                <div className="flex flex-col gap-0.5 col-span-2 border-t border-dashed border-violet-100 pt-1.5 mt-0.5">
                  <div className="flex justify-between font-medium text-violet-700">
                    <span>تكبير / تصغير (Zoom):</span>
                    <span>{cropZoom}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={cropZoom}
                    onChange={(e) => setCropZoom(Number(e.target.value))}
                    className="w-full accent-violet-500 h-1.5"
                  />
                </div>
              </div>

              {/* Quick alignment and crop Actions */}
              <div className="flex items-center justify-between flex-wrap gap-2 mt-1 pt-1.5 border-t border-violet-100">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] md:text-xs text-gray-500 font-medium">
                    محاذاة:
                  </span>
                  <button
                    type="button"
                    onClick={centerHorizontally}
                    title="توسيط أفقي"
                    className="p-1 md:p-1.5 bg-white border border-violet-200 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <svg
                      className="w-3.5 h-3.5 md:w-4 md:h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="12" y1="4" x2="12" y2="20" />
                      <polyline points="8 8 4 12 8 16" />
                      <polyline points="16 8 20 12 16 16" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={centerVertically}
                    title="توسيط رأسي"
                    className="p-1 md:p-1.5 bg-white border border-violet-200 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <svg
                      className="w-3.5 h-3.5 md:w-4 md:h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="4" y1="12" x2="20" y2="12" />
                      <polyline points="8 8 12 4 16 8" />
                      <polyline points="8 16 12 20 16 16" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={centerBoth}
                    title="توسيط كلي"
                    className="p-1 md:p-1.5 bg-white border border-violet-200 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <svg
                      className="w-3.5 h-3.5 md:w-4 md:h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="3" />
                      <line x1="12" y1="2" x2="12" y2="22" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                    </svg>
                  </button>
                </div>
                <div className="flex gap-1.5 ms-auto">
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    className="h-7 md:h-8 text-[11px] md:text-xs px-2 md:px-3"
                    onPress={() => setCropMode(false)}
                  >
                    إلغاء القص
                  </Button>
                  <Button
                    size="sm"
                    className="bg-violet-600 text-white font-semibold shadow-sm h-7 md:h-8 text-[11px] md:text-xs px-2.5 md:px-3"
                    onPress={handleApplyCrop}
                  >
                    تطبيق القص
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Prompt editor toggle */}
          <div className="border border-gray-100 rounded-xl overflow-hidden text-xs md:text-sm">
            <button
              type="button"
              onClick={() => setShowPromptEditor((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 md:px-4 md:py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-xs md:text-sm text-gray-600 font-medium"
            >
              <span className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5 md:w-4 md:h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                تخصيص البرومبت
              </span>
              <svg
                className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform ${showPromptEditor ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showPromptEditor && (
              <div className="p-2.5 md:p-3 flex flex-col gap-1.5">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="w-full text-[11px] md:text-xs text-gray-700 border border-gray-200 rounded-lg p-2 md:p-3 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 font-mono leading-relaxed"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setPrompt(DEFAULT_PROMPT)}
                  className="self-start text-[11px] md:text-xs text-violet-500 hover:text-violet-700 underline"
                >
                  إعادة تعيين للافتراضي
                </button>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="flex items-center justify-between gap-2 p-3 md:p-4 border-t border-gray-100">
          <Button
            color="danger"
            variant="light"
            size="sm"
            onPress={handleClose}
            isDisabled={isLoading}
            className="text-xs md:text-sm h-8 md:h-10 px-3"
          >
            إلغاء
          </Button>

          <div className="flex items-center gap-2">
            {status !== "done" && (
              <Button
                size="sm"
                className="bg-gradient-to-tr from-violet-500 to-purple-400 text-white font-semibold shadow-md hover:shadow-violet-200 hover:scale-[1.02] transition-all duration-200 text-xs md:text-sm h-8 md:h-10 px-3.5 md:px-5"
                onPress={handleEnhance}
                isDisabled={isLoading || !originalImageUrl}
                isLoading={isLoading}
              >
                {isLoading
                  ? "جاري المعالجة..."
                  : status === "error"
                    ? "إعادة المحاولة"
                    : "تفريغ الخلفية"}
              </Button>
            )}

            {status === "done" && (
              <>
                <Button
                  size="sm"
                  variant="flat"
                  color="default"
                  onPress={handleEnhance}
                  isDisabled={isLoading}
                  className="text-xs md:text-sm h-8 md:h-10 px-2.5 md:px-4"
                >
                  إعادة المحاولة
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-tr from-emerald-500 to-green-400 text-white font-semibold shadow-md hover:shadow-green-200 hover:scale-[1.02] transition-all duration-200 text-xs md:text-sm h-8 md:h-10 px-3.5 md:px-5"
                  onPress={handleConfirm}
                  isDisabled={cropMode}
                >
                  حفظ وتطبيق
                </Button>
              </>
            )}
          </div>
        </ModalFooter>
      </ModalContent>

      {/* Lightbox full-screen image viewer */}
      {lightboxImage &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-max bg-black/95 flex flex-col items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setLightboxImage(null)}
          >
            <button
              type="button"
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2.5 transition-colors focus:outline-none"
              onClick={() => setLightboxImage(null)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={lightboxImage}
              alt="عرض ملء الشاشة"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>,
          document.body,
        )}
    </Modal>
  );
}
