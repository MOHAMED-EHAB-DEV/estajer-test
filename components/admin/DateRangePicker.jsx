"use client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { useState } from "react";
import Button from "../ui/Button";
import { CalendarIcon } from "../ui/svgs/icons/CalendarIconSvg";
import { RightArrow } from "../ui/svgs/icons/RightArrowSvg";

export default function DateRangePicker({
  lang,
  onSelect,
  translate,
  selectedRange,
  dark,
  admin,
  orange,
  hideText,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const t = (key) => translate(`admin.home.welcome.${key}`);

  const formatDateRange = (range) => {
    const date = range?.from ? range : { from: new Date(), to: new Date() };
    if (!date?.from) return;
    const fromDate = date.from.toLocaleDateString("ar");
    const toDate = date.to ? date.to.toLocaleDateString("ar") : fromDate;
    return `${fromDate} - ${toDate}`;
  };

  const handleSelect = (range) => {
    if (!range) return onSelect({});
    const { from, to } = range;
    const date = { from, to: to || from };
    onSelect(date);
  };

  return (
    <div
      className={`flex items-center gap-3 relative ${admin || orange ? "w-full" : ""}`}
    >
      {!(admin || orange) && (
        <span
          className={`${hideText ? "md:block hidden" : ""} text-darkNavy font-semibold md:text-base text-sm`}
        >
          {t("filter")} :
        </span>
      )}
      <Popover
        placement="bottom-start"
        offset={10}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <PopoverTrigger>
          <Button
            variant="solid"
            className={`${orange ? "bg-[#FDF5EE] border w-full border-[#f48a42]/20 hover:border-[#f48a42]/50 rounded-xl shadow-none md:h-12 h-10" : dark ? "bg-[#EAEEF3] rounded-full" : admin ? "bg-[#f4f4f5] rounded-xl w-full md:h-14 h-10" : "bg-white border-1 border-gray-200 rounded-xl h-auto"} min-w-[200px] justify-start md:p-4 p-2 text-start`}
          >
            <div className="flex items-center md:gap-4 gap-2 w-full">
              <CalendarIcon
                className="md:w-5 md:h-5 w-3.5 h-3.5"
                color="#F48A42"
              />
              <span className="text-gray-800 md:text-sm text-[11px] flex items-center justify-between md:gap-3 gap-1 flex-1">
                {formatDateRange(selectedRange)}
                <RightArrow className="md:w-5 md:h-5 w-3.5 h-3.5"></RightArrow>
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 md:w-[28rem] w-72 max-w-full">
          <Calendar
            selected={selectedRange}
            mode="range"
            lang={lang}
            onSelect={handleSelect}
            disabled={[{ after: new Date() }]}
            initialFocus
            sm={true}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
