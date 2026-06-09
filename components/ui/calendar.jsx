"use client";
import { DayPicker } from "react-day-picker";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "./svgs/icons/ChevronLeftSvg";
import { ChevronRight } from "./svgs/icons/ChevronRightSvg";
import { buttonVariants } from "./CnButton";

function Calendar({
  lang,
  className,
  classNames,
  showOutsideDays = true,
  sm,
  ...props
}) {
  return (
    <DayPicker
      lang={lang}
      dir="ltr"
      {...(lang === "ar" ? { locale: ar } : {})}
      showOutsideDays={showOutsideDays}
      className={cn(
        "w-full bg-white rounded-3xl xl:p-8 md:p-6 p-4 border-[#EAEEF3] border",
        className,
      )}
      classNames={{
        months: "w-full",
        month: "w-full md:space-y-6 space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label:
          "text-[0.85rem] md:text-[1.1rem] lg:text-[1.2rem] font-semibold",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "lg:h-10 lg:w-10 h-6 w-6 bg-[#EAEEF3] p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex w-full mb-2",
        head_cell:
          "rounded-md w-full font-medium text-[0.75rem] md:text-[1rem] lg:text-[1.2rem] text-darkNavy",
        row: "flex w-full md:mt-2 mt-1 lg:gap-4 gap-1",
        cell: `text-center text-[0.8rem] md:text-[1rem] lg:text-[1.2rem] p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 w-full`,
        day: cn(
          buttonVariants({
            variant: "ghost",
            className:
              "text-[0.75rem] md:text-[1rem] lg:text-[1.2rem] md:!h-12 !h-8",
          }),
          "md:h-12 h-10 w-full p-0 font-normal aria-selected:opacity-100",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-[rgba(244,137,66,0.2)] aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => <ChevronLeft />,
        IconRight: ({ className, ...props }) => <ChevronRight />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
