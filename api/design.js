const { readJson, sendJson } = require("./_lib/body");
const { requireAdmin } = require("./_lib/auth");
const { readDesign, writeDesign } = require("./_lib/storage");

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const design = await readDesign();
      return sendJson(res, 200, { ok: true, design });
    } catch (error) {
      return sendJson(res, error.statusCode || 500, { ok: false, message: error.message });
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return sendJson(res, 405, { ok: false, message: "Method not allowed." });
  }

  if (!requireAdmin(req, res, sendJson)) {
    return;
  }

  try {
    const body = await readJson(req, 9 * 1024 * 1024);
    const saved = await writeDesign(body.design || body);
    return sendJson(res, 200, { ok: true, design: saved });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { ok: false, message: error.message });
  }
};
