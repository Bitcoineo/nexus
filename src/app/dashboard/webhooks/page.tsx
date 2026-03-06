"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { format } from "date-fns";
import { PageWrapper } from "@/components/page-wrapper";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Endpoint = {
  id: string;
  url: string;
  secret: string;
  events: string;
  active: number;
  createdAt: string;
};

type Delivery = {
  id: string;
  event: string;
  status: string;
  statusCode: number | null;
  attempts: number;
  createdAt: string;
  lastAttemptAt: string | null;
};

export default function WebhooksPage() {
  const { data } = useSWR("/api/webhooks", fetcher);
  const [showCreate, setShowCreate] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const endpoints: Endpoint[] = data?.data || [];

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this webhook endpoint? This cannot be undone.")) return;
    await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
    mutate("/api/webhooks");
  }

  async function handleToggle(id: string, currentActive: number) {
    await fetch(`/api/webhooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !currentActive }),
    });
    mutate("/api/webhooks");
  }

  async function handleTest(id: string) {
    await fetch(`/api/webhooks/${id}/test`, { method: "POST" });
    if (expanded === id) {
      mutate(`/api/webhooks/${id}/deliveries`);
    }
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-foreground-secondary mt-1">
            Receive real-time notifications when events occur.
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreate(true);
            setNewSecret(null);
          }}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
        >
          New endpoint
        </button>
      </div>

      {/* Secret reveal */}
      {newSecret && (
        <div className="mt-6 bg-accent/5 border border-accent/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 mt-0.5 text-accent shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                Copy this secret now. You won&apos;t see it again.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-code-bg text-blue-300 rounded-lg text-sm font-mono break-all">
                  {newSecret}
                </code>
                <button
                  onClick={() => handleCopy(newSecret)}
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
      {showCreate && !newSecret && (
        <CreateEndpointForm
          onClose={() => setShowCreate(false)}
          onCreated={(secret: string) => {
            setNewSecret(secret);
            mutate("/api/webhooks");
          }}
        />
      )}

      {/* Endpoints list */}
      <div className="mt-6 space-y-3">
        {endpoints.map((ep) => (
          <div key={ep.id} className="bg-background rounded-xl border border-border overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono truncate">{ep.url}</code>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        ep.active
                          ? "bg-green-50 text-green-600"
                          : "bg-background-tertiary text-foreground-tertiary"
                      }`}
                    >
                      {ep.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(JSON.parse(ep.events) as string[]).map((event) => (
                      <span
                        key={event}
                        className="px-2 py-0.5 bg-background-tertiary text-foreground-secondary text-xs rounded font-mono"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-foreground-tertiary">
                    Created {format(new Date(ep.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => handleTest(ep.id)}
                    className="px-3 py-1.5 border border-border rounded-lg text-xs hover:bg-background-tertiary transition-colors"
                  >
                    Send test
                  </button>
                  <button
                    onClick={() => handleToggle(ep.id, ep.active)}
                    className="px-3 py-1.5 border border-border rounded-lg text-xs hover:bg-background-tertiary transition-colors"
                  >
                    {ep.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => setEditing(editing === ep.id ? null : ep.id)}
                    className="px-3 py-1.5 border border-border rounded-lg text-xs hover:bg-background-tertiary transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ep.id)}
                    className="px-3 py-1.5 text-red-500 border border-red-200 rounded-lg text-xs hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Edit inline */}
              {editing === ep.id && (
                <EditEndpointForm
                  endpoint={ep}
                  onClose={() => setEditing(null)}
                  onSaved={() => {
                    setEditing(null);
                    mutate("/api/webhooks");
                  }}
                />
              )}
            </div>

            {/* Expandable deliveries */}
            <div className="border-t border-border">
              <button
                onClick={() => setExpanded(expanded === ep.id ? null : ep.id)}
                className="w-full px-5 py-2.5 text-left text-xs text-foreground-tertiary hover:bg-background-secondary transition-colors flex items-center justify-between"
              >
                <span>Delivery history</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 transition-transform ${expanded === ep.id ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {expanded === ep.id && <DeliveryList endpointId={ep.id} />}
            </div>
          </div>
        ))}

        {endpoints.length === 0 && !showCreate && (
          <div className="text-center py-12 text-foreground-tertiary text-sm">
            No endpoints. Add one to receive event notifications.
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

function CreateEndpointForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (secret: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["note.created"]);
  const [loading, setLoading] = useState(false);

  const allEvents = ["note.created", "note.updated", "note.deleted"];

  function toggleEvent(event: string) {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, events }),
    });
    const data = await res.json();
    setLoading(false);
    onCreated(data.data.secret);
  }

  return (
    <div className="mt-6 bg-background rounded-xl border border-border p-5">
      <h2 className="text-lg font-semibold">New endpoint</h2>
      <form onSubmit={handleCreate} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder="https://your-app.com/webhook"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Events</label>
          <div className="flex flex-wrap gap-2">
            {allEvents.map((event) => (
              <label
                key={event}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                  events.includes(event)
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-foreground-secondary hover:border-accent/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={events.includes(event)}
                  onChange={() => toggleEvent(event)}
                  className="sr-only"
                />
                <span className="font-mono text-xs">{event}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !url || events.length === 0}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create endpoint"}
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

function EditEndpointForm({
  endpoint,
  onClose,
  onSaved,
}: {
  endpoint: Endpoint;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [url, setUrl] = useState(endpoint.url);
  const [events, setEvents] = useState<string[]>(JSON.parse(endpoint.events));
  const [loading, setLoading] = useState(false);

  const allEvents = ["note.created", "note.updated", "note.deleted"];

  function toggleEvent(event: string) {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/webhooks/${endpoint.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, events }),
    });
    setLoading(false);
    onSaved();
  }

  return (
    <form onSubmit={handleSave} className="mt-4 pt-4 border-t border-border space-y-3">
      <div>
        <label className="block text-xs font-medium mb-1">URL</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-1.5 border border-border rounded-lg text-sm font-mono bg-background focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Events</label>
        <div className="flex flex-wrap gap-2">
          {allEvents.map((event) => (
            <label
              key={event}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                events.includes(event)
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-foreground-secondary"
              }`}
            >
              <input
                type="checkbox"
                checked={events.includes(event)}
                onChange={() => toggleEvent(event)}
                className="sr-only"
              />
              <span className="font-mono">{event}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 border border-border rounded-lg text-xs hover:bg-background-tertiary transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function DeliveryList({ endpointId }: { endpointId: string }) {
  const { data } = useSWR(`/api/webhooks/${endpointId}/deliveries`, fetcher);
  const deliveries: Delivery[] = data?.data || [];

  if (deliveries.length === 0) {
    return (
      <div className="px-5 py-4 text-xs text-foreground-tertiary">
        No deliveries yet
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {deliveries.map((d) => (
        <div key={d.id} className="px-5 py-3 flex items-center gap-4 text-xs">
          <span className="font-mono text-foreground-tertiary w-24">{d.event}</span>
          <span
            className={`px-2 py-0.5 rounded font-medium ${
              d.status === "success"
                ? "bg-green-50 text-green-600"
                : d.status === "failed"
                  ? "bg-red-50 text-red-600"
                  : "bg-amber-50 text-amber-600"
            }`}
          >
            {d.status}
          </span>
          <span className="text-foreground-tertiary">
            {d.statusCode || "-"}
          </span>
          <span className="text-foreground-tertiary">
            {d.attempts} attempt{d.attempts !== 1 ? "s" : ""}
          </span>
          <span className="text-foreground-tertiary ml-auto font-mono">
            {format(new Date(d.createdAt), "MMM d HH:mm:ss")}
          </span>
        </div>
      ))}
    </div>
  );
}
