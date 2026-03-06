"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type EndpointDoc = {
  method: string;
  path: string;
  description: string;
  scope: string;
  version: string;
  sectionLabel: string;
  queryParams?: { name: string; type: string; description: string }[];
  bodyExample?: string;
  responseExample: string;
  errorExamples: { status: number; body: string }[];
};

const ENDPOINTS: EndpointDoc[] = [
  {
    method: "GET",
    path: "/api/v1/notes",
    description: "List all notes with pagination.",
    scope: "notes:read",
    version: "v1",
    sectionLabel: "List notes",
    queryParams: [
      { name: "page", type: "integer", description: "Page number (default: 1)" },
      { name: "limit", type: "integer", description: "Items per page (default: 20, max: 100)" },
    ],
    responseExample: JSON.stringify({
      data: [{ id: "abc123", title: "My Note", content: "Hello world", tags: "api,docs", created_at: "2024-01-15T10:30:00.000Z", updated_at: "2024-01-15T10:30:00.000Z" }],
      pagination: { page: 1, limit: 20, total: 42 },
    }, null, 2),
    errorExamples: [
      { status: 401, body: JSON.stringify({ error: "Invalid API key." }, null, 2) },
      { status: 429, body: JSON.stringify({ error: "Rate limit exceeded." }, null, 2) },
    ],
  },
  {
    method: "GET",
    path: "/api/v1/notes/:id",
    description: "Retrieve a single note by ID.",
    scope: "notes:read",
    version: "v1",
    sectionLabel: "Get note",
    responseExample: JSON.stringify({
      data: { id: "abc123", title: "My Note", content: "Hello world", tags: "api,docs", created_at: "2024-01-15T10:30:00.000Z", updated_at: "2024-01-15T10:30:00.000Z" },
    }, null, 2),
    errorExamples: [
      { status: 404, body: JSON.stringify({ error: "Note not found." }, null, 2) },
    ],
  },
  {
    method: "POST",
    path: "/api/v1/notes",
    description: "Create a new note.",
    scope: "notes:write",
    version: "v1",
    sectionLabel: "Create note",
    bodyExample: JSON.stringify({ title: "My Note", content: "Hello world", tags: "api,docs" }, null, 2),
    responseExample: JSON.stringify({
      data: { id: "abc123", title: "My Note", content: "Hello world", tags: "api,docs", created_at: "2024-01-15T10:30:00.000Z", updated_at: "2024-01-15T10:30:00.000Z" },
    }, null, 2),
    errorExamples: [
      { status: 400, body: JSON.stringify({ error: "Missing required field: title" }, null, 2) },
      { status: 403, body: JSON.stringify({ error: "Insufficient permissions. Required: notes:write" }, null, 2) },
    ],
  },
  {
    method: "PATCH",
    path: "/api/v1/notes/:id",
    description: "Update an existing note by ID.",
    scope: "notes:write",
    version: "v1",
    sectionLabel: "Update note",
    bodyExample: JSON.stringify({ title: "Updated Title", content: "New content" }, null, 2),
    responseExample: JSON.stringify({
      data: { id: "abc123", title: "Updated Title", content: "New content", tags: "api,docs", created_at: "2024-01-15T10:30:00.000Z", updated_at: "2024-01-15T12:00:00.000Z" },
    }, null, 2),
    errorExamples: [
      { status: 404, body: JSON.stringify({ error: "Note not found." }, null, 2) },
    ],
  },
  {
    method: "DELETE",
    path: "/api/v1/notes/:id",
    description: "Permanently delete a note.",
    scope: "notes:write",
    version: "v1",
    sectionLabel: "Delete note",
    responseExample: JSON.stringify({ data: { id: "abc123", deleted: true } }, null, 2),
    errorExamples: [
      { status: 404, body: JSON.stringify({ error: "Note not found." }, null, 2) },
    ],
  },
  {
    method: "GET",
    path: "/api/v2/notes",
    description: "List all notes with search and tag filtering.",
    scope: "notes:read",
    version: "v2",
    sectionLabel: "List notes",
    queryParams: [
      { name: "page", type: "integer", description: "Page number (default: 1)" },
      { name: "limit", type: "integer", description: "Items per page (default: 20, max: 100)" },
      { name: "search", type: "string", description: "Search title and content" },
      { name: "tag", type: "string", description: "Filter by tag name" },
    ],
    responseExample: JSON.stringify({
      data: [{ id: "abc123", title: "My Note", content: "Hello world", tags: ["api", "docs"], version: 1, metadata: {}, createdAt: "2024-01-15T10:30:00.000Z", updatedAt: "2024-01-15T10:30:00.000Z" }],
      pagination: { page: 1, limit: 20, total: 42 },
    }, null, 2),
    errorExamples: [
      { status: 401, body: JSON.stringify({ error: "Invalid API key." }, null, 2) },
      { status: 429, body: JSON.stringify({ error: "Rate limit exceeded." }, null, 2) },
    ],
  },
  {
    method: "GET",
    path: "/api/v2/notes/:id",
    description: "Retrieve a single note by ID.",
    scope: "notes:read",
    version: "v2",
    sectionLabel: "Get note",
    responseExample: JSON.stringify({
      data: { id: "abc123", title: "My Note", content: "Hello world", tags: ["api", "docs"], version: 1, metadata: {}, createdAt: "2024-01-15T10:30:00.000Z", updatedAt: "2024-01-15T10:30:00.000Z" },
    }, null, 2),
    errorExamples: [
      { status: 404, body: JSON.stringify({ error: "Note not found." }, null, 2) },
    ],
  },
  {
    method: "POST",
    path: "/api/v2/notes",
    description: "Create a new note with array tags.",
    scope: "notes:write",
    version: "v2",
    sectionLabel: "Create note",
    bodyExample: JSON.stringify({ title: "My Note", content: "Hello world", tags: ["api", "docs"] }, null, 2),
    responseExample: JSON.stringify({
      data: { id: "abc123", title: "My Note", content: "Hello world", tags: ["api", "docs"], version: 1, metadata: {}, createdAt: "2024-01-15T10:30:00.000Z", updatedAt: "2024-01-15T10:30:00.000Z" },
    }, null, 2),
    errorExamples: [
      { status: 400, body: JSON.stringify({ error: "Missing required field: title" }, null, 2) },
    ],
  },
  {
    method: "PATCH",
    path: "/api/v2/notes/:id",
    description: "Update an existing note by ID.",
    scope: "notes:write",
    version: "v2",
    sectionLabel: "Update note",
    bodyExample: JSON.stringify({ title: "Updated Title", tags: ["api", "updated"] }, null, 2),
    responseExample: JSON.stringify({
      data: { id: "abc123", title: "Updated Title", content: "Hello world", tags: ["api", "updated"], version: 1, metadata: {}, createdAt: "2024-01-15T10:30:00.000Z", updatedAt: "2024-01-15T12:00:00.000Z" },
    }, null, 2),
    errorExamples: [
      { status: 404, body: JSON.stringify({ error: "Note not found." }, null, 2) },
    ],
  },
  {
    method: "DELETE",
    path: "/api/v2/notes/:id",
    description: "Permanently delete a note.",
    scope: "notes:write",
    version: "v2",
    sectionLabel: "Delete note",
    responseExample: JSON.stringify({ data: { id: "abc123", deleted: true } }, null, 2),
    errorExamples: [
      { status: 404, body: JSON.stringify({ error: "Note not found." }, null, 2) },
    ],
  },
];

