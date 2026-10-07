import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcrypt";

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
                bu.barangay_id,
                bu.role,
                bu.is_active,
                bu.created_at,
                bu.updated_at,
                b.barangay_code,
                b.barangay_name
            FROM public.barangay_users bu

            LEFT JOIN public.barangays b
                ON b.id = bu.barangay_id

            ORDER BY
                bu.created_at DESC
        `);

        return NextResponse.json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error(
            "GET /api/barangay_users error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to fetch barangay users.",
            },
            {
                status: 500,
            }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            username,
            password,
            first_name,
            middle_name,
            last_name,
            email,
            barangay_id,
            role,
            is_active,
        } = body;

        /*
         * Validate required fields
         */
        if (
            typeof username !== "string" ||
            !username.trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Username is required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            typeof password !== "string" ||
            !password.trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Password is required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            typeof first_name !== "string" ||
            !first_name.trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "First name is required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            typeof last_name !== "string" ||
            !last_name.trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Last name is required.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            typeof role !== "string" ||
            !role.trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Role is required.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
         * Check duplicate username
         */
        const existingUser = await pool.query(
            `
            SELECT id
            FROM public.barangay_users
            WHERE username = $1
            LIMIT 1
            `,
            [username.trim()]
        );

        if (existingUser.rows.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Username already exists.",
                },
                {
                    status: 409,
                }
            );
        }

        /*
         * If barangay_id was supplied,
         * verify that the barangay exists.
         */
        if (barangay_id) {
            const barangayResult =
                await pool.query(
                    `
                    SELECT id
                    FROM public.barangays
                    WHERE id = $1
                    LIMIT 1
                    `,
                    [barangay_id]
                );

            if (
                barangayResult.rows.length === 0
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Selected barangay was not found.",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        /*
         * Hash password
         */
        const passwordHash =
            await bcrypt.hash(
                password,
                10
            );

        /*
         * Insert barangay user
         */
        const result = await pool.query(
            `
            INSERT INTO public.barangay_users
            (
                username,
                password_hash,
                first_name,
                middle_name,
                last_name,
                email,
                barangay_id,
                role,
                is_active
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9
            )
            RETURNING
                id,
                username,
                first_name,
                middle_name,
                last_name,
                email,
                barangay_id,
                role,
                is_active,
                created_at,
                updated_at
            `,
            [
                username.trim(),
                passwordHash,
                first_name.trim(),
                typeof middle_name === "string" &&
                middle_name.trim()
                    ? middle_name.trim()
                    : null,
                last_name.trim(),
                typeof email === "string" &&
                email.trim()
                    ? email.trim()
                    : null,
                barangay_id || null,
                role.trim(),
                is_active === true,
            ]
        );

        return NextResponse.json(
            {
                success: true,
                message:
                    "Barangay user created successfully.",
                data: result.rows[0],
            },
            {
                status: 201,
            }
        );
    } catch (error: any) {
        console.error(
            "POST /api/barangay_users error:",
            error
        );

        /*
         * PostgreSQL unique violation
         */
        if (error?.code === "23505") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Username already exists.",
                },
                {
                    status: 409,
                }
            );
        }

        /*
         * PostgreSQL foreign key violation
         */
        if (error?.code === "23503") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid barangay selected.",
                },
                {
                    status: 400,
                }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to create barangay user.",
            },
            {
                status: 500,
            }
        );
    }
}