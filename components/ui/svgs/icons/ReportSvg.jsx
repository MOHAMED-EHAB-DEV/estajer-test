export const Report = ({ className, size = 18, fill = "#F44242", ...rest }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 19 18"
    {...rest}
  >
    <g id="Page-1" fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
      <g id="Core" fill={fill} transform="translate(-129 -381)">
        <g id="report" transform="translate(129 381)">
          <path
            id="Shape"
            d="M12.7 0H5.3L0 5.3v7.5L5.3 18h7.5l5.3-5.3V5.3zM9 14.3c-.7 0-1.3-.6-1.3-1.3s.6-1.3 1.3-1.3 1.3.6 1.3 1.3-.6 1.3-1.3 1.3m1-4.3H8V4h2z"
          ></path>
        </g>
      </g>
    </g>
  </svg>
);
