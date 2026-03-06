"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Is there a free tier?",
    a: "Yes. 100 requests/day, 10/minute. No credit card needed.",
  },
  {
    q: "How do I authenticate?",
    a: "Create an API key in the dashboard. Pass it as a Bearer token or query param.",
  },
  {
    q: "What happens when I hit the rate limit?",
    a: "You get a 429 response with a Retry-After header. The X-RateLimit-Remaining header tells you how many requests you have left.",
  },
  {
    q: "How do webhooks work?",
    a: "Register a URL, pick your events. We POST signed payloads with HMAC-SHA256. Failed deliveries retry 3 times with exponential backoff.",
  },
  {
    q: "Can I rotate my API key?",
    a: "Revoke the old key and create a new one. Active integrations using the old key will stop working immediately.",
  },
  {
    q: "What's the difference between v1 and v2?",
    a: "v2 returns tags as arrays instead of comma strings, adds search and tag filtering, and includes a version field.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto">
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="border-b border-border">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between py-4 text-left text-sm transition-colors hover:text-foreground"
            >
              <span className={isOpen ? "font-semibold text-foreground" : "text-foreground"}>
                {faq.q}
              </span>
              <svg
                className={`w-4 h-4 shrink-0 ml-4 text-foreground-tertiary transition-transform duration-200 ${
                  isOpen ? "rotate-90" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            <div
              className="overflow-hidden transition-all duration-200"
              style={{
                maxHeight: isOpen ? "200px" : "0px",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <p className="pb-4 text-sm text-foreground-secondary leading-relaxed">
                {faq.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
