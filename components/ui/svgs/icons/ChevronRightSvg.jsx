export const ChevronRight = ({ color = "black", ...rest }) => (
  <svg
    className="md:!w-6 md:!h-6 !w-5 !h-5"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    {...rest}
  >
    <path
      d="M9 18L15 12L9 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
