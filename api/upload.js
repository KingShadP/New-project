const { readJson, sendJson } = require("./_lib/body");
const { requireAdmin } = require("./_lib/auth");
const { writeUpload } = require("./_lib/storage");

function parseDataUrl(value) {
  const match = /^data:([^;,]+);base64,(.+)$/i.exec(String(value || ""));

  if (!match) {
    throw Object.assign(new Error("Upload must be a base64 data URL."), {
      statusCode: 400,
    });
  }

  const contentType = match[1];

  if (!/^(image|video)\//.test(contentType)) {
    throw Object.assign(
      new Error("Only image and video uploads are allowed."),
      { statusCode: 415 },
    );
  }

  return {
    contentType,
    buffer: Buffer.from(match[2], "base64"),
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { ok: false, message: "Method not allowed." });
  }

  if (!requireAdmin(req, res, sendJson)) {
    return;
  }

  try {
    const body = await readJson(req, 14 * 1024 * 1024);
    const fileName = String(body.fileName || "upload");
    const parsed = parseDataUrl(body.dataUrl);
    const media = await writeUpload({ ...parsed, fileName });

    return sendJson(res, 200, { ok: true, media });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, {
      ok: false,
      message: error.message,
    });
  }
};

module.exports.parseDataUrl = parseDataUrl;
