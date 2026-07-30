"use client";

import React from "react";
import HowItWorksTab from "@/components/admin/partners/modal/HowItWorksTab";

export default function HowItWorksEditor({
  data,
  onDataChange,
  formData,
  t,
  isAr,
}) {
  return (
    <HowItWorksTab
      formData={{ ...formData, howItWorks: data }}
      setFormData={(updater) => {
        onDataChange((prev) => {
          const next =
            typeof updater === "function"
              ? updater({ ...formData, howItWorks: prev })
              : updater;
          return next.howItWorks;
        });
      }}
      t={t}
      isAr={isAr}
    />
  );
}
