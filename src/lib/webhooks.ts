import crypto from "crypto";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { webhookEndpoint, webhookDelivery } from "@/db/schema";
import { eq, and, lte, lt } from "drizzle-orm";

const RETRY_INTERVALS = [60_000, 300_000, 900_000]; // 1min, 5min, 15min

function signPayload(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export async function createWebhookEndpoint(
  userId: string,
  url: string,
  events: string[],
  secret?: string
) {
  const endpointSecret = secret || `whsec_${nanoid(32)}`;
  const id = nanoid();

  await db.insert(webhookEndpoint).values({
    id,
    userId,
    url,
    secret: endpointSecret,
    events: JSON.stringify(events),
    active: 1,
  });

  return { id, secret: endpointSecret };
}

export async function listWebhookEndpoints(userId: string) {
  return db
    .select()
    .from(webhookEndpoint)
    .where(eq(webhookEndpoint.userId, userId))
    .orderBy(webhookEndpoint.createdAt);
}

export async function updateWebhookEndpoint(
  endpointId: string,
  userId: string,
  data: { url?: string; events?: string[]; active?: boolean }
) {
  const [existing] = await db
    .select()
    .from(webhookEndpoint)
    .where(
      and(eq(webhookEndpoint.id, endpointId), eq(webhookEndpoint.userId, userId))
    )
    .limit(1);

  if (!existing) return null;

  const updates: Record<string, unknown> = {};
  if (data.url !== undefined) updates.url = data.url;
  if (data.events !== undefined) updates.events = JSON.stringify(data.events);
  if (data.active !== undefined) updates.active = data.active ? 1 : 0;

  if (Object.keys(updates).length === 0) return existing;

  const [updated] = await db
    .update(webhookEndpoint)
    .set(updates)
    .where(eq(webhookEndpoint.id, endpointId))
    .returning();

  return updated;
}

export async function deleteWebhookEndpoint(endpointId: string, userId: string) {
  const [existing] = await db
    .select()
    .from(webhookEndpoint)
    .where(
      and(eq(webhookEndpoint.id, endpointId), eq(webhookEndpoint.userId, userId))
    )
    .limit(1);

  if (!existing) return false;

  await db.delete(webhookEndpoint).where(eq(webhookEndpoint.id, endpointId));
  return true;
}

export async function deliverWebhook(
  endpointId: string,
  event: string,
  payload: Record<string, unknown>
) {
  const [endpoint] = await db
    .select()
    .from(webhookEndpoint)
    .where(eq(webhookEndpoint.id, endpointId))
    .limit(1);

  if (!endpoint || !endpoint.active) return;

  const payloadStr = JSON.stringify(payload);
  const signature = signPayload(payloadStr, endpoint.secret);
  const deliveryId = nanoid();
  const now = new Date().toISOString();

  await db.insert(webhookDelivery).values({
    id: deliveryId,
    webhookEndpointId: endpointId,
    event,
    payload: payloadStr,
    status: "pending",
    attempts: 0,
    createdAt: now,
  });

  try {
    const res = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Nexus-Signature": signature,
        "X-Nexus-Event": event,
      },
      body: payloadStr,
      signal: AbortSignal.timeout(10_000),
    });

    if (res.ok) {
      await db
        .update(webhookDelivery)
        .set({
          status: "success",
          statusCode: res.status,
          attempts: 1,
          lastAttemptAt: new Date().toISOString(),
        })
        .where(eq(webhookDelivery.id, deliveryId));
    } else {
      const nextRetry = new Date(Date.now() + RETRY_INTERVALS[0]).toISOString();
      await db
        .update(webhookDelivery)
        .set({
          status: "failed",
          statusCode: res.status,
          attempts: 1,
          lastAttemptAt: new Date().toISOString(),
          nextRetryAt: nextRetry,
        })
        .where(eq(webhookDelivery.id, deliveryId));
    }
  } catch {
    const nextRetry = new Date(Date.now() + RETRY_INTERVALS[0]).toISOString();
    await db
      .update(webhookDelivery)
      .set({
        status: "failed",
        attempts: 1,
        lastAttemptAt: new Date().toISOString(),
        nextRetryAt: nextRetry,
      })
      .where(eq(webhookDelivery.id, deliveryId));
  }
}

export async function retryFailedDeliveries() {
  const now = new Date().toISOString();

  const pending = await db
    .select()
    .from(webhookDelivery)
    .where(
      and(
        eq(webhookDelivery.status, "failed"),
        lt(webhookDelivery.attempts, 3),
        lte(webhookDelivery.nextRetryAt, now)
      )
    );

  for (const delivery of pending) {
    const [endpoint] = await db
      .select()
      .from(webhookEndpoint)
      .where(eq(webhookEndpoint.id, delivery.webhookEndpointId))
      .limit(1);

    if (!endpoint || !endpoint.active) continue;

    const signature = signPayload(delivery.payload, endpoint.secret);

    try {
      const res = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Nexus-Signature": signature,
          "X-Nexus-Event": delivery.event,
        },
        body: delivery.payload,
        signal: AbortSignal.timeout(10_000),
      });

      const newAttempts = delivery.attempts + 1;

      if (res.ok) {
        await db
          .update(webhookDelivery)
          .set({
            status: "success",
            statusCode: res.status,
            attempts: newAttempts,
            lastAttemptAt: new Date().toISOString(),
            nextRetryAt: null,
          })
          .where(eq(webhookDelivery.id, delivery.id));
      } else {
        const nextRetryInterval = RETRY_INTERVALS[newAttempts] || null;
        await db
          .update(webhookDelivery)
          .set({
            status: newAttempts >= 3 ? "failed" : "failed",
            statusCode: res.status,
            attempts: newAttempts,
            lastAttemptAt: new Date().toISOString(),
            nextRetryAt: nextRetryInterval
              ? new Date(Date.now() + nextRetryInterval).toISOString()
              : null,
          })
          .where(eq(webhookDelivery.id, delivery.id));
      }
    } catch {
      const newAttempts = delivery.attempts + 1;
      const nextRetryInterval = RETRY_INTERVALS[newAttempts] || null;
      await db
        .update(webhookDelivery)
        .set({
          status: "failed",
          attempts: newAttempts,
          lastAttemptAt: new Date().toISOString(),
          nextRetryAt: nextRetryInterval
            ? new Date(Date.now() + nextRetryInterval).toISOString()
            : null,
        })
        .where(eq(webhookDelivery.id, delivery.id));
    }
  }
}

export async function getWebhookDeliveries(endpointId: string, userId: string) {
  // Verify ownership
  const [endpoint] = await db
    .select()
    .from(webhookEndpoint)
    .where(
      and(eq(webhookEndpoint.id, endpointId), eq(webhookEndpoint.userId, userId))
    )
    .limit(1);

  if (!endpoint) return null;

  return db
    .select()
    .from(webhookDelivery)
    .where(eq(webhookDelivery.webhookEndpointId, endpointId))
    .orderBy(webhookDelivery.createdAt);
}

export async function triggerWebhooks(
  userId: string,
  event: string,
  payload: Record<string, unknown>
) {
  const endpoints = await db
    .select()
    .from(webhookEndpoint)
    .where(and(eq(webhookEndpoint.userId, userId), eq(webhookEndpoint.active, 1)));

  for (const endpoint of endpoints) {
    const events: string[] = JSON.parse(endpoint.events);
    if (events.includes(event)) {
      deliverWebhook(endpoint.id, event, {
        event,
        data: payload,
        timestamp: new Date().toISOString(),
      }).catch(console.error);
    }
  }
}
