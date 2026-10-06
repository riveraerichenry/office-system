import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

/*
|--------------------------------------------------------------------------
| GET - Created Barangay RAT
|--------------------------------------------------------------------------
*/

export async function GET() {
    try {
        const result = await pool.query(`
            SELECT
                h.id,
                h.rat_no,
                h.barangay_user_id,
                h.status,
                h.remarks,
                h.generated_at,
                h.completed_at,
                h.created_at,

                bu.username,
                bu.first_name,
                bu.middle_name,
                bu.last_name,

                b.id AS barangay_id,
                b.barangay_code,
                b.barangay_name,
                b.municipality,
                b.province,

                COUNT(i.id)::integer AS booklet_count,

                MIN(sbr.beginning_or) AS beginning_or,
                MAX(sbr.ending_or) AS ending_or

            FROM barangay_rat_headers h

            INNER JOIN barangay_users bu
                ON bu.id = h.barangay_user_id

            LEFT JOIN barangays b
                ON b.id = bu.barangay_id

            LEFT JOIN barangay_rat_items i
                ON i.rat_id = h.id
                AND i.is_active = TRUE

            LEFT JOIN smi_booklet_registration sbr
                ON sbr.id = i.booklet_id
                AND sbr.is_active = TRUE

            WHERE h.is_active = TRUE

            GROUP BY
                h.id,
                h.rat_no,
                h.barangay_user_id,
                h.status,
                h.remarks,
                h.generated_at,
                h.completed_at,
                h.created_at,

                bu.username,
                bu.first_name,
                bu.middle_name,
                bu.last_name,

                b.id,
                b.barangay_code,
                b.barangay_name,
                b.municipality,
                b.province

            ORDER BY
                h.created_at DESC
        `);

        const rats = result.rows.map((row) => {
            const fullName = [
                row.first_name,
                row.middle_name,
                row.last_name,
            ]
                .filter(Boolean)
                .join(" ");

            return {
                id: row.id,
                rat_no: row.rat_no,
                status: row.status,
                remarks: row.remarks,
                generated_at: row.generated_at,
                completed_at: row.completed_at,
                created_at: row.created_at,

                barangay_user: {
                    id: row.barangay_user_id,
                    username: row.username,
                    full_name: fullName,
                },

                barangay: {
                    id: row.barangay_id,
                    code: row.barangay_code,
                    name: row.barangay_name,
                    municipality: row.municipality,
                    province: row.province,
                },

                booklet_count: row.booklet_count,

                beginning_or:
                    row.beginning_or !== null
                        ? Number(row.beginning_or)
                        : null,

                ending_or:
                    row.ending_or !== null
                        ? Number(row.ending_or)
                        : null,
            };
        });

        return NextResponse.json({
            success: true,
            rats,
        });
    } catch (error) {
        console.error(
            "Barangay RAT GET error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to load Barangay RAT records.",
            },
            {
                status: 500,
            }
        );
    }
}

/*
|--------------------------------------------------------------------------
| POST - Create Barangay RAT
|--------------------------------------------------------------------------
|
| One Barangay User
|        |
|        ▼
| barangay_rat_headers
|        |
|        ▼
| barangay_rat_items
|        |
|        ▼
| smi_booklet_registration
|        |
|        ├── status = ISSUED
|        └── issued_date = NOW()
|
|--------------------------------------------------------------------------
*/

