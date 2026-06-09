export const User = ({ className, color = "#0D092B", size = 24, ...rest }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 25"
    fill={color}
    {...rest}
  >
    <path d="M12 10.5C14.2091 10.5 16 8.70914 16 6.5C16 4.29086 14.2091 2.5 12 2.5C9.79086 2.5 8 4.29086 8 6.5C8 8.70914 9.79086 10.5 12 10.5Z" />
    <path d="M20 18C20 20.485 20 22.5 12 22.5C4 22.5 4 20.485 4 18C4 15.515 7.582 13.5 12 13.5C16.418 13.5 20 15.515 20 18Z" />
  </svg>
);
