export function NexusLogo({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      {/* Edges forming the N */}
      <line
        x1="5"
        y1="20"
        x2="5"
        y2="4"
        stroke="#007AFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="5"
        y1="4"
        x2="19"
        y2="20"
        stroke="#007AFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="19"
        y1="20"
        x2="19"
        y2="4"
        stroke="#007AFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Nodes */}
      <circle cx="5" cy="20" r="2.5" fill="#007AFF" />
      <circle cx="5" cy="4" r="2.5" fill="#007AFF" />
      <circle cx="19" cy="20" r="2.5" fill="#007AFF" />
      <circle cx="19" cy="4" r="2.5" fill="#007AFF" />
    </svg>
  );
}

export function NexusLogoWithText({
  size = 24,
  className,
  textClassName,
}: {
  size?: number;
  className?: string;
  textClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className || ""}`}>
      <NexusLogo size={size} />
      <span
        className={`font-semibold text-foreground ${textClassName || ""}`}
      >
        Nexus
      </span>
    </span>
  );
}
