import { NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api-middleware";
import { db } from "@/db";
import { note } from "@/db/schema";
import { eq, desc, sql, like, or } from "drizzle-orm";
import { triggerWebhooks } from "@/lib/webhooks";

function toV2Response(n: typeof note.$inferSelect) {
  return {
    id: n.id,
    title: n.title,
    content: n.content,
    tags: JSON.parse(n.tags) as string[],
    version: n.version,
    metadata: {},
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  };
}

// GET /api/v2/notes
export const GET = withApiAuth(async (req, ctx) => {
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "20"), 100);
  const offset = (page - 1) * limit;
  const search = req.nextUrl.searchParams.get("search");
  const tag = req.nextUrl.searchParams.get("tag");

  const conditions = [eq(note.userId, ctx.user.id)];

  if (search) {
    conditions.push(
      or(
        like(note.title, `%${search}%`),
        like(note.content, `%${search}%`)
      )!
    );
  }

  if (tag) {
    conditions.push(like(note.tags, `%"${tag}"%`));
  }

  const where = conditions.length === 1 ? conditions[0] : sql`${conditions.reduce((a, b) => sql`${a} AND ${b}`)}`;

  const notes = await db
    .select()
    .from(note)
    .where(where)
    .orderBy(desc(note.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(note)
    .where(where);

  return NextResponse.json({
    data: notes.map(toV2Response),
    pagination: { page, limit, total: count },
  });
}, ["notes:read"]);

// POST /api/v2/notes
export const POST = withApiAuth(async (req, ctx) => {
  const body = await req.json();
  const { title, content, tags } = body;

  if (!title || !content) {
    return NextResponse.json(
      { error: "title and content are required" },
      { status: 400 }
    );
  }

  const tagsArray = Array.isArray(tags) ? tags : [];

  const [created] = await db
    .insert(note)
    .values({
      userId: ctx.user.id,
      apiKeyId: ctx.apiKey.id,
      title,
      content,
      tags: JSON.stringify(tagsArray),
    })
    .returning();

  triggerWebhooks(ctx.user.id, "note.created", { note: toV2Response(created) }).catch(console.error);

  return NextResponse.json({ data: toV2Response(created) }, { status: 201 });
}, ["notes:write"]);
