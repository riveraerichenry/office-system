import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
    try {
        const result = await pool.query(`
            SELECT
                bu.id,
                bu.username,
                bu.first_name,
                bu.middle_name,
                bu.last_name,
                bu.email,
                bu.role,
                bu.barangay_id,

                b.id AS barangay_uuid,
                b.barangay_code,
                b.barangay_name,
                b.municipality,
                b.province

            FROM barangay_users bu

            LEFT JOIN barangays b
                ON b.id = bu.barangay_id

            WHERE bu.is_active = TRUE

            ORDER BY
                b.barangay_name ASC,
                bu.last_name ASC,
                bu.first_name ASC
        `);

        const users = result.rows.map((user) => {
            const fullName = [
                user.first_name,
                user.middle_name,
                user.last_name,
            ]
                .filter(Boolean)
                .join(" ");

            return {
                id: user.id,
                username: user.username,
                first_name: user.first_name,
                middle_name: user.middle_name,
                last_name: user.last_name,
                full_name: fullName,

                barangay: {
                    id: user.barangay_uuid,
                    code: user.barangay_code,
                    name: user.barangay_name,
                    municipality: user.municipality,
                    province: user.province,
                },

                display_name: `${user.barangay_name ?? "Unknown Barangay"} - ${fullName}`,
            };
        });

        return NextResponse.json({
            success: true,
            users,
        });
    } catch (error) {
        console.error(
            "Barangay RAT users error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Failed to load barangay users.",
            },
            {
                status: 500,
            }
        );
    }
}