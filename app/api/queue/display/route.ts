import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getPhilippineDate } from "@/lib/queue-date";

export async function GET() {
    try {
        const queueDate = getPhilippineDate();

        // Latest global call, including RECALL
        const currentResult = await pool.query(
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
            ORDER BY called_at DESC, id DESC
            LIMIT 1
            `,
            [queueDate]
        );

        // Highest issued NEXT number
        const highestResult = await pool.query(
            `
            SELECT COALESCE(MAX(queue_number), 0) AS highest_number
            FROM queue_records
            WHERE queue_date = $1
              AND call_type = 'NEXT'
            `,
            [queueDate]
        );

        // Total numbers issued
        const totalResult = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM queue_records
            WHERE queue_date = $1
              AND call_type = 'NEXT'
            `,
            [queueDate]
        );

        // Latest NEXT number for each collector
        const collectorsResult = await pool.query(
            `
            SELECT DISTINCT ON (collector_id)
                collector_id,
                collector_name,
                queue_number,
                window_number,
                called_at
            FROM queue_records
            WHERE queue_date = $1
              AND call_type = 'NEXT'
            ORDER BY collector_id, called_at DESC, id DESC
            `,
            [queueDate]
        );

        // Recent calls, NEXT and RECALL
        const recentResult = await pool.query(
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
            ORDER BY called_at DESC, id DESC
            LIMIT 15
            `,
            [queueDate]
        );

        const current = currentResult.rows[0] ?? null;

        const collectors = collectorsResult.rows.map(
            (collector: any) => ({
                collector_id: collector.collector_id,
                collector_name: collector.collector_name,
                queue_number: Number(collector.queue_number),
                formatted_number: String(collector.queue_number).padStart(3, "0"),
                window_number: collector.window_number
                    ? Number(collector.window_number)
                    : null,
                called_at: collector.called_at,
            })
        );

        const recentCalls = recentResult.rows.map(
            (call: any) => ({
                id: call.id,
                queue_number: Number(call.queue_number),
                formatted_number: String(call.queue_number).padStart(3, "0"),
                collector_id: call.collector_id,
                collector_name: call.collector_name,
                call_type: call.call_type,
                window_number: call.window_number
                    ? Number(call.window_number)
                    : null,
                called_at: call.called_at,
            })
        );

        return NextResponse.json({
            success: true,
            queue_date: queueDate,

            current: current
                ? {
                    id: current.id,
                    queue_number: Number(current.queue_number),
                    formatted_number: String(current.queue_number).padStart(3, "0"),
                    collector_id: current.collector_id,
                    collector_name: current.collector_name,
                    call_type: current.call_type,
                    window_number: current.window_number
                        ? Number(current.window_number)
                        : null,
                    called_at: current.called_at,
                }
                : null,

            highest_number: Number(
                highestResult.rows[0].highest_number
            ),

            formatted_highest_number: String(
                highestResult.rows[0].highest_number
            ).padStart(3, "0"),

            total_issued: Number(
                totalResult.rows[0].total
            ),

            collectors,
            recent_calls: recentCalls,
        });
    } catch (error) {
        console.error("QUEUE DISPLAY ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to load queue display.",
            },
            { status: 500 }
        );
    }
}