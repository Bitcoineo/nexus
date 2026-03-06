import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  user,
  apiKey,
  note,
  webhookEndpoint,
  webhookDelivery,
  apiUsage,
} from "./schema";

function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

async function main() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  const db = drizzle(client);

  console.log("Seeding database...");

  // ─── Test User ─────────────────────────────────────────────────────────
  const userId = nanoid();
  const hashedPassword = await bcrypt.hash("password123", 10);

  await db.insert(user).values({
    id: userId,
    name: "Dev User",
    email: "dev@example.com",
    password: hashedPassword,
  });
  console.log("  Created user: dev@example.com / password123");

  // ─── API Key ───────────────────────────────────────────────────────────
  const rawKey = `nx_live_${nanoid(32)}`;
  const keyId = nanoid();

  await db.insert(apiKey).values({
    id: keyId,
    userId,
    name: "Development",
    keyHash: hashApiKey(rawKey),
    keyPrefix: rawKey.slice(0, 16),
    scopes: JSON.stringify(["notes:read", "notes:write", "webhooks:manage"]),
    plan: "free",
    createdAt: new Date().toISOString(),
  });
  console.log(`  Created API key: ${rawKey}`);

  // ─── Sample Notes ──────────────────────────────────────────────────────
  const noteTitles = [
    "Getting Started with the API",
    "Authentication Best Practices",
    "Rate Limiting Explained",
    "Webhook Integration Guide",
    "API Versioning Strategy",
    "Error Handling Patterns",
    "Pagination Implementation",
    "Caching Strategies",
    "Security Considerations",
    "Performance Optimization",
    "Testing API Endpoints",
    "Monitoring and Logging",
    "Database Schema Design",
    "REST vs GraphQL",
    "OAuth 2.0 Flow",
    "JWT Token Management",
    "API Gateway Patterns",
    "Microservices Communication",
    "Event-Driven Architecture",
    "CI/CD Pipeline Setup",
  ];

  const tagOptions = [
    "api",
    "security",
    "performance",
    "architecture",
    "testing",
    "devops",
    "database",
    "auth",
    "webhooks",
    "docs",
  ];

  for (let i = 0; i < noteTitles.length; i++) {
    const tags = tagOptions
      .sort(() => Math.random() - 0.5)
      .slice(0, 2 + Math.floor(Math.random() * 3));
    const daysAgo = Math.floor(Math.random() * 14);
    const created = new Date(
      Date.now() - daysAgo * 24 * 60 * 60 * 1000
    ).toISOString();

    await db.insert(note).values({
      id: nanoid(),
      userId,
      apiKeyId: keyId,
      title: noteTitles[i],
      content: `This is the content for "${noteTitles[i]}". It covers important concepts and practical examples for developers building with the Nexus API platform.`,
      tags: JSON.stringify(tags),
      version: 1,
      createdAt: created,
      updatedAt: created,
    });
  }
  console.log(`  Created ${noteTitles.length} notes`);

  // ─── Usage Logs (500+ entries over 7 days) ────────────────────────────
  const endpoints = [
    "/api/v1/notes",
    "/api/v1/notes/:id",
    "/api/v2/notes",
    "/api/v2/notes/:id",
  ];
  const methods = ["GET", "POST", "PUT", "DELETE"];
  const statusCodes = [200, 200, 200, 200, 201, 204, 400, 401, 404, 429, 500];

  // Distribution weights: more traffic during business hours
  const hourWeights = [
    1, 1, 1, 1, 1, 2, 3, 5, 8, 10, 10, 9, 7, 8, 10, 10, 9, 7, 5, 4, 3, 2, 1,
    1,
  ];

  let usageCount = 0;
  const usageValues = [];

  for (let day = 0; day < 7; day++) {
    // More requests on weekdays (Mon-Fri)
    const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
    const dayOfWeek = date.getDay();
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const dailyRequests = isWeekday
      ? 80 + Math.floor(Math.random() * 40)
      : 30 + Math.floor(Math.random() * 20);

    for (let r = 0; r < dailyRequests; r++) {
      // Pick hour weighted by traffic pattern
      const totalWeight = hourWeights.reduce((a, b) => a + b, 0);
      let rand = Math.random() * totalWeight;
      let hour = 0;
      for (let h = 0; h < hourWeights.length; h++) {
        rand -= hourWeights[h];
        if (rand <= 0) {
          hour = h;
          break;
        }
      }

      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);
      const timestamp = new Date(date);
      timestamp.setHours(hour, minute, second, 0);

      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const method =
        endpoint.includes(":id") && Math.random() > 0.5
          ? methods[Math.floor(Math.random() * 3) + 1]
          : methods[Math.floor(Math.random() * 2)];
      const status =
        statusCodes[Math.floor(Math.random() * statusCodes.length)];
      const responseTime =
        status >= 500
          ? 500 + Math.floor(Math.random() * 2000)
          : 20 + Math.floor(Math.random() * 200);

      usageValues.push({
        id: nanoid(),
        apiKeyId: keyId,
        endpoint,
        method,
        statusCode: status,
        responseTimeMs: responseTime,
        timestamp: timestamp.toISOString(),
      });
      usageCount++;
    }
  }

  // Batch insert usage logs
  const batchSize = 50;
  for (let i = 0; i < usageValues.length; i += batchSize) {
    await db.insert(apiUsage).values(usageValues.slice(i, i + batchSize));
  }
  console.log(`  Created ${usageCount} usage log entries`);

  // ─── Webhook Endpoint ──────────────────────────────────────────────────
  const webhookId = nanoid();
  const webhookSecret = `whsec_${nanoid(32)}`;

  await db.insert(webhookEndpoint).values({
    id: webhookId,
    userId,
    url: "https://example.com/webhook",
    secret: webhookSecret,
    events: JSON.stringify(["note.created", "note.updated", "note.deleted"]),
    active: 1,
    createdAt: new Date().toISOString(),
  });
  console.log(`  Created webhook endpoint: https://example.com/webhook`);

  // ─── Webhook Deliveries ────────────────────────────────────────────────
  const deliveries = [
    {
      event: "note.created",
      status: "success" as const,
      statusCode: 200,
      attempts: 1,
    },
    {
      event: "note.updated",
      status: "success" as const,
      statusCode: 200,
      attempts: 1,
    },
    {
      event: "note.created",
      status: "failed" as const,
      statusCode: 500,
      attempts: 3,
    },
    {
      event: "note.deleted",
      status: "success" as const,
      statusCode: 200,
      attempts: 2,
    },
    {
      event: "note.updated",
      status: "pending" as const,
      statusCode: null,
      attempts: 0,
    },
  ];

  for (const d of deliveries) {
    const createdAt = new Date(
      Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000
    ).toISOString();

    await db.insert(webhookDelivery).values({
      id: nanoid(),
      webhookEndpointId: webhookId,
      event: d.event,
      payload: JSON.stringify({
        event: d.event,
        data: { id: nanoid(), title: "Sample Note", tags: ["api", "test"] },
        timestamp: createdAt,
      }),
      status: d.status,
      statusCode: d.statusCode,
      attempts: d.attempts,
      lastAttemptAt: d.attempts > 0 ? createdAt : null,
      nextRetryAt:
        d.status === "pending"
          ? new Date(Date.now() + 60000).toISOString()
          : null,
      createdAt,
    });
  }
  console.log(`  Created ${deliveries.length} webhook deliveries`);

  console.log("\nSeed complete!");
  console.log(`\nAPI Key (save this): ${rawKey}`);
  client.close();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
