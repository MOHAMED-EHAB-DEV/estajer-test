import { formatNumeric, hexToRgba } from "@/lib/utils";
import Link from "next/link";

export default function Cards({
  placeholder,
  dateRange,
  cards = [],
  noMargin,
}) {
  const formatDateRange = (dateRange) => {
    if (!dateRange?.startDate || !dateRange?.endDate)
      return new Date().toLocaleDateString("en", {
        day: "numeric",
        month: "numeric",
      });

    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    if (startDate.toDateString() === endDate.toDateString())
      return startDate.toLocaleDateString("en", {
        day: "numeric",
        month: "numeric",
      });

    return `${startDate.toLocaleDateString("en", {
      day: "numeric",
      month: "numeric",
    })} - ${endDate.toLocaleDateString("en", {
      day: "numeric",
      month: "numeric",
    })}`;
  };

  return (
    <div
      className={`grid md:grid-cols-4 grid-cols-2 items-center justify-center gap-2 md:gap-4 ${noMargin ? "" : "mb-6"} ${
        cards.length === 5 ? "md:grid-cols-2" : ""
      }`}
    >
      {cards.map(
        (
          {
            Icon,
            valueColor,
            iconColor,
            title,
            value,
            review,
            reviewColor,
            OtherIcon,
            actionText,
            actionLink,
            ActionIcon,
          },
          idx,
        ) => (
          <div
            key={idx}
            className={`flex w-full h-full md:h-[140px] items-center justify-between gap-3 md:gap-5 p-2.5 md:p-4 rounded-lg bg-[#FEFEFE] ${cards.length === 5 && idx + 1 === cards.length ? "col-span-2" : ""} ${cards.length === 7 && idx + 1 > 4 ? (idx + 1 === cards.length ? "md:col-span-4 col-span-2" : "md:col-span-2") : ""}`}
          >
            <div className="flex flex-col items-start gap-1 md:gap-3">
              <h1 className="text-[10px] md:text-sm font-semibold text-darkNavy font-IBMPlex">
                {title}
              </h1>

              <div className="flex flex-col gap-0.5 md:gap-2">
                {OtherIcon ? (
                  <div className="flex items-center gap-1">
                    <p
                      className="font-bold text-base md:text-lg lg:text-[28px]"
                      style={{ color: valueColor }}
                    >
                      {placeholder ? "..." : formatNumeric(value)}
                    </p>
                    <OtherIcon className="md:w-auto w-3.5 h-3.5" />
                  </div>
                ) : (
                  <p
                    className="font-bold text-sm md:text-lg lg:text-[28px] font-NotoSansArabic"
                    style={{ color: valueColor }}
                  >
                    {placeholder ? "..." : value}
                  </p>
                )}

                <span
                  className={`text-[9px] md:text-sm font-semibold font-IBMPlex ${
                    review === "hidden" ? review : ""
                  }`}
                  style={{ color: reviewColor }}
                >
                  {review || "---"}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center h-full gap-2 md:gap-4">
              <div
                className="flex items-center justify-center w-8 h-8 md:w-12 md:h-12 p-1.5 md:p-3 ms-auto rounded-md self-center"
                style={{ backgroundColor: hexToRgba(iconColor) }}
              >
                <Icon color={iconColor} className="md:w-6 md:h-6 w-4 h-4" />
              </div>

              <div className="flex items-center gap-1 self-center">
                {actionText && actionLink && ActionIcon ? (
                  <Link
                    href={actionLink}
                    className="flex items-center gap-0.5 md:gap-1"
                  >
                    <span className="text-[11px] md:text-sm font-semibold text-darkNavy">
                      {actionText}
                    </span>
                    <ActionIcon className="md:w-4 md:h-4 w-3 h-3" />
                  </Link>
                ) : (
                  <span className="text-[10px] md:text-[14px] font-bold text-darkNavy">
                    {formatDateRange(dateRange)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  );
}
