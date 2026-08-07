import { NextResponse } from "next/server";
import { mysqlPool } from "@/lib/mysql";

export async function GET() {
    try {

        const [barangays] = await mysqlPool.query(

            `
            SELECT DISTINCT
                barangay_name
            FROM vw_faas_lookup
            WHERE
                barangay_name IS NOT NULL
                AND barangay_name <> ''
            ORDER BY barangay_name
            `
        );

        const [classifications] = await mysqlPool.query(

            `
            SELECT DISTINCT
                classification_name
            FROM vw_faas_lookup
            WHERE
                classification_name IS NOT NULL
                AND classification_name <> ''
            ORDER BY classification_name
            `
        );

        return NextResponse.json({

            success: true,

            barangays,

            classifications,

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