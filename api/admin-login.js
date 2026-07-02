const { readJson, sendJson } = require("./_lib/body");
const { createSessionCookie, getConfig, safeEqual } = require("./_lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { ok: false, message: "Method not allowed." });
  }

  const config = getConfig();

  if (!config.configured) {
    return sendJson(res, 503, {
      ok: false,
      configured: false,
      message: "Admin is locked until KSP_ADMIN_PASSWORD and KSP_ADMIN_SECRET are configured.",
    });
  }

  try {
    const body = await readJson(req, 256 * 1024);
    const password = String(body.password || "");

    if (!password || !safeEqual(password, config.password)) {
      return sendJson(res, 401, { ok: false, authenticated: false, message: "Wrong password." });
    }

    res.setHeader("Set-Cookie", createSessionCookie());
    return sendJson(res, 200, {
      ok: true,
      authenticated: true,
      usesDevelopmentFallback: config.usesDevelopmentFallback,
    });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { ok: false, message: error.message });
  }
};