const METHOD_BADGE: Record<string, string> = {
  GET: "bg-emerald-50 text-emerald-700 border-emerald-200",
  POST: "bg-blue-50 text-blue-700 border-blue-200",
  PATCH: "bg-amber-50 text-amber-700 border-amber-200",
  DELETE: "bg-red-50 text-red-700 border-red-200",
};

const METHOD_DOT: Record<string, string> = {
  GET: "bg-emerald-500",
  POST: "bg-blue-500",
  PATCH: "bg-amber-500",
  DELETE: "bg-red-500",
};

export default function DocsPage() {
  const [selected, setSelected] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tryItOpen, setTryItOpen] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { data: keysData } = useSWR("/api/keys", fetcher);
  const activeKeys = (keysData?.data || []).filter(
    (k: { revokedAt: string | null }) => !k.revokedAt
  );
  const defaultKey = activeKeys[0]?.keyPrefix
    ? `${activeKeys[0].keyPrefix}...`
    : "nx_live_your_key_here";

  const endpoint = ENDPOINTS[selected];
  const v1Endpoints = ENDPOINTS.filter((e) => e.version === "v1");
  const v2Endpoints = ENDPOINTS.filter((e) => e.version === "v2");

  function handleSelect(idx: number) {
    setSelected(idx);
    setSidebarOpen(false);
  }

  function toggleSection(key: string) {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const breadcrumb = selected === -1
    ? "API Reference > Webhooks"
    : `API Reference > Notes ${endpoint.version} > ${endpoint.sectionLabel}`;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-lg flex items-center justify-center bg-background-secondary border border-border"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-foreground-secondary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 lg:z-auto w-64 h-screen shrink-0 overflow-y-auto transition-transform lg:translate-x-0 bg-background-secondary border-r border-border ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">API Reference</h2>
        </div>

        <nav className="py-2">
          <SidebarSection
            label="Notes v1"
            collapsed={collapsed["v1"]}
            onToggle={() => toggleSection("v1")}
          >
            {v1Endpoints.map((ep) => {
              const idx = ENDPOINTS.indexOf(ep);
              return (
                <SidebarItem
                  key={idx}
                  method={ep.method}
                  path={ep.path.replace("/api/v1", "")}
                  active={selected === idx}
                  onClick={() => handleSelect(idx)}
                />
              );
            })}
          </SidebarSection>

          <SidebarSection
            label="Notes v2"
            collapsed={collapsed["v2"]}
            onToggle={() => toggleSection("v2")}
          >
            {v2Endpoints.map((ep) => {
              const idx = ENDPOINTS.indexOf(ep);
              return (
                <SidebarItem
                  key={idx}
                  method={ep.method}
                  path={ep.path.replace("/api/v2", "")}
                  active={selected === idx}
                  onClick={() => handleSelect(idx)}
                />
              );
            })}
          </SidebarSection>

          <SidebarSection
            label="Webhooks"
            collapsed={collapsed["webhooks"]}
            onToggle={() => toggleSection("webhooks")}
          >
            <button
              onClick={() => handleSelect(-1)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                selected === -1
                  ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500 font-medium"
                  : "text-foreground-secondary hover:bg-background-tertiary"
              }`}
            >
              Events & signatures
            </button>
          </SidebarSection>
        </nav>
      </aside>

      {/* Center content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="max-w-2xl mx-auto px-6 lg:px-12 py-8">
          {/* Breadcrumb */}
          <div className="text-xs text-foreground-tertiary font-mono mb-6">
            {breadcrumb}
          </div>

          {selected === -1 ? (
            <WebhookDocs />
          ) : (
            <EndpointDocs endpoint={endpoint} defaultKey={defaultKey} />
          )}
        </div>
      </main>

      {/* Right panel — Try it (desktop only) */}
      <div className="hidden xl:block w-80 shrink-0 border-l border-border bg-background-secondary">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Try this endpoint</h3>
            <button
              onClick={() => setTryItOpen(!tryItOpen)}
              className="text-xs text-foreground-tertiary hover:text-foreground-secondary transition-colors"
            >
              {tryItOpen ? "Hide" : "Show"}
            </button>
          </div>
          {tryItOpen && selected !== -1 && (
            <TryItPanel endpoint={endpoint} defaultKey={defaultKey} />
          )}
          {selected === -1 && (
            <div className="p-5 text-sm text-foreground-tertiary">
              Select an endpoint to try it.
            </div>
          )}
        </div>
      </div>

      {/* Mobile try-it (below content on small screens) */}
      {selected !== -1 && (
        <div className="xl:hidden fixed bottom-4 right-4 z-30">
          <MobileTryIt endpoint={endpoint} defaultKey={defaultKey} />
        </div>
      )}
    </div>
  );
}

function MobileTryIt({ endpoint, defaultKey }: { endpoint: EndpointDoc; defaultKey: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-accent hover:bg-accent-hover text-white shadow-lg flex items-center justify-center transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-2xl max-h-[70vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold">Try this endpoint</h3>
              <button onClick={() => setOpen(false)} className="text-foreground-tertiary text-sm">Close</button>
            </div>
            <TryItPanel endpoint={endpoint} defaultKey={defaultKey} />
          </div>
        </>
      )}
    </>
  );
}

function SidebarSection({
  label,
  collapsed,
  onToggle,
  children,
}: {
  label: string;
  collapsed?: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-2 text-xs font-semibold text-foreground-tertiary uppercase tracking-wider hover:text-foreground-secondary transition-colors"
      >
        {label}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-3.5 h-3.5 transition-transform ${collapsed ? "-rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {!collapsed && <div>{children}</div>}
    </div>
  );
}

function SidebarItem({
  method,
  path,
  active,
  onClick,
}: {
  method: string;
  path: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 flex items-center gap-2.5 text-sm transition-colors ${
        active
          ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500 font-medium"
          : "text-foreground-secondary hover:bg-background-tertiary"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${METHOD_DOT[method]}`} />
      <span className="font-mono text-xs truncate">
        <span className="font-semibold">{method}</span> {path}
      </span>
    </button>
  );
}

