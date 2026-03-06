"use client";

import { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { PageWrapper } from "@/components/page-wrapper";
import { MethodBadge, StatusBadge } from "@/components/badges";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type LogEntry = {
  id: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs: number;
  timestamp: string;
  keyPrefix: string;
};

export default function LogsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [endpoint, setEndpoint] = useState("");

  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  if (endpoint) params.set("endpoint", endpoint);

  const { data, isLoading } = useSWR(
    `/api/dashboard/logs?${params.toString()}`,
    fetcher
  );

  const logs: LogEntry[] = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = Math.ceil(total / 50);

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold">Request log</h1>
      <p className="text-foreground-secondary mt-1">
        Monitor your API request history.
      </p>

      {/* Filters */}
      <div className="mt-6 flex gap-3 items-center flex-wrap">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">All status</option>
          <option value="2xx">2xx Success</option>
          <option value="4xx">4xx Client Error</option>
          <option value="5xx">5xx Server Error</option>
        </select>

        <input
          type="text"
          value={endpoint}
          onChange={(e) => {
            setEndpoint(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by endpoint..."
          className="px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 w-64"
        />

        <span className="text-sm text-foreground-tertiary ml-auto">
          {total} total requests
        </span>
      </div>

      {/* Table */}
      <div className="mt-4 bg-background rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-background-secondary">
                <th className="text-left px-4 py-3 font-medium text-foreground-secondary">
                  Timestamp
                </th>
                <th className="text-left px-4 py-3 font-medium text-foreground-secondary">
                  Method
                </th>
                <th className="text-left px-4 py-3 font-medium text-foreground-secondary">
                  Endpoint
                </th>
                <th className="text-left px-4 py-3 font-medium text-foreground-secondary">
                  Status
                </th>
                <th className="text-right px-4 py-3 font-medium text-foreground-secondary">
                  Time
                </th>
                <th className="text-right px-4 py-3 font-medium text-foreground-secondary">
                  Key
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-background-secondary transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-foreground-tertiary">
                    {format(new Date(log.timestamp), "MMM d HH:mm:ss")}
                  </td>
                  <td className="px-4 py-3">
                    <MethodBadge method={log.method} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{log.endpoint}</td>
                  <td className="px-4 py-3">
                    <StatusBadge code={log.statusCode} />
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-foreground-tertiary font-mono">
                    {log.responseTimeMs}ms
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-foreground-tertiary">
                    {log.keyPrefix}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && !isLoading && (
          <div className="px-4 py-12 text-center text-foreground-tertiary text-sm">
            No requests logged yet. Requests to your API will appear here.
          </div>
        )}

        {isLoading && (
          <div className="px-4 py-12 text-center text-foreground-tertiary text-sm">
            Loading...
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-background-tertiary transition-colors disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-foreground-tertiary">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-background-tertiary transition-colors disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </PageWrapper>
  );
}
