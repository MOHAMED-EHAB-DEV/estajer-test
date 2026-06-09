"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function HowToRentTabs({
  renterTitle,
  lessorTitle,
  renterSteps,
  lessorSteps,
  renterButton,
  lessorButton,
  lang,
}) {
  const [activeTab, setActiveTab] = useState("renter");

  return (
    <div className="max-w-6xl mx-auto px-5">
      {/* Tabs */}
      <div className="flex justify-center p-1.5 bg-[#fdfdfd] rounded-full gap-1 my-6 md:my-10 max-w-sm mx-auto border border-[#f4f5f7] shadow-inner">
        <button
          onClick={() => setActiveTab("renter")}
          className={`flex-1 px-4 md:px-8 py-3 rounded-full font-extrabold text-[0.7rem] md:text-sm transition-all h-auto border-none ${
            activeTab === "renter"
              ? "bg-primary text-white shadow-md scale-[1.02]"
              : "bg-transparent text-[#6c757d] hover:bg-white/50"
          }`}
        >
          {renterTitle}
        </button>

        <button
          onClick={() => setActiveTab("lessor")}
          className={`flex-1 px-4 md:px-8 py-3 rounded-full font-extrabold text-[0.7rem] md:text-sm transition-all h-auto border-none ${
            activeTab === "lessor"
              ? "bg-primary text-white shadow-md scale-[1.02]"
              : "bg-transparent text-[#6c757d] hover:bg-white/50"
          }`}
        >
          {lessorTitle}
        </button>
      </div>

      {/* Renter Tab */}
      <div className={`${activeTab === "renter" ? "block" : "hidden"}`}>
        <div className="relative py-5 grid grid-cols-2 md:flex md:flex-row justify-between gap-y-10 gap-x-4 md:gap-0">
          <div className={`mx-10 hidden md:block absolute top-16 inset-x-12 h-1 z-0 bg-[repeating-linear-gradient(to_right,transparent,transparent_10px,#FFE8B6_10px,#FFE8B6_20px)] ${lang === "ar" ? "animate-line-reverse" : "animate-line"}`} />

          {renterSteps.map((step, index) => (
            <div
              key={index}
              className="flex-1 text-center relative z-10 px-1 md:px-2.5 group"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg border-2 border-transparent transition-all duration-300 ease-in-out transform rotate-45 group-hover:border-primary group-hover:scale-105">
                <div className="transform -rotate-45 flex items-center justify-center scale-75 md:scale-100">
                  {step.Icon}
                </div>
              </div>
              <h3 className="text-sm md:text-xl text-darkNavy font-extrabold mb-1.5 md:mb-2.5">
                {index + 1}. {step.title}
              </h3>
              <p className="text-[0.65rem] md:text-sm text-gray-500 leading-tight">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="md:mt-16 mt-6 flex justify-center">
          <Link
            href={renterButton.href}
            className="inline-block px-16 py-3 text-sm md:text-base bg-primary text-white rounded-full font-extrabold shadow-xl shadow-primary/40"
          >
            {renterButton.title}
          </Link>
        </div>
      </div>

      {/* Lessor Tab */}
      <div className={`${activeTab === "lessor" ? "block" : "hidden"}`}>
        <div className="relative py-5 grid grid-cols-2 md:flex md:flex-row justify-between gap-y-10 gap-x-4 md:gap-0">
          <div className={`mx-10 hidden md:block absolute top-16 inset-x-12 h-1 z-0 bg-[repeating-linear-gradient(to_right,transparent,transparent_10px,#FFE8B6_10px,#FFE8B6_20px)] ${lang === "ar" ? "animate-line-reverse" : "animate-line"}`} />

          {lessorSteps.map((step, index) => (
            <div
              key={index}
              className="flex-1 text-center relative z-10 px-1 md:px-2.5 group"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center shadow-lg border-2 border-transparent transition-all duration-300 ease-in-out transform rotate-45 group-hover:border-primary group-hover:scale-105">
                <div className="transform -rotate-45 flex items-center justify-center scale-75 md:scale-100">
                  {step.Icon}
                </div>
              </div>
              <h3 className="text-sm md:text-xl text-darkNavy font-extrabold mb-1.5 md:mb-2.5">
                {index + 1}. {step.title}
              </h3>
              <p className="text-[0.65rem] md:text-sm text-gray-500 leading-tight">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="md:mt-16 mt-6 flex justify-center">
          <Link
            href={lessorButton.href}
            className="inline-block px-16 py-3 text-sm md:text-base bg-primary text-white rounded-full font-extrabold shadow-xl shadow-primary/40"
          >
            {lessorButton.title}
          </Link>
        </div>
      </div>
    </div>
  );
}
