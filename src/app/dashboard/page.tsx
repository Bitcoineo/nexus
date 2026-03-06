"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { PageWrapper } from "@/components/page-wrapper";
import { MethodBadge, StatusBadge } from "@/components/badges";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardOverview() {
  const { data: session } = useSession();
  const { data: stats } = useSWR("/api/dashboard/stats", fetcher);
  const { data: usage } = useSWR("/api/dashboard/usage", fetcher);
  const { data: logs } = useSWR("/api/dashboard/logs?page=1", fetcher);

  const firstName = session?.user?.name?.split(" ")[0] || "Developer";

  const chartData = (usage?.data || []).map(
    (d: { date: string; count: number }) => ({
      date: format(new Date(d.date), "MMM d"),
      requests: d.count,
    })
  );

  const recentLogs = (logs?.data || []).slice(0, 10);

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold">{firstName}</h1>
      <p className="text-foreground-secondary mt-1">Your API at a glance.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <StatCard
          label="API calls (24h)"
          value={stats?.data?.totalCalls24h ?? "-"}
        />
        <StatCard
          label="Active keys"
          value={stats?.data?.activeKeys ?? "-"}
        />
        <StatCard
          label="Total notes"
          value={stats?.data?.notesCount ?? "-"}
        />
      </div>

      {/* Chart */}
      <div className="mt-8 bg-background rounded-xl border border-border p-5">
        <h2 className="text-sm font-medium text-foreground-secondary mb-4">
          Requests (last 7 days)
        </h2>
        <div className="h-52">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--background)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#007AFF"
                  fill="url(#colorReq)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-foreground-tertiary">
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-background rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium text-foreground-secondary">
            Recent activity
          </h2>
        </div>
        {recentLogs.length > 0 ? (
          <div className="divide-y divide-border">
            {recentLogs.map(
              (log: {
                id: string;
                method: string;
                endpoint: string;
                statusCode: number;
                responseTimeMs: number;
                timestamp: string;
              }) => (
                <div
                  key={log.id}
                  className="px-5 py-3 flex items-center gap-4 text-sm"
                >
                  <MethodBadge method={log.method} />
                  <span className="font-mono text-xs flex-1 truncate">
                    {log.endpoint}
                  </span>
                  <StatusBadge code={log.statusCode} />
                  <span className="text-foreground-tertiary text-xs w-16 text-right font-mono">
                    {log.responseTimeMs}ms
                  </span>
                  <span className="text-foreground-tertiary text-xs w-20 text-right font-mono">
                    {format(new Date(log.timestamp), "HH:mm:ss")}
                  </span>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-sm text-foreground-tertiary">
            No requests yet. Make your first API call.
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-background rounded-xl border border-border p-5">
      <div className="text-sm text-foreground-secondary">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
