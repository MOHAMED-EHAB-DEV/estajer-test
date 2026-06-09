export const Minus = ({
  className = "w-10 h-10",
  color = "white",
  size = 41,
  strokeWidth = 3,
  ...rest
}) => (
  <svg
    // className="min-w-10"
    className={className}
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
