export default function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 560 520"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      role="img"
      aria-label="Illustration of a shopping bag with parcels and a phone showing an order confirmation"
    >
      {/* Backdrop blob */}
      <circle
        cx="290"
        cy="260"
        r="230"
        style={{ fill: "var(--accent-light)" }}
      />

      <circle
        cx="290"
        cy="260"
        r="230"
        style={{ stroke: "var(--accent)", strokeOpacity: 0.35 }}
        strokeWidth="2"
        strokeDasharray="6 10"
        fill="none"
      />

      {/* Floating parcel — top left */}
      <g transform="translate(60 90) rotate(-8)">
        <rect
          width="86"
          height="70"
          rx="10"
          style={{ fill: "var(--surface)" }}
          stroke="var(--border)"
          strokeWidth="2"
        />
        <rect
          x="0"
          y="26"
          width="86"
          height="14"
          style={{ fill: "var(--accent)" }}
        />
        <rect
          x="36"
          y="0"
          width="14"
          height="70"
          style={{ fill: "var(--accent)" }}
        />
      </g>

      {/* Floating parcel — bottom right */}
      <g transform="translate(400 340) rotate(10)">
        <rect
          width="70"
          height="58"
          rx="9"
          style={{ fill: "var(--surface)" }}
          stroke="var(--border)"
          strokeWidth="2"
        />
        <rect
          x="0"
          y="21"
          width="70"
          height="12"
          style={{ fill: "var(--primary)" }}
        />
        <rect
          x="29"
          y="0"
          width="12"
          height="58"
          style={{ fill: "var(--primary)" }}
        />
      </g>

      {/* Sparkles */}
      <g style={{ fill: "var(--accent-dark)" }}>
        <path d="M120 330 l6 16 16 6 -16 6 -6 16 -6 -16 -16 -6 16 -6 z" />
      </g>

      <g style={{ fill: "var(--primary)" }}>
        <path d="M440 150 l5 13 13 5 -13 5 -5 13 -5 -13 -13 -5 13 -5 z" />
      </g>

      {/* Discount tag */}
      <g transform="translate(345 95) rotate(18)">
        <path
          d="M0 20 L20 0 L64 0 A10 10 0 0 1 74 10 L74 34 L20 34 A10 10 0 0 1 10 24 Z"
          style={{ fill: "var(--primary)" }}
        />
        <circle cx="20" cy="14" r="5" style={{ fill: "var(--surface)" }} />
        <text
          x="38"
          y="24"
          fontSize="14"
          fontWeight="800"
          fill="white"
        >
          -30%
        </text>
      </g>

      {/* Main shopping bag */}
      <g transform="translate(175 130)">
        <path
          d="M20 60 L28 20 A2 2 0 0 1 30 18 L100 18 A2 2 0 0 1 102 20 L110 60 Z"
          style={{ fill: "var(--primary)" }}
        />

        <rect
          x="10"
          y="60"
          width="110"
          height="150"
          rx="14"
          style={{ fill: "var(--primary)" }}
        />

        <rect
          x="10"
          y="60"
          width="110"
          height="34"
          rx="14"
          style={{ fill: "var(--primary-dark)" }}
        />

        {/* Bag handles */}
        <path
          d="M45 60 V38 a20 20 0 0 1 40 0 V60"
          fill="none"
          stroke="var(--primary-dark)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Smiling face / brand mark on the bag */}
        <circle cx="65" cy="150" r="34" style={{ fill: "var(--surface)" }} />
        <circle cx="53" cy="142" r="5" style={{ fill: "var(--primary)" }} />
        <circle cx="77" cy="142" r="5" style={{ fill: "var(--primary)" }} />
        <path
          d="M48 160 Q65 178 82 160"
          fill="none"
          stroke="var(--accent-dark)"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>

      {/* Phone with order confirmation */}
      <g transform="translate(300 210)">
        <rect
          width="130"
          height="220"
          rx="22"
          style={{ fill: "var(--surface)" }}
          stroke="var(--border)"
          strokeWidth="3"
        />

        <rect
          x="12"
          y="18"
          width="106"
          height="150"
          rx="10"
          style={{ fill: "var(--surface-soft)" }}
        />

        <circle
          cx="65"
          cy="70"
          r="26"
          style={{ fill: "var(--primary-light)" }}
        />
        <path
          d="M53 70 l9 9 17 -19"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <rect
          x="24"
          y="112"
          width="82"
          height="8"
          rx="4"
          style={{ fill: "var(--border)" }}
        />
        <rect
          x="24"
          y="128"
          width="56"
          height="8"
          rx="4"
          style={{ fill: "var(--border)" }}
        />

        <rect
          x="12"
          y="182"
          width="106"
          height="26"
          rx="13"
          style={{ fill: "var(--accent)" }}
        />
      </g>
    </svg>
  );
}
