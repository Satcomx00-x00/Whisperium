// Inline SVG icons — the locked stack ships no icon dependency, so these are
// hand-rolled, currentColor-driven, and sized via className.

type IconProps = { className?: string };

const base = (className?: string) => `h-3.5 w-3.5 ${className ?? ''}`.trim();

export const MicIcon = ({ className }: IconProps) => (
  <svg
    className={base(className)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M12 17v5" />
  </svg>
);

export const StopIcon = ({ className }: IconProps) => (
  <svg className={base(className)} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

export const PauseIcon = ({ className }: IconProps) => (
  <svg
    className={base(className)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="9" y1="5" x2="9" y2="19" />
    <line x1="15" y1="5" x2="15" y2="19" />
  </svg>
);

export const PinIcon = ({ className }: IconProps) => (
  <svg
    className={base(className)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 4h6l-1 6 3 3H7l3-3-1-6Z" />
    <path d="M12 16v4" />
  </svg>
);

export const InfoIcon = ({ className }: IconProps) => (
  <svg
    className={base(className)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export const SettingsIcon = ({ className }: IconProps) => (
  <svg
    className={base(className)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
  </svg>
);
