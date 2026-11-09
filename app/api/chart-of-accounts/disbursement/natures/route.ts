
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getAuthenticatedUserId(decoded: string | jwt.JwtPayload) {
  if (typeof decoded === "string") return null;

  const userId = decoded.userId ?? decoded.id;

  if (typeof userId !== "string") return null;

  return UUID_REGEX.test(userId) ? userId : null;
}

async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token || !process.env.JWT_SECRET) return null;

  try {
    return getAuthenticatedUserId(
      jwt.verify(token, process.env.JWT_SECRET)
    );
  } catch {
    return null;
  }
}

// GET: ACTIVE NATURES BY OFFICE
export async function GET(request: NextRequest) {
  try {
    const userId = await authenticate();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const officeId =
      request.nextUrl.searchParams.get("office_id")?.trim() || "";

    if (!UUID_REGEX.test(officeId)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid office ID is required.",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        SELECT
          id,
          nature_name,
          office_id,
          status
        FROM account_disbursement_nature
        WHERE
          office_id = $1::uuid
          AND status = 'Active'
        ORDER BY nature_name ASC
      `,
      [officeId]
    );

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Disbursement Nature API Error:", error);

    const err = error as { message?: string };

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Internal server error.",
      },
      { status: 500 }
    );
  }
}
