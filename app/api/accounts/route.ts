import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {

    try {

        const result =
            await pool.query(

                `
                SELECT

                    id,

                    account_code,

                    account_name

                FROM accounts

                WHERE

                    is_active = TRUE

                AND

                    is_postable = TRUE

                ORDER BY

                    account_code
                `

            );

        return NextResponse.json({

            success: true,

            data: result.rows,

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