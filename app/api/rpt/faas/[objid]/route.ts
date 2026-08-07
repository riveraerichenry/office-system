import { NextRequest, NextResponse } from "next/server";
import { mysqlPool } from "@/lib/mysql";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ objid: string }> }
) {
    try {
        const { objid } = await params;

        const [rows] = await mysqlPool.query(
            `
            SELECT *
            FROM faas
            WHERE objid = ?
            LIMIT 1
            `,
            [objid]
        );

        const property = (rows as any[])[0];

        if (!property) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Property not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            property,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to load property.",
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
            },
            { status: 500 }
        );
    }
}