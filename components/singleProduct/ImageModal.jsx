"use client";

import { Modal, ModalContent, ModalBody } from "@heroui/modal";
import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { anyImgUrl } from "@/utils/ImageUrl";
import { ChevronLeft } from "../ui/svgs/icons/ChevronLeftSvg";
import { ChevronRight } from "../ui/svgs/icons/ChevronRightSvg";
import { X } from "../ui/svgs/icons/XSvg";;

export default function ImageModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  productName,
  requested,
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    startIndex: initialIndex,
  });

  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  // Image loading state management
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [loadingImages, setLoadingImages] = useState(new Set());

  // Zoom state management
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const [justFinishedDragging, setJustFinishedDragging] = useState(false);
  const imageContainerRef = useRef(null);

  // Handle high-resolution image loading
  const handleImageLoad = useCallback((index) => {
    setLoadedImages((prev) => new Set([...prev, index]));
    setLoadingImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }, []);

  // Start loading high-resolution image
  const startImageLoad = useCallback(
    (index) => {
      if (!loadedImages.has(index) && !loadingImages.has(index)) {
        setLoadingImages((prev) => new Set([...prev, index]));
      }
    },
    [loadedImages, loadingImages],
  );

  // Preload images when modal opens or slide changes
  useEffect(() => {
    if (isOpen && images?.length) {
      // Start loading current image immediately
      startImageLoad(selectedIndex);
      // Preload adjacent images
      const prevIndex =
        selectedIndex === 0 ? images.length - 1 : selectedIndex - 1;
      const nextIndex =
        selectedIndex === images.length - 1 ? 0 : selectedIndex + 1;
      setTimeout(() => {
        startImageLoad(prevIndex);
        startImageLoad(nextIndex);
      }, 100);
    }
  }, [isOpen, selectedIndex, images?.length, startImageLoad]);

  const scrollPrev = useCallback(() => {
    if (emblaApi && !isZoomed) emblaApi.scrollPrev();
  }, [emblaApi, isZoomed]);

  const scrollNext = useCallback(() => {
    if (emblaApi && !isZoomed) emblaApi.scrollNext();
  }, [emblaApi, isZoomed]);

  const onThumbClick = useCallback(
    (index) => {
      if (!emblaApi || !emblaThumbsApi || isZoomed) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi, emblaThumbsApi, isZoomed],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
    emblaThumbsApi.scrollTo(emblaApi.selectedScrollSnap());
  }, [emblaApi, emblaThumbsApi]);

  // Zoom functionality
  const handleImageClick = useCallback(
    (e) => {
      // Prevent zoom out if we just finished dragging
      if (isDragging || justFinishedDragging) return;

      if (!isZoomed) {
        // Zoom in
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate pan position to center the clicked point
        const panX = (centerX - x) * 0.55;
        const panY = (centerY - y) * 0.55;

        setZoomLevel(2.5);
        setPanPosition({ x: panX, y: panY });
        setIsZoomed(true);
      } else {
        // Zoom out only if we haven't just finished dragging
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
        setIsZoomed(false);
      }
    },
    [isZoomed, isDragging, justFinishedDragging],
  );

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e) => {
      if (!isZoomed) return;
      e.preventDefault();
      setIsDragging(true);
      setHasDragged(false);
      setJustFinishedDragging(false);
      setDragStart({
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y,
      });
    },
    [isZoomed, panPosition],
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !isZoomed) return;

      // Mark that we have actually dragged
      setHasDragged(true);

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Limit pan boundaries
      const maxPan = 150;
      const limitedX = Math.max(-maxPan, Math.min(maxPan, newX));
      const limitedY = Math.max(-maxPan, Math.min(maxPan, newY));

      setPanPosition({ x: limitedX, y: limitedY });
    },
    [isDragging, isZoomed, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    if (hasDragged) {
      setJustFinishedDragging(true);
      // Clear the flag after a short delay to allow normal clicks again
      setTimeout(() => {
        setJustFinishedDragging(false);
      }, 100);
    }
    setIsDragging(false);
    setHasDragged(false);
  }, [hasDragged]);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback(
    (e) => {
      if (!isZoomed) return;
      e.preventDefault();
      const touch = e.touches[0];
      setIsDragging(true);
      setHasDragged(false);
      setJustFinishedDragging(false);
      setDragStart({
        x: touch.clientX - panPosition.x,
        y: touch.clientY - panPosition.y,
      });
    },
    [isZoomed, panPosition],
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging || !isZoomed) return;
      e.preventDefault();

      // Mark that we have actually dragged
      setHasDragged(true);

      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;

      // Limit pan boundaries
      const maxPan = 120;
      const limitedX = Math.max(-maxPan, Math.min(maxPan, newX));
      const limitedY = Math.max(-maxPan, Math.min(maxPan, newY));

      setPanPosition({ x: limitedX, y: limitedY });
    },
    [isDragging, isZoomed, dragStart],
  );

  const handleTouchEnd = useCallback(() => {
    if (hasDragged) {
      setJustFinishedDragging(true);
      // Clear the flag after a short delay to allow normal clicks again
      setTimeout(() => {
        setJustFinishedDragging(false);
      }, 100);
    }
    setIsDragging(false);
    setHasDragged(false);
  }, [hasDragged]);

  // Reset zoom when changing slides
  const resetZoom = useCallback(() => {
    setIsZoomed(false);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
    setHasDragged(false);
    setJustFinishedDragging(false);
  }, []);

  // Reset loading states when modal closes
  const resetLoadingStates = useCallback(() => {
    setLoadedImages(new Set());
    setLoadingImages(new Set());
  }, []);

  // Enhanced close handler
  const handleClose = useCallback(() => {
    resetZoom();
    resetLoadingStates();
    onClose();
  }, [resetZoom, resetLoadingStates, onClose]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    emblaApi.on("select", resetZoom); // Reset zoom when slide changes
  }, [emblaApi, onSelect, resetZoom]);

  // Reset to initial index when modal opens
  useEffect(() => {
    if (isOpen && emblaApi) {
      emblaApi.scrollTo(initialIndex);
      resetZoom();
    }
  }, [isOpen, initialIndex, emblaApi, resetZoom]);

  // Add mouse and touch event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      // Mouse events
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      // Touch events
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // Disable carousel dragging when zoomed
  useEffect(() => {
    if (emblaApi) {
      if (isZoomed) {
        emblaApi.reInit({ watchDrag: false });
      } else {
        emblaApi.reInit({ watchDrag: true });
      }
    }
  }, [emblaApi, isZoomed]);

  if (!images || images.length === 0) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="full"
      hideCloseButton
      classNames={{
        body: "p-0",
        backdrop: "bg-black/90 backdrop-blur-sm",
        base: "bg-transparent shadow-none pointer-events-none",
      }}
    >
      <ModalContent className="h-full">
        <ModalBody className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <button
              onClick={handleClose}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Zoom indicator */}
          {isZoomed && (
            <div className="absolute top-4 left-4 z-50 pointer-events-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-white text-sm font-medium">
                  Click to zoom out
                </span>
              </div>
            </div>
          )}

          {/* Main image container with Embla Carousel */}
          <div className="flex-1 flex items-center justify-center relative">
            {/* Navigation arrows */}
            {images.length > 1 && !isZoomed && (
              <>
                <button
                  onClick={scrollPrev}
                  disabled={prevBtnDisabled}
                  className="group flex items-center md:top-0 md:bottom-0 pointer-events-auto absolute left-0 z-40 px-8"
                >
                  <div className="bg-white/20 group-hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </div>
                </button>
                <button
                  onClick={scrollNext}
                  disabled={nextBtnDisabled}
                  className="group flex items-center md:top-0 md:bottom-0 pointer-events-auto absolute right-0 z-40 px-8"
                >
                  <div className="bg-white/20 group-hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronRight className="w-6 h-6 text-white" />
                  </div>
                </button>
              </>
            )}

            {/* Embla Carousel for main images */}
            <div
              className="w-full h-full max-w-8xl max-h-[80vh] mx-4 mb-4"
              dir="ltr"
            >
              <div
                className="embla__viewport h-full pointer-events-auto"
                ref={emblaRef}
              >
                <div className="embla__container h-full">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="embla__slide h-full flex items-center justify-center"
                    >
                      <div
                        ref={imageContainerRef}
                        className="relative w-full h-full overflow-hidden"
                        style={{
                          cursor: isZoomed
                            ? isDragging
                              ? "grabbing"
                              : "grab"
                            : "zoom-in",
                        }}
                      >
                        <div
                          className="relative w-full h-full transition-transform duration-300 ease-out"
                          style={{
                            transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)`,
                          }}
                          onClick={handleImageClick}
                          onMouseDown={handleMouseDown}
                          onTouchStart={handleTouchStart}
                        >
                          {/* Low-resolution placeholder image */}
                          <Image
                            src={anyImgUrl({
                              src: requested ? image : image?.preview,
                              size: index === 0 ? 900 : 500,
                              quality: 100,
                            })}
                            fill
                            alt={`${productName} - Image ${index + 1}`}
                            title={`${productName} - Image ${index + 1}`}
                            unoptimized
                            className={`h-full w-full ${
                              requested ? "object-cover" : "object-contain"
                            } rounded-lg select-none transition-opacity duration-300 ${
                              loadedImages.has(index)
                                ? "opacity-0"
                                : "opacity-100"
                            }`}
                            draggable={false}
                          />

                          {/* High-resolution image */}
                          {(loadingImages.has(index) ||
                            loadedImages.has(index)) && (
                            <Image
                              src={anyImgUrl({
                                src: requested ? image : image?.preview,
                                size: 1500,
                                quality: 90,
                              })}
                              fill
                              alt={`${productName} - Image ${index + 1}`}
                              title={`${productName} - Image ${index + 1}`}
                              unoptimized
                              className={`h-full w-full ${
                                requested ? "object-cover" : "object-contain"
                              } rounded-lg select-none transition-opacity duration-300 ${
                                loadedImages.has(index)
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                              draggable={false}
                              onLoad={() => handleImageLoad(index)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail navigation with Embla Carousel */}
          {images.length > 1 && !isZoomed && (
            <div className="pointer-events-auto absolute md:bottom-2 bottom-4 left-1/2 transform -translate-x-1/2 z-40">
              <div className="bg-white/10 md:bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1">
                <div className="embla-thumbs md:max-w-md max-w-xs" dir="ltr">
                  <div className="embla-thumbs__viewport" ref={emblaThumbsRef}>
                    <div className="embla-thumbs__container gap-2">
                      {images.map((image, index) => (
                        <div key={index} className="embla-thumbs__slide flex">
                          <button
                            onClick={() => onThumbClick(index)}
                            className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all ${
                              index === selectedIndex
                                ? "ring-2 ring-white scale-95"
                                : "opacity-70 hover:opacity-100 scale-90"
                            }`}
                          >
                            <div
                              className="absolute inset-0 opacity-95"
                              style={{
                                background:
                                  image?.gradientStyle ||
                                  "linear-gradient(135deg, rgb(255 255 255), rgb(255 255 255))",
                              }}
                            />
                            <Image
                              src={anyImgUrl({
                                src: requested ? image : image?.preview,
                                size: 100,
                                quality: 70,
                              })}
                              fill
                              alt={`${productName} thumbnail ${index + 1}`}
                              unoptimized
                              className={`h-full w-full ${
                                requested ? "object-cover" : "object-contain"
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Image counter */}
          {images.length > 1 && !isZoomed && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-white font-medium">
                  {selectedIndex + 1} / {images.length}
                </span>
              </div>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
