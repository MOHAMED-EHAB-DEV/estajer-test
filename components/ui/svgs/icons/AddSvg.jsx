export const Add = ({ className, color = "#0D092B", ...rest }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}
  >
    <path
      d="M10.0039 1V19"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M1 9.99609L19 9.99609"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
