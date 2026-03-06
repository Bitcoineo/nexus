import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { apiKey, apiUsage } from "@/db/schema";
import { eq, and, lt, gte, lte, sql, desc, like } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const limit = 50;
  const offset = (page - 1) * limit;
  const statusFilter = req.nextUrl.searchParams.get("status");
  const endpointFilter = req.nextUrl.searchParams.get("endpoint");
  const dateFrom = req.nextUrl.searchParams.get("from");
  const dateTo = req.nextUrl.searchParams.get("to");

  const userKeys = await db
    .select({ id: apiKey.id, keyPrefix: apiKey.keyPrefix })
    .from(apiKey)
    .where(eq(apiKey.userId, userId));

  const keyIds = userKeys.map((k) => k.id);
  const keyPrefixMap = new Map(userKeys.map((k) => [k.id, k.keyPrefix]));

  if (keyIds.length === 0) {
    return NextResponse.json({ data: [], pagination: { page, limit, total: 0 } });
  }

  const conditions = [
    sql`${apiUsage.apiKeyId} IN (${sql.join(keyIds.map((id) => sql`${id}`), sql`,`)})`,
  ];

  if (statusFilter === "2xx") {
    conditions.push(and(gte(apiUsage.statusCode, 200), lt(apiUsage.statusCode, 300))!);
  } else if (statusFilter === "4xx") {
    conditions.push(and(gte(apiUsage.statusCode, 400), lt(apiUsage.statusCode, 500))!);
  } else if (statusFilter === "5xx") {
    conditions.push(gte(apiUsage.statusCode, 500));
  }

  if (endpointFilter) {
    conditions.push(like(apiUsage.endpoint, `%${endpointFilter}%`));
  }

  if (dateFrom) {
    conditions.push(gte(apiUsage.timestamp, dateFrom));
  }
  if (dateTo) {
    conditions.push(lte(apiUsage.timestamp, dateTo));
  }

  const where = conditions.reduce((a, b) => sql`${a} AND ${b}`);

  const logs = await db
    .select()
    .from(apiUsage)
    .where(where)
    .orderBy(desc(apiUsage.timestamp))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(apiUsage)
    .where(where);

  const data = logs.map((log) => ({
    ...log,
    keyPrefix: keyPrefixMap.get(log.apiKeyId) || "unknown",
  }));

  return NextResponse.json({
    data,
    pagination: { page, limit, total: count },
  });
}
