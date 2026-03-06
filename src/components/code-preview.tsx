"use client";

import { useState, useEffect, useRef } from "react";

const tabs = ["curl", "Node.js", "Python", "Go"] as const;
type Tab = (typeof tabs)[number];

function CurlCode({ animate }: { animate: boolean }) {
  const cls = animate ? "animate-type-line" : "";
  return (
    <>
      <div className={cls} style={animate ? { animationDelay: "600ms" } : undefined}>
        <span className="text-gray-200">$ </span>
        <span className="text-gray-200">curl</span>
        <span className="text-gray-500"> -H </span>
        <span className="text-green-400">&quot;Authorization: Bearer nx_live_...&quot;</span>
        <span className="text-gray-500"> \</span>
      </div>
      <div className={`pl-4 text-gray-500 ${cls}`} style={animate ? { animationDelay: "800ms" } : undefined}>
        https://api.nexus.dev/v2/notes
      </div>
    </>
  );
}

function NodeCode() {
  return (
    <>
      <div>
        <span className="text-purple-400">const</span>
        <span className="text-gray-200"> res </span>
        <span className="text-gray-500">= </span>
        <span className="text-purple-400">await</span>
        <span className="text-blue-400"> fetch</span>
        <span className="text-gray-500">(</span>
      </div>
      <div className="pl-4">
        <span className="text-green-400">&quot;https://api.nexus.dev/v2/notes&quot;</span>
        <span className="text-gray-500">,</span>
      </div>
      <div className="pl-4 text-gray-500">{"{"}</div>
      <div className="pl-8">
        <span className="text-blue-400">headers</span>
        <span className="text-gray-500">: {"{"}</span>
      </div>
      <div className="pl-12">
        <span className="text-blue-400">Authorization</span>
        <span className="text-gray-500">: </span>
        <span className="text-green-400">&quot;Bearer nx_live_...&quot;</span>
      </div>
      <div className="pl-8 text-gray-500">{"}"}</div>
      <div className="pl-4 text-gray-500">{"}"}</div>
      <div className="text-gray-500">);</div>
      <div className="mt-2">
        <span className="text-purple-400">const</span>
        <span className="text-gray-200"> data </span>
        <span className="text-gray-500">= </span>
        <span className="text-purple-400">await</span>
        <span className="text-gray-200"> res</span>
        <span className="text-gray-500">.</span>
        <span className="text-blue-400">json</span>
        <span className="text-gray-500">();</span>
      </div>
    </>
  );
}

function PythonCode() {
  return (
    <>
      <div>
        <span className="text-purple-400">import</span>
        <span className="text-gray-200"> requests</span>
      </div>
      <div className="mt-2">
        <span className="text-gray-200">res </span>
        <span className="text-gray-500">= </span>
        <span className="text-gray-200">requests</span>
        <span className="text-gray-500">.</span>
        <span className="text-blue-400">get</span>
        <span className="text-gray-500">(</span>
      </div>
      <div className="pl-4">
        <span className="text-green-400">&quot;https://api.nexus.dev/v2/notes&quot;</span>
        <span className="text-gray-500">,</span>
      </div>
      <div className="pl-4">
        <span className="text-blue-400">headers</span>
        <span className="text-gray-500">={"{"}</span>
      </div>
      <div className="pl-8">
        <span className="text-green-400">&quot;Authorization&quot;</span>
        <span className="text-gray-500">: </span>
        <span className="text-green-400">&quot;Bearer nx_live_...&quot;</span>
      </div>
      <div className="pl-4 text-gray-500">{"}"})</div>
      <div className="mt-2">
        <span className="text-gray-200">data </span>
        <span className="text-gray-500">= </span>
        <span className="text-gray-200">res</span>
        <span className="text-gray-500">.</span>
        <span className="text-blue-400">json</span>
        <span className="text-gray-500">()</span>
      </div>
    </>
  );
}

function GoCode() {
  return (
    <>
      <div>
        <span className="text-gray-200">req</span>
        <span className="text-gray-500">, </span>
        <span className="text-gray-200">_ </span>
        <span className="text-gray-500">:= </span>
        <span className="text-gray-200">http</span>
        <span className="text-gray-500">.</span>
        <span className="text-blue-400">NewRequest</span>
        <span className="text-gray-500">(</span>
      </div>
      <div className="pl-4">
        <span className="text-green-400">&quot;GET&quot;</span>
        <span className="text-gray-500">,</span>
      </div>
      <div className="pl-4">
        <span className="text-green-400">&quot;https://api.nexus.dev/v2/notes&quot;</span>
        <span className="text-gray-500">,</span>
      </div>
      <div className="pl-4">
        <span className="text-purple-400">nil</span>
        <span className="text-gray-500">,</span>
      </div>
      <div className="text-gray-500">)</div>
      <div className="mt-2">
        <span className="text-gray-200">req</span>
        <span className="text-gray-500">.</span>
        <span className="text-gray-200">Header</span>
        <span className="text-gray-500">.</span>
        <span className="text-blue-400">Set</span>
        <span className="text-gray-500">(</span>
      </div>
      <div className="pl-4">
        <span className="text-green-400">&quot;Authorization&quot;</span>
        <span className="text-gray-500">,</span>
      </div>
      <div className="pl-4">
        <span className="text-green-400">&quot;Bearer nx_live_...&quot;</span>
        <span className="text-gray-500">,</span>
      </div>
      <div className="text-gray-500">)</div>
      <div className="mt-2">
        <span className="text-gray-200">resp</span>
        <span className="text-gray-500">, </span>
        <span className="text-gray-200">_ </span>
        <span className="text-gray-500">:= </span>
        <span className="text-gray-200">http</span>
        <span className="text-gray-500">.</span>
        <span className="text-blue-400">DefaultClient</span>
        <span className="text-gray-500">.</span>
        <span className="text-blue-400">Do</span>
        <span className="text-gray-500">(</span>
        <span className="text-gray-200">req</span>
        <span className="text-gray-500">)</span>
      </div>
    </>
  );
}

