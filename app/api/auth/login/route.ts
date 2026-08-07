import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcrypt";
import { createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // ---------------------------------------------
    // Get user + roles
    // ---------------------------------------------

    const result = await pool.query(
      `
      SELECT
          u.id,
          u.username,
          u.password,
          u.full_name,
          u.is_active,

          COALESCE(
            json_agg(
              json_build_object(
                'id', r.id,
                'role_name', r.role_name
              )
            ) FILTER (WHERE r.id IS NOT NULL),
            '[]'
          ) AS roles

      FROM users u

      LEFT JOIN user_roles ur
        ON ur.user_id = u.id

      LEFT JOIN roles r
        ON r.id = ur.role_id

      WHERE
        u.username = $1
        AND u.is_active = TRUE

      GROUP BY
        u.id,
        u.username,
        u.password,
        u.full_name,
        u.is_active
      `,
      [username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          message: "Invalid username or password",
        },
        {
          status: 401,
        }
      );
    }

    const user = result.rows[0];

    // ---------------------------------------------
    // Verify Password
    // ---------------------------------------------

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid) {
      return NextResponse.json(
        {
          message: "Invalid username or password",
        },
        {
          status: 401,
        }
      );
    }

    // ---------------------------------------------
    // Get Modules From Roles
    // ---------------------------------------------

    const roleIds = user.roles.map(
      (role: any) => role.id
    );

    let modules: any[] = [];

    if (roleIds.length > 0) {
      const moduleResult = await pool.query(
        `
        SELECT

            m.id,
            m.module_name,
            m.path,
            m.icon,
            m.background_color,

            BOOL_OR(rm.can_view)     AS can_view,
            BOOL_OR(rm.can_add)      AS can_add,
            BOOL_OR(rm.can_edit)     AS can_edit,
            BOOL_OR(rm.can_delete)   AS can_delete,
            BOOL_OR(rm.can_approve)  AS can_approve,
            BOOL_OR(rm.can_print)    AS can_print

        FROM role_modules rm

        INNER JOIN modules m
            ON m.id = rm.module_id

        WHERE rm.role_id = ANY($1::uuid[])

        GROUP BY
            m.id,
            m.module_name,
            m.path,
            m.icon,
            m.background_color,
            m.sort_order

        ORDER BY
            m.sort_order,
            m.module_name
        `,
        [roleIds]
      );

      modules = moduleResult.rows;
    }

    console.log("========== LOGIN ==========");
    console.log("USER:", user.username);
    console.log("ROLES:", user.roles);
    console.log("MODULES:", modules);
    console.log("===========================");

    // ---------------------------------------------
    // Administrator?
    // ---------------------------------------------

    const isAdmin = user.roles.some(
      (role: any) =>
        role.role_name === "Administrator"
    );

    // ---------------------------------------------
    // Create JWT
    // ---------------------------------------------

    const token = createToken({
  id: user.id,
  username: user.username,
  full_name: user.full_name,
  roles: user.roles,
});


    console.log("JWT LENGTH:", token.length);
    // ---------------------------------------------
    // Response
    // ---------------------------------------------

    const response = NextResponse.json({
      success: true,

      redirectTo: isAdmin
        ? "/admin/dashboard"
        : "/dashboard",

      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        roles: user.roles,
        modules,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        message: "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}