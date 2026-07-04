import fs from "node:fs/promises";
import path from "node:path";
import { env, isProduction } from "@/lib/env";
import { siteDesignSchema, type SiteDesign } from "@/lib/content/schema";

const DEFAULT_DESIGN_PATH = path.join(process.cwd(), "data", "site-design.default.json");
const LOCAL_DESIGN_PATH = path.join(process.cwd(), ".data", "site-design.json");
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "assets", "uploads");
const DESIGN_BLOB_PATH = "control/site-design.json";

function hasBlobToken() {
  return Boolean(env.BLOB_READ_WRITE_TOKEN);
}

async function loadDefaultDesign() {
  const raw = await fs.readFile(DEFAULT_DESIGN_PATH, "utf8");
  return siteDesignSchema.parse(JSON.parse(raw));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function mergeDeep<T>(base: T, override: unknown): T {
  if (Array.isArray(base) || Array.isArray(override)) {
    return (Array.isArray(override) ? override : base) as T;
  }

  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override === undefined ? base : override) as T;
  }

  const merged: Record<string, unknown> = { ...base };

  Object.keys(override).forEach((key) => {
    merged[key] = mergeDeep((base as Record<string, unknown>)[key], override[key]);
  });

  return merged as T;
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

export function getStorageStatus() {
  return {
    persistent: hasBlobToken(),
    mode: hasBlobToken() ? "vercel-blob" : isProduction() ? "unconfigured" : "local-dev",
  };
}

export async function readDesign() {
  const defaults = await loadDefaultDesign();
  const stored = (await readBlobDesign()) || (await readLocalDesign());
  const merged = mergeDeep(defaults, stored || {});
  const design = siteDesignSchema.parse(merged);

  return {
    ...design,
    storage: getStorageStatus(),
  };
}

export async function writeDesign(nextDesign: unknown) {
  const validated = siteDesignSchema.parse(nextDesign);
  const design = {
    ...validated,
    updatedAt: new Date().toISOString(),
  } satisfies SiteDesign;

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
    throw Object.assign(new Error("Persistent storage is not configured for production."), {
      statusCode: 503,
    });
  }

  await fs.mkdir(path.dirname(LOCAL_DESIGN_PATH), { recursive: true });
  await fs.writeFile(LOCAL_DESIGN_PATH, JSON.stringify(design, null, 2));
  return design;
}

function sanitizeFileName(name: string) {
  const parsed = path.parse(String(name || "upload"));
  const safeBase =
    parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "upload";
  const safeExt = parsed.ext.toLowerCase().replace(/[^a-z0-9.]/g, "") || ".bin";
  return `${Date.now()}-${safeBase}${safeExt}`;
}

export async function writeUpload({
  buffer,
  fileName,
  contentType,
}: {
  buffer: Buffer;
  fileName: string;
  contentType: string;
}) {
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
      kind: contentType.startsWith("video/") ? "video" : ("image" as const),
    };
  }

  if (isProduction()) {
    throw Object.assign(new Error("Persistent media storage is not configured for production."), {
      statusCode: 503,
    });
  }

  await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_UPLOAD_DIR, safeName), buffer);

  return {
    label: path.parse(fileName).name || "Uploaded media",
    url: `/assets/uploads/${safeName}`,
    pathname: `assets/uploads/${safeName}`,
    kind: contentType.startsWith("video/") ? "video" : ("image" as const),
  };
}
