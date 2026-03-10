export function Logo({ size = 40 }: { size?: number }) {
  const id = `logo-gradient-${size}`;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="12" y1="10" x2="88" y2="92" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>

      <rect x="8" y="8" width="84" height="84" rx="24" fill={`url(#${id})`} />
      <path
        d="M28 34c8-6 17-7 22-7s14 1 22 7v32c-8-6-17-7-22-7s-14 1-22 7V34Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path d="M50 27v39" stroke="#1d4ed8" strokeWidth="4" strokeLinecap="round" />
      <path d="M34 42h12M34 49h12M54 42h12M54 49h12" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
