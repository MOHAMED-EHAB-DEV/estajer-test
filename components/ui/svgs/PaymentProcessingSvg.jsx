const PaymentProcessing = () => (
  <svg
    className="h-max"
    width="550"
    height="550"
    viewBox="0 0 800 800"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Background Circle */}
    <circle cx="400" cy="400" r="350" fill="#dbf1fe" />
    <circle cx="400" cy="400" r="300" fill="#a4d9f7" opacity="0.5" />

    {/* Bank Building */}
    <rect x="250" y="280" width="300" height="220" rx="8" fill="#0496be" />
    <rect x="280" y="320" width="240" height="180" rx="4" fill="#05609a" />

    {/* Bank Pillars */}
    <rect
      x="290"
      y="340"
      width="30"
      height="140"
      rx="4"
      fill="#fff"
      opacity="0.9"
    />
    <rect
      x="340"
      y="340"
      width="30"
      height="140"
      rx="4"
      fill="#fff"
      opacity="0.9"
    />
    <rect
      x="430"
      y="340"
      width="30"
      height="140"
      rx="4"
      fill="#fff"
      opacity="0.9"
    />
    <rect
      x="480"
      y="340"
      width="30"
      height="140"
      rx="4"
      fill="#fff"
      opacity="0.9"
    />

    {/* Bank Roof */}
    <path d="M230 290 L400 200 L570 290 L230 290" fill="#0496be" />
    <path d="M260 290 L400 220 L540 290 L260 290" fill="#05609a" />

    {/* Bank Door */}
    <rect x="370" y="420" width="60" height="80" rx="4" fill="#feb313" />
    <circle cx="418" cy="460" r="4" fill="#05609a" />

    {/* Clock/Timer Circle - Processing Indicator */}
    <circle
      cx="550"
      cy="250"
      r="70"
      fill="#fff"
      stroke="#0496be"
      strokeWidth="6"
    />
    <circle cx="550" cy="250" r="55" fill="#dbf1fe" />

    {/* Clock Hands - Animated Feel */}
    <line
      x1="550"
      y1="250"
      x2="550"
      y2="210"
      stroke="#0496be"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <line
      x1="550"
      y1="250"
      x2="580"
      y2="260"
      stroke="#05609a"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="550" cy="250" r="6" fill="#0496be" />

    {/* Processing Arrows - Circular Motion */}
    <path
      d="M550 180 C590 180 620 210 620 250"
      stroke="#feb313"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    <polygon points="622,240 622,260 635,250" fill="#feb313" />

    {/* Money/Document Flow */}
    <rect
      x="180"
      y="350"
      width="50"
      height="70"
      rx="4"
      fill="#feb313"
      opacity="0.8"
    >
      <animate
        attributeName="opacity"
        values="0.4;0.8;0.4"
        dur="2s"
        repeatCount="indefinite"
      />
    </rect>
    <line
      x1="190"
      y1="370"
      x2="220"
      y2="370"
      stroke="#05609a"
      strokeWidth="2"
    />
    <line
      x1="190"
      y1="385"
      x2="215"
      y2="385"
      stroke="#05609a"
      strokeWidth="2"
    />
    <line
      x1="190"
      y1="400"
      x2="210"
      y2="400"
      stroke="#05609a"
      strokeWidth="2"
    />

    {/* Arrow from document to bank */}
    <path
      d="M235 385 L280 385"
      stroke="#0496be"
      strokeWidth="3"
      strokeLinecap="round"
      markerEnd="url(#arrowhead)"
    >
      <animate
        attributeName="stroke-dasharray"
        values="0,50;50,0"
        dur="1.5s"
        repeatCount="indefinite"
      />
    </path>
    <defs>
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="#0496be" />
      </marker>
    </defs>

    {/* Coins Stack */}
    <ellipse cx="620" cy="450" rx="40" ry="15" fill="#feb313" />
    <ellipse cx="620" cy="440" rx="40" ry="15" fill="#ffd36b" />
    <ellipse cx="620" cy="430" rx="40" ry="15" fill="#feb313" />
    <ellipse cx="620" cy="420" rx="40" ry="15" fill="#ffd36b" />

    {/* Checkmark in Progress Circle */}
    <circle cx="260" cy="520" r="40" fill="#0496be" opacity="0.2" />
    <circle cx="260" cy="520" r="30" fill="#fff" />
    <path
      d="M245 520 L255 530 L278 507"
      stroke="#0496be"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity="0.5"
    />

    {/* Loading Dots */}
    <circle cx="360" cy="560" r="8" fill="#0496be">
      <animate
        attributeName="opacity"
        values="0.3;1;0.3"
        dur="1.2s"
        repeatCount="indefinite"
        begin="0s"
      />
    </circle>
    <circle cx="400" cy="560" r="8" fill="#0496be">
      <animate
        attributeName="opacity"
        values="0.3;1;0.3"
        dur="1.2s"
        repeatCount="indefinite"
        begin="0.4s"
      />
    </circle>
    <circle cx="440" cy="560" r="8" fill="#0496be">
      <animate
        attributeName="opacity"
        values="0.3;1;0.3"
        dur="1.2s"
        repeatCount="indefinite"
        begin="0.8s"
      />
    </circle>

    {/* Small decorative elements */}
    <circle cx="180" cy="250" r="15" fill="#feb313" opacity="0.6" />
    <circle cx="650" cy="350" r="12" fill="#ff6110" opacity="0.5" />
    <circle cx="150" cy="450" r="10" fill="#0496be" opacity="0.4" />
  </svg>
);

export default PaymentProcessing;
