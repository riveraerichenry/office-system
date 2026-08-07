import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";

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

    if (
      body.password &&
      body.password.trim() !== ""
    ) {
      const hashed =
        await bcrypt.hash(
          body.password,
          10
        );

      await pool.query(
        `
        UPDATE users
        SET
          username = $1,
          password = $2
        WHERE id = $3
        `,
        [
          body.username,
          hashed,
          decoded.id,
        ]
      );
    } else {
      await pool.query(
        `
        UPDATE users
        SET username = $1
        WHERE id = $2
        `,
        [
          body.username,
          decoded.id,
        ]
      );
    }

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