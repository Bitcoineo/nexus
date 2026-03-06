import crypto from "crypto";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { apiKey, user } from "@/db/schema";
import { eq, and } from "drizzle-orm";

function hashKey(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function generateApiKey(
  userId: string,
  name: string,
  scopes: string[],
  plan: "free" | "pro"
) {
  const raw = `nx_live_${nanoid(32)}`;
  const keyHash = hashKey(raw);
  const keyPrefix = raw.slice(0, 16);

  const id = nanoid();
  await db.insert(apiKey).values({
    id,
    userId,
    name,
    keyHash,
    keyPrefix,
    scopes: JSON.stringify(scopes),
    plan,
  });

  return { id, raw, keyPrefix };
}

export async function validateApiKey(rawKey: string) {
  const keyHash = hashKey(rawKey);

  const [found] = await db
    .select({
      apiKey: apiKey,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(apiKey)
    .innerJoin(user, eq(apiKey.userId, user.id))
    .where(eq(apiKey.keyHash, keyHash))
    .limit(1);

  if (!found) return null;
  if (found.apiKey.revokedAt) return null;

  return { apiKey: found.apiKey, user: found.user };
}

export async function revokeApiKey(keyId: string, userId: string) {
  const [found] = await db
    .select()
    .from(apiKey)
    .where(and(eq(apiKey.id, keyId), eq(apiKey.userId, userId)))
    .limit(1);

  if (!found) return false;

  await db
    .update(apiKey)
    .set({ revokedAt: new Date().toISOString() })
    .where(eq(apiKey.id, keyId));

  return true;
}

export async function listApiKeys(userId: string) {
  return db
    .select({
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      scopes: apiKey.scopes,
      plan: apiKey.plan,
      lastUsedAt: apiKey.lastUsedAt,
      createdAt: apiKey.createdAt,
      revokedAt: apiKey.revokedAt,
    })
    .from(apiKey)
    .where(eq(apiKey.userId, userId))
    .orderBy(apiKey.createdAt);
}

export async function updateLastUsed(keyId: string) {
  await db
    .update(apiKey)
    .set({ lastUsedAt: new Date().toISOString() })
    .where(eq(apiKey.id, keyId));
}
