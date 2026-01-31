import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Set timestamp cookie for anti-bot protection on survey pages
  if (request.nextUrl.pathname.startsWith("/survey/")) {
    const existingCookie = request.cookies.get("survey_start");

    if (!existingCookie) {
      response.cookies.set("survey_start", Date.now().toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60, // 1 hour
      });
    }
  }

  return response;
}

export const config = {
  matcher: "/survey/:path*",
};
