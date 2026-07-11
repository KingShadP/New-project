const { sendJson } = require("./_lib/body");
const { clearSessionCookie, getConfig, verifySession } = require("./_lib/auth");
const { getStorageStatus } = require("./_lib/storage");

module.exports = async function handler(req, res) {
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", clearSessionCookie());
    return sendJson(res, 200, { ok: true, authenticated: false });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, DELETE");
    return sendJson(res, 405, { ok: false, message: "Method not allowed." });
  }

  const config = getConfig();

  return sendJson(res, 200, {
    ok: true,
    configured: config.configured,
    productionConfigured: config.productionConfigured,
    authenticated: verifySession(req),
    storage: getStorageStatus(),
  });
};
