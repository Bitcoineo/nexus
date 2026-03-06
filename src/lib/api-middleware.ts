import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, updateLastUsed } from "./api-keys";
import { checkRateLimit } from "./rate-limiter";
import { db } from "@/db";
import { apiUsage } from "@/db/schema";

type ApiContext = {
  apiKey: {
    id: string;
    userId: string;
    scopes: string;
    plan: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type ApiHandler = (
  req: NextRequest,
  ctx: ApiContext,
  params: Record<string, string>
) => Promise<NextResponse>;

export function withApiAuth(handler: ApiHandler, requiredScopes: string[]) {
  return async (
    req: NextRequest,
    { params }: { params: Record<string, string> }
  ) => {
    const start = Date.now();
    const endpoint = req.nextUrl.pathname;

    // Extract API key
    const authHeader = req.headers.get("authorization");
    const queryKey = req.nextUrl.searchParams.get("api_key");
    let rawKey: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      rawKey = authHeader.slice(7);
    } else if (queryKey) {
      rawKey = queryKey;
    }

    if (!rawKey) {
      return NextResponse.json(
        { error: "Missing API key. Use Authorization: Bearer <key> or ?api_key=<key>" },
        { status: 401 }
      );
    }

    // Validate key
    const result = await validateApiKey(rawKey);
    if (!result) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    const { apiKey: key, user } = result;

    // Check scopes
    const keyScopes: string[] = JSON.parse(key.scopes);
    for (const scope of requiredScopes) {
      if (!keyScopes.includes(scope)) {
        return NextResponse.json(
          { error: `Insufficient permissions. Required: ${scope}` },
          { status: 403 }
        );
      }
    }

    // Check rate limit
    const plan = key.plan as "free" | "pro";
    const rateLimit = await checkRateLimit(key.id, plan, endpoint);

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil(
        (rateLimit.resetAt.getTime() - Date.now()) / 1000
      );
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(
              Math.floor(rateLimit.resetAt.getTime() / 1000)
            ),
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    // Update last used (fire and forget)
    updateLastUsed(key.id).catch(() => {});

    // Execute handler
    const ctx: ApiContext = { apiKey: key, user };
    const response = await handler(req, ctx, params);

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", String(rateLimit.limit));
    response.headers.set(
      "X-RateLimit-Remaining",
      String(rateLimit.remaining)
    );
    response.headers.set(
      "X-RateLimit-Reset",
      String(Math.floor(rateLimit.resetAt.getTime() / 1000))
    );

    // Log usage (fire and forget)
    const elapsed = Date.now() - start;
    db.insert(apiUsage)
      .values({
        apiKeyId: key.id,
        endpoint,
        method: req.method,
        statusCode: response.status,
        responseTimeMs: elapsed,
      })
      .catch(() => {});

    return response;
  };
}
