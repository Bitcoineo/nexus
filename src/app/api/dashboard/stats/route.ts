import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { apiKey, apiUsage, note } from "@/db/schema";
import { eq, and, gt, sql } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Get user's API key IDs
  const userKeys = await db
    .select({ id: apiKey.id })
    .from(apiKey)
    .where(eq(apiKey.userId, userId));

  const keyIds = userKeys.map((k) => k.id);

  let totalCalls24h = 0;
  if (keyIds.length > 0) {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(apiUsage)
      .where(
        and(
          sql`${apiUsage.apiKeyId} IN (${sql.join(keyIds.map((id) => sql`${id}`), sql`,`)})`,
          gt(apiUsage.timestamp, oneDayAgo)
        )
      );
    totalCalls24h = result.count;
  }

  const activeKeys = userKeys.length;

  const [{ notesCount }] = await db
    .select({ notesCount: sql<number>`count(*)` })
    .from(note)
    .where(eq(note.userId, userId));

  return NextResponse.json({
    data: {
      totalCalls24h,
      activeKeys,
      notesCount,
    },
  });
}
