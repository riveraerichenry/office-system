
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getQueueCollector } from "@/lib/queue-auth";
import { createNewQueueSession } from "@/lib/queue-session";

export async function POST() {
    const collector = await getQueueCollector();

    if (!collector) {
        return NextResponse.json(
            { success: false, message: "Unauthorized." },
            { status: 401 }
        );
    }

    const isAdmin = collector.roles.some(
        (role) => role.role_name === "Administrator"
    );

    if (!isAdmin) {
        return NextResponse.json(
            {
                success: false,
                message: "Administrator access required.",
            },
            { status: 403 }
        );
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Serialize all queue operations
        await client.query(
            "SELECT pg_advisory_xact_lock(782341)"
        );

        const session = await createNewQueueSession(
            client,
            collector.id
        );

        await client.query("COMMIT");

        return NextResponse.json({
            success: true,
            message: "Queue successfully reset.",
            session,
        });
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("QUEUE RESET ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to reset queue.",
            },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
