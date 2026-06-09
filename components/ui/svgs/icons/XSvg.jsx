export const X = ({
  className = "text-[#0D092B] w-5 h-5",
  strokeWidth = "2",
  ...rest
}) => (
  <svg
    viewBox="0 0 21 22"
    className={className}
    stroke={"currentColor"}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    {...rest}
  >
    <path d="M1 1.75L19.5 20.25" />
    <path d="M19.5 1.75L0.999998 20.25" />
  </svg>
);
