export const Seen = ({ color = "#B3B3B3", single, ...rest }) => (
  <svg width="17" height="9" viewBox="0 0 17 9" fill="none" {...rest}>
    <path
      d={`M5.39421 4.49984L8.93004 8.03568L16 0.964844M1.22754 ${
        !single
          ? "4.49984L4.76337 8.03568M11.8342 0.964844L9.14421 3.67901"
          : "5.0"
      }`}
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
