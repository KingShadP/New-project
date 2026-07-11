const fs = require("node:fs/promises");
const path = require("node:path");

const DEFAULT_DESIGN_PATH = path.join(process.cwd(), "data", "site-design.default.json");
const LOCAL_DESIGN_PATH = path.join(process.cwd(), ".data", "site-design.json");
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "assets", "uploads");
const DESIGN_BLOB_PATH = "control/site-design.json";

function isProduction() {
  return process.env.VERCEL_ENV === "production";
}

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function loadDefaultDesign() {
  const raw = await fs.readFile(DEFAULT_DESIGN_PATH, "utf8");
  return JSON.parse(raw);
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function mergeDeep(base, override) {
  if (Array.isArray(base) || Array.isArray(override)) {
    return Array.isArray(override) ? override : base;
  }

  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override === undefined ? base : override;
  }

  const merged = { ...base };

  Object.keys(override).forEach((key) => {
    merged[key] = mergeDeep(base[key], override[key]);
  });

  return merged;
}

async function getBlobClient() {
  try {
    return await import("@vercel/blob");
  } catch {
    return null;
  }
}

async function readBlobDesign() {
  if (!hasBlobToken()) {
    return null;
  }

  const client = await getBlobClient();

  if (!client) {
    return null;
  }

  const result = await client.list({ prefix: DESIGN_BLOB_PATH, limit: 1 });
  const blob = result.blobs.find((item) => item.pathname === DESIGN_BLOB_PATH) || result.blobs[0];

  if (!blob) {
    return null;
  }

  const response = await fetch(blob.url, { cache: "no-store" });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

async function readLocalDesign() {
  try {
    return JSON.parse(await fs.readFile(LOCAL_DESIGN_PATH, "utf8"));
  } catch {
    return null;
  }
}

async function readDesign() {
  const defaults = await loadDefaultDesign();
  const stored = (await readBlobDesign()) || (await readLocalDesign());
  const design = mergeDeep(defaults, stored || {});
  design.storage = getStorageStatus();
  return design;
}

async function writeDesign(nextDesign) {
  const design = {
    ...nextDesign,
    updatedAt: new Date().toISOString(),
  };
  delete design.storage;

  if (hasBlobToken()) {
    const client = await getBlobClient();

    if (!client) {
      throw Object.assign(new Error("Vercel Blob package is not available."), { statusCode: 503 });
    }

    await client.put(DESIGN_BLOB_PATH, JSON.stringify(design, null, 2), {
      access: "public",
      allowOverwrite: true,
      contentType: "application/json; charset=utf-8",
    });

    return design;
  }

  if (isProduction()) {
    throw Object.assign(new Error("Persistent storage is not configured for production."), { statusCode: 503 });
  }

  await fs.mkdir(path.dirname(LOCAL_DESIGN_PATH), { recursive: true });
  await fs.writeFile(LOCAL_DESIGN_PATH, JSON.stringify(design, null, 2));
  return design;
}

function sanitizeFileName(name) {
  const parsed = path.parse(String(name || "upload"));
  const safeBase = parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "upload";
  const safeExt = parsed.ext.toLowerCase().replace(/[^a-z0-9.]/g, "") || ".bin";
  return `${Date.now()}-${safeBase}${safeExt}`;
}

async function writeUpload({ buffer, fileName, contentType }) {
  const safeName = sanitizeFileName(fileName);

  if (hasBlobToken()) {
    const client = await getBlobClient();

    if (!client) {
      throw Object.assign(new Error("Vercel Blob package is not available."), { statusCode: 503 });
    }

    const blob = await client.put(`media/${safeName}`, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType,
    });

    return {
      label: path.parse(fileName).name || "Uploaded media",
      url: blob.url,
      pathname: blob.pathname,
      kind: contentType.startsWith("video/") ? "video" : "image",
    };
  }

  if (isProduction()) {
    throw Object.assign(new Error("Persistent media storage is not configured for production."), { statusCode: 503 });
  }

  await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_UPLOAD_DIR, safeName), buffer);

  return {
    label: path.parse(fileName).name || "Uploaded media",
    url: `assets/uploads/${safeName}`,
    pathname: `assets/uploads/${safeName}`,
    kind: contentType.startsWith("video/") ? "video" : "image",
  };
}

function getStorageStatus() {
  return {
    persistent: hasBlobToken(),
    mode: hasBlobToken() ? "vercel-blob" : isProduction() ? "unconfigured" : "local-dev",
  };
}

module.exports = {
  getStorageStatus,
  readDesign,
  writeDesign,
  writeUpload,
  mergeDeep,
};
