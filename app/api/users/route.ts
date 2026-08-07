import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.username,
        u.full_name,
        u.is_active,
        u.created_at,
        u.updated_at,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', r.id,
              'role_name', r.role_name,
              'description', r.description
            )
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) AS roles

      FROM users u

      LEFT JOIN user_roles ur
        ON ur.user_id = u.id

      LEFT JOIN roles r
        ON r.id = ur.role_id

      GROUP BY
        u.id,
        u.username,
        u.full_name,
        u.is_active,
        u.created_at,
        u.updated_at

      ORDER BY
        u.full_name;
    `);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const {
      username,
      full_name,
      password,
      is_active,
      roles,
    } = await req.json();

    await client.query("BEGIN");

    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      `
      INSERT INTO users
      (
        username,
        full_name,
        password,
        is_active
      )
      VALUES
      ($1,$2,$3,$4)
      RETURNING id
      `,
      [
        username,
        full_name,
        hashedPassword,
        is_active,
      ]
    );

    const userId = userResult.rows[0].id;

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
        [userId, roleId]
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
      },
      {
        status: 500,
      }
    );

  } finally {
    client.release();
  }
}