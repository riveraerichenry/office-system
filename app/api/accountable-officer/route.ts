import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET(
  req: NextRequest
) {
  try {
    const token =
      req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          exists: false,
          data: null,
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
          ao.id,
          ao.first_name,
          ao.middle_name,
          ao.last_name,
          ao.suffix,
          ao.position,
          ao.office,
          ao.designation,

          u.username,
          u.role,
          u.is_active

        FROM accountable_officers ao
        INNER JOIN users u
          ON u.id = ao.user_id
        WHERE ao.user_id = $1
        `,
        [decoded.id]
      );

    if (
      result.rows.length === 0
    ) {
      return NextResponse.json({
        exists: false,
        data: null,
      });
    }

    return NextResponse.json({
      exists: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        exists: false,
        data: null,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest
) {
  try {
    const token =
      req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as any;

    const body = await req.json();

    await pool.query(
      `
      INSERT INTO accountable_officers (
        id,
        user_id,
        first_name,
        middle_name,
        last_name,
        suffix,
        position,
        office,
        designation
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `,
      [
        randomUUID(),
        decoded.id,
        body.first_name,
        body.middle_name,
        body.last_name,
        body.suffix,
        body.position,
        body.office,
        body.designation,
      ]
    );

    return NextResponse.json({
      success: true,
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


export async function PUT(
  req: NextRequest
) {
  try {
    const token =
      req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as any;

    const body = await req.json();

    await pool.query(
      `
      UPDATE accountable_officers
      SET
        first_name = $1,
        middle_name = $2,
        last_name = $3,
        suffix = $4,
        position = $5,
        office = $6,
        designation = $7
      WHERE user_id = $8
      `,
      [
        body.first_name,
        body.middle_name,
        body.last_name,
        body.suffix,
        body.position,
        body.office,
        body.designation,
        decoded.id,
      ]
    );

    return NextResponse.json({
      success: true,
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