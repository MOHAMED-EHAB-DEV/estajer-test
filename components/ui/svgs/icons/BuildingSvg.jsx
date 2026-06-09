export const Building = ({ size = 24, ...rest }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...rest}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 9.5h18M3 9.5V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5M3 9.5c0 1.5 1.5 2.5 3 2.5s3-1 3-2.5M9 9.5c0 1.5 1.5 2.5 3 2.5s3-1 3-2.5M15 9.5c0 1.5 1.5 2.5 3 2.5s3-1 3-2.5"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 20v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5"
    />
    <circle cx="17" cy="15" r="1" />
  </svg>
);
