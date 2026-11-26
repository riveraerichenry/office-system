import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export type QueueCollector = {
    id: string;
    username: string;
    full_name: string;
    roles: {
        id: string;
        role_name: string;
    }[];
};

type JwtPayload = {
    id: string;
    username: string;
    full_name: string;

    roles: {
        id: string;
        role_name: string;
    }[];

    iat?: number;
    exp?: number;
};

export async function getQueueCollector(): Promise<QueueCollector | null> {
    try {
        const cookieStore = await cookies();

        const token = cookieStore.get("token")?.value;

        if (!token || !process.env.JWT_SECRET) {
            return null;
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        ) as JwtPayload;

        if (
            !decoded.id ||
            !decoded.username ||
            !decoded.full_name
        ) {
            return null;
        }

        return {
            id: String(decoded.id),
            username: decoded.username,
            full_name: decoded.full_name,
            roles: decoded.roles ?? [],
        };

    } catch (error) {
        console.error(
            "QUEUE AUTH ERROR:",
            error
        );

        return null;
    }
}