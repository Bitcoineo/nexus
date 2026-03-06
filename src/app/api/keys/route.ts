import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateApiKey, listApiKeys, revokeApiKey } from "@/lib/api-keys";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await listApiKeys(session.user.id);
  return NextResponse.json({ data: keys });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, scopes, plan } = body;

  if (!name || !scopes || !plan) {
    return NextResponse.json(
      { error: "name, scopes, and plan are required" },
      { status: 400 }
    );
  }

  const result = await generateApiKey(session.user.id, name, scopes, plan);
  return NextResponse.json({ data: result }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { keyId } = await req.json();
  if (!keyId) {
    return NextResponse.json({ error: "keyId is required" }, { status: 400 });
  }

  const success = await revokeApiKey(keyId, session.user.id);
  if (!success) {
    return NextResponse.json({ error: "Key not found" }, { status: 404 });
  }

  return NextResponse.json({ data: { revoked: true } });
}
