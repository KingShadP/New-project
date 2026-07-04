import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getConfig, verifySession } from "@/lib/auth";
import { getStorageStatus } from "@/lib/content/service";

export async function GET(request: NextRequest) {
  const config = getConfig();
  const session = verifySession(request);

  return NextResponse.json({
    ok: true,
    configured: config.configured,
    productionConfigured: config.productionConfigured,
    authenticated: Boolean(session),
    role: session?.role || null,
    usesDevelopmentFallback: config.usesDevelopmentFallback,
    storage: getStorageStatus(),
  });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true, authenticated: false });
  response.cookies.set(clearSessionCookie());
  return response;
}
