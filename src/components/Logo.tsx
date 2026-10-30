export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <linearGradient id="uz-g" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#35C8FF" />
          <stop offset="1" stopColor="#9065FF" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="10" fill="url(#uz-g)" />
      <ellipse cx="24" cy="24" rx="21" ry="8" transform="rotate(-24 24 24)" stroke="url(#uz-g)" strokeWidth="2.2" opacity="0.9" />
      <circle cx="41" cy="14" r="2.6" fill="#F5F7FF" />
      <circle cx="20.5" cy="20.5" r="3" fill="#F5F7FF" opacity="0.35" />
    </svg>
  );
}

export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="font-display text-xl font-bold tracking-tight">
        Uz<span className="text-gradient">Astro</span>
      </span>
    </span>
  );
}
