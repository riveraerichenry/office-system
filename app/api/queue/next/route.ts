
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getQueueCollector } from "@/lib/queue-auth";
import { getActiveQueueSession } from "@/lib/queue-session";
import { getPhilippineDate } from "@/lib/queue-date";

export async function POST(request: Request) {
    const collector = await getQueueCollector();

    if (!collector) {
        return NextResponse.json(
            { success: false, message: "Unauthorized." },
            { status: 401 }
        );
    }

    let body;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { success: false, message: "Invalid request." },
            { status: 400 }
        );
    }

    const windowNumber = Number(body.window_number);

    if (
        !Number.isInteger(windowNumber) ||
        windowNumber < 1
    ) {
        return NextResponse.json(
            { success: false, message: "Invalid window number." },
            { status: 400 }
        );
    }

    const queueDate = getPhilippineDate();
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            "SELECT pg_advisory_xact_lock(782341)"
        );

        const session = await getActiveQueueSession(client);

        const result = await client.query(
            `
            SELECT COALESCE(MAX(queue_number), 0) AS highest_number
            FROM queue_records
            WHERE queue_date = $1
              AND session_id = $2
              AND call_type = 'NEXT'
            `,
            [queueDate, session.id]
        );

        const nextNumber =
            Number(result.rows[0].highest_number) + 1;

        const inserted = await client.query(
            `
            INSERT INTO queue_records (
                queue_date,
                session_id,
                queue_number,
                collector_id,
                collector_name,
                call_type,
                window_number,
                called_at
            )
            VALUES ($1, $2, $3, $4, $5, 'NEXT', $6, NOW())
            RETURNING *
            `,
            [
                queueDate,
                session.id,
                nextNumber,
                collector.id,
                collector.full_name,
                windowNumber,
            ]
        );

        await client.query("COMMIT");

        return NextResponse.json({
            success: true,
            queue: inserted.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("QUEUE NEXT ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to generate queue number.",
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
