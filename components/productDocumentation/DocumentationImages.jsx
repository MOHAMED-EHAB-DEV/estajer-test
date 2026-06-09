"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Close } from "../ui/svgs/icons/CloseSvg"; // Assuming ImageSvg is the icon from your screenshot
import Button from "../ui/Button";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import { useTranslations } from "@/hooks/useTranslations";

export default function DocumentationImages({ files, setFiles, translate }) {
  const trans = useTranslations(translate);
  const t = (key) => trans(`productDocumentation.${key}`);

  const MAX_FILES = 10;
  const MAX_WIDTH = 1500;

  const [mediaStream, setMediaStream] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const processCapturedImageWithTimestamp = useCallback(
    (sourceCanvas) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = sourceCanvas.toDataURL();

        img.onload = () => {
          const targetCanvas = document.createElement("canvas");
          const ctx = targetCanvas.getContext("2d");
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          targetCanvas.width = width;
          targetCanvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          // --- Add Timestamp ---
          const now = new Date();
          const dateTimeString = now.toLocaleString("fr", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          const fontSize = Math.max(18, Math.min(width * 0.03, height * 0.03)); // Responsive font size
          ctx.font = `bold ${fontSize}px Arial, sans-serif`;
          ctx.textBaseline = "bottom";
          ctx.textAlign = "right";

          const padding = fontSize * 0.5; // Padding around text

          // Measure text for background
          const textMetrics = ctx.measureText(dateTimeString);
          const textWidth = textMetrics.width;
          const textHeight = fontSize; // Approximate height

          // Draw semi-transparent background for timestamp
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          ctx.fillRect(
            width - textWidth - padding * 2, // x
            height - textHeight - padding * 2, // y
            textWidth + padding * 2, // width
            textHeight + padding * 2, // height
          );

          // Draw timestamp text
          ctx.fillStyle = "white";
          ctx.fillText(dateTimeString, width - padding, height - padding);
          // --- End Timestamp ---

          const resizedBase64 = targetCanvas.toDataURL("image/webp", 0.85);

          resolve({
            preview: resizedBase64,
            name: `camera-${Date.now()}.webp`,
            type: "image/webp",
          });
        };

        img.onerror = (error) => {
          console.error("Error loading captured image for processing:", error);
          reject(new Error("Failed to load captured image for processing."));
        };
      });
    },
    [MAX_WIDTH],
  );

  const startCamera = async () => {
    if (files.length >= MAX_FILES) {
      toast.warning(
        ToastMessage(t("maxFilesExceeded").replace("{count}", MAX_FILES)),
      );
      return;
    }
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setMediaStream(stream);
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      let message = `Error accessing camera: ${err.name}`;
      if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        message = t("errors.cameraNotFound");
      } else if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        message = t("errors.cameraPermissionDenied");
      } else if (
        err.name === "OverconstrainedError" ||
        err.name === "ConstraintNotSatisfiedError"
      ) {
        message = t("errors.cameraConstraints");
      } else if (
        err.name === "NotReadableError" ||
        err.name === "TrackStartError"
      ) {
        message = t("errors.cameraInUse");
      }
      setCameraError(message);
      setIsCameraOpen(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    setIsCameraOpen(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [mediaStream]);

  const capturePhoto = async () => {
    if (!videoRef.current || !mediaStream || !canvasRef.current) {
      setCameraError(t("cameraNotReady"));
      return;
    }
    if (files.length >= MAX_FILES) {
      toast.warning(
        ToastMessage(t("maxFilesExceeded").replace("{count}", MAX_FILES)),
      );
      if (isCameraOpen) stopCamera();
      return;
    }

    const video = videoRef.current;
    const captureCanvas = canvasRef.current;

    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;

    const ctx = captureCanvas.getContext("2d");
    if (!ctx) {
      console.error("Failed to get 2D context from capture canvas.");
      setCameraError(t("errors.technicalError"));
      return;
    }

    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

    try {
      const processedFile =
        await processCapturedImageWithTimestamp(captureCanvas);
      setFiles((prevFiles) => [...prevFiles, processedFile]);

      if (files.length + 1 >= MAX_FILES) stopCamera();
    } catch (error) {
      console.error("Error processing captured image:", error);
      toast.error(ToastMessage(t("imageProcessError")));
    }
  };

  useEffect(() => {
    if (mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  useEffect(() => {
    return () => {
      if (mediaStream) {
        stopCamera();
      }
    };
  }, [mediaStream, stopCamera]);

  const removeFile = (index) =>
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });

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

  return (
    <>
      <div className="flex flex-col gap-4">
        {!isCameraOpen && files.length < MAX_FILES && (
          <button
            type="button"
            onClick={startCamera}
            className="w-full min-h-[200px] bg-orange-50 border-2 border-dashed border-orange-400 rounded-xl
          flex flex-col items-center justify-center p-6 text-center
            text-gray-500 hover:text-primary hover:border-primary transition-colors group"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="text-primary w-10 h-10"
            >
              <path
                d="M1 8a2 2 0 0 1 2-2h1V4.5A1.5 1.5 0 0 1 5.5 3h9A1.5 1.5 0 0 1 16 4.5V6h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm5.21 3.24a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 1 1-1.06-1.06L4.94 11.5l-2.29-2.3a.75.75 0 0 1 1.06-1.06l2.5 2.5ZM14.5 11a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{t("openCameraButton")}</span>
            <span className="text-xs mt-1">
              ({files.length}/{MAX_FILES} {t("imagesAdded")})
            </span>
          </button>
        )}

        {isCameraOpen && (
          <div className="my-2 p-3 border border-gray-300 rounded-lg bg-gray-50 shadow-md">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-[calc(100vh-300px)] min-h-[200px] rounded-md bg-black object-contain mb-3"
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                color="success"
                onPress={capturePhoto}
                isDisabled={files.length >= MAX_FILES}
                className="flex-grow bg-green-500 hover:bg-green-600 text-white py-2.5 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    d="M1 8a2 2 0 0 1 2-2h1V4.5A1.5 1.5 0 0 1 5.5 3h9A1.5 1.5 0 0 1 16 4.5V6h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm5.21 3.24a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 1 1-1.06-1.06L4.94 11.5l-2.29-2.3a.75.75 0 0 1 1.06-1.06l2.5 2.5ZM14.5 11a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
                {t("captureButton")} ({files.length}/{MAX_FILES})
              </Button>
              <Button
                color="danger"
                onPress={stopCamera}
                className="bg-red-500 hover:bg-red-600 text-white py-2.5 px-4 rounded-lg flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
                {t("closeCamera")}
              </Button>
            </div>
          </div>
        )}

        {cameraError && (
          <p className="text-red-600 text-sm mt-2 p-3 bg-red-100 border border-red-300 rounded-md text-center">
            {cameraError}
          </p>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-2">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            {t("capturedImages")}:
          </h3>
          <div className="flex flex-wrap gap-4">
            {files.map((file, idx) => (
              <div
                key={file.name + idx} // More robust key
                className="relative group"
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, idx)}
              >
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <img
                    src={file.preview}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute -top-2 -right-2 sm:-top-2.5 sm:-right-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-transform transform group-hover:scale-110"
                  aria-label="Remove image"
                >
                  <Close className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ul className="text-gray-600 space-y-1 list-disc list-inside mt-4">
        <li>{t("maxImagesAllowed").replace("{count}", MAX_FILES)}</li>
        <li>{t("timestampAddedToImages")}</li>
        <li>{t("onlyCameraAllowed")}</li>
      </ul>
    </>
  );
}
