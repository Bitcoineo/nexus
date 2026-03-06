import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { apiKey, apiUsage } from "@/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const userKeys = await db
    .select({ id: apiKey.id })
    .from(apiKey)
    .where(eq(apiKey.userId, userId));

  const keyIds = userKeys.map((k) => k.id);

  if (keyIds.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const usage = await db
    .select({
      date: sql<string>`date(${apiUsage.timestamp})`,
      count: sql<number>`count(*)`,
    })
    .from(apiUsage)
    .where(
      and(
        sql`${apiUsage.apiKeyId} IN (${sql.join(keyIds.map((id) => sql`${id}`), sql`,`)})`,
        gt(apiUsage.timestamp, sevenDaysAgo)
      )
    )
    .groupBy(sql`date(${apiUsage.timestamp})`)
    .orderBy(sql`date(${apiUsage.timestamp})`);

  return NextResponse.json({ data: usage });
}
