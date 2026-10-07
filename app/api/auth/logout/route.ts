import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // Check if the browser sent the token
        const existingToken = req.cookies.get("token");

        console.log("========== LOGOUT ==========");
        console.log("TOKEN EXISTS:", !!existingToken);
        console.log("TOKEN LENGTH:", existingToken?.value?.length ?? 0);
        console.log("============================");

        const response = NextResponse.json({
            success: true,
            message: "Logged out successfully.",
            tokenFound: !!existingToken,
        });

        // Clear the Next.js authentication cookie
        response.cookies.set("token", "", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
            expires: new Date(0),
            maxAge: 0,
        });

        return response;

    } catch (error) {
        console.error("LOGOUT ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Logout failed.",
            },
            {
                status: 500,
            }
        );
    }
}