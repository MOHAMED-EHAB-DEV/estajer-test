import React from "react";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";
import { Location } from "../ui/svgs/icons/LocationSvg";
import { Premium } from "../ui/svgs/icons/PremiumSvg";
import { Star } from "../ui/svgs/icons/StarSvg";
import ChatButton from "../chat/ChatButton";
import Button from "../ui/Button";
import Link from "next/link";
import { differenceInMonths } from "date-fns";
import { useTranslations } from "@/hooks/useTranslations";
import { isArabic, removeLastWord } from "@/lib/utils";
import { Share } from "../ui/svgs/icons/ShareSvg";
import { Company } from "../ui/svgs/icons/CompanySvg";
import { CheckFilled } from "../ui/svgs/icons/CheckFilledSvg";
import { User as UserIcon } from "../ui/svgs/icons/UserSvg";
const ProductsIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="19"
    height="13"
    fill="none"
    viewBox="0 0 19 13"
    {...props}
  >
    <path
      fill="#F28E2B"
      d="M12.038 6.3c.14 0 .253 0 .393-.028l3.854-1.125v5.006a.875.875 0 0 1-.704.872l-6.075 1.547c-.28.056-.59.056-.871 0L2.56 11.025c-.394-.084-.675-.45-.675-.872V5.147l3.853 1.125a1.302 1.302 0 0 0 1.519-.619l1.828-3.01 1.8 3.01c.225.394.675.647 1.153.647m5.99-3.15c.113.253 0 .563-.28.647L12.177 5.4a.495.495 0 0 1-.534-.197L9.084.9l7.032-.872a.415.415 0 0 1 .45.225zM1.575.253a.415.415 0 0 1 .45-.225L9.085.9 6.497 5.175a.47.47 0 0 1-.534.225L.393 3.797a.487.487 0 0 1-.28-.647z"
    ></path>
  </svg>
);

const CalendarIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="15"
    fill="none"
    viewBox="0 0 13 15"
    {...props}
  >
    <path
      fill="#F28E2B"
      d="M11.25 1.8c.731 0 1.35.619 1.35 1.35v9.9c0 .76-.619 1.35-1.35 1.35h-9.9C.59 14.4 0 13.81 0 13.05v-9.9C0 2.42.59 1.8 1.35 1.8H2.7V.338c0-.17.14-.338.337-.338h1.125c.17 0 .338.169.338.338V1.8h3.6V.338c0-.17.14-.338.337-.338h1.125c.17 0 .338.169.338.338V1.8zm-.169 11.25c.085 0 .169-.056.169-.169v-8.38h-9.9v8.38q0 .17.169.17zm-1.49-5.625-4.022 3.966c-.113.14-.338.14-.478 0L2.98 9.253c-.112-.112-.112-.337 0-.478l.647-.619c.14-.14.338-.14.478 0l1.238 1.238L8.466 6.3c.14-.14.365-.14.478 0l.647.647a.38.38 0 0 1 0 .478"
    ></path>
  </svg>
);

const CircleArc = () => (
  <svg
    width="100%"
    height="100%"
    fill="none"
    viewBox="0 0 738 738"
    className="w-full h-full pointer-events-none"
  >
    {/* Thick translucent ring (MarketingHero style) */}
    <circle
      cx="369"
      cy="369"
      r="319"
      stroke="#F48A42"
      strokeWidth="100"
      opacity="0.2"
      style={{ mixBlendMode: "multiply" }}
    ></circle>
    {/* Outer dashed spinning ring */}
    <circle
      cx="369"
      cy="369"
      r="380"
      stroke="#F48A42"
      strokeWidth="3"
      strokeDasharray="12 12"
      opacity="0.4"
      className="origin-center animate-[spin_60s_linear_infinite_reverse]"
    ></circle>
    {/* Inner dashed spinning ring (Hero.jsx style) */}
    <circle
      cx="369"
      cy="369"
      r="250"
      stroke="#F48A42"
      strokeWidth="4"
      strokeDasharray="16 16"
      opacity="0.5"
      className="origin-center animate-[spin_40s_linear_infinite]"
    ></circle>
    {/* Middle thin pulsing ring for extra depth */}
    <circle
      cx="369"
      cy="369"
      r="310"
      stroke="#F48A42"
      strokeWidth="1.5"
      opacity="0.25"
      className="origin-center animate-[pulse_10s_ease-in-out_infinite]"
    ></circle>
  </svg>
);

