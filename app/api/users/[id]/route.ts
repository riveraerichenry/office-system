import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcrypt";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  req: NextRequest,
  { params }: Params
) {
  const client = await pool.connect();

  try {
    const { id } = await params;

    const {
      username,
      full_name,
      password,
      is_active,
      roles,
    } = await req.json();

    await client.query("BEGIN");

    // Update user info
    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);

      await client.query(
        `
        UPDATE users
        SET
          username=$1,
          full_name=$2,
          password=$3,
          is_active=$4,
          updated_at=NOW()
        WHERE id=$5
        `,
        [
          username,
          full_name,
          hashed,
          is_active,
          id,
        ]
      );
    } else {
      await client.query(
        `
        UPDATE users
        SET
          username=$1,
          full_name=$2,
          is_active=$3,
          updated_at=NOW()
        WHERE id=$4
        `,
        [
          username,
          full_name,
          is_active,
          id,
        ]
      );
    }

    // Remove old roles
    await client.query(
      `
      DELETE FROM user_roles
      WHERE user_id=$1
      `,
      [id]
    );

    // Insert new roles
    for (const roleId of roles) {
      await client.query(
        `
        INSERT INTO user_roles
        (
          user_id,
          role_id
        )
        VALUES
        ($1,$2)
        `,
        [id, roleId]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user.",
      },
      {
        status: 500,
      }
    );

  } finally {
    client.release();
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    await pool.query(
      `
      DELETE FROM users
      WHERE id=$1
      `,
      [id]
    );

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete user.",
      },
      {
        status: 500,
      }
    );
  }
}