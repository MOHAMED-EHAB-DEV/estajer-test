export const X = ({ className, strokeWidth = "2", ...rest }) => (
  <svg
    viewBox="0 0 21 22"
    className={className || "text-darkNavy md:w-5 w-3.5 md:h-5 h-3.5"}
    stroke={"currentColor"}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    {...rest}
  >
    <path d="M1 1.75L19.5 20.25" />
    <path d="M19.5 1.75L0.999998 20.25" />
  </svg>
);
