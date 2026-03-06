export function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "text-[#34C759] bg-[#34C759]/10",
    POST: "text-[#007AFF] bg-[#007AFF]/10",
    PUT: "text-[#FF9500] bg-[#FF9500]/10",
    PATCH: "text-[#FF9500] bg-[#FF9500]/10",
    DELETE: "text-[#FF3B30] bg-[#FF3B30]/10",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
        colors[method] || "text-foreground-secondary bg-background-tertiary"
      }`}
    >
      {method}
    </span>
  );
}

export function StatusBadge({ code }: { code: number }) {
  const color =
    code < 300
      ? "text-[#34C759] bg-[#34C759]/10"
      : code < 500
        ? "text-[#FF9500] bg-[#FF9500]/10"
        : "text-[#FF3B30] bg-[#FF3B30]/10";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${color}`}>
      {code}
    </span>
  );
}
