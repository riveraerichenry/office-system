import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // Check if the browser sent the Barangay token
        const existingToken = req.cookies.get("barangay_token");

        console.log("========== BARANGAY LOGOUT ==========");
        console.log(
            "BARANGAY TOKEN EXISTS:",
            !!existingToken
        );
        console.log(
            "BARANGAY TOKEN LENGTH:",
            existingToken?.value?.length ?? 0
        );
        console.log("=====================================");

        const response = NextResponse.json({
            success: true,
            message: "Logged out successfully.",
            tokenFound: !!existingToken,
        });

        // Clear Barangay authentication cookie
        response.cookies.set("barangay_token", "", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
            expires: new Date(0),
            maxAge: 0,
        });

        return response;

    } catch (error) {
        console.error(
            "BARANGAY LOGOUT ERROR:",
            error
        );

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