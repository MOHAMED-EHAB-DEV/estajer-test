export const Line = ({ className = "min-w-0.5 md:h-[30px] h-[20px]", color = "#0D092B", ...rest }) => (
  <svg
    className={className}
    width="2"
    height="30"
    viewBox="0 0 2 26"
    fill="none"
    {...rest}
  >
    <path d="M1 0V26" stroke={color} />
  </svg>
);
