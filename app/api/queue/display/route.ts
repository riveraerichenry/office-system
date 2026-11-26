
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getActiveQueueSession } from "@/lib/queue-session";
import { getPhilippineDate } from "@/lib/queue-date";

export async function GET() {
    const queueDate = getPhilippineDate();
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(
            "SELECT pg_advisory_xact_lock(782341)"
        );

        const session = await getActiveQueueSession(client);

        const currentResult = await client.query(
            `
            SELECT
                id,
                queue_number,
                collector_id,
                collector_name,
                call_type,
                window_number,
                called_at
            FROM queue_records
            WHERE queue_date = $1
              AND session_id = $2
              AND call_type IN ('NEXT', 'RECALL')
            ORDER BY called_at DESC, id DESC
            LIMIT 1
            `,
            [queueDate, session.id]
        );

        const highestResult = await client.query(
            `
            SELECT COALESCE(MAX(queue_number), 0) AS highest_number
            FROM queue_records
            WHERE queue_date = $1
              AND session_id = $2
              AND call_type = 'NEXT'
            `,
            [queueDate, session.id]
        );

        const totalResult = await client.query(
            `
            SELECT COUNT(*) AS total_issued
            FROM queue_records
            WHERE queue_date = $1
              AND session_id = $2
              AND call_type = 'NEXT'
            `,
            [queueDate, session.id]
        );

        const collectorsResult = await client.query(
            `
            SELECT DISTINCT ON (collector_id)
                collector_id,
                collector_name,
                queue_number,
                called_at
            FROM queue_records
            WHERE queue_date = $1
              AND session_id = $2
              AND call_type = 'NEXT'
            ORDER BY collector_id, called_at DESC, id DESC
            `,
            [queueDate, session.id]
        );

        const recentResult = await client.query(
            `
            SELECT
                id,
                queue_number,
                collector_id,
                collector_name,
                call_type,
                window_number,
                called_at
            FROM queue_records
            WHERE queue_date = $1
              AND session_id = $2
              AND call_type IN ('NEXT', 'RECALL')
            ORDER BY called_at DESC, id DESC
            LIMIT 15
            `,
            [queueDate, session.id]
        );

        await client.query("COMMIT");

        const current = currentResult.rows[0] ?? null;

        const highestNumber = Number(
            highestResult.rows[0].highest_number
        );

        const totalIssued = Number(
            totalResult.rows[0].total_issued
        );

        const formatQueue = (number: number) =>
            String(number).padStart(3, "0");

        return NextResponse.json({
            success: true,
            queue_date: queueDate,

            session: {
                id: session.id,
                session_number: session.session_number,
            },

            current: current
                ? {
                    ...current,
                    queue_number: Number(current.queue_number),
                    formatted_queue_number: formatQueue(
                        Number(current.queue_number)
                    ),
                    window_number: Number(current.window_number),
                }
                : null,

            highest_number: highestNumber,
            formatted_highest_number: formatQueue(highestNumber),
            total_issued: totalIssued,

            collectors: collectorsResult.rows.map((item) => ({
                ...item,
                queue_number: Number(item.queue_number),
                formatted_queue_number: formatQueue(
                    Number(item.queue_number)
                ),
            })),

            recent_calls: recentResult.rows.map((item) => ({
                ...item,
                queue_number: Number(item.queue_number),
                formatted_queue_number: formatQueue(
                    Number(item.queue_number)
                ),
                window_number: Number(item.window_number),
            })),
        });
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("QUEUE DISPLAY ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to retrieve queue display.",
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
