export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background-secondary min-h-full">
      <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
