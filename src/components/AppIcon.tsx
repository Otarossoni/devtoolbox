interface AppIconProps {
  size?: number;
  className?: string;
}

/** DevToolbox mark (design option 2a "Toolbox prompt"): toolbox with a terminal prompt — also used as the favicon (src/app/icon.svg) */
export default function AppIcon({ size = 36, className = "" }: AppIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden
      className={`block shrink-0 ${className}`}
    >
      <g className="fill-accent">
        <rect x="21" y="8" width="22" height="5" rx="2.5" />
        <rect x="21" y="8" width="5" height="15" rx="2.5" />
        <rect x="38" y="8" width="5" height="15" rx="2.5" />
        <rect x="5" y="20" width="54" height="38" rx="10" />
      </g>
      <g className="fill-on-accent">
        <polygon points="15,31 28,39 15,47 15,41.5 19.5,39 15,36.5" />
        <rect x="31" y="43" width="14" height="4.5" rx="2" />
      </g>
    </svg>
  );
}
