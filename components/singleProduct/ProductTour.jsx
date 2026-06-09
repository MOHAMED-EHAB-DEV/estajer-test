"use client";
import { useEffect } from "react";
import { driver } from "driver.js";
import "@/styles/product-tour.css";
import { useTranslations } from "@/hooks/useTranslations";

export default function ProductTour({ lang, translate, product }) {
  useEffect(() => {
    const trans = useTranslations(translate);
    const t = (key) => trans(`productTour.${key}`);

    const steps = [
      // Introduction step (no element = center of screen)
      {
        popover: {
          title: t("steps.introduction.title"),
          description: t("steps.introduction.description"),
          showButtons: ["next", "close"],
        },
      },
      {
        element: "#order-container",
        popover: {
          title: t("steps.orderContainer.title"),
          description: t("steps.orderContainer.description"),
          side: lang === "ar" ? "right" : "left",
          align: "start",
        },
      },
      {
        element: "#quantity-selector",
        popover: {
          title: t("steps.quantity.title"),
          description: t("steps.quantity.description"),
          side: lang === "ar" ? "right" : "left",
          align: "start",
        },
      },
    ];

    if (product?.pricingModel === "packages") {
      steps.push(
        {
          element: "#booking-packages",
          popover: {
            title: t("steps.bookingPackages.title"),
            description: t("steps.bookingPackages.description"),
            side: lang === "ar" ? "right" : "left",
            align: "start",
          },
        },
        {
          element: "#packages-range-date",
          popover: {
            title: t("steps.packagesRangeDate.title"),
            description: t("steps.packagesRangeDate.description"),
            side: lang === "ar" ? "right" : "left",
            align: "start",
          },
        }
      );
    } else {
      steps.push({
        element: "#date-selector",
        popover: {
          title: t("steps.dateSelector.title"),
          description: t("steps.dateSelector.description"),
          side: lang === "ar" ? "right" : "left",
          align: "start",
        },
      });
    }

    steps.push({
      element: "#booking-button",
      popover: {
        title: t("steps.bookingButton.title"),
        description: t("steps.bookingButton.description"),
        side: "top",
        align: "center",
      },
    });

    const isDelivery = product.rental.delivery.type === "delivery";
    steps.push({
      element: "#delivery-options",
      popover: {
        title: t(
          isDelivery
            ? "steps.deliveryOptions.deliveryTitle"
            : "steps.deliveryOptions.pickupTitle"
        ),
        description: t(
          isDelivery
            ? "steps.deliveryOptions.deliveryDescription"
            : "steps.deliveryOptions.pickupDescription"
        ),
        side: lang === "ar" ? "right" : "left",
        align: "start",
      },
    });

    steps.push(
      {
        element: "#product-location",
        popover: {
          title: t("steps.productLocation.title"),
          description: t("steps.productLocation.description"),
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "#chat-button",
        popover: {
          title: t("steps.chatButton.title"),
          description: t("steps.chatButton.description"),
          side: "top",
          align: "center",
        },
      }
    );

    // Initialize driver.js with RTL support for Arabic
    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      steps: steps,
      nextBtnText: t("navigation.next"),
      prevBtnText: t("navigation.previous"),
      doneBtnText: t("navigation.done"),
      progressText: t("navigation.progress"),
      // RTL support
      rtl: lang === "ar",
      onDestroyStarted: () => {
        driverObj.destroy();
      },
      onPopoverRender: (popover, { config, state }) => {
        const footer = popover.footer;
        if (footer) {
          const currentStep = state.activeIndex;
          const totalSteps = steps.length;
          const isFirstStep = currentStep === 0;
          const isLastStep = currentStep === totalSteps - 1;

          // Remove existing skip button if it exists
          const existingSkipBtn = footer.querySelector(
            ".driver-popover-btn-skip"
          );
          if (existingSkipBtn) {
            existingSkipBtn.remove();
          }

          if (isFirstStep) {
            // For the introduction step, customize the buttons
            const nextBtn = footer.querySelector(".driver-popover-next-btn");
            const closeBtn = footer.querySelector(".driver-popover-close-btn");

            if (nextBtn) {
              nextBtn.innerText = lang === "ar" ? "ابدأ الجولة" : "Start Tour";
            }

            if (closeBtn) {
              closeBtn.innerText = lang === "ar" ? "تخطي" : "Skip Tour";
            }
          } else if (!isLastStep) {
            // For other steps (except the last step), add the skip button
            const skipBtn = document.createElement("button");
            skipBtn.type = "button";
            skipBtn.innerText = lang === "ar" ? "تخطي" : "Skip";
            skipBtn.style.cssText = `
              background-color: transparent;
              color: #6b7280;
              border: 1px solid transparent;
              text-decoration: none;
              text-shadow: none;
              font-size: 14px;
              padding: 5px 10px;
              border-radius: 4px;
              cursor: pointer;
              transition: color 0.2s;
            `;
            skipBtn.addEventListener("mouseover", () => {
              skipBtn.style.color = "#111";
            });
            skipBtn.addEventListener("mouseout", () => {
              skipBtn.style.color = "#6b7280";
            });
            skipBtn.addEventListener("click", () => driverObj.destroy());
            footer.insertBefore(skipBtn, footer.firstChild);
          }
        }
      },
    });

    // Start the tour with a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      driverObj.drive();
    }, 500);

    return () => {
      clearTimeout(timer);
      driverObj.destroy();
    };
  }, [lang, translate, product]);

  return null;
}
