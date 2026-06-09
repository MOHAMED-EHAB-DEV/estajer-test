import CustomModal from "../ui/CustomModal";
import Button from "../ui/Button";

const WarningIcon = ({ className }) => (
  <svg
    width="122"
    height="122"
    fill="none"
    viewBox="0 0 122 122"
    className={className}
  >
    <g filter="url(#filter0_d_1896_10816)">
      <path
        fill="#F44242"
        fillRule="evenodd"
        d="M100.689 46.897c0-22.092-17.907-40-40-40-22.092 0-40 17.908-40 40s17.908 40 40 40 40-17.909 40-40m-40-20a4 4 0 0 1 4 4v20a4 4 0 0 1-8 0v-20a4 4 0 0 1 4-4m-4 36a4 4 0 0 1 4-4h.032a4 4 0 0 1 0 8h-.031a4 4 0 0 1-4-4"
        clipRule="evenodd"
      ></path>
    </g>
    <defs>
      <filter
        id="filter0_d_1896_10816"
        width="121.379"
        height="121.379"
        x="0"
        y="0"
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        ></feColorMatrix>
        <feOffset dy="13.793"></feOffset>
        <feGaussianBlur stdDeviation="10.345"></feGaussianBlur>
        <feComposite in2="hardAlpha" operator="out"></feComposite>
        <feColorMatrix values="0 0 0 0 0.95 0 0 0 0 0.281042 0 0 0 0 0.292191 0 0 0 0.3 0"></feColorMatrix>
        <feBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_1896_10816"
        ></feBlend>
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_1896_10816"
          result="shape"
        ></feBlend>
      </filter>
    </defs>
  </svg>
);

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  cancelText,
  confirmText,
  type,
  loading,
  t,
}) {
  const isDelete = type === "delete" || type === "cancel";
  const primaryColor = isDelete ? "bg-[#F44242]" : "bg-primary";
  const titleColor = isDelete ? "text-[#F44242]" : "text-primary";
  const shadowColor = isDelete
    ? "shadow-[0px_10px_16px_rgba(244,66,66,0.3)]"
    : "shadow-md";

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      className="bg-white dark:bg-gray-900 rounded-[24px] p-2 md:p-4 text-black dark:text-white shadow-xl"
      backdropClass="backdrop-blur-sm"
    >
      <div className="flex flex-col relative w-full" dir="rtl">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-6 end-6 text-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900 text-[#1D1B20] dark:text-gray-200 shadow-sm z-50 p-2 rounded-full flex items-center justify-center border border-gray-100 dark:border-gray-850"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Body Container */}
        <div className="flex flex-1 flex-col gap-3 md:px-4 p-0">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 mt-6">
            <div className="flex-shrink-0">
              <WarningIcon className="w-[60px] h-[60px] md:w-[84px] md:h-[84px]" />
            </div>
            <div className="flex flex-col flex-1 text-center md:text-start">
              <h2
                className={`text-xl md:text-2xl font-bold ${titleColor} mb-2`}
              >
                {title || (isDelete ? "تحذير!" : t("confirmModal.title"))}
              </h2>
              <p className="text-base md:text-lg font-medium leading-[1.5] text-[#1D1B20] dark:text-gray-200">
                {message}
              </p>
            </div>
          </div>

          <div className="border-t border-[#E8E8E8] dark:border-gray-800 mt-8 w-full" />
        </div>

        {/* Footer Container */}
        <div className="md:px-4 flex flex-col md:flex-row justify-between items-center p-0 mt-6 pb-2 gap-4">
          <Button
            onPress={onClose}
            disabled={loading}
            color="none"
            className="text-base md:text-lg font-bold text-[#1D1B20] dark:text-gray-200 hover:opacity-70 transition-opacity order-2 md:order-1"
          >
            {cancelText || t("confirmModal.cancel")}
          </Button>
          <Button
            onPress={onConfirm}
            isLoading={loading}
            className={`w-full md:w-auto min-w-[140px] md:min-w-[180px] h-12 md:h-[52px] rounded-[26px] ${primaryColor} hover:opacity-90 text-white text-base md:text-[18px] font-bold ${shadowColor} transition-all order-1 md:order-2`}
          >
            {confirmText || t("confirmModal.confirm")}
          </Button>
        </div>
      </div>
    </CustomModal>
  );
}
