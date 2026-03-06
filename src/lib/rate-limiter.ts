import { db } from "@/db";
import { rateLimitLog } from "@/db/schema";
import { eq, and, gt, lt, sql } from "drizzle-orm";

const LIMITS = {
  free: { perMinute: 10, perDay: 100 },
  pro: { perMinute: 100, perDay: 10000 },
} as const;

export async function checkRateLimit(
  apiKeyId: string,
  plan: "free" | "pro",
  endpoint: string
) {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const limits = LIMITS[plan];

  // Count requests in last minute
  const [minuteCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(rateLimitLog)
    .where(
      and(
        eq(rateLimitLog.apiKeyId, apiKeyId),
        gt(rateLimitLog.timestamp, oneMinuteAgo)
      )
    );

  if (minuteCount.count >= limits.perMinute) {
    const resetAt = new Date(now.getTime() + 60 * 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      limit: limits.perMinute,
    };
  }

  // Count requests in last day
  const [dayCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(rateLimitLog)
    .where(
      and(
        eq(rateLimitLog.apiKeyId, apiKeyId),
        gt(rateLimitLog.timestamp, oneDayAgo)
      )
    );

  if (dayCount.count >= limits.perDay) {
    const tomorrow = new Date(now);
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      allowed: false,
      remaining: 0,
      resetAt: tomorrow,
      limit: limits.perDay,
    };
  }

  // Record request
  await db.insert(rateLimitLog).values({
    apiKeyId,
    endpoint,
    timestamp: now.toISOString(),
  });

  const remaining = Math.min(
    limits.perMinute - minuteCount.count - 1,
    limits.perDay - dayCount.count - 1
  );

  return {
    allowed: true,
    remaining,
    resetAt: new Date(now.getTime() + 60 * 1000),
    limit: limits.perMinute,
  };
}

export async function cleanupOldLogs() {
  const oneDayAgo = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toISOString();

  await db
    .delete(rateLimitLog)
    .where(lt(rateLimitLog.timestamp, oneDayAgo));
}
