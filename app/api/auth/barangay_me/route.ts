import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get(
            "barangay_token"
        )?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Not authenticated.",
                },
                { status: 401 }
            );
        }

        if (!process.env.JWT_SECRET) {
            console.error(
                "Barangay authentication error: JWT_SECRET is not configured."
            );

            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication configuration error.",
                },
                { status: 500 }
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        ) as {
            id: string;
            username: string;
            role: string;
            barangay_id: string;
        };

        const result = await pool.query(
            `
            SELECT
                bu.id,
                bu.username,
                bu.first_name,
                bu.middle_name,
                bu.last_name,
                bu.email,
                bu.role,
                bu.is_active,

                b.id AS barangay_uuid,
                b.barangay_code,
                b.barangay_name,
                b.municipality,
                b.province,
                b.is_active AS barangay_is_active

            FROM barangay_users bu

            LEFT JOIN barangays b
                ON b.id = bu.barangay_id

            WHERE bu.id = $1
              AND bu.is_active = TRUE

            LIMIT 1
            `,
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User account not found.",
                },
                { status: 401 }
            );
        }

        const user = result.rows[0];

        if (!user.barangay_is_active) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This barangay is inactive.",
                },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,

            user: {
                id: user.id,
                username: user.username,

                first_name: user.first_name,
                middle_name: user.middle_name,
                last_name: user.last_name,

                email: user.email,
                role: user.role,

                barangay: {
                    id: user.barangay_uuid,
                    code: user.barangay_code,
                    name: user.barangay_name,
                    municipality: user.municipality,
                    province: user.province,
                },
            },
        });
    } catch (error) {
        console.error(
            "Barangay authentication error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Invalid or expired session.",
            },
            { status: 401 }
        );
    }
}