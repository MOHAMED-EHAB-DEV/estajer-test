export const Line = ({ color = "#0D092B", ...rest }) => (
  <svg
    className="min-w-0.5"
    width="2"
    height="30"
    viewBox="0 0 2 26"
    fill="none"
    {...rest}
  >
    <path d="M1 0V26" stroke={color} />
  </svg>
);
