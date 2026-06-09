"use client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { useState, memo } from "react";
import Button from "../ui/Button";
import { CalendarIcon } from "../ui/svgs/icons/CalendarIconSvg";
import { addDays } from "date-fns";

function PackagesRangeDate({
  lang,
  onSelect,
  selectedPackage,
  setDaysCount,
  translate,
  ownerHolidayPeriods = [],
}) {
  const [date, setDate] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const t = (key) => translate(`productComponent.bookingPackages.${key}`);

  const isHolidayDate = (dateToCheck) => {
    const d = new Date(dateToCheck);
    d.setHours(0, 0, 0, 0);
    return ownerHolidayPeriods.some((p) => {
      const from = new Date(p.from);
      const to = new Date(p.to);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      return d >= from && d <= to;
    });
  };

  return (
    <div className="mt-6" id="packages-range-date">
      <h3 className="text-darkNavy font-semibold text-[1rem] md:text-[1.2rem] lg:text-[1.4rem] font-IBMPlex mb-4">
        {t("selectDurationDate")}
      </h3>
      <Popover
        placement="bottom-start"
        offset={10}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <PopoverTrigger>
          <div className="relative w-full flex items-center gap-2">
            <Button
              variant="light"
              className="flex-1 w-full bg-white border border-primary/70 shadow rounded-xl justify-start p-3 text-left"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <CalendarIcon className="w-5 h-5" color="#F48A42" />
                <span className="text-gray-600 text-[0.9rem] md:text-[1rem]">
                  {date
                    ? date.toLocaleDateString(lang === "ar" ? "ar" : "en-GB")
                    : t("selectDurationDate")}
                </span>
              </div>
            </Button>
            {date && (
              <button
                type="button"
                className="absolute end-3 p-1 hover:bg-gray-100 rounded-full transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setDate(undefined);
                  onSelect(undefined);
                  setDaysCount(0);
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400 hover:text-red-500"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 md:w-[28rem] w-[85vw] max-w-full">
          {isOpen && (
            <Calendar
              selected={date}
              mode="single"
              lang={lang}
              onSelect={(e) => {
                setDate(e);
                // For hourly packages, daysNumber < 1 so end = same day as start
                const daysToAdd =
                  selectedPackage.daysNumber >= 1
                    ? Math.ceil(selectedPackage.daysNumber) - 1
                    : 0;
                const date = {
                  from: e,
                  to: addDays(e, daysToAdd),
                };
                setDaysCount(selectedPackage.daysNumber);
                onSelect(date);
                setIsOpen(false);
              }}
              disabled={[
                { before: new Date().setDate(new Date().getDate()) },
                (date) => isHolidayDate(date),
              ]}
              initialFocus
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default memo(PackagesRangeDate);
