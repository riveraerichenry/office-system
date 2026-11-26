import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getPhilippineDate } from "@/lib/queue-date";
import { getQueueCollector } from "@/lib/queue-auth";

export async function POST(request: Request) {
    const client = await pool.connect();

    try {
        const collector = await getQueueCollector();

        if (!collector) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const windowNumber = Number(body.window_number);

        if (!Number.isInteger(windowNumber) || windowNumber < 1) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please select a window.",
                },
                { status: 400 }
            );
        }

        const queueDate = getPhilippineDate();

        await client.query("BEGIN");

        await client.query(
            `SELECT pg_advisory_xact_lock(782341)`
        );

        const latestResult = await client.query(
            `
            SELECT
                queue_number,
                collector_id,
                collector_name
            FROM queue_records
            WHERE queue_date = $1
              AND collector_id = $2
              AND call_type = 'NEXT'
            ORDER BY called_at DESC, id DESC
            LIMIT 1
            `,
            [queueDate, String(collector.id)]
        );

        if (!latestResult.rows.length) {
            await client.query("ROLLBACK");

            return NextResponse.json(
                {
                    success: false,
                    message: "You have no queue number to recall today.",
                },
                { status: 400 }
            );
        }

        const latest = latestResult.rows[0];

        const result = await client.query(
            `
            INSERT INTO queue_records (
                queue_date,
                queue_number,
                collector_id,
                collector_name,
                call_type,
                window_number,
                called_at
            )
            VALUES ($1, $2, $3, $4, 'RECALL', $5, NOW())
            RETURNING *
            `,
            [
                queueDate,
                latest.queue_number,
                String(collector.id),
                collector.full_name,
                windowNumber,
            ]
        );

        await client.query("COMMIT");

        const record = result.rows[0];

        return NextResponse.json({
            success: true,
            queue: {
                id: record.id,
                queue_number: Number(record.queue_number),
                formatted_number: String(record.queue_number).padStart(3, "0"),
                collector_id: record.collector_id,
                collector_name: record.collector_name,
                call_type: record.call_type,
                window_number: Number(record.window_number),
                called_at: record.called_at,
            },
        });
    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch {}

        console.error("QUEUE RECALL ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to recall queue number.",
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}