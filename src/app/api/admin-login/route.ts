import { z } from "zod";
import { NextResponse } from "next/server";
import { audit, createSessionCookie, getConfig, safeEqual } from "@/lib/auth";

const loginSchema = z
  .object({
    password: z.string().optional(),
    breakGlassToken: z.string().optional(),
  })
  .strict();

export async function POST(request: Request) {
  const config = getConfig();

  if (!config.configured) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message: "Admin is locked until KSP_ADMIN_PASSWORD and KSP_ADMIN_SECRET are configured.",
      },
      { status: 503 },
    );
  }

  let parsed: z.infer<typeof loginSchema>;

  try {
    parsed = loginSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  if (parsed.breakGlassToken) {
    if (!config.breakGlassToken || !safeEqual(parsed.breakGlassToken, config.breakGlassToken)) {
      audit("break_glass_login_failed");
      return NextResponse.json({ ok: false, authenticated: false, message: "Invalid break-glass token." }, { status: 401 });
    }

    const response = NextResponse.json({
      ok: true,
      authenticated: true,
      role: "superadmin",
      usesDevelopmentFallback: config.usesDevelopmentFallback,
      method: "break-glass",
    });

    response.cookies.set(createSessionCookie("superadmin", "break-glass"));
    audit("break_glass_login_success");
    return response;
  }

  const password = String(parsed.password || "");

  if (!password || !safeEqual(password, config.password)) {
    return NextResponse.json({ ok: false, authenticated: false, message: "Wrong password." }, { status: 401 });
  }

  const response = NextResponse.json({
    ok: true,
    authenticated: true,
    role: "admin",
    usesDevelopmentFallback: config.usesDevelopmentFallback,
    method: "password",
  });

  response.cookies.set(createSessionCookie("admin", "password"));
  audit("admin_login_success");
  return response;
}
