import { NextResponse } from "next/server";
import { withApiAuth } from "@/lib/api-middleware";
import { db } from "@/db";
import { note } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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

// GET /api/v2/notes/[id]
export const GET = withApiAuth(async (req, ctx, params) => {
  const [found] = await db
    .select()
    .from(note)
    .where(and(eq(note.id, params.id), eq(note.userId, ctx.user.id)))
    .limit(1);

  if (!found) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({ data: toV2Response(found) });
}, ["notes:read"]);

// PATCH /api/v2/notes/[id]
export const PATCH = withApiAuth(async (req, ctx, params) => {
  const [existing] = await db
    .select()
    .from(note)
    .where(and(eq(note.id, params.id), eq(note.userId, ctx.user.id)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const body = await req.json();
  const updates: Partial<{ title: string; content: string; tags: string; updatedAt: string }> = {
    updatedAt: new Date().toISOString(),
  };

  if (body.title) updates.title = body.title;
  if (body.content) updates.content = body.content;
  if (Array.isArray(body.tags)) {
    updates.tags = JSON.stringify(body.tags);
  }

  const [updated] = await db
    .update(note)
    .set(updates)
    .where(eq(note.id, params.id))
    .returning();

  triggerWebhooks(ctx.user.id, "note.updated", { note: toV2Response(updated) }).catch(console.error);

  return NextResponse.json({ data: toV2Response(updated) });
}, ["notes:write"]);

// DELETE /api/v2/notes/[id]
export const DELETE = withApiAuth(async (req, ctx, params) => {
  const [existing] = await db
    .select()
    .from(note)
    .where(and(eq(note.id, params.id), eq(note.userId, ctx.user.id)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  await db.delete(note).where(eq(note.id, params.id));

  triggerWebhooks(ctx.user.id, "note.deleted", { noteId: params.id }).catch(console.error);

  return NextResponse.json({ data: { id: params.id, deleted: true } });
}, ["notes:write"]);