export async function POST(
    request: NextRequest
) {
    const client = await pool.connect();

    try {
        const body = await request.json();

        const barangayUserId = String(
            body.barangay_user_id ?? ""
        ).trim();

        const bookletIds = Array.isArray(
            body.booklet_ids
        )
            ? body.booklet_ids
                  .map((id: unknown) =>
                      String(id).trim()
                  )
                  .filter(Boolean)
            : [];

        const remarks =
            body.remarks !== undefined &&
            body.remarks !== null
                ? String(body.remarks).trim()
                : null;

        /*
        |--------------------------------------------------------------------------
        | Validate Barangay User
        |--------------------------------------------------------------------------
        */

        if (!barangayUserId) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Barangay User is required.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Booklets
        |--------------------------------------------------------------------------
        */

        if (bookletIds.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "At least one booklet is required.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Prevent Duplicate Booklets
        |--------------------------------------------------------------------------
        */

        const uniqueBookletIds = [
            ...new Set(bookletIds),
        ];

        if (
            uniqueBookletIds.length !==
            bookletIds.length
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "A booklet cannot be selected more than once.",
                },
                {
                    status: 400,
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | BEGIN TRANSACTION
        |--------------------------------------------------------------------------
        */

        await client.query("BEGIN");

        /*
        |--------------------------------------------------------------------------
        | Verify Barangay User
        |--------------------------------------------------------------------------
        */

        const userResult =
            await client.query(
                `
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

                    b.id AS barangay_uuid,
                    b.barangay_code,
                    b.barangay_name,
                    b.municipality,
                    b.province

                FROM barangay_users bu

                LEFT JOIN barangays b
                    ON b.id = bu.barangay_id

                WHERE bu.id = $1

                LIMIT 1
                `,
                [barangayUserId]
            );

        if (userResult.rows.length === 0) {
            throw new Error(
                "Barangay User not found."
            );
        }

        const barangayUser =
            userResult.rows[0];

        if (!barangayUser.is_active) {
            throw new Error(
                "The selected Barangay User is inactive."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Barangay
        |--------------------------------------------------------------------------
        */

        if (
            barangayUser.barangay_id &&
            barangayUser.barangay_uuid &&
            barangayUser.barangay_id !==
                barangayUser.barangay_uuid
        ) {
            throw new Error(
                "Invalid Barangay User assignment."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Lock and Verify Selected Booklets
        |--------------------------------------------------------------------------
        |
        | FOR UPDATE prevents another transaction from
        | changing/assigning the same booklet while
        | this RAT is being created.
        |
        */

        const bookletResult =
            await client.query(
                `
                SELECT
                    id,
                    control_no,
                    accountable_form_id,
                    fiscal_year,
                    series,
                    beginning_or,
                    ending_or,
                    receipt_count,
                    current_or,
                    status,
                    received_date,
                    issued_date,
                    supplier,
                    remarks,
                    is_active,
                    created_by,
                    created_at,
                    updated_at

                FROM smi_booklet_registration

                WHERE id = ANY($1::uuid[])

                FOR UPDATE
                `,
                [uniqueBookletIds]
            );

        /*
        |--------------------------------------------------------------------------
        | Verify all requested booklets exist
        |--------------------------------------------------------------------------
        */

        if (
            bookletResult.rows.length !==
            uniqueBookletIds.length
        ) {
            throw new Error(
                "One or more selected booklets could not be found."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Booklets are Active
        |--------------------------------------------------------------------------
        */

        const inactiveBooklets =
            bookletResult.rows.filter(
                (booklet) =>
                    !booklet.is_active
            );

        if (
            inactiveBooklets.length > 0
        ) {
            throw new Error(
                "One or more selected booklets are inactive."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Booklets are Not Already Issued
        |--------------------------------------------------------------------------
        */

        const alreadyIssued =
            bookletResult.rows.filter(
                (booklet) =>
                    String(
                        booklet.status ?? ""
                    ).toUpperCase() ===
                        "ISSUED"
            );

        if (alreadyIssued.length > 0) {
            const issuedControls =
                alreadyIssued
                    .map(
                        (booklet) =>
                            booklet.control_no
                    )
                    .filter(Boolean)
                    .join(", ");

            throw new Error(
                issuedControls
                    ? `The following booklet(s) are already issued: ${issuedControls}.`
                    : "One or more selected booklets are already issued."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Generate Barangay RAT Number
        |--------------------------------------------------------------------------
        |
        | Example:
        |
        | BR-RAT-2026-A1B2C3
        |
        |--------------------------------------------------------------------------
        */

        const year =
            new Date()
                .getFullYear()
                .toString();

        let ratNo = "";

        let ratCreated = false;

        /*
        |--------------------------------------------------------------------------
        | Generate Unique RAT Number
        |--------------------------------------------------------------------------
        */

        for (
            let attempt = 0;
            attempt < 10;
            attempt++
        ) {
            const randomPart =
                Math.random()
                    .toString(36)
                    .substring(
                        2,
                        8
                    )
                    .toUpperCase();

            const candidate =
                `BR-RAT-${year}-${randomPart}`;

            const existing =
                await client.query(
                    `
                    SELECT id
                    FROM barangay_rat_headers
                    WHERE rat_no = $1
                    LIMIT 1
                    `,
                    [candidate]
                );

            if (
                existing.rows.length === 0
            ) {
                ratNo = candidate;
                ratCreated = true;
                break;
            }
        }

        if (!ratCreated) {
            throw new Error(
                "Unable to generate a unique RAT number."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Create RAT Header
        |--------------------------------------------------------------------------
        */

        const headerResult =
            await client.query(
                `
                INSERT INTO barangay_rat_headers (
                    rat_no,
                    barangay_user_id,
                    status,
                    remarks,
                    generated_at,
                    created_at,
                    updated_at,
                    is_active
                )

                VALUES (
                    $1,
                    $2,
                    'CREATED',
                    $3,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP,
                    TRUE
                )

                RETURNING
                    id,
                    rat_no,
                    barangay_user_id,
                    status,
                    remarks,
                    generated_at,
                    created_at
                `,
                [
                    ratNo,
                    barangayUserId,
                    remarks || null,
                ]
            );

        const header =
            headerResult.rows[0];

        /*
        |--------------------------------------------------------------------------
        | Create RAT Items
        |--------------------------------------------------------------------------
        */

        for (
            const bookletId of
                uniqueBookletIds
        ) {
            /*
            |--------------------------------------------------------------------------
            | Insert Barangay RAT Item
            |--------------------------------------------------------------------------
            */

            await client.query(
                `
                INSERT INTO barangay_rat_items (
                    rat_id,
                    booklet_id,
                    created_at,
                    updated_at,
                    is_active
                )

                VALUES (
                    $1,
                    $2,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP,
                    TRUE
                )
                `,
                [
                    header.id,
                    bookletId,
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | Mark Booklet as ISSUED
            |--------------------------------------------------------------------------
            */

            const updateBooklet =
                await client.query(
                    `
                    UPDATE smi_booklet_registration

                    SET
                        status = 'ISSUED',
                        issued_date = NOW(),
                        updated_at = NOW()

                    WHERE id = $1
                        AND is_active = TRUE
                    `,
                    [bookletId]
                );

            /*
            |--------------------------------------------------------------------------
            | Make Sure Booklet Was Actually Updated
            |--------------------------------------------------------------------------
            */

            if (
                updateBooklet.rowCount !==
                1
            ) {
                throw new Error(
                    "Failed to mark one of the selected booklets as ISSUED."
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | COMMIT
        |--------------------------------------------------------------------------
        */

        await client.query("COMMIT");

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return NextResponse.json(
            {
                success: true,

                message:
                    "Barangay RAT created successfully.",

                rat: {
                    id: header.id,

                    rat_no: header.rat_no,

                    barangay_user_id:
                        header.barangay_user_id,

                    status: header.status,

                    remarks: header.remarks,

                    generated_at:
                        header.generated_at,

                    created_at:
                        header.created_at,

                    booklet_count:
                        uniqueBookletIds.length,
                },
            },
            {
                status: 201,
            }
        );
    } catch (error: any) {
        /*
        |--------------------------------------------------------------------------
        | ROLLBACK
        |--------------------------------------------------------------------------
        */

        try {
            await client.query(
                "ROLLBACK"
            );
        } catch (rollbackError) {
            console.error(
                "Barangay RAT rollback error:",
                rollbackError
            );
        }

        console.error(
            "Barangay RAT POST error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    error?.message ??
                    "Failed to create Barangay RAT.",
            },
            {
                status: 500,
            }
        );
    } finally {
        /*
        |--------------------------------------------------------------------------
        | RELEASE CLIENT
        |--------------------------------------------------------------------------
        */

        client.release();
    }
}