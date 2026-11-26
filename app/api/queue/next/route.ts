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

        const highestResult = await client.query(
            `
            SELECT COALESCE(MAX(queue_number), 0) AS highest_number
            FROM queue_records
            WHERE queue_date = $1
              AND call_type = 'NEXT'
            `,
            [queueDate]
        );

        const nextNumber =
            Number(highestResult.rows[0].highest_number) + 1;

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
            VALUES ($1, $2, $3, $4, 'NEXT', $5, NOW())
            RETURNING *
            `,
            [
                queueDate,
                nextNumber,
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