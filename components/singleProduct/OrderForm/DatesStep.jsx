import dynamic from "next/dynamic";

const RangeDate = dynamic(() => import("../RangeDate"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] bg-gray-100/50 rounded-3xl animate-pulse flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  ),
});

const PackagesRangeDate = dynamic(() => import("../PackagesRangeDate"), {
  ssr: false,
  loading: () => (
    <div className="mt-6 animate-pulse">
      <div className="h-7 w-48 bg-gray-100 rounded-lg mb-4" />
      <div className="h-14 w-full bg-gray-100 rounded-xl" />
    </div>
  ),
});

export default function DatesStep({
  isPackages,
  selectedPackage,
  setDaysCount,
  onSelect,
  trans,
  lang,
  selectedServices,
  bookings,
  product,
  quantity,
  cartItems,
  translate,
  t,
  ownerHolidayPeriods = [],
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-500 mb-4 text-center uppercase tracking-wider md:hidden">
        {isPackages ? t("selectDate") : t("selectRentalPeriod")}
      </p>
      {isPackages ? (
        <PackagesRangeDate
          selectedPackage={selectedPackage}
          setDaysCount={setDaysCount}
          onSelect={onSelect}
          translate={trans}
          lang={lang}
          ownerHolidayPeriods={ownerHolidayPeriods}
        />
      ) : (
        <RangeDate
          selectedServices={selectedServices}
          bookings={bookings}
          onSelect={onSelect}
          minDays={product.rental.minDays}
          productQuantity={product.quantity}
          productId={product._id}
          quantity={quantity}
          services={product.services}
          cartItems={cartItems}
          translate={translate}
          setDaysCount={setDaysCount}
          lang={lang}
          ownerHolidayPeriods={ownerHolidayPeriods}
        />
      )}
    </div>
  );
}
