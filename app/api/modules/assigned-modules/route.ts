import {
  NextRequest,
  NextResponse,
} from "next/server";
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
        {
          success: false,
          error: "Unauthorized",
        },
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
        SELECT
          m.id,
          m.module_name,
          m.icon,
          m.path,
          m.description,
          um.sort_order
        FROM user_modules um
        INNER JOIN modules m
          ON m.id = um.module_id
        WHERE um.user_id = $1
          AND um.is_visible = TRUE
          AND m.is_active = TRUE
        ORDER BY um.sort_order
        `,
        [decoded.id]
      );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}