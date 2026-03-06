import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWebhookDeliveries } from "@/lib/webhooks";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deliveries = await getWebhookDeliveries(params.id, session.user.id);
  if (deliveries === null) {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }

  return NextResponse.json({ data: deliveries });
}
