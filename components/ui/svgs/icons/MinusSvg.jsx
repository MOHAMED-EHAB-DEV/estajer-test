export const Minus = ({
  className,
  color = "white",
  size = 41,
  strokeWidth = 3,
  ...rest
}) => (
  <svg
    className={className || "md:w-10 w-6 md:h-10 h-6"}
    width={size}
    height={size}
    viewBox="0 0 41 41"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    {...rest}
  >
    <path d="M12 20H30" />
  </svg>
);