export default function TopSection({
  lang,
  user,
  translate,
  page = "products",
  branch,
}) {
  const trans = useTranslations(translate);

  const t = (value) => trans(`profile.${value}`);

  const langPrefix = lang === "ar" ? "" : "en/";

  const branchLocation =
    branch && user?.branches?.find((b) => b._id === branch)?.address?.[lang];
  const fullBranchLocation =
    branchLocation &&
    `${
      branchLocation?.neighborhood ? `${branchLocation?.neighborhood}, ` : ""
    } ${branchLocation?.city}, ${branchLocation?.governorate}, ${
      branchLocation?.country
    }`;

  const monthsJoined = user?.createdAt
    ? differenceInMonths(new Date(), new Date(user?.createdAt))
    : 0;

  const isTrusted = user?.stats?.averageRating >= 4.5 || user?.premium;
  return (
    <div className="relative mb-4 md:mb-16">
      {/* Hero Cover */}
      {/* Hero Cover - Silk Waves with Centered Faded Dots */}
      <div className="h-[250px] md:h-[350px] relative overflow-hidden bg-gradient-to-br from-[#fff9f5] via-[#FEF6EE] to-[#fff3e7]">
        {/* 1. Main Background with Dots (Centered) */}
        <svg
          className="absolute inset-0 w-full h-full text-[#f48a42]"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1440 350"
          fill="none"
        >
          <defs>
            {/* 1. Define the Dotted Grid Pattern */}
            <pattern
              id="center-dots"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="2"
                r="1.5"
                fill="currentColor"
                fillOpacity="0.15"
              />
            </pattern>

            {/* 2. Soft Radial Mask to fade the dots towards the edges */}
            <radialGradient id="dots-fade" cx="50%" cy="50%" r="50%">
              <stop offset="25%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="70%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <mask id="dots-mask">
              <rect width="1440" height="350" fill="url(#dots-fade)" />
            </mask>
          </defs>

          {/* Render Center Faded Dot Grid First (so it stays in the background) */}
          <rect
            width="1440"
            height="350"
            fill="url(#center-dots)"
            mask="url(#dots-mask)"
          />
        </svg>

        {/* 2. Right Side Swooshes (Anchored to Right) */}
        <svg
          className="absolute inset-0 w-full h-full text-[#f48a42] pointer-events-none translate-x-1/3 md:translate-x-0"
          preserveAspectRatio="xMaxYMin slice"
          viewBox="0 0 1440 350"
          fill="none"
        >
          <path
            d="M900,0 C1150,180 1440,250 1440,0 Z"
            fill="currentColor"
            fillOpacity="0.04"
          />
          <path
            d="M1050,0 C1250,120 1440,180 1440,0 Z"
            fill="currentColor"
            fillOpacity="0.06"
          />
          <path
            d="M750,-50 C1050,220 1350,300 1500,100"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 8"
            strokeOpacity="0.15"
            fill="none"
          />
          <circle
            cx="1200"
            cy="150"
            r="3"
            fill="currentColor"
            fillOpacity="0.3"
          />
          <circle
            cx="1180"
            cy="130"
            r="1.5"
            fill="currentColor"
            fillOpacity="0.4"
          />
        </svg>

        {/* 3. Left Side Swooshes (Anchored to Left) */}
        <svg
          className="absolute inset-0 w-full h-full text-[#f48a42] pointer-events-none"
          preserveAspectRatio="xMinYMin slice"
          viewBox="0 0 1440 350"
          fill="none"
        >
          <path
            d="M0,150 C250,200 450,350 0,350 Z"
            fill="currentColor"
            fillOpacity="0.05"
          />
          <path
            d="M0,220 C150,260 300,350 0,350 Z"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <path
            d="M-50,100 C300,150 550,400 -50,450"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.2"
            fill="none"
          />
          {/* Left floating dots */}
          <circle
            cx="250"
            cy="120"
            r="2.5"
            fill="currentColor"
            fillOpacity="0.2"
          />
        </svg>
      </div>
      <div className="relative -mt-12 md:-mt-20 z-10 px-4">
        <div className="max-w-screen-xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-4 md:p-8 border-t-4 border-[#f28e2b] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <div className="flex flex-col md:flex-row md:gap-6 gap-1 items-start">
              {/* Avatar Section */}
              <div className="flex flex-col items-center flex-shrink-0 mx-auto md:mx-0">
                <div className="w-24 h-24 md:w-[100px] md:h-[100px] rounded-full overflow-hidden bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] relative border-1 border-white shadow-[0_8px_20px_rgba(0,0,0,0.1)] flex items-center justify-center transition-transform hover:scale-105 duration-300">
                  <Image
                    src={anyImgUrl({
                      src: user?.avatar,
                      size: 500,
                    })}
                    alt={user?.fullName}
                    className="h-full w-full object-cover"
                    unoptimized
                    fill
                  />
                  {/* Premium Glow effect */}
                  {user?.premium && (
                    <div className="absolute inset-0 border-2 border-[#f28e2b]/30 rounded-full animate-pulse" />
                  )}
                </div>
                {user?.accountType === "company" && (
                  <div className="mt-[-10px] z-10 bg-[#FFF3E6] text-[#F48A42] px-3.5 py-1.5 rounded-full text-[0.8rem] font-bold border border-[#FFE4CC] flex items-center gap-1.5 whitespace-nowrap shadow-sm">
                    <Company className="w-3 h-3 " />
                    {t("company")}
                  </div>
                )}
              </div>

              {/* Info Section */}
              <div className="flex-1 w-full text-center md:text-start min-w-0 mt-3 md:mt-0">
                <h1 className="text-xl md:text-[1.75rem] font-black text-[#0b0c2a] mb-1.5 flex items-center justify-center md:justify-start gap-2.5 leading-tight">
                  {user?.premium && (
                    <Premium className="w-5 h-5 md:w-8 md:h-6" />
                  )}
                  <span
                    dir={
                      user?.premium
                        ? ""
                        : isArabic(user?.fullName)
                          ? "rtl"
                          : "ltr"
                    }
                  >
                    {user?.premium
                      ? user?.fullName
                      : removeLastWord(user?.fullName)}
                    {branch &&
                      ` ( ${
                        user?.branches?.find((b) => b._id === branch)?.name?.[
                          lang
                        ]
                      } )`}
                  </span>
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-1 text-[#6c757d] text-[0.8rem] md:text-[0.9rem] mb-3 md:mb-4">
                  <div className="bg-[#FFF3E6] md:bg-transparent p-1 rounded-md">
                    <Location className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#f28e2b]" />
                  </div>
                  <span>
                    {fullBranchLocation || user?.address || t("noAddress")}
                  </span>
                </div>
                <p className="text-[#495057] text-[0.85rem] md:text-[1rem] leading-relaxed max-w-4xl line-clamp-3 md:line-clamp-none font-normal px-2 md:px-0">
                  {user?.bio || t("noDescription")}
                </p>
              </div>

              {/* Actions Section */}
              <div className="flex gap-3 items-center flex-shrink-0 w-full md:w-auto justify-center md:justify-end mt-4 md:mt-0">
                <button
                  className="w-12 h-12 rounded-2xl border border-[#e9ecef] bg-white text-[#495057] flex items-center justify-center hover:border-[#f28e2b] hover:text-[#f28e2b] transition-all shadow-sm hover:shadow-md"
                  title={t("share")}
                >
                  <Share size={22} color="currentColor" />
                </button>
                <ChatButton
                  translate={translate}
                  product={{ owner: user }}
                  langPrefix={langPrefix}
                  className="md:ms-0"
                  profile={true}
                />
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 md:flex md:flex-wrap md:gap-[15px] mt-6 md:mt-[25px]">
              {/* Rating Pill */}
              <div className="bg-[#f8f9fa] md:bg-white border border-[#e9ecef] px-2 py-3 md:px-[20px] md:py-2 rounded-xl md:rounded-full text-[0.75rem] md:text-[0.95rem] flex flex-wrap items-center justify-center gap-1 md:gap-2 transition-all hover:border-[#f28e2b] hover:bg-white group shadow-sm md:shadow-none">
                <Star
                  className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110"
                  color="#f28e2b"
                  filled
                />
                <span className="font-black text-[#0b0c2a]">
                  {user?.stats?.averageRating?.toFixed(1) || "0.0"}
                </span>
                <span className="w-full text-center md:w-auto text-[#6c757d] text-[0.6rem] md:text-[0.9rem] font-bold uppercase tracking-wider md:normal-case md:tracking-normal">
                  {t("averageRating")}
                </span>
              </div>

              {/* Products Pill */}
              <div className="bg-[#f8f9fa] md:bg-white border border-[#e9ecef] px-2 py-3 md:px-[20px] md:py-2 rounded-xl md:rounded-full text-[0.75rem] md:text-[0.95rem] flex flex-wrap items-center justify-center gap-1 md:gap-2 transition-all hover:border-[#f28e2b] hover:bg-white group shadow-sm md:shadow-none">
                <ProductsIcon className="w-4 h-4 md:w-5 md:h-5 text-[#f28e2b]" />
                <span className="font-black text-[#0b0c2a]">
                  {user?.stats?.productsCount || 0}
                </span>
                <span className="w-full text-center md:w-auto text-[#6c757d] text-[0.6rem] md:text-[0.9rem] font-bold uppercase tracking-wider md:normal-case md:tracking-normal">
                  {t("products")}
                </span>
              </div>

              {/* Joined Pill */}
              <div className="bg-[#f8f9fa] md:bg-white border border-[#e9ecef] px-2 py-3 md:px-[20px] md:py-2 rounded-xl md:rounded-full text-[0.75rem] md:text-[0.95rem] flex flex-wrap items-center justify-center gap-1 md:gap-2 transition-all hover:border-[#f28e2b] hover:bg-white group shadow-sm md:shadow-none">
                <CalendarIcon
                  className="w-4 h-4 md:w-5 md:h-5"
                  color="#f28e2b"
                />
                <span className="font-black text-[#0b0c2a]">
                  {monthsJoined}
                </span>
                <span className="w-full text-center md:w-auto text-[#6c757d] text-[0.6rem] md:text-[0.9rem] font-bold uppercase tracking-wider md:normal-case md:tracking-normal whitespace-nowrap">
                  {t("monthsSinceJoined")}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs Navigation - Premium Toggle Style */}
          <div className="flex justify-center p-1.5 bg-[#fdfdfd] rounded-full gap-1 my-6 md:my-10 max-w-sm mx-auto border border-[#f4f5f7] shadow-inner">
            <Button
              variant={page === "products" ? "default" : "secondary"}
              as={Link}
              href={`/${langPrefix}profile/${
                user?.pathName || user?._id
              }/products${branch ? `?branch=${branch}` : ""}`}
              className={`flex-1 px-4 md:px-8 py-3 rounded-full font-extrabold text-[0.7rem] md:text-sm transition-all h-auto border-none ${
                page === "products"
                  ? "bg-primary text-white shadow-md scale-[1.02]"
                  : "bg-transparent text-[#6c757d] hover:bg-white/50"
              }`}
            >
              {t("productsList")}
            </Button>
            <Button
              variant={page === "reviews" ? "default" : "secondary"}
              as={Link}
              href={`/${langPrefix}profile/${
                user?.pathName || user?._id
              }/reviews${branch ? `?branch=${branch}` : ""}`}
              className={`flex-1 px-4 md:px-8 py-3 rounded-full font-extrabold text-[0.7rem] md:text-sm transition-all h-auto border-none ${
                page === "reviews"
                  ? "bg-primary text-white shadow-md scale-[1.02]"
                  : "bg-transparent text-[#6c757d] hover:bg-white/50"
              }`}
            >
              {t("reviews")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
