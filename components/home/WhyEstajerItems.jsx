"use client";
import React from "react";

const IconItem = ({ Icon, title, description, index }) => {
  return (
    <div
      className={`
        flex flex-col text-darkNavy gap-2 md:gap-4 items-center
        transition-all duration-500 ease-out transform
        opacity-100 translate-y-0 scale-100
      `}
    >
      <div className="rounded-full shadow-[0px_0px_23px_0px_rgba(244,138,66,0.6)]">
        {Icon}
      </div>
      <div className="xl:text-[1.35rem] md:text-[1.25rem] text-[1.15rem] font-semibold font-IBMPlex">
        {title}
      </div>
      <p className="px-2 -mt-0.5 xl:text-base md:text-[0.92rem] text-[0.875rem]">
        {description}
      </p>
    </div>
  );
};

export default IconItem;
