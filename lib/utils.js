import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getTranslations } from "@/hooks/getTranslations";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function hexToRgba(hex, alpha = 0.1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function removeLastWord(str) {
  const words = str?.trim()?.split(" ") || [];
  if (words.length === 1 && str.length <= 3) return str;
  if (words.length === 1 && str.length === 4) return str.slice(0, -2) + "**";
  if (words.length === 1) return str.slice(0, -4) + "****";
  return words
    .map((word, idx) =>
      idx !== words.length - 1 ? word : "*".repeat(word.length),
    )
    .join(" ");
}

export function isArabic(text) {
  const arabicRegex = /^[\u0600-\u06FF]/;
  return arabicRegex.test(text);
}

export const linkify = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          href={part}
          key={i}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

export function translatePathSegments(p, t) {
  const segments = p.split("/").filter(Boolean);
  let currentPath = "";

  return segments
    .map((segment, index) => {
      const translated = t(segment);
      currentPath += `/${segment}${["products", "orders", "messages", "support"].includes(segment) ? "/overview" : ""}`;
      return {
        text: translated,
        href: currentPath,
      };
    })
    .filter((item) => !item.text?.toLowerCase().startsWith("missing"));
}

export function formatNumeric(num) {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1) + "k";
  }
  return num?.toString();
}

export const generatePathName = (email) => {
  const timestamp = Date.now().toString().slice(-6);
  const [localPart, domain] = email.split("@");
  const domainName = domain.split(".")[0];
  return email.includes("info")
    ? `${domainName}${timestamp}`.slice(0, 23)
    : `${localPart}${timestamp}`.slice(0, 23);
};
