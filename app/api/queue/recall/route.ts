
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

        const latestNext = await client.query(
            `
            SELECT queue_number
            FROM queue_records
            WHERE queue_date = $1
              AND session_id = $2
              AND collector_id = $3
              AND call_type = 'NEXT'
            ORDER BY called_at DESC, id DESC
            LIMIT 1
            `,
            [
                queueDate,
                session.id,
                collector.id,
            ]
        );

        if (latestNext.rows.length === 0) {
            await client.query("ROLLBACK");

            return NextResponse.json(
                {
                    success: false,
                    message: "You have no queue number to recall in this session.",
                },
                { status: 400 }
            );
        }

        const queueNumber =
            latestNext.rows[0].queue_number;

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
            VALUES ($1, $2, $3, $4, $5, 'RECALL', $6, NOW())
            RETURNING *
            `,
            [
                queueDate,
                session.id,
                queueNumber,
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

        console.error("QUEUE RECALL ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to recall queue.",
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
