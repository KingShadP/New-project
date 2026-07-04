import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { writeUpload } from "@/lib/content/service";

const uploadSchema = z
  .object({
    fileName: z.string().default("upload"),
    dataUrl: z.string().min(1),
  })
  .strict();

function parseDataUrl(value: string) {
  const match = /^data:([^;,]+);base64,(.+)$/i.exec(value);

  if (!match) {
    throw Object.assign(new Error("Upload must be a base64 data URL."), { statusCode: 400 });
  }

  const contentType = match[1];

  if (!/^(image|video)\//.test(contentType)) {
    throw Object.assign(new Error("Only image and video uploads are allowed."), { statusCode: 415 });
  }

  return {
    contentType,
    buffer: Buffer.from(match[2], "base64"),
  };
}

export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin.ok) {
    return admin.response;
  }

  try {
    const body = uploadSchema.parse(await request.json());
    const parsed = parseDataUrl(body.dataUrl);
    const media = await writeUpload({ ...parsed, fileName: body.fileName });
    return NextResponse.json({ ok: true, media });
  } catch (error) {
    const status = typeof error === "object" && error && "statusCode" in error ? Number(error.statusCode) : 400;
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ ok: false, message }, { status });
  }
}
