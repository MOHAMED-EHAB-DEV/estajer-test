export const UpArrow = ({ ...rest }) => (
  <div className="relative mx-auto" {...rest}>
    <svg
      className="absolute blur-xl"
      width="40"
      height="40"
      viewBox="37 37 40 40"
    >
      <circle opacity="0.8" cx="57" cy="57" r="17" fill="#F48A42" />
    </svg>
    <svg
      className="relative z-10"
      width="40"
      height="40"
      viewBox="37 37 40 40"
      fill="white"
    >
      <path d="M57 37.5C46.248 37.5 37.5 46.248 37.5 57C37.5 67.752 46.248 76.5 57 76.5C67.752 76.5 76.5 67.752 76.5 57C76.5 46.248 67.752 37.5 57 37.5ZM57 40.5C66.1305 40.5 73.5 47.8695 73.5 57C73.5 66.1305 66.1305 73.5 57 73.5C47.8695 73.5 40.5 66.1305 40.5 57C40.5 47.8695 47.8695 40.5 57 40.5ZM57 46.3125L55.92 47.3925L47.391 55.9215L49.5 58.08L55.5 52.08V67.5H58.5V52.08L64.5 58.08L66.609 55.92L58.0785 47.391L56.9985 46.311L57 46.3125Z" />
    </svg>
  </div>
);
