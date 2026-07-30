"use client";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function LanguageSwitcher({
  lang,
  home,
  awareness,
  className,
  brandColor,
  roundedClass = "rounded-full",
}) {
  const { user, setUser } = useUser();
  const router = useRouter();
  const currentPath = usePathname();
  const [currentSearch, setCurrentSearch] = useState("");

  // Get current search params using browser APIs
  useEffect(() => {
    if (typeof window !== "undefined") setCurrentSearch(window.location.search);
  }, []);

  const pageName = currentPath.replace("/en", "");
  const fullQueryString = currentSearch;

  // Check if user's language preference differs from current page language
  useEffect(() => {
    if (user && user?.lang && user.lang !== lang) {
      // Update user's language preference in database to match current page language
      const updateUserLanguage = async () => {
        try {
          const response = await fetch("/api/users/update-language", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lang }),
          });
          if (response.ok) setUser((prev) => ({ ...prev, lang }));
        } catch (error) {
          console.error("Failed to sync language preference:", error);
        }
      };

      updateUserLanguage();
    }
  }, [user, lang, setUser]);

  const handleLanguageSwitch = async () => {
    const newLang = lang === "ar" ? "en" : "ar";

    if (user && user.lang !== newLang) {
      try {
        const response = await fetch("/api/users/update-language", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang: newLang }),
        });
        if (response.ok) setUser((prev) => ({ ...prev, lang: newLang }));
      } catch (error) {
        console.error("Failed to update language preference:", error);
      }
    }
    // Navigate to the new language URL
    const targetUrl =
      newLang === "en"
        ? `/en${pageName}${fullQueryString}`
        : `${pageName || "/"}${fullQueryString}`;

    router.push(targetUrl);
  };

  const isArabic = lang === "ar";

  return (
    <div
      onClick={handleLanguageSwitch}
      className={
        className ||
        `relative flex items-center rounded-full p-1 shadow-sm cursor-pointer select-none ${
          home
            ? "bg-white/15 backdrop-blur"
            : "bg-gradient-to-br from-[#f3f4f6] to-[#e5e7eb]"
        }`
      }
      role="button"
      aria-label="Toggle language"
    >
      {/* Sliding indicator */}
      <div
        className={`absolute top-0.5 bottom-0.5 transition-all duration-300 ease-out w-1/2 right-1 ${roundedClass} ${
          brandColor ? "" : home ? "bg-primary" : "bg-darkNavy"
        }`}
        style={brandColor ? { backgroundColor: brandColor } : {}}
      />

      {/* Arabic label */}
      <div
        className={`relative md:w-10 w-8 flex justify-center z-10 md:px-3.5 px-2 md:py-1.5 py-1 rounded-full font-semibold md:text-sm text-xs transition-all duration-300 ease-out ${
          isArabic
            ? "text-white"
            : home && !awareness
              ? "text-white/70 hover:text-white"
              : "text-gray-500 hover:text-gray-700"
        }
        `}
      >
        <span className="flex items-center gap-1">ع</span>
      </div>

      {/* English label */}
      <div
        className={`relative md:w-10 w-8 flex justify-center z-10 md:px-3.5 px-2 md:py-1.5 py-1 rounded-full font-semibold md:text-sm text-xs transition-all duration-300 ease-out ${
          !isArabic
            ? "text-white"
            : home && !awareness
              ? "text-white/70 hover:text-white"
              : "text-gray-500 hover:text-gray-700"
        }
        `}
      >
        <span className="flex items-center gap-1">En</span>
      </div>
    </div>
  );
}
