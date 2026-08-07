import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const { pathname } = req.nextUrl;

  const isLogin = pathname === "/login";

  const isAdminRoute =
    pathname.startsWith("/admin");

  const isDashboardRoute =
    pathname.startsWith("/dashboard");

  const protectedRoute =
    isAdminRoute ||
    isDashboardRoute;

  // ---------------------------------------
  // Not logged in
  // ---------------------------------------

  if (!token && protectedRoute) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  if (!token) {
    return NextResponse.next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as any;

    const roles =
      decoded.roles || [];

    const isAdmin =
      roles.some(
        (r: any) =>
          r.role_name ===
          "Administrator"
      );

    // ---------------------------------------
    // Already logged in
    // ---------------------------------------

    if (isLogin) {
      return NextResponse.redirect(
        new URL(
          isAdmin
            ? "/admin/dashboard"
            : "/dashboard",
          req.url
        )
      );
    }

    // ---------------------------------------
    // Admin pages
    // ---------------------------------------

    if (
      isAdminRoute &&
      !isAdmin
    ) {
      return NextResponse.redirect(
        new URL(
          "/dashboard",
          req.url
        )
      );
    }

    return NextResponse.next();
  } catch (err) {
    const response =
      NextResponse.redirect(
        new URL(
          "/login",
          req.url
        )
      );

    response.cookies.delete("token");

    return response;
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/login",
  ],
};