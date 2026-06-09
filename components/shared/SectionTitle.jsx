import React from "react";

export default function SectionTitle({
  title,
  text,
  main,
  subHeadingClassName,
  id,
  className,
}) {
  return (
    <header
      className={`text-center md:my-2 ${className || ""}`}
      {...(id && { id })}
    >
      {main ? (
        <h2
          className="font-IBMPlex font-bold text-2xl lg:text-[1.8rem] md:text-[1.6rem] text-darkNavy md:mb-4 mb-1"
          itemProp="headline"
        >
          {title}
        </h2>
      ) : (
        <h3
          className={`font-IBMPlex font-semibold text-2xl lg:text-[1.8rem] md:text-[1.6rem] text-darkNavy mb-1 ${
            subHeadingClassName || ""
          }`}
          itemProp="headline"
        >
          {title}
        </h3>
      )}
      <p
        className="text-[#5B5656] lg:text-[1.1rem] md:text-[1.2rem] px-2"
        itemProp="description"
      >
        {text}
      </p>
    </header>
  );
}
