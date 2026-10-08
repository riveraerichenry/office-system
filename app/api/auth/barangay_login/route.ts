import {
    NextRequest,
    NextResponse,
} from "next/server";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
    pool,
} from "@/lib/db";


export async function POST(
    request: NextRequest
) {

    try {

        const body =
            await request.json();


        const username =
            String(
                body.username ?? ""
            ).trim();


        const password =
            String(
                body.password ?? ""
            );


        /*
        |--------------------------------------------------------------------------
        | VALIDATE INPUT
        |--------------------------------------------------------------------------
        */

        if (
            !username ||
            !password
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Username and password are required.",
                },
                {
                    status: 400,
                }
            );

        }


        /*
        |--------------------------------------------------------------------------
        | FIND BARANGAY USER
        |--------------------------------------------------------------------------
        */

        const result =
            await pool.query(
                `
                SELECT

                    bu.id,

                    bu.username,

                    bu.password_hash,

                    bu.first_name,

                    bu.middle_name,

                    bu.last_name,

                    bu.email,

                    bu.barangay_id,

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


                WHERE bu.username = $1


                LIMIT 1
                `,
                [
                    username,
                ]
            );


        /*
        |--------------------------------------------------------------------------
        | USER NOT FOUND
        |--------------------------------------------------------------------------
        */

        if (
            result.rows.length === 0
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid username or password.",
                },
                {
                    status: 401,
                }
            );

        }


        const user =
            result.rows[0];


        /*
        |--------------------------------------------------------------------------
        | USER ACTIVE CHECK
        |--------------------------------------------------------------------------
        */

        if (
            !user.is_active
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "This account is inactive.",
                },
                {
                    status: 403,
                }
            );

        }


        /*
        |--------------------------------------------------------------------------
        | BARANGAY ACTIVE CHECK
        |--------------------------------------------------------------------------
        */

        if (
            user.barangay_is_active === false
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "This barangay is inactive.",
                },
                {
                    status: 403,
                }
            );

        }


        /*
        |--------------------------------------------------------------------------
        | CHECK PASSWORD
        |--------------------------------------------------------------------------
        */

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password_hash
            );


        if (
            !passwordMatch
        ) {

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Invalid username or password.",
                },
                {
                    status: 401,
                }
            );

        }


        /*
        |--------------------------------------------------------------------------
        | CHECK JWT SECRET
        |--------------------------------------------------------------------------
        */

        if (
            !process.env.JWT_SECRET
        ) {

            console.error(
                "Barangay login error: JWT_SECRET is not configured."
            );


            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Authentication configuration error.",
                },
                {
                    status: 500,
                }
            );

        }


        /*
        |--------------------------------------------------------------------------
        | CREATE JWT
        |--------------------------------------------------------------------------
        */

        const token =
            jwt.sign(
                {
                    id:
                        user.id,

                    username:
                        user.username,

                    role:
                        user.role,

                    barangay_id:
                        user.barangay_id,

                    barangay_code:
                        user.barangay_code,

                    barangay_name:
                        user.barangay_name,

                    system:
                        "barangay",
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        "8h",
                }
            );


        /*
        |--------------------------------------------------------------------------
        | CREATE RESPONSE
        |--------------------------------------------------------------------------
        */

        const response =
            NextResponse.json(
                {
                    success: true,

                    message:
                        "Login successful.",

                    user: {

                        id:
                            user.id,

                        username:
                            user.username,


                        first_name:
                            user.first_name,

                        middle_name:
                            user.middle_name,

                        last_name:
                            user.last_name,


                        email:
                            user.email,


                        role:
                            user.role,


                        barangay: {

                            id:
                                user.barangay_uuid,

                            code:
                                user.barangay_code,

                            name:
                                user.barangay_name,

                            municipality:
                                user.municipality,

                            province:
                                user.province,

                        },

                    },

                },

                {
                    status: 200,
                }
            );


        /*
        |--------------------------------------------------------------------------
        | SET BARANGAY SESSION COOKIE
        |
        | Current deployment is accessed through:
        | http://10.20.0.30:3002
        |
        | Therefore Secure must be FALSE while using HTTP.
        |--------------------------------------------------------------------------
        */

        response.cookies.set(
            "barangay_token",
            token,
            {
                httpOnly: true,

                secure: false,

                sameSite: "lax",

                path: "/",

                maxAge:
                    60 * 60 * 8,
            }
        );


        /*
        |--------------------------------------------------------------------------
        | RETURN RESPONSE
        |--------------------------------------------------------------------------
        */

        return response;


    } catch (
        error
    ) {

        console.error(
            "Barangay login error:",
            error
        );


        return NextResponse.json(
            {
                success: false,
                message:
                    "An unexpected error occurred.",
            },
            {
                status: 500,
            }
        );

    }

}