function ResponseBlock({ animate }: { animate: boolean }) {
  const cls = animate ? "animate-type-line" : "";
  return (
    <>
      <div className={`mt-3 text-gray-500 ${cls}`} style={animate ? { animationDelay: "1000ms" } : undefined}>
        {"{"}
      </div>
      <div className={`pl-4 ${cls}`} style={animate ? { animationDelay: "1100ms" } : undefined}>
        <span className="text-blue-400">&quot;data&quot;</span>
        <span className="text-gray-500">: [{"{"}</span>
      </div>
      <div className={`pl-8 ${cls}`} style={animate ? { animationDelay: "1200ms" } : undefined}>
        <span className="text-blue-400">&quot;id&quot;</span>
        <span className="text-gray-500">: </span>
        <span className="text-green-400">&quot;n_a1b2c3&quot;</span>
        <span className="text-gray-500">,</span>
      </div>
      <div className={`pl-8 ${cls}`} style={animate ? { animationDelay: "1300ms" } : undefined}>
        <span className="text-blue-400">&quot;title&quot;</span>
        <span className="text-gray-500">: </span>
        <span className="text-green-400">&quot;My first note&quot;</span>
        <span className="text-gray-500">,</span>
      </div>
      <div className={`pl-8 ${cls}`} style={animate ? { animationDelay: "1400ms" } : undefined}>
        <span className="text-blue-400">&quot;tags&quot;</span>
        <span className="text-gray-500">: [</span>
        <span className="text-green-400">&quot;api&quot;</span>
        <span className="text-gray-500">, </span>
        <span className="text-green-400">&quot;docs&quot;</span>
        <span className="text-gray-500">]</span>
      </div>
      <div className={`pl-4 ${cls}`} style={animate ? { animationDelay: "1500ms" } : undefined}>
        <span className="text-gray-500">{"}"}]</span>
      </div>
      <div className={cls} style={animate ? { animationDelay: "1600ms" } : undefined}>
        <span className="text-gray-500">{"}"}</span>
        {animate && (
          <span
            className="inline-block w-[7px] h-[14px] bg-gray-400 ml-1 align-middle"
            style={{ animation: "blink 1s step-end infinite", animationDelay: "2000ms", opacity: 0 }}
          />
        )}
      </div>
    </>
  );
}

export function CodePreview() {
  const [active, setActive] = useState<Tab>("curl");
  const initialTab = useRef(true);
  const [toastPhase, setToastPhase] = useState<"hidden" | "visible" | "done">("hidden");

  // Only animate curl on the very first render (before any tab switch)
  const shouldAnimate = active === "curl" && initialTab.current;

  function handleTabClick(tab: Tab) {
    initialTab.current = false;
    setActive(tab);
  }

  // Toast: show at 3s, hide at 5s
  useEffect(() => {
    const showTimer = setTimeout(() => setToastPhase("visible"), 3000);
    const hideTimer = setTimeout(() => setToastPhase("done"), 5000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className="mt-10 max-w-xl mx-auto relative overflow-visible">
      <div className="shadow-xl rounded-xl overflow-hidden">
        {/* Terminal bar with dots */}
        <div className="bg-[#2a2a2c] px-3.5 pt-2.5">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2 h-2 rounded-full bg-[#FF5F57]"
              style={{ animation: "dotPulse 300ms ease-in-out 1900ms forwards" }}
            />
            <span
              className="w-2 h-2 rounded-full bg-[#FEBC2E]"
              style={{ animation: "dotPulse 300ms ease-in-out 1950ms forwards" }}
            />
            <span
              className="w-2 h-2 rounded-full bg-[#28C840]"
              style={{ animation: "dotPulse 300ms ease-in-out 2000ms forwards" }}
            />
          </div>
          {/* Tabs */}
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-3.5 py-1.5 text-xs font-mono transition-colors shrink-0 ${
                  active === tab
                    ? "text-white font-medium bg-[#1D1D1F] rounded-t-md"
                    : "text-[#636366] hover:text-[#A1A1AA]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        {/* Code body */}
        <div className="bg-code-bg p-5 text-left text-sm font-mono overflow-x-auto min-h-[240px]">
          {active === "curl" && (
            <>
              <CurlCode animate={shouldAnimate} />
              <ResponseBlock animate={shouldAnimate} />
            </>
          )}
          {active === "Node.js" && (
            <>
              <NodeCode />
              <ResponseBlock animate={false} />
            </>
          )}
          {active === "Python" && (
            <>
              <PythonCode />
              <ResponseBlock animate={false} />
            </>
          )}
          {active === "Go" && (
            <>
              <GoCode />
              <ResponseBlock animate={false} />
            </>
          )}
        </div>
      </div>

      {/* Toast notification */}
      <div
        className={`absolute bottom-4 right-4 rounded-lg bg-[#1D1D1F] text-white text-sm px-4 py-2.5 shadow-lg flex items-center gap-2 transition-all duration-300 ${
          toastPhase === "visible"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <svg className="w-4 h-4 text-[#34C759] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        API key copied to clipboard
      </div>
    </div>
  );
}
