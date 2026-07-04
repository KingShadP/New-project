import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { readDesign, writeDesign } from "@/lib/content/service";
import { siteDesignSchema } from "@/lib/content/schema";

const saveSchema = z
  .object({
    design: siteDesignSchema,
  })
  .strict();

export async function GET() {
  try {
    const design = await readDesign();
    return NextResponse.json({ ok: true, design });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read design.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);
  if (!admin.ok) {
    return admin.response;
  }

  try {
    const payload = saveSchema.parse(await request.json());
    const saved = await writeDesign(payload.design);
    return NextResponse.json({ ok: true, design: saved });
  } catch (error) {
    const status = typeof error === "object" && error && "statusCode" in error ? Number(error.statusCode) : 400;
    const message = error instanceof Error ? error.message : "Unable to save design.";
    return NextResponse.json({ ok: false, message }, { status });
  }
}
