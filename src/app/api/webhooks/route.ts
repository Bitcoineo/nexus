import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createWebhookEndpoint,
  listWebhookEndpoints,
} from "@/lib/webhooks";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const endpoints = await listWebhookEndpoints(session.user.id);
  return NextResponse.json({ data: endpoints });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url, events } = await req.json();

  if (!url || !events || !Array.isArray(events) || events.length === 0) {
    return NextResponse.json(
      { error: "url and events are required" },
      { status: 400 }
    );
  }

  const result = await createWebhookEndpoint(session.user.id, url, events);
  return NextResponse.json({ data: result }, { status: 201 });
}
