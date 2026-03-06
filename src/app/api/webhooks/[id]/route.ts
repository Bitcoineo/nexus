import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateWebhookEndpoint, deleteWebhookEndpoint } from "@/lib/webhooks";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const updated = await updateWebhookEndpoint(params.id, session.user.id, body);

  if (!updated) {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const success = await deleteWebhookEndpoint(params.id, session.user.id);
  if (!success) {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }

  return NextResponse.json({ data: { deleted: true } });
}
