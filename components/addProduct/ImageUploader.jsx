"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { useState, useRef, useCallback, useEffect } from "react";
import { Close } from "../ui/svgs/icons/CloseSvg";
import { ImageSvg } from "../ui/svgs/icons/ImageSvgSvg";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import { extractColorsFromCanvas } from "@/utils/ImageResizer";

export default function ImageUploader({
  files,
  setFiles,
  review,
  translate,
  proposal,
  isThumbnail = false,
  sm,
  layout = "horizontal",
  hideTips = false,
}) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`addProductPage.imageUploader.${key}`);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const MAX_FILES = review ? 5 : isThumbnail ? 1 : 10;
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const MinWidth = review ? 400 : 1; // Minimum width for resized images
  const MAX_WIDTH = 1500; // Maximum width for resized images

  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          let width = img.width;
          let height = img.height;

          if (width < MinWidth)
            return toast.error(
              ToastMessage(t("minWidth").replace("{width}", MinWidth)),
            );

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw and resize image on canvas
          ctx?.drawImage(img, 0, 0, width, height);

          // Extract colors for gradient (using a smaller canvas for analysis)
          const analysisCanvas = document.createElement("canvas");
          const analysisCtx = analysisCanvas.getContext("2d");
          analysisCanvas.width = 150;
          analysisCanvas.height = 150;

          // Draw image to analysis canvas
          analysisCtx.drawImage(img, 0, 0, 150, 150);

          // Get gradient colors
          const gradientColors = extractColorsFromCanvas(analysisCtx, 150, 150);

          // Convert to WebP format with base64
          const resizedBase64 = canvas.toDataURL("image/webp");

          resolve({
            preview: resizedBase64,
            name: file.name,
            type: "image/webp",
            gradientColors: gradientColors,
            gradientStyle: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`,
          });
        };

        img.onerror = (error) => {
          reject(error);
        };
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0)
      handleFiles(e.dataTransfer.files);
  }, []);

  const handleFiles = async (fileList) => {
    if (files.length >= MAX_FILES)
      return toast.error(
        ToastMessage(t("maxFiles").replace("{count}", MAX_FILES)),
      );

    const newFiles = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, MAX_FILES - files.length);

    if (newFiles.length === 0)
      return toast.error(ToastMessage(t("imagesOnly")));

    // Check file sizes
    const oversizedFiles = newFiles.filter((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0)
      toast.warning(ToastMessage(t("maxFileSize")));

    const validFiles = newFiles.filter((file) => file.size <= MAX_FILE_SIZE);

    try {
      const processedFiles = await Promise.all(
        validFiles.map((file) => resizeImage(file)),
      );
      setFiles((prevFiles) => [...prevFiles, ...processedFiles]);
    } catch (error) {
      console.error("Error processing images:", error);
      toast.error(ToastMessage(t("processError")));
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index) =>
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });

  // Function to handle reordering
  const handleDragStart = (e, index) =>
    e.dataTransfer.setData("text/plain", index.toString());

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = Number(e.dataTransfer.getData("text/plain"));
    if (dragIndex === dropIndex) return;
    const newFiles = [...files];
    const draggedItem = newFiles[dragIndex];
    newFiles.splice(dragIndex, 1);
    newFiles.splice(dropIndex, 0, draggedItem);
    setFiles(newFiles);
  };
  useEffect(() => {
    const handlePaste = (event) => {
      if (event.clipboardData && event.clipboardData.items) {
        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          const imageType = items[i].type;
          if (
            imageType === "image/png" ||
            imageType === "image/jpeg" ||
            imageType === "image/webp"
          ) {
            const file = items[i].getAsFile();
            handleFiles([file]);
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handleFiles]);
  return (
    <>
      <div
        className={`border-2 border-dashed ${
          sm ? "rounded-2xl p-4" : "rounded-2xl p-8"
        } text-center cursor-pointer transition-colors bg-[#fff8ed] ${
          isDragging
            ? "border-primary bg-primary/5 animate-pulse"
            : "border-[#fbbf92] hover:bg-orange-50/30"
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          multiple
          accept="image/*"
          className="hidden"
        />
        <div
          className={`flex ${
            layout === "vertical"
              ? "flex-col items-center justify-center py-6 px-4 gap-3"
              : "items-center justify-center gap-2"
          } pointer-events-none ${
            review
              ? sm
                ? "min-h-[5rem]"
                : "min-h-[6rem]"
              : sm
                ? "min-h-[8rem]"
                : "min-h-[12rem]"
          }`}
        >
          <ImageSvg size={review ? (sm ? 22 : 26) : sm ? 26 : 31} />
          <p
            className={`text-[#5B5656] ${
              !review ? (sm ? "text-sm" : "text-lg") : sm ? "text-xs" : ""
            }`}
          >
            {isDragging ? t("dragging") : t("dragAndDrop")}
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className={sm ? "mt-2" : "mt-6"}>
          <div className="flex flex-wrap gap-4">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="relative group"
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, idx)}
              >
                <div
                  className={`relative aspect-[1/.8] ${
                    sm ? "h-24" : "h-32"
                  } border rounded-lg overflow-hidden`}
                >
                  <div
                    className="absolute inset-0 opacity-95 group-hover:opacity-90 transition-opacity duration-300"
                    style={{ background: file.gradientStyle }}
                  />
                  <img
                    src={file.preview || "/placeholder.svg"}
                    alt={`Preview ${idx}`}
                    className="w-full h-full object-contain relative z-10"
                  />
                  {!review && !proposal && idx === 0 && (
                    <div className="absolute bottom-0 z-20 left-0 right-0 bg-primary/80 text-white text-xs py-1 text-center">
                      {t("mainImage")}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute z-20 -top-2 -left-2 bg-red-500 bg-opacity-90 hover:bg-opacity-100 transition-colors text-white rounded-full p-1 "
                >
                  <Close className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {!hideTips && (
        <ul
          className={`text-darkNavy ${
            sm ? "text-sm space-y-0.5 mt-1" : "space-y-1 mt-4"
          }`}
        >
          {!review || (!proposal && <li>• {t("tips.mainImageTip")}</li>)}
          {!isThumbnail && <li>• {t("tips.dragTip")}</li>}
          <li>• {t("tips.maxFilesTip").replace("{count}", MAX_FILES)}</li>
          {!review && <li>• {t("tips.resizeTip")}</li>}
        </ul>
      )}
    </>
  );
}
