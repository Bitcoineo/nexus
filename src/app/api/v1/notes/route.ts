import { NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api-middleware";
import { db } from "@/db";
import { note } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { triggerWebhooks } from "@/lib/webhooks";

function toV1Response(n: typeof note.$inferSelect) {
  const tags: string[] = JSON.parse(n.tags);
  return {
    id: n.id,
    title: n.title,
    content: n.content,
    tags: tags.join(","),
    created_at: n.createdAt,
    updated_at: n.updatedAt,
  };
}

// GET /api/v1/notes
export const GET = withApiAuth(async (req, ctx) => {
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "20"), 100);
  const offset = (page - 1) * limit;

  const notes = await db
    .select()
    .from(note)
    .where(eq(note.userId, ctx.user.id))
    .orderBy(desc(note.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(note)
    .where(eq(note.userId, ctx.user.id));

  return NextResponse.json({
    data: notes.map(toV1Response),
    pagination: { page, limit, total: count },
  });
}, ["notes:read"]);

// POST /api/v1/notes
export const POST = withApiAuth(async (req, ctx) => {
  const body = await req.json();
  const { title, content, tags } = body;

  if (!title || !content) {
    return NextResponse.json(
      { error: "title and content are required" },
      { status: 400 }
    );
  }

  const tagsArray = typeof tags === "string"
    ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
    : [];

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

  triggerWebhooks(ctx.user.id, "note.created", { note: toV1Response(created) }).catch(console.error);

  return NextResponse.json({ data: toV1Response(created) }, { status: 201 });
}, ["notes:write"]);
