const crypto = require("node:crypto");

const COOKIE_NAME = "ksp_admin_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function isProduction() {
  return process.env.VERCEL_ENV === "production";
}

function getConfig() {
  const password = process.env.KSP_ADMIN_PASSWORD || (!isProduction() ? "admin" : "");
  const secret = process.env.KSP_ADMIN_SECRET || (!isProduction() ? "dev-only-kingshadp-secret" : "");

  return {
    password,
    secret,
    configured: Boolean(password && secret),
    productionConfigured: Boolean(process.env.KSP_ADMIN_PASSWORD && process.env.KSP_ADMIN_SECRET),
    usesDevelopmentFallback: !isProduction() && (!process.env.KSP_ADMIN_PASSWORD || !process.env.KSP_ADMIN_SECRET),
  };
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function parseCookies(req) {
  const header = req.headers.cookie || "";

  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return [decodeURIComponent(part.slice(0, index)), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

function createSessionCookie() {
  const { secret } = getConfig();
  const payload = base64url(JSON.stringify({ role: "admin", iat: Date.now() }));
  const signature = sign(payload, secret);
  const secure = isProduction() ? " Secure;" : "";

  return `${COOKIE_NAME}=${payload}.${signature}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_SECONDS};${secure}`;
}

function verifySession(req) {
  const { configured, secret } = getConfig();

  if (!configured) {
    return false;
  }

  const cookie = parseCookies(req)[COOKIE_NAME];

  if (!cookie || !cookie.includes(".")) {
    return false;
  }

  const [payload, signature] = cookie.split(".");

  if (!payload || !signature || !safeEqual(sign(payload, secret), signature)) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const ageSeconds = (Date.now() - Number(parsed.iat || 0)) / 1000;
    return parsed.role === "admin" && ageSeconds < SESSION_SECONDS;
  } catch {
    return false;
  }
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0;`;
}

function requireAdmin(req, res, sendJson) {
  const config = getConfig();

  if (!config.configured) {
    sendJson(res, 503, {
      ok: false,
      configured: false,
      message: "Admin is locked until KSP_ADMIN_PASSWORD and KSP_ADMIN_SECRET are configured.",
    });
    return false;
  }

  if (!verifySession(req)) {
    sendJson(res, 401, { ok: false, authenticated: false, message: "Admin session required." });
    return false;
  }

  return true;
}

module.exports = {
  clearSessionCookie,
  createSessionCookie,
  getConfig,
  parseCookies,
  requireAdmin,
  safeEqual,
  verifySession,
};
