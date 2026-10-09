import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
    try {
        const result = await pool.query(`
            SELECT
                u.id,
                u.full_name,
                u.username,
                STRING_AGG(
                    DISTINCT r.role_name,
                    ', ' ORDER BY r.role_name
                ) AS role_name
            FROM public.users u
            INNER JOIN public.user_roles ur
                ON ur.user_id = u.id
            INNER JOIN public.roles r
                ON r.id = ur.role_id
            WHERE COALESCE(u.is_active, TRUE) = TRUE
              AND LOWER(TRIM(r.role_name)) IN (
                  'collector',
                  'collector officer'
              )
            GROUP BY u.id, u.full_name, u.username
            ORDER BY u.full_name ASC NULLS LAST
        `);

        return NextResponse.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error("GET RPT COLLECTORS ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to load collectors.",
            },
            { status: 500 }
        );
    }
}