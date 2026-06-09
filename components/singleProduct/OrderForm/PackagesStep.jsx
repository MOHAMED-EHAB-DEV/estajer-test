import BookingPackages from "../BookingPackages";
import { addDays } from "date-fns";

export default function PackagesStep({
  product,
  selectedPackage,
  setSelectedPackage,
  setDaysCount,
  setSelectedDates,
  trans,
  lang,
  t,
}) {
  return (
    <div className="space-y-4 mb-0 md:mb-8">
      <p className="text-sm font-semibold text-gray-500 mb-4 text-center uppercase tracking-wider md:hidden">
        {t("selectPackage")}
      </p>
      <BookingPackages
        lang={lang}
        packages={product.rental.packages || []}
        initialSelectedId={selectedPackage.id}
        translate={trans}
        onSelect={(pkg) => {
          setSelectedPackage(pkg);
          setDaysCount(pkg.daysNumber);
          setSelectedDates((prev) =>
            prev
              ? {
                  from: prev.from,
                  to: addDays(prev.from, pkg.daysNumber - 1),
                }
              : null,
          );
        }}
      />
    </div>
  );
}
