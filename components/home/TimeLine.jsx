"use client";
import React from "react";
import Button from "../ui/Button";
import Link from "next/link";

const TimelineItem = ({
  Icon,
  title,
  description,
  index,
  button,
  href,
  primary,
}) => {
  return (
    <div
      className={`flex justify-center lg:gap-8 md:gap-4 gap-3 w-full transition-all duration-500 ease-out transform ${index !== 0 ? "mt-4 md:mt-10" : ""} ${index % 2 !== 0 ? "flex-row-reverse" : ""} opacity-100 translate-y-0`}
    >
      {button ? (
        <div
          className={`order-1 flex items-center relative mt-3 ${
            index !== 0
              ? "after:absolute after:h-[90%] after:bottom-1/2 after:translate-y-[-75%] after:left-1/2 after:w-px after:bg-darkNavy"
              : ""
          }`}
        >
          <Button
            as={Link}
            href={href}
            aria-label={button}
            variant="light"
            className="md:w-52 bg-primary/5 border border-primary/10 py-4 px-6 text-[0.8rem] md:text-[1.1rem] text-darkNavy font-semibold"
          >
            {button}
          </Button>
        </div>
      ) : (
        <>
          <div className="order-1 w-5/12"></div>
          <div
            className={`order-1 flex items-center relative ${
              index !== 0
                ? "after:absolute md:after:h-[80%] after:h-[85%] after:bottom-1/2 after:translate-y-[-50%] after:start-3.5 after:w-px after:-translate-x-[0.5px] after:bg-darkNavy"
                : ""
            }`}
          >
            <div className="flex items-center justify-center font-semibold md:text-lg text-primary bg-darkNavy shadow-[0px_0px_23px_0px_rgba(244,138,66,0.6)] md:w-8 md:h-8 h-7 w-7 rounded-full">
              {index + 1}
            </div>
          </div>
          <div
            className={`order-1 w-5/12 flex items-center md:gap-4 gap-2 pt-0.5 ${
              index % 2 !== 0 ? "flex-row-reverse text-end" : ""
            }`}
          >
            {Icon}
            <div className="w-full md:m-auto">
              <div className="text-darkNavy font-IBMPlex font-semibold mb-2 md:text-xl text-[1.05rem]">
                {title}
              </div>
              <p
                className={`text-[#5B5656] max-w-52 md:text-base text-[0.9rem] ${
                  index % 2 !== 0 ? "ms-auto" : ""
                }`}
              >
                {description}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function TimeLine({ items }) {
  return (
    <div className="relative wrap overflow-hidden py-12 md:py-24 xl:px-10 lg:px-8 md:px-6 h-full">
      {items.map(({ Icon, title, description, button, href, primary }, idx) => (
        <TimelineItem
          key={idx}
          Icon={Icon}
          title={title}
          description={description}
          index={idx}
          button={button}
          primary={primary}
          href={href}
        />
      ))}
    </div>
  );
}
