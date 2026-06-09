"use client";
import { useEffect, useState, memo } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { Calendar } from "../ui/calendar";

function DatePickerDemo({
  lang,
  bookings,
  onSelect,
  minDays,
  productQuantity = 1,
  quantity = 1,
  selectedServices,
  services,
  productId,
  cartItems,
  translate,
  setDaysCount,
  ownerHolidayPeriods = [],
}) {
  const [date, setDate] = useState({});
  const [error, setError] = useState("");
  const [shouldLoadCalendar, setShouldLoadCalendar] = useState(false);
  const t = useTranslations(translate);

  useEffect(() => {
    date.from && handleSelect(date);
  }, [quantity, selectedServices]);

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

  const isDateFullyBooked = (dateToCheck) => {
    const checkDate = new Date(dateToCheck);
    let bookedCount = 0;
    let serviceCount = {};
    // Check confirmed bookings
    const userItems = cartItems.filter(
      ({ product }) => product?._id === productId,
    );
    [...bookings, ...userItems]?.map((booking) => {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      // If checkDate falls within this booking's range

      if (checkDate >= startDate && checkDate <= endDate) {
        booking.selectedServices?.map(
          ({ id, quantity }) =>
            (serviceCount[id] = (serviceCount[id] || 0) + quantity),
        );

        bookedCount += booking.quantity || 1;
      }
    });
    const servicesExceeded = selectedServices.map(
      ({ id, quantity }) =>
        (serviceCount[id] || 0) >
        services?.find((s) => s.id === id)?.quantity - quantity,
    );
    // Return true if all units are booked for this date
    return (
      bookedCount > productQuantity - quantity || servicesExceeded.some(Boolean)
    );
  };

  const handleSelect = (range) => {
    if (!range) {
      onSelect();
      setDaysCount(0);
      return setDate({});
    }
    setError("");
    const { from, to } = range;
    const date = { from, to: to || from };

    // Check if any date in the range is disabled (fully booked)
    const start = new Date(from);
    const end = new Date(to || from);

    // Validate that none of the dates in the range are fully booked or holiday
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (isDateFullyBooked(new Date(d)) || isHolidayDate(new Date(d))) {
        setError(t("singleProduct.order.rangeDate.datesUnavailable"));
        setDate({});
        setDaysCount(0);
        return onSelect();
      }
    }

    // Validate min/max days
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1 || 1;
    setDaysCount(days);
    setDate(date);

    if (days < minDays) {
      setDaysCount(0);
      setError(
        t("singleProduct.order.rangeDate.minDays").replace("{days}", minDays),
      );
      return onSelect();
    }

    onSelect(date);
  };

  return (
    <div id="date-selector">
      <Calendar
        lang={lang}
        mode="range"
        selected={date}
        onSelect={handleSelect}
        disabled={[
          (date) => isDateFullyBooked(date) || isHolidayDate(date),
          { before: new Date().setDate(new Date().getDate()) },
        ]}
      />
      {date?.from && (
        <div className="flex justify-center mt-2">
          <button
            onClick={() => handleSelect(undefined)}
            className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
          >
            {t("addProductPage.common.clearDates")}
          </button>
        </div>
      )}
      {error && (
        <p className="text-red-500 text-[.8rem] md:text-[1.2rem] text-center mt-4">
          {error}
        </p>
      )}
    </div>
  );
}

export default memo(DatePickerDemo);
