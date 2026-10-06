import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { pool } from "@/lib/db";

type BarangayTokenPayload = {
    id: string;
    username?: string;
    system?: string;
};

export async function GET(
    request: NextRequest
) {
    try {
        const token =
            request.cookies.get(
                "barangay_token"
            )?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized.",
                },
                {
                    status: 401,
                }
            );
        }

        const secret =
            process.env.JWT_SECRET;

        if (!secret) {
            console.error(
                "JWT_SECRET is not configured."
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Server configuration error.",
                },
                {
                    status: 500,
                }
            );
        }

        let decoded: BarangayTokenPayload;

        try {
            decoded =
                jwt.verify(
                    token,
                    secret
                ) as BarangayTokenPayload;
        } catch (error) {
            console.error(
                "Invalid barangay token:",
                error
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid or expired session.",
                },
                {
                    status: 401,
                }
            );
        }

        if (!decoded?.id) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid user session.",
                },
                {
                    status: 401,
                }
            );
        }

        /*
         * ============================================================
         * GET ONLY BOOKLETS RAT-ASSIGNED TO CURRENT BARANGAY USER
         * ============================================================
         *
         * barangay_users
         *       ↓
         * barangay_rat_headers
         *       ↓
         * barangay_rat_items
         *       ↓
         * smi_booklet_registration
         *       ↓
         * accountable_forms
         */

        const result = await pool.query(
            `
            SELECT
                sbr.id,

                af.form_code,

                sbr.beginning_or,
                sbr.ending_or,
                sbr.current_or,

                h.id AS rat_id,
                h.rat_no,
                h.status AS rat_status,
                h.generated_at AS rat_generated_at,
                h.created_at AS rat_created_at,

                i.id AS rat_item_id

            FROM barangay_rat_headers h

            INNER JOIN barangay_rat_items i
                ON i.rat_id = h.id
                AND i.is_active = TRUE

            INNER JOIN smi_booklet_registration sbr
                ON sbr.id = i.booklet_id
                AND sbr.is_active = TRUE

            INNER JOIN accountable_forms af
                ON af.id = sbr.accountable_form_id

            WHERE
                h.barangay_user_id = $1

                AND h.is_active = TRUE

            ORDER BY
                h.created_at DESC,
                af.form_code ASC
            `,
            [decoded.id]
        );

        return NextResponse.json({
            success: true,
            booklets: result.rows,
        });
    } catch (error) {
        console.error(
            "GET /api/barangay-rat/my-booklets error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to load assigned booklets.",
            },
            {
                status: 500,
            }
        );
    }
}