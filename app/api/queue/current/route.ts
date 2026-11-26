import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getPhilippineDate } from "@/lib/queue-date";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const windowId = searchParams.get("windowId");

    if (!windowId || !/^\d+$/.test(windowId)) {
      return NextResponse.json(
        { error: "Valid windowId is required" },
        { status: 400 }
      );
    }

    const queueDate = getPhilippineDate();

    const result = await pool.query(
      `
      SELECT
        w.id AS window_id,
        w.window_number,
        w.window_name,
        COALESCE(c.queue_number, 0) AS current_number,
        $2::date AS queue_date
      FROM queuing_windows w

      LEFT JOIN LATERAL (
        SELECT queue_number
        FROM queue_calls
        WHERE window_id = w.id
          AND queue_date = $2::date
        ORDER BY called_at DESC, id DESC
        LIMIT 1
      ) c ON TRUE

      WHERE w.id = $1
        AND w.is_active = TRUE
      `,
      [windowId, queueDate]
    );

    if (!result.rows.length) {
      return NextResponse.json(
        { error: "Window not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("QUEUE CURRENT ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load current queue" },
      { status: 500 }
    );
  }
}