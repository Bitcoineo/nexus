import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NexusLogoWithText } from "@/components/nexus-logo";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <NexusLogoWithText size={24} textClassName="text-lg" />
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
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance">
            The API toolkit for builders.
          </h1>
          <p className="mt-3 text-lg text-foreground-secondary text-balance">
            Keys. Limits. Hooks. Docs. Everything between your code and production.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
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

          {/* Code preview */}
          <div className="mt-10 max-w-xl mx-auto shadow-xl rounded-xl overflow-hidden">
            {/* Terminal bar */}
            <div className="h-8 bg-[#2a2a2c] flex items-center px-3.5 gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5F57]" />
              <span className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
              <span className="w-2 h-2 rounded-full bg-[#28C840]" />
            </div>
            {/* Code body */}
            <div className="bg-code-bg p-5 text-left text-sm font-mono overflow-x-auto">
              <div>
                <span className="text-gray-200">$ </span>
                <span className="text-gray-200">curl</span>
                <span className="text-gray-500"> -H </span>
                <span className="text-green-400">&quot;Authorization: Bearer nx_live_...&quot;</span>
                <span className="text-gray-500"> \</span>
              </div>
              <div className="pl-4 text-gray-500">https://api.nexus.dev/v2/notes</div>
              <div className="mt-3 text-gray-500">{"{"}</div>
              <div className="pl-4">
                <span className="text-blue-400">&quot;data&quot;</span>
                <span className="text-gray-500">: [{"{"}</span>
              </div>
              <div className="pl-8">
                <span className="text-blue-400">&quot;id&quot;</span>
                <span className="text-gray-500">: </span>
                <span className="text-green-400">&quot;n_a1b2c3&quot;</span>
                <span className="text-gray-500">,</span>
              </div>
              <div className="pl-8">
                <span className="text-blue-400">&quot;title&quot;</span>
                <span className="text-gray-500">: </span>
                <span className="text-green-400">&quot;My first note&quot;</span>
                <span className="text-gray-500">,</span>
              </div>
              <div className="pl-8">
                <span className="text-blue-400">&quot;tags&quot;</span>
                <span className="text-gray-500">: [</span>
                <span className="text-green-400">&quot;api&quot;</span>
                <span className="text-gray-500">, </span>
                <span className="text-green-400">&quot;docs&quot;</span>
                <span className="text-gray-500">]</span>
              </div>
              <div className="pl-4">
                <span className="text-gray-500">{"}"}]</span>
              </div>
              <div className="text-gray-500">{"}"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="px-6">
        <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          <FeatureCard
            title="Authenticate"
            description="API keys with scopes. Hash on store. Show once."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25z" />
              </svg>
            }
          />
          <FeatureCard
            title="Rate limit"
            description="Sliding window. Free and Pro tiers. Headers on every response."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            }
          />
          <FeatureCard
            title="Webhooks"
            description="HMAC-signed. Retry with backoff. Delivery logs."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-16 bg-background-secondary py-20 text-center">
        <h2 className="text-3xl font-bold">Start building.</h2>
        <Link
          href="/auth/signup"
          className="mt-5 inline-block px-8 py-3.5 bg-accent hover:bg-accent-hover text-white rounded-full text-sm font-medium transition-colors"
        >
          Get your API key
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="flex items-center justify-center gap-4 text-sm text-foreground-tertiary">
          <span>Built by Bitcoineo</span>
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
    <div className="border border-border rounded-xl p-8 hover:border-accent/30 hover:-translate-y-1 hover:shadow-md transition-all duration-200">
      <div className="w-10 h-10 rounded-xl bg-[#007AFF]/[0.08] text-accent flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-[15px] text-[#6E6E73] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
