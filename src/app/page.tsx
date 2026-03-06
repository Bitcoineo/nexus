import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NexusLogoWithText } from "@/components/nexus-logo";
import { FadeInView } from "@/components/fade-in-view";
import { CodePreview } from "@/components/code-preview";
import { FaqAccordion } from "@/components/faq-accordion";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Nav */}
      <nav className="border-b border-border animate-fade-in">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/">
            <NexusLogoWithText size={24} textClassName="text-lg" />
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/dashboard/docs"
              className="text-sm text-foreground-secondary hover:text-foreground transition-colors hidden sm:block"
            >
              Docs
            </Link>
            <Link
              href="/auth/signin"
              className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-full transition-colors font-medium"
            >
              Get your API key
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center px-6 pt-32 pb-16">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance animate-fade-in-up">
            The API toolkit for builders.
          </h1>
          <p
            className="mt-3 text-lg text-foreground-secondary text-balance animate-fade-in-up"
            style={{ animationDelay: "150ms" }}
          >
            Keys. Limits. Hooks. Docs. Everything between your code and production.
          </p>

          {/* Badges */}
          <div
            className="mt-4 flex flex-wrap items-center justify-center gap-2 animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border border-border text-foreground-secondary bg-background">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Free tier
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border border-border text-foreground-secondary bg-background">
              v2 API
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border border-border text-foreground-secondary bg-background">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              99.9% uptime
            </span>
          </div>

          <div
            className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <Link
              href="/auth/signup"
              className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-full text-sm font-medium transition-colors"
            >
              Get your API key
            </Link>
            <Link
              href="/dashboard/docs"
              className="px-6 py-2.5 border border-border hover:bg-background-tertiary rounded-full text-sm font-medium transition-colors"
            >
              Read the docs
            </Link>
          </div>

          {/* Code preview with tabs + toast */}
          <CodePreview />
        </div>
      </section>

      {/* Feature cards */}
      <section className="px-6">
        <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          <FadeInView delay={0}>
            <FeatureCard
              title="Authenticate"
              description="API keys with scopes. Hash on store. Show once."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25z" />
                </svg>
              }
            />
          </FadeInView>
          <FadeInView delay={150}>
            <div className="h-full border border-border rounded-xl p-8 hover:border-accent/30 hover:-translate-y-1 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-accent/[0.08] text-accent flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">Rate limit</h3>
              <p className="mt-2 text-[15px] text-foreground-secondary leading-relaxed">
                Sliding window. Free and Pro tiers. Headers on every response.
              </p>
              {/* Rate limit visual */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-mono text-foreground-secondary mb-1.5">
                  <span>245 / 1,000 requests</span>
                </div>
                <div className="h-1.5 rounded-full bg-background-tertiary overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: "24.5%" }} />
                </div>
                <div className="mt-1.5 text-xs text-foreground-tertiary">
                  Resets in 14m
                </div>
              </div>
            </div>
          </FadeInView>
          <FadeInView delay={300}>
            <FeatureCard
              title="Webhooks"
              description="HMAC-signed. Retry with backoff. Delivery logs."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              }
            />
          </FadeInView>
        </div>
      </section>

      {/* Testimonial */}
      <FadeInView>
        <section className="mt-16 py-16 bg-background-secondary">
          <div className="max-w-2xl mx-auto px-6 text-center relative">
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-6xl text-accent/10 font-serif leading-none select-none">
              &ldquo;
            </span>
            <blockquote className="text-lg sm:text-xl leading-relaxed text-foreground italic">
              We replaced 400 lines of auth middleware with Nexus. Keys, rate limits, and webhook delivery — all handled.
            </blockquote>
            <p className="mt-4 text-sm text-foreground-tertiary not-italic">
              — Engineering team at a YC startup
            </p>
          </div>
        </section>
      </FadeInView>

      {/* FAQ */}
      <FadeInView>
        <section className="py-16 px-6 bg-background">
          <h2 className="text-2xl font-semibold text-center mb-8">Questions</h2>
          <FaqAccordion />
        </section>
      </FadeInView>

      {/* Footer */}
      <footer className="border-t border-border bg-background-secondary py-12 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/">
              <NexusLogoWithText size={20} textClassName="text-base" />
            </Link>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-semibold mb-3">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link href="/dashboard/keys" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">API Keys</Link></li>
                <li><Link href="/dashboard/webhooks" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Webhooks</Link></li>
                <li><Link href="/dashboard/docs" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Docs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/dashboard/docs" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Getting Started</Link></li>
                <li><Link href="/dashboard/docs" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">API Reference</Link></li>
                <li><a href="#" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Changelog</a></li>
                <li><a href="#" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Company</h4>
              <ul className="space-y-2">
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">About</a></li>
                <li><a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-foreground-tertiary">
              &copy; 2026 Bitcoineo. All rights reserved.
            </span>
            <div className="flex items-center gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-foreground-tertiary hover:text-foreground transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-foreground-tertiary hover:text-foreground transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="h-full border border-border rounded-xl p-8 hover:border-accent/30 hover:-translate-y-1 hover:shadow-md transition-all duration-200">
      <div className="w-10 h-10 rounded-xl bg-accent/[0.08] text-accent flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-[15px] text-foreground-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}
