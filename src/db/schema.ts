import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

// ─── Auth Tables (Auth.js) ─────────────────────────────────────────────────

export const user = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  password: text("password"),
});

export const account = sqliteTable("account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const session = sqliteTable("session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  sessionToken: text("sessionToken").notNull().unique(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationToken = sqliteTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

// ─── API Key ───────────────────────────────────────────────────────────────

export const apiKey = sqliteTable(
  "api_key",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    keyHash: text("keyHash").notNull(),
    keyPrefix: text("keyPrefix").notNull(),
    scopes: text("scopes").notNull(), // JSON array
    plan: text("plan", { enum: ["free", "pro"] })
      .notNull()
      .default("free"),
    lastUsedAt: text("lastUsedAt"),
    createdAt: text("createdAt")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    revokedAt: text("revokedAt"),
  },
  (table) => ({
    keyHashIdx: index("api_key_keyHash_idx").on(table.keyHash),
  })
);

// ─── Rate Limit Log ────────────────────────────────────────────────────────

export const rateLimitLog = sqliteTable(
  "rate_limit_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    apiKeyId: text("apiKeyId")
      .notNull()
      .references(() => apiKey.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    timestamp: text("timestamp")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    keyTimestampIdx: index("rate_limit_key_ts_idx").on(
      table.apiKeyId,
      table.timestamp
    ),
  })
);

// ─── Note ──────────────────────────────────────────────────────────────────

export const note = sqliteTable("note", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  apiKeyId: text("apiKeyId")
    .notNull()
    .references(() => apiKey.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").notNull(), // JSON array
  version: integer("version").notNull().default(1),
  createdAt: text("createdAt")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ─── Webhook Endpoint ──────────────────────────────────────────────────────

export const webhookEndpoint = sqliteTable("webhook_endpoint", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  secret: text("secret").notNull(),
  events: text("events").notNull(), // JSON array
  active: integer("active").notNull().default(1),
  createdAt: text("createdAt")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ─── Webhook Delivery ──────────────────────────────────────────────────────

export const webhookDelivery = sqliteTable("webhook_delivery", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  webhookEndpointId: text("webhookEndpointId")
    .notNull()
    .references(() => webhookEndpoint.id, { onDelete: "cascade" }),
  event: text("event").notNull(),
  payload: text("payload").notNull(), // JSON
  status: text("status", { enum: ["pending", "success", "failed"] })
    .notNull()
    .default("pending"),
  statusCode: integer("statusCode"),
  attempts: integer("attempts").notNull().default(0),
  lastAttemptAt: text("lastAttemptAt"),
  nextRetryAt: text("nextRetryAt"),
  createdAt: text("createdAt")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

// ─── API Usage ─────────────────────────────────────────────────────────────

export const apiUsage = sqliteTable(
  "api_usage",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    apiKeyId: text("apiKeyId")
      .notNull()
      .references(() => apiKey.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    method: text("method").notNull(),
    statusCode: integer("statusCode").notNull(),
    responseTimeMs: integer("responseTimeMs").notNull(),
    timestamp: text("timestamp")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    keyTimestampIdx: index("api_usage_key_ts_idx").on(
      table.apiKeyId,
      table.timestamp
    ),
  })
);
