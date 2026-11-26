import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getPhilippineDate } from "@/lib/queue-date";
import { getQueueCollector } from "@/lib/queue-auth";

export async function GET() {
    try {
        const collector = await getQueueCollector();

        if (!collector) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const queueDate = getPhilippineDate();

        const result = await pool.query(
            `
            SELECT
                queue_number,
                called_at
            FROM queue_records
            WHERE queue_date = $1
              AND collector_id = $2
              AND call_type = 'NEXT'
            ORDER BY called_at DESC, id DESC
            LIMIT 1
            `,
            [queueDate, String(collector.id)]
        );

        const current = result.rows[0] ?? null;

        return NextResponse.json({
            success: true,
            collector: {
                id: String(collector.id),
                full_name: collector.full_name,
            },
            current: current
                ? {
                    queue_number: Number(current.queue_number),
                    formatted_number: String(current.queue_number).padStart(3, "0"),
                    called_at: current.called_at,
                }
                : null,
        });
    } catch (error) {
        console.error("MY CURRENT QUEUE ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to load current queue.",
            },
            { status: 500 }
        );
    }
}