"use client";

import { useEffect, useRef, useState } from "react";

export function FadeInView({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`h-full ${className || ""}`}
      style={{
        opacity: 0,
        animation: visible ? `fadeInUp 400ms ease-out ${delay}ms forwards` : undefined,
      }}
    >
      {children}
    </div>
  );
}
