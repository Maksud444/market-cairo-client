export default function VerifiedBadge({ size = 14, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 ${className}`}
      title="Verified user"
      aria-label="Verified"
    >
      <path
        d="M10 1.5l2.12 1.54 2.6-.4 1.04 2.4 2.4 1.04-.4 2.6L19.5 10l-1.54 2.12.4 2.6-2.4 1.04-1.04 2.4-2.6-.4L10 19.5l-2.12-1.54-2.6.4-1.04-2.4-2.4-1.04.4-2.6L.5 10l1.54-2.12-.4-2.6 2.4-1.04L5.08 1.64l2.6.4L10 1.5z"
        fill="#1D9BF0"
      />
      <path
        d="M7 10l2 2 4-4"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
