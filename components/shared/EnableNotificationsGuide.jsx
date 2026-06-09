"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "../ui/CnButton";
import { ChevronLeft } from "../ui/svgs/icons/ChevronLeftSvg";
import { ChevronRight } from "../ui/svgs/icons/ChevronRightSvg";;
import { useTranslations } from "@/hooks/useTranslations";

const EnableNotificationsGuide = ({ translate, lang }) => {
  const trans = useTranslations(translate);
  const t = (text) => trans(`notifications.model.guide.${text}`);
  const [os, setOs] = useState("undetermined");
  const [browser, setBrowser] = useState("undetermined");
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    skipSnaps: false,
    direction: lang === "ar" ? "rtl" : "ltr",
  });
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (idx) => {
      if (emblaApi) emblaApi.scrollTo(idx);
    },
    [emblaApi]
  );

  const onInit = useCallback((emblaApi) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;

    if (/Android/i.test(userAgent)) setOs("Android");
    else if (/iPhone|iPad|iPod/i.test(userAgent)) setOs("iOS");
    else if (/Win/i.test(userAgent)) setOs("Windows");
    else if (/Mac/i.test(userAgent)) setOs("MacOS");

    if (userAgent.indexOf("Firefox") > -1) setBrowser("Firefox");
    else if (userAgent.indexOf("SamsungBrowser") > -1)
      setBrowser("Samsung Internet");
    else if (userAgent.indexOf("Edg") > -1) setBrowser("Edge");
    else if (userAgent.indexOf("Chrome") > -1) setBrowser("Chrome");
    else if (userAgent.indexOf("Safari") > -1 && !/Chrome/.test(userAgent))
      setBrowser("Safari");
  }, []);

  const guides = {
    Windows: {
      Chrome: [
        {
          text: t("windows.chrome.0"),
          img: "/screenshots/chrome-windows-lock.png",
        },
        {
          text: t("windows.chrome.1"),
          img: "/screenshots/chrome-windows-notifications.png",
        },
        {
          text: t("windows.chrome.2"),
          img: "/screenshots/chrome-windows-refresh.png",
        },
      ],
      Firefox: [
        {
          text: t("windows.firefox.0"),
          img: "/screenshots/firefox-windows-permissions.png",
        },
        {
          text: t("windows.firefox.1"),
          img: "/screenshots/firefox-windows-notifications.png",
        },
        {
          text: t("windows.firefox.2"),
          img: "/screenshots/firefox-windows-refresh.png",
        },
      ],
      Edge: [
        {
          text: t("windows.edge.0"),
          img: "/screenshots/edge-windows-lock.png",
        },
        {
          text: t("windows.edge.1"),
          img: "/screenshots/edge-windows-notifications.png",
        },
        {
          text: t("windows.edge.2"),
          img: "/screenshots/edge-windows-refresh.png",
        },
      ],
    },
    MacOS: {
      Chrome: [
        {
          text: t("macos.chrome.0"),
          img: "/screenshots/chrome-windows-lock.png",
        },
        {
          text: t("macos.chrome.1"),
          img: "/screenshots/chrome-windows-notifications.png",
        },
        {
          text: t("macos.chrome.2"),
          img: "/screenshots/chrome-windows-refresh.png",
        },
      ],
      Firefox: [
        {
          text: t("macos.firefox.0"),
          img: "/screenshots/firefox-windows-permissions.png",
        },
        {
          text: t("macos.firefox.1"),
          img: "/screenshots/firefox-windows-notifications.png",
        },
        {
          text: t("macos.firefox.2"),
          img: "/screenshots/firefox-windows-refresh.png",
        },
      ],
      Safari: [
        { text: t("macos.safari.0"), img: null },
        { text: t("macos.safari.1"), img: null },
        { text: t("macos.safari.2"), img: null },
      ],
    },
    Android: {
      Chrome: [
        {
          text: t("android.chrome.0"),
          img: "/screenshots/chrome-android-lock.jpg",
        },
        {
          text: t("android.chrome.1"),
          img: "/screenshots/chrome-android-notifications.jpg",
        },
        {
          text: t("android.chrome.2"),
          img: "/screenshots/chrome-android-refresh.jpg",
        },
      ],
      "Samsung Internet": [
        {
          text: t("android.samsung.0"),
          img: "/screenshots/chrome-android-lock.jpg",
        },
        {
          text: t("android.samsung.1"),
          img: "/screenshots/chrome-android-notifications.jpg",
        },
        {
          text: t("android.samsung.2"),
          img: "/screenshots/chrome-android-refresh.jpg",
        },
      ],
      Firefox: [
        { text: t("android.firefox.0"), img: null },
        { text: t("android.firefox.1"), img: null },
        { text: t("android.firefox.2"), img: null },
      ],
    },
    iOS: {
      Chrome: [
        { text: t("ios.chrome.0"), img: null },
        { text: t("ios.chrome.1"), img: null },
      ],
      Safari: [
        { text: t("ios.safari.0"), img: null },
        { text: t("ios.safari.1"), img: null },
        { text: t("ios.safari.2"), img: null },
      ],
      Firefox: [
        { text: t("ios.firefox.0"), img: null },
        { text: t("ios.firefox.1"), img: null },
      ],
    },
  };

  const getInstructions = () => {
    if (guides[os] && guides[os][browser]) return guides[os][browser];
    return [{ text: t("noGuide"), img: null }];
  };
  const instructions = getInstructions();

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg overflow-y-auto max-h-[75vh]">
      <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        {t("enableNotifications")}
      </h3>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        {t("blockedNotifications")}{" "}
        <span className="font-semibold text-orange-500">{browser}</span>{" "}
        {t("on")} <span className="font-semibold text-orange-500">{os}</span>.
      </p>

      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {instructions.map((step, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 px-3">
                <div className="flex flex-col md:flex-row items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-orange-500 text-white flex items-center justify-center rounded-full text-lg font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-gray-200">
                      {step.text}
                    </p>
                    {step.img && (
                      <div className="mt-4 rounded-lg relative md:aspect-[1.2/1] aspect-[1/1.35] overflow-hidden border dark:border-gray-700">
                        <Image
                          src={step.img}
                          alt={`Step ${index + 1}`}
                          fill
                          unoptimized
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {instructions.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-[-15px] top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
              onClick={lang === "ar" ? scrollNext : scrollPrev}
              disabled={lang === "ar" ? nextBtnDisabled : prevBtnDisabled}
              aria-label="Previous products"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-[-15px] top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
              onClick={lang === "ar" ? scrollPrev : scrollNext}
              disabled={lang === "ar" ? prevBtnDisabled : nextBtnDisabled}
              aria-label="Next products"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {instructions.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === selectedIndex
                  ? "bg-primary w-8"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EnableNotificationsGuide;
