export const Chevron = ({ className, size = 16, color = "currentColor", ...rest }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...rest}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);
