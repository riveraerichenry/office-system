import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/authorize";
import { MODULE_PATHS } from "@/lib/module-paths";

export async function GET(req: NextRequest) {
    try {
        const user = await authorize(
            req,
            MODULE_PATHS.DIPP,
            "view"
        );

        console.log("========== AUTHORIZED USER ==========");
        console.log(user);
        console.log("User ID:", user.id);
        console.log("====================================");

        return NextResponse.json({
            success: true,
            user,
        });

    } catch (err: any) {
        console.error(err);

        return NextResponse.json(
            {
                success: false,
                message: err.message,
            },
            {
                status: 500,
            }
        );
    }
}