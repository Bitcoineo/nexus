"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { format } from "date-fns";
import { PageWrapper } from "@/components/page-wrapper";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type ApiKeyData = {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string;
  plan: string;
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
};

export default function KeysPage() {
  const { data } = useSWR("/api/keys", fetcher);
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const keys: ApiKeyData[] = data?.data || [];

  async function handleRevoke(keyId: string) {
    if (!confirm("Revoke this key? Active integrations will break.")) return;
    setRevoking(keyId);
    await fetch("/api/keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyId }),
    });
    setRevoking(null);
    mutate("/api/keys");
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API keys</h1>
          <p className="text-foreground-secondary mt-1">
            Manage keys for authenticating requests.
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreate(true);
            setNewKey(null);
          }}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
        >
          New API key
        </button>
      </div>

      {/* New key reveal */}
      {newKey && (
        <div className="mt-6 bg-accent/5 border border-accent/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 mt-0.5 text-accent shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                Copy this key now. You won&apos;t see it again.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-code-bg text-blue-300 rounded-lg text-sm font-mono break-all">
                  {newKey}
                </code>
                <button
                  onClick={() => handleCopy(newKey)}
                  className="px-3 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors shrink-0"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create form */}
      {showCreate && !newKey && (
        <CreateKeyModal
          onClose={() => setShowCreate(false)}
          onCreated={(raw: string) => {
            setNewKey(raw);
            mutate("/api/keys");
          }}
        />
      )}

      {/* Keys list */}
      <div className="mt-6 space-y-3">
        {keys.map((key) => (
          <div
            key={key.id}
            className={`bg-background rounded-xl border border-border p-5 ${
              key.revokedAt ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium ${key.revokedAt ? "line-through" : ""}`}
                  >
                    {key.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      key.plan === "pro"
                        ? "bg-accent/10 text-accent"
                        : "bg-background-tertiary text-foreground-secondary"
                    }`}
                  >
                    {key.plan}
                  </span>
                  {key.revokedAt && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600">
                      Revoked
                    </span>
                  )}
                </div>
                <code className="text-xs font-mono text-foreground-tertiary mt-1 block">
                  {key.keyPrefix}...
                </code>
              </div>
              {!key.revokedAt && (
                <button
                  onClick={() => handleRevoke(key.id)}
                  disabled={revoking === key.id}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                >
                  {revoking === key.id ? "Revoking..." : "Revoke"}
                </button>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {(JSON.parse(key.scopes) as string[]).map((scope) => (
                <span
                  key={scope}
                  className="px-2 py-0.5 bg-background-tertiary text-foreground-secondary text-xs rounded font-mono"
                >
                  {scope}
                </span>
              ))}
            </div>

            <div className="mt-3 flex gap-4 text-xs text-foreground-tertiary">
              <span>Created {format(new Date(key.createdAt), "MMM d, yyyy")}</span>
              {key.lastUsedAt && (
                <span>
                  Last used {format(new Date(key.lastUsedAt), "MMM d, yyyy HH:mm")}
                </span>
              )}
            </div>
          </div>
        ))}

        {keys.length === 0 && (
          <div className="text-center py-12 text-foreground-tertiary text-sm">
            No keys yet. Create one to start making requests.
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

function CreateKeyModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (raw: string) => void;
}) {
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [scopes, setScopes] = useState<string[]>(["notes:read", "notes:write"]);
  const [loading, setLoading] = useState(false);

  function toggleScope(scope: string) {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, plan, scopes }),
    });
    const data = await res.json();
    setLoading(false);
    onCreated(data.data.raw);
  }

  return (
    <div className="mt-6 bg-background rounded-xl border border-border p-5">
      <h2 className="text-lg font-semibold">New API key</h2>
      <form onSubmit={handleCreate} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Production, Development"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Plan</label>
          <div className="flex gap-3">
            {(["free", "pro"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlan(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  plan === p
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-foreground-secondary hover:border-accent/30"
                }`}
              >
                {p === "free" ? "Free (10/min, 100/day)" : "Pro (100/min, 10k/day)"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Scopes</label>
          <div className="flex flex-wrap gap-2">
            {["notes:read", "notes:write", "webhooks:manage"].map((scope) => (
              <label
                key={scope}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                  scopes.includes(scope)
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-foreground-secondary hover:border-accent/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={scopes.includes(scope)}
                  onChange={() => toggleScope(scope)}
                  className="sr-only"
                />
                <span className="font-mono text-xs">{scope}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !name || scopes.length === 0}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create key"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-background-tertiary transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
