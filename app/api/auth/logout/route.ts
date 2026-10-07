import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({
        success: true,
        message: "Logged out successfully.",
    });

    // Clear regular system JWT
    response.cookies.set("token", "", {
        expires: new Date(0),
        maxAge: 0,
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });

    // Clear PHP session
    response.cookies.set("PHPSESSID", "", {
        expires: new Date(0),
        maxAge: 0,
        path: "/",
    });

    // Clear PHP remember-me cookie
    response.cookies.set("REMEMBERME", "", {
        expires: new Date(0),
        maxAge: 0,
        path: "/",
    });

    return response;
}