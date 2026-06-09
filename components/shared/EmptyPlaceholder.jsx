import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const EmptyPlaceholder = ({
  detailsContainerClassName = "w-36",
  descriptionClassName = "",
  containerClassName = "",
  titleClassName = "",
  description,
  actionText,
  ActionIcon,
  title,
  Icon,
  url,
  role,
  "aria-live": ariaLive,
}) => {
  return (
    <section
      className={cn(
        "flex flex-col items-center gap-2 md:py-8 py-2",
        containerClassName,
      )}
      {...(role ? { role } : {})}
      {...(ariaLive ? { "aria-live": ariaLive } : {})}
    >
      <div aria-hidden="true">
        <Icon className="md:w-72 md:h-72 w-28 h-28" />
      </div>
      <div className="flex flex-col gap-8 items-center">
        <div
          className={cn(
            "flex flex-col text-center md:gap-4 gap-1",
            detailsContainerClassName,
          )}
        >
          <h2
            className={cn(
               "text-darkNavy font-IBMPlex font-medium md:text-xl text-lg md:mt-2 mt-0",
              titleClassName,
            )}
          >
            {title}
          </h2>
          <p
            className={cn(
              "font-IBMPlex md:text-medium text-sm text-[#838282]",
              descriptionClassName,
            )}
          >
            {description}
          </p>
        </div>

        {actionText && (
          <Link
            className="font-IBMPlex md:text-lg text-base font-semibold text-[#F9FAFC] md:px-12 px-8 md:py-4 py-2.5 bg-primary [filter:drop-shadow(0_17px_20px_rgba(244,138,66,0.2))] rounded-full flex items-center gap-[10px]"
            href={url}
          >
            {actionText}
            {ActionIcon && <ActionIcon />}
          </Link>
        )}
      </div>
    </section>
  );
};
export default EmptyPlaceholder;
