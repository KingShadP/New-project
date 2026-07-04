import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { env, isProduction } from "@/lib/env";

const COOKIE_NAME = "ksp_admin_session";
const SESSION_SECONDS = 60 * 60 * 4;

type SessionRole = "admin" | "superadmin";

type SessionPayload = {
  role: SessionRole;
  iat: number;
  method: "password" | "break-glass";
};

export function getConfig() {
  const password = env.KSP_ADMIN_PASSWORD || (!isProduction() ? "admin" : "");
  const secret = env.KSP_ADMIN_SECRET || (!isProduction() ? "dev-only-kingshadp-secret" : "");

  return {
    password,
    secret,
    breakGlassToken: env.KSP_BREAK_GLASS_TOKEN || "",
    configured: Boolean(password && secret),
    productionConfigured: Boolean(env.KSP_ADMIN_PASSWORD && env.KSP_ADMIN_SECRET),
    usesDevelopmentFallback:
      !isProduction() && (!env.KSP_ADMIN_PASSWORD || !env.KSP_ADMIN_SECRET),
  };
}

function sign(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

export function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function encodeSession(session: SessionPayload, secret: string) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

function decodeSession(token: string, secret: string): SessionPayload | null {
  if (!token.includes(".")) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature || !safeEqual(sign(payload, secret), signature)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
    const ageSeconds = (Date.now() - Number(parsed.iat || 0)) / 1000;

    if (ageSeconds >= SESSION_SECONDS) {
      return null;
    }

    if (parsed.role !== "admin" && parsed.role !== "superadmin") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function createSessionCookie(role: SessionRole, method: SessionPayload["method"]) {
  const { secret } = getConfig();
  const secure = isProduction();
  const token = encodeSession({ role, iat: Date.now(), method }, secret);

  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_SECONDS,
  };
}

export function clearSessionCookie() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export function verifySessionFromToken(token: string | undefined | null) {
  const { configured, secret } = getConfig();
  if (!configured || !token) {
    return null;
  }

  return decodeSession(token, secret);
}

export function verifySession(req: NextRequest) {
  return verifySessionFromToken(req.cookies.get(COOKIE_NAME)?.value);
}

export function requireAdmin(req: NextRequest) {
  const config = getConfig();

  if (!config.configured) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          configured: false,
          message: "Admin is locked until KSP_ADMIN_PASSWORD and KSP_ADMIN_SECRET are configured.",
        },
        { status: 503 },
      ),
    };
  }

  const session = verifySession(req);

  if (!session) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, authenticated: false, message: "Admin session required." },
        { status: 401 },
      ),
    };
  }

  return { ok: true, session };
}

export function audit(event: string, context: Record<string, unknown> = {}) {
  console.info(
    JSON.stringify({
      channel: "ksp-audit",
      event,
      at: new Date().toISOString(),
      ...context,
    }),
  );
}