function EndpointDocs({
  endpoint,
  defaultKey,
}: {
  endpoint: EndpointDoc;
  defaultKey: string;
}) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold border ${METHOD_BADGE[endpoint.method]}`}
        >
          {endpoint.method}
        </span>
        <code className="text-xl font-mono font-bold text-foreground">{endpoint.path}</code>
      </div>

      <p className="mt-4 text-[15px] text-foreground-secondary leading-relaxed">{endpoint.description}</p>

      {/* Auth */}
      <Section title="Authentication">
        <p className="text-[15px] text-foreground-secondary leading-relaxed">
          Requires a Bearer token in the <code className="text-accent font-mono text-sm">Authorization</code> header.
          Scope:{" "}
          <code className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-xs font-mono">
            {endpoint.scope}
          </code>
        </p>
      </Section>

      {/* Rate limits */}
      <Section title="Rate limits">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-4 border border-border bg-background-secondary">
            <div className="text-[11px] uppercase tracking-wider text-foreground-tertiary">Free</div>
            <div className="text-lg font-mono text-foreground mt-1">10<span className="text-foreground-tertiary">/min</span></div>
            <div className="text-sm font-mono text-foreground-secondary">100<span className="text-foreground-tertiary">/day</span></div>
          </div>
          <div className="rounded-xl p-4 border border-border bg-background-secondary">
            <div className="text-[11px] uppercase tracking-wider text-foreground-tertiary">Pro</div>
            <div className="text-lg font-mono text-foreground mt-1">100<span className="text-foreground-tertiary">/min</span></div>
            <div className="text-sm font-mono text-foreground-secondary">10,000<span className="text-foreground-tertiary">/day</span></div>
          </div>
        </div>
      </Section>

      {/* Headers */}
      <Section title="Headers">
        <ParamTable
          rows={[
            { name: "Authorization", type: "string", description: `Bearer ${defaultKey}` },
            { name: "Content-Type", type: "string", description: "application/json" },
          ]}
        />
      </Section>

      {/* Query params */}
      {endpoint.queryParams && (
        <Section title="Query parameters">
          <ParamTable rows={endpoint.queryParams} />
        </Section>
      )}

      {/* Request body */}
      {endpoint.bodyExample && (
        <Section title="Request body">
          <CodeBlock code={endpoint.bodyExample} />
        </Section>
      )}

      {/* Success response */}
      <Section title="Response">
        <div className="mb-3">
          <DocStatusBadge code={endpoint.method === "POST" ? 201 : 200} label="OK" />
        </div>
        <CodeBlock code={endpoint.responseExample} />
      </Section>

      {/* Error responses */}
      <Section title="Errors">
        <div className="space-y-4">
          {endpoint.errorExamples.map((err) => (
            <div key={err.status}>
              <div className="mb-2">
                <DocStatusBadge code={err.status} />
              </div>
              <CodeBlock code={err.body} />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function DocStatusBadge({ code, label }: { code: number; label?: string }) {
  const color =
    code < 300
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-red-50 text-red-700 border-red-200";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-mono font-medium border ${color}`}>
      {code}{label ? ` ${label}` : ""}
    </span>
  );
}

