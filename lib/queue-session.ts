import { PoolClient } from "pg";
import { getPhilippineDate } from "@/lib/queue-date";

export type QueueSession = {
    id: number;
    queue_date: string;
    session_number: number;
};

export async function getActiveQueueSession(
    client: PoolClient
): Promise<QueueSession> {
    const queueDate = getPhilippineDate();

    const result = await client.query(
        `
        SELECT id, queue_date, session_number
        FROM queue_sessions
        WHERE queue_date = $1
        ORDER BY session_number DESC
        LIMIT 1
        `,
        [queueDate]
    );

    if (result.rows.length > 0) {
        return result.rows[0];
    }

    const created = await client.query(
        `
        INSERT INTO queue_sessions (
            queue_date,
            session_number
        )
        VALUES ($1, 1)
        RETURNING id, queue_date, session_number
        `,
        [queueDate]
    );

    return created.rows[0];
}

export async function createNewQueueSession(
    client: PoolClient,
    collectorId: string
): Promise<QueueSession> {
    const queueDate = getPhilippineDate();

    const result = await client.query(
        `
        SELECT COALESCE(MAX(session_number), 0) AS session_number
        FROM queue_sessions
        WHERE queue_date = $1
        `,
        [queueDate]
    );

    const nextSessionNumber =
        Number(result.rows[0].session_number) + 1;

    const created = await client.query(
        `
        INSERT INTO queue_sessions (
            queue_date,
            session_number,
            created_by
        )
        VALUES ($1, $2, $3)
        RETURNING id, queue_date, session_number
        `,
        [
            queueDate,
            nextSessionNumber,
            collectorId,
        ]
    );

    return created.rows[0];
}