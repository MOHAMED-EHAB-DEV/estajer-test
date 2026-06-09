"use client";

import React from "react";

// Icons for the three steps
const EstajerIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className="w-7 h-7"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);

const PartnerIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className="w-7 h-7"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);

const BenefitsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className="w-7 h-7"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z"
    />
  </svg>
);

const ArrowConnector = ({ isRtl }) => (
  <div className="hidden lg:flex items-center justify-center mx-[-0.75rem] z-10 self-center">
    <div className="w-12 h-12 rounded-full bg-white shadow-lg shadow-primary/10 border border-primary/15 flex items-center justify-center text-primary">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        className={`w-5 h-5 ${isRtl ? "" : "rotate-180"}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
      </svg>
    </div>
  </div>
);

// Mobile arrow connector (vertical)
const MobileArrowConnector = () => (
  <div className="flex lg:hidden items-center justify-center py-2 z-10">
    <div className="w-10 h-10 rounded-full bg-white shadow-lg shadow-primary/10 border border-primary/15 flex items-center justify-center text-primary">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        className="w-4 h-4 -rotate-90"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
      </svg>
    </div>
  </div>
);

const StepCard = ({ icon, title, items, variant = "default", index }) => {
  const variants = {
    estajer: {
      border: "border-primary/20",
      bg: "bg-gradient-to-br from-primary/[0.04] via-white to-primary/[0.02]",
      iconBg: "bg-gradient-to-br from-primary to-primary/80",
      accent: "from-primary via-primary/70 to-transparent",
      dot: "bg-primary",
      numberBg: "bg-primary/10 text-primary",
    },
    partner: {
      border: "border-amber-300/30",
      bg: "bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30",
      iconBg: "bg-gradient-to-br from-amber-500 to-amber-400",
      accent: "from-amber-500 via-amber-400/70 to-transparent",
      dot: "bg-amber-500",
      numberBg: "bg-amber-500/10 text-amber-600",
    },
    benefits: {
      border: "border-emerald-300/30",
      bg: "bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30",
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-400",
      accent: "from-emerald-500 via-emerald-400/70 to-transparent",
      dot: "bg-emerald-500",
      numberBg: "bg-emerald-500/10 text-emerald-600",
    },
    default: {
      border: "border-neutral-200",
      bg: "bg-white",
      iconBg: "bg-primary",
      accent: "from-primary via-primary/70 to-transparent",
      dot: "bg-primary",
      numberBg: "bg-primary/10 text-primary",
    },
  };

  const v = variants[variant] || variants.default;

  return (
    <div
      className={`
        group relative flex-1 rounded-2xl lg:rounded-3xl ${v.border} border ${v.bg}
        p-5 lg:p-7
        transition-all duration-500
        hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1
        overflow-hidden
      `}
      style={{
        animationDelay: `${index * 150}ms`,
      }}
    >
      {/* Top accent line */}
      <div
        className={`absolute top-0 start-0 w-full h-[3px] bg-gradient-to-r ${v.accent} opacity-80`}
      />

      {/* Decorative circles */}
      <div className="absolute -bottom-6 -end-6 w-24 h-24 rounded-full bg-gradient-to-br from-neutral-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Icon */}
      <div className="flex items-center justify-between mb-5">
        <div
          className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl ${v.iconBg} text-white flex items-center justify-center shadow-lg`}
        >
          {icon}
        </div>
        <div
          className={`${v.numberBg} w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black`}
        >
          {index + 1}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base lg:text-lg font-extrabold text-darkNavy mb-4 leading-tight">
        {title}
      </h3>

      {/* Items */}
      <ul className="flex flex-col gap-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 group/item">
            <span
              className={`w-2 h-2 mt-[7px] rounded-full ${v.dot} shrink-0 group-hover/item:scale-125 transition-transform`}
            />
            <span className="text-sm lg:text-[15px] text-neutral-600 font-medium leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function PartnerHowItWorks({ partner, lang }) {
  const howItWorks = partner.howItWorks;

  // Only show if there's content
  if (!howItWorks) return null;

  const hasContent =
    howItWorks.estajerSide?.itemsAr?.length > 0 ||
    howItWorks.estajerSide?.itemsEn?.length > 0 ||
    howItWorks.partnerSide?.itemsAr?.length > 0 ||
    howItWorks.partnerSide?.itemsEn?.length > 0 ||
    howItWorks.sharedBenefits?.itemsAr?.length > 0 ||
    howItWorks.sharedBenefits?.itemsEn?.length > 0;

  if (!hasContent) return null;

  const isAr = lang === "ar";

  const sectionTitle = isAr
    ? howItWorks.sectionTitleAr
    : howItWorks.sectionTitleEn;

  const steps = [
    {
      icon: <EstajerIcon />,
      title: isAr
        ? howItWorks.estajerSide?.titleAr
        : howItWorks.estajerSide?.titleEn,
      items: isAr
        ? howItWorks.estajerSide?.itemsAr || []
        : howItWorks.estajerSide?.itemsEn || [],
      variant: "estajer",
    },
    {
      icon: <PartnerIcon />,
      title: isAr
        ? howItWorks.partnerSide?.titleAr
        : howItWorks.partnerSide?.titleEn,
      items: isAr
        ? howItWorks.partnerSide?.itemsAr || []
        : howItWorks.partnerSide?.itemsEn || [],
      variant: "partner",
    },
    {
      icon: <BenefitsIcon />,
      title: isAr
        ? howItWorks.sharedBenefits?.titleAr
        : howItWorks.sharedBenefits?.titleEn,
      items: isAr
        ? howItWorks.sharedBenefits?.itemsAr || []
        : howItWorks.sharedBenefits?.itemsEn || [],
      variant: "benefits",
    },
  ];

  // Filter out empty steps
  const visibleSteps = steps.filter(
    (step) => step.items.length > 0 && step.title,
  );

  if (visibleSteps.length === 0) return null;

  // For RTL, reverse the order for the visual flow
  const orderedSteps = isAr ? [...visibleSteps].reverse() : visibleSteps;

  return (
    <section className="mt-16 lg:mt-24">
      {/* Section Header */}
      {sectionTitle && (
        <div className="text-center mb-10 lg:mb-14">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-darkNavy leading-tight">
            {sectionTitle}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-4 rounded-full" />
        </div>
      )}

      {/* Steps Flow */}
      <div
        className={`flex items-stretch ${isAr ? "lg:flex-row-reverse flex-col-reverse" : "lg:flex-row flex-col"}`}
      >
        {orderedSteps.map((step, idx) => (
          <React.Fragment key={idx}>
            <StepCard
              icon={step.icon}
              title={step.title}
              items={step.items}
              variant={step.variant}
              index={isAr ? visibleSteps.length - 1 - idx : idx}
            />
            {idx < orderedSteps.length - 1 && (
              <>
                <ArrowConnector isRtl={isAr} />
                <MobileArrowConnector />
              </>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
