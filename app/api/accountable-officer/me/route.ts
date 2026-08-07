import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";

export async function GET(
  req: NextRequest
) {
  try {
    const token =
      req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { exists: false },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as any;

    const result =
      await pool.query(
        `
        SELECT id
        FROM accountable_officers
        WHERE user_id = $1
      `,
        [decoded.id]
      );

    return NextResponse.json({
      exists:
        result.rows.length > 0,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { exists: false },
      { status: 500 }
    );
  }
}