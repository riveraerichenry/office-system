import { NextRequest, NextResponse } from "next/server";

import { pool } from "@/lib/db";


/* =========================================================
   GET
   GET ALL BARANGAYS
========================================================= */

export async function GET() {

    try {

        const result =
            await pool.query(`
                SELECT
                    id,
                    barangay_code,
                    barangay_name,
                    municipality,
                    province,
                    is_active,
                    created_at,
                    updated_at
                FROM barangays
                ORDER BY barangay_name ASC
            `);


        return NextResponse.json(
            {
                success: true,
                data: result.rows,
            },
            {
                status: 200,
            }
        );

    } catch (error) {

        console.error(
            "GET BARANGAYS ERROR:",
            error
        );


        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch barangays.",
            },
            {
                status: 500,
            }
        );

    }

}


/* =========================================================
   POST
   CREATE BARANGAY
========================================================= */

export async function POST(
    request: NextRequest
) {

    try {

        const body =
            await request.json();


        const {
            barangay_code,
            barangay_name,
            municipality = "Taytay",
            province = "Palawan",
            is_active = true,
        } = body;


        if (
            !barangay_name
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Barangay name is required.",
                },
                {
                    status: 400,
                }
            );

        }


        const result =
            await pool.query(
                `
                    INSERT INTO barangays (
                        barangay_code,
                        barangay_name,
                        municipality,
                        province,
                        is_active
                    )
                    VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5
                    )
                    RETURNING *
                `,
                [
                    barangay_code || null,
                    barangay_name.trim(),
                    municipality.trim(),
                    province.trim(),
                    is_active,
                ]
            );


        return NextResponse.json(
            {
                success: true,
                message:
                    "Barangay created successfully.",
                data:
                    result.rows[0],
            },
            {
                status: 201,
            }
        );

    } catch (error: any) {

        console.error(
            "CREATE BARANGAY ERROR:",
            error
        );


        if (
            error.code === "23505"
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Barangay already exists.",
                },
                {
                    status: 409,
                }
            );

        }


        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to create barangay.",
            },
            {
                status: 500,
            }
        );

    }

}


/* =========================================================
   PUT
   UPDATE BARANGAY
========================================================= */

export async function PUT(
    request: NextRequest
) {

    try {

        const body =
            await request.json();


        const {
            id,
            barangay_code,
            barangay_name,
            municipality,
            province,
            is_active,
        } = body;


        if (
            !id
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Barangay ID is required.",
                },
                {
                    status: 400,
                }
            );

        }


        if (
            !barangay_name
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Barangay name is required.",
                },
                {
                    status: 400,
                }
            );

        }


        const result =
            await pool.query(
                `
                    UPDATE barangays

                    SET
                        barangay_code = $1,
                        barangay_name = $2,
                        municipality = $3,
                        province = $4,
                        is_active = $5,
                        updated_at = NOW()

                    WHERE id = $6

                    RETURNING *
                `,
                [
                    barangay_code || null,
                    barangay_name.trim(),
                    municipality?.trim() || "Taytay",
                    province?.trim() || "Palawan",
                    is_active,
                    id,
                ]
            );


        if (
            result.rowCount === 0
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Barangay not found.",
                },
                {
                    status: 404,
                }
            );

        }


        return NextResponse.json(
            {
                success: true,
                message:
                    "Barangay updated successfully.",
                data:
                    result.rows[0],
            },
            {
                status: 200,
            }
        );

    } catch (error: any) {

        console.error(
            "UPDATE BARANGAY ERROR:",
            error
        );


        if (
            error.code === "23505"
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Barangay name or code already exists.",
                },
                {
                    status: 409,
                }
            );

        }


        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to update barangay.",
            },
            {
                status: 500,
            }
        );

    }

}


/* =========================================================
   DELETE
   DELETE BARANGAY
========================================================= */

export async function DELETE(
    request: NextRequest
) {

    try {

        const {
            searchParams,
        } =
            new URL(
                request.url
            );


        const id =
            searchParams.get(
                "id"
            );


        if (
            !id
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Barangay ID is required.",
                },
                {
                    status: 400,
                }
            );

        }


        const result =
            await pool.query(
                `
                    DELETE FROM barangays

                    WHERE id = $1

                    RETURNING *
                `,
                [
                    id,
                ]
            );


        if (
            result.rowCount === 0
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Barangay not found.",
                },
                {
                    status: 404,
                }
            );

        }


        return NextResponse.json(
            {
                success: true,
                message:
                    "Barangay deleted successfully.",
                data:
                    result.rows[0],
            },
            {
                status: 200,
            }
        );

    } catch (error) {

        console.error(
            "DELETE BARANGAY ERROR:",
            error
        );


        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to delete barangay.",
            },
            {
                status: 500,
            }
        );

    }

}