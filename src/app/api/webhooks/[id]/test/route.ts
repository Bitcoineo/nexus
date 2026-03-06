import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { webhookEndpoint } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { deliverWebhook } from "@/lib/webhooks";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [endpoint] = await db
    .select()
    .from(webhookEndpoint)
    .where(
      and(
        eq(webhookEndpoint.id, params.id),
        eq(webhookEndpoint.userId, session.user.id)
      )
    )
    .limit(1);

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }

  await deliverWebhook(params.id, "test", {
    event: "test",
    data: {
      message: "This is a test webhook delivery from Nexus",
      timestamp: new Date().toISOString(),
    },
  });

  return NextResponse.json({ data: { sent: true } });
}