function TryItPanel({
  endpoint,
  defaultKey,
}: {
  endpoint: EndpointDoc;
  defaultKey: string;
}) {
  const [apiKey, setApiKey] = useState(defaultKey);
  const [body, setBody] = useState(endpoint.bodyExample || "");
  const [pathParam, setPathParam] = useState("");
  const [queryStr, setQueryStr] = useState("");
  const [response, setResponse] = useState<{
    status: number;
    body: string;
    time: number;
    headers: Record<string, string>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const hasPathParam = endpoint.path.includes(":id");

  useEffect(() => {
    setBody(endpoint.bodyExample || "");
    setResponse(null);
    setPathParam("");
    setQueryStr("");
  }, [endpoint.bodyExample, endpoint.path]);

  async function handleSend() {
    setLoading(true);
    const start = Date.now();

    let url = endpoint.path;
    if (hasPathParam) {
      url = url.replace(":id", pathParam || "REPLACE_WITH_ID");
    }
    if (queryStr) {
      url += (url.includes("?") ? "&" : "?") + queryStr;
    }

    const opts: RequestInit = {
      method: endpoint.method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    };

    if (body && ["POST", "PATCH", "PUT"].includes(endpoint.method)) {
      opts.body = body;
    }

    try {
      const res = await fetch(url, opts);
      const elapsed = Date.now() - start;
      const text = await res.text();
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        if (k.startsWith("x-ratelimit") || k === "retry-after") {
          headers[k] = v;
        }
      });

      let formatted = text;
      try {
        formatted = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        // keep as-is
      }

      setResponse({ status: res.status, body: formatted, time: elapsed, headers });
    } catch {
      setResponse({
        status: 0,
        body: "Network error",
        time: Date.now() - start,
        headers: {},
      });
    }
    setLoading(false);
  }

  return (
    <div className="p-5 space-y-4">
      <FieldGroup label="API Key">
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm font-mono border border-border bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
          placeholder="nx_live_..."
        />
      </FieldGroup>

      {hasPathParam && (
        <FieldGroup label="Note ID">
          <input
            type="text"
            value={pathParam}
            onChange={(e) => setPathParam(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm font-mono border border-border bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
            placeholder="abc123"
          />
        </FieldGroup>
      )}

      {endpoint.queryParams && (
        <FieldGroup label="Query string">
          <input
            type="text"
            value={queryStr}
            onChange={(e) => setQueryStr(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm font-mono border border-border bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
            placeholder="page=1&limit=10"
          />
        </FieldGroup>
      )}

      {endpoint.bodyExample && (
        <FieldGroup label="Request body">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full px-3 py-2.5 rounded-lg text-sm font-mono border border-border bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 resize-y leading-relaxed"
          />
        </FieldGroup>
      )}

      <button
        onClick={handleSend}
        disabled={loading}
        className="w-full rounded-full px-5 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send request"}
      </button>

      {response && (
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <DocStatusBadge code={response.status} />
            <span className="text-xs text-foreground-tertiary font-mono">
              {response.time}ms
            </span>
          </div>
          {Object.keys(response.headers).length > 0 && (
            <div className="mb-3 space-y-1">
              {Object.entries(response.headers).map(([k, v]) => (
                <div key={k} className="text-xs font-mono">
                  <span className="text-foreground-tertiary">{k}:</span>{" "}
                  <span className="text-foreground-secondary">{v}</span>
                </div>
              ))}
            </div>
          )}
          <CodeBlock code={response.body} />
        </div>
      )}
    </div>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground-secondary mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function WebhookDocs() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Webhook Events</h1>
      <p className="mt-3 text-[15px] text-foreground-secondary leading-relaxed">
        Nexus sends real-time webhook notifications when events occur. Configure
        endpoints in the Webhooks dashboard to start receiving them.
      </p>

      <Section title="Events">
        <div className="space-y-3">
          {[
            { event: "note.created", description: "Fires when a note is created via the API." },
            { event: "note.updated", description: "Fires when a note is updated via the API." },
            { event: "note.deleted", description: "Fires when a note is deleted via the API." },
          ].map((e) => (
            <div key={e.event} className="flex items-start gap-3">
              <code className="px-2 py-0.5 rounded bg-accent/10 text-accent text-xs font-mono shrink-0">
                {e.event}
              </code>
              <span className="text-sm text-foreground-secondary">{e.description}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Payload shape">
        <CodeBlock
          code={JSON.stringify(
            {
              event: "note.created",
              data: {
                note: {
                  id: "abc123",
                  title: "My Note",
                  content: "Hello world",
                  tags: ["api", "docs"],
                  version: 1,
                  createdAt: "2024-01-15T10:30:00.000Z",
                },
              },
              timestamp: "2024-01-15T10:30:00.000Z",
            },
            null,
            2
          )}
        />
      </Section>

      <Section title="Delivery headers">
        <ParamTable
          rows={[
            { name: "X-Nexus-Signature", type: "string", description: "HMAC-SHA256 hex digest of the payload body" },
            { name: "X-Nexus-Event", type: "string", description: "Event type (e.g., note.created)" },
            { name: "Content-Type", type: "string", description: "application/json" },
          ]}
        />
      </Section>

      <Section title="Verifying signatures">
        <p className="text-sm text-foreground-secondary mb-3">
          Always verify the webhook signature to ensure the request came from Nexus.
        </p>
        <CodeBlock
          code={`const crypto = require("crypto");

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

app.post("/webhook", (req, res) => {
  const signature = req.headers["x-nexus-signature"];
  const isValid = verifyWebhook(
    JSON.stringify(req.body),
    signature,
    process.env.WEBHOOK_SECRET
  );
  if (!isValid) return res.status(401).send("Invalid");
  // Process event...
  res.status(200).send("OK");
});`}
        />
      </Section>

      <Section title="Retry policy">
        <div className="text-sm text-foreground-secondary space-y-2">
          <p>Failed deliveries are retried up to 3 times with exponential backoff:</p>
          <div className="grid grid-cols-4 gap-3 mt-3">
            {[
              { label: "Initial", time: "Immediate" },
              { label: "Retry 1", time: "1 min" },
              { label: "Retry 2", time: "5 min" },
              { label: "Retry 3", time: "15 min" },
            ].map((r) => (
              <div
                key={r.label}
                className="rounded-lg p-3 border border-border bg-background-secondary text-center"
              >
                <div className="text-[11px] uppercase tracking-wider text-foreground-tertiary">{r.label}</div>
                <div className="text-sm font-mono text-foreground mt-1">{r.time}</div>
              </div>
            ))}
          </div>
          <p className="mt-3">A delivery is successful when it returns a 2xx status code.</p>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-10">
      <h2 className="text-sm font-semibold text-foreground-secondary mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      {children}
    </div>
  );
}

function ParamTable({
  rows,
}: {
  rows: { name: string; type: string; description: string }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 pr-4 font-medium text-foreground-tertiary text-xs">Name</th>
            <th className="text-left py-3 pr-4 font-medium text-foreground-tertiary text-xs">Type</th>
            <th className="text-left py-3 font-medium text-foreground-tertiary text-xs">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-border/50">
              <td className="py-3 pr-4 font-mono text-xs text-accent">{row.name}</td>
              <td className="py-3 pr-4 text-foreground-tertiary text-xs">{row.type}</td>
              <td className="py-3 text-foreground-secondary text-xs">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="rounded-xl p-5 overflow-x-auto text-sm font-mono leading-relaxed bg-code-bg border border-[#2a2640]">
      <code>{highlightCode(code)}</code>
    </pre>
  );
}

function highlightCode(code: string): React.ReactNode[] {
  const lines = code.split("\n");
  return lines.map((line, i) => {
    const remaining = line;
    let key = 0;
    const parts: React.ReactNode[] = [];

    const isJs =
      remaining.includes("const ") ||
      remaining.includes("function ") ||
      remaining.includes("require(") ||
      remaining.includes("return ") ||
      remaining.includes("app.") ||
      remaining.trimStart().startsWith("//");

    if (isJs) {
      if (remaining.trimStart().startsWith("//")) {
        parts.push(<span key={key++} className="text-gray-600">{remaining}</span>);
      } else {
        const processed = remaining;
        const jsTokens: { start: number; end: number; className: string }[] = [];

        const stringRegex = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g;
        let match;
        while ((match = stringRegex.exec(processed)) !== null) {
          jsTokens.push({
            start: match.index,
            end: match.index + match[0].length,
            className: "text-emerald-400",
          });
        }

        let pos = 0;
        const sortedTokens = jsTokens.sort((a, b) => a.start - b.start);

        for (const token of sortedTokens) {
          if (pos < token.start) {
            const segment = processed.slice(pos, token.start);
            parts.push(
              <span key={key++} className="text-gray-300">
                {highlightJsKeywords(segment)}
              </span>
            );
          }
          parts.push(
            <span key={key++} className={token.className}>
              {processed.slice(token.start, token.end)}
            </span>
          );
          pos = token.end;
        }
        if (pos < processed.length) {
          parts.push(
            <span key={key++} className="text-gray-300">
              {highlightJsKeywords(processed.slice(pos))}
            </span>
          );
        }
      }
    } else {
      let colored = remaining;

      colored = colored.replace(
        /("[\w\-_.]+")\s*:/g,
        (_, k) => `\x01KEY${k}\x02:`
      );

      colored = colored.replace(
        /: ("(?:[^"\\]|\\.)*")/g,
        (_, v) => `: \x01STR${v}\x02`
      );

      colored = colored.replace(
        /(?<=[\[,]\s*)("(?:[^"\\]|\\.)*")/g,
        (_, v) => `\x01STR${v}\x02`
      );

      colored = colored.replace(
        /:\s*(\d+)/g,
        (m, n) => m.replace(n, `\x01NUM${n}\x02`)
      );

      colored = colored.replace(
        /:\s*(true|false|null)/g,
        (m, b) => m.replace(b, `\x01BOOL${b}\x02`)
      );

      const tokens = colored.split(/(\x01(?:KEY|STR|NUM|BOOL).*?\x02)/);
      for (const token of tokens) {
        if (token.startsWith("\x01KEY")) {
          parts.push(<span key={key++} className="text-blue-400">{token.slice(4, -1)}</span>);
        } else if (token.startsWith("\x01STR")) {
          parts.push(<span key={key++} className="text-emerald-400">{token.slice(4, -1)}</span>);
        } else if (token.startsWith("\x01NUM")) {
          parts.push(<span key={key++} className="text-amber-400">{token.slice(4, -1)}</span>);
        } else if (token.startsWith("\x01BOOL")) {
          parts.push(<span key={key++} className="text-blue-400">{token.slice(5, -1)}</span>);
        } else {
          parts.push(<span key={key++} className="text-gray-500">{token}</span>);
        }
      }
    }

    return (
      <span key={i}>
        {parts}
        {i < lines.length - 1 ? "\n" : ""}
      </span>
    );
  });
}

function highlightJsKeywords(text: string): React.ReactNode {
  const keywords = /\b(const|let|var|function|return|if|else|require|app)\b/g;
  const parts = text.split(keywords);
  return parts.map((part, i) => {
    if (keywords.test(part)) {
      keywords.lastIndex = 0;
      return <span key={i} className="text-blue-400">{part}</span>;
    }
    return part;
  });
}
