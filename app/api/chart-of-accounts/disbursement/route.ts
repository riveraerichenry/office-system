
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

function isValidUUID(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

function handleError(error: unknown) {
  console.error("Disbursement Accounts API Error:", error);

  const err = error as {
    code?: string;
    message?: string;
  };

  if (err.code === "23505") {
    return NextResponse.json(
      { success: false, message: "Account code already exists." },
      { status: 409 }
    );
  }

  if (err.code === "23503") {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid office, nature, or related record.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: err.message || "Internal server error.",
    },
    { status: 500 }
  );
}

const ACCOUNT_SELECT = `
  SELECT
    a.id,
    a.account_code,
    a.account_name,

    a.nature_id,
    n.nature_name,

    a.office_id,
    o.office_name,

    a.class_name,
    a.title_name,
    a.type_name,
    a.is_postable,
    a.status,
    a.created_by,
    a.created_at,
    a.updated_at

  FROM accounts_disbursement a

  LEFT JOIN account_disbursement_nature n
    ON n.id = a.nature_id

  LEFT JOIN offices o
    ON o.id = a.office_id
`;

// GET: ALL ACCOUNTS
export async function GET(request: NextRequest) {
  try {
    const userId = await authenticate();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const search =
      request.nextUrl.searchParams.get("search")?.trim() || "";

    const result = await pool.query(
      `
        ${ACCOUNT_SELECT}
        WHERE
          $1 = ''
          OR a.account_code ILIKE $2
          OR a.account_name ILIKE $2
          OR COALESCE(n.nature_name, '') ILIKE $2
          OR COALESCE(o.office_name, '') ILIKE $2
          OR COALESCE(a.class_name, '') ILIKE $2
          OR COALESCE(a.title_name, '') ILIKE $2
          OR COALESCE(a.type_name, '') ILIKE $2
        ORDER BY
          a.account_code ASC,
          a.account_name ASC
      `,
      [search, `%${search}%`]
    );

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    return handleError(error);
  }
}

// POST: CREATE ACCOUNT
export async function POST(request: NextRequest) {
  try {
    const userId = await authenticate();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      account_code,
      account_name,
      nature_id,
      office_id,
      class_name,
      title_name,
      type_name,
      is_postable,
    } = body;

    const cleanCode = String(account_code ?? "").trim();
    const cleanName = String(account_name ?? "").trim();

    if (!cleanCode || !cleanName) {
      return NextResponse.json(
        {
          success: false,
          message: "Account code and account name are required.",
        },
        { status: 400 }
      );
    }

    if (!isValidUUID(office_id)) {
      return NextResponse.json(
        { success: false, message: "A valid office is required." },
        { status: 400 }
      );
    }

    if (!isValidUUID(nature_id)) {
      return NextResponse.json(
        { success: false, message: "A valid nature is required." },
        { status: 400 }
      );
    }

    const duplicate = await pool.query(
      `
        SELECT id
        FROM accounts_disbursement
        WHERE account_code = $1
        LIMIT 1
      `,
      [cleanCode]
    );

    if (duplicate.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: "Account code already exists." },
        { status: 409 }
      );
    }

    // Confirm that the nature belongs to the selected office
    const nature = await pool.query(
      `
        SELECT id
        FROM account_disbursement_nature
        WHERE
          id = $1::uuid
          AND office_id = $2::uuid
          AND status = 'Active'
        LIMIT 1
      `,
      [nature_id, office_id]
    );

    if (nature.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected nature does not belong to the selected office or is inactive.",
        },
        { status: 400 }
      );
    }

    const office = await pool.query(
      `
        SELECT id
        FROM offices
        WHERE id = $1::uuid
        LIMIT 1
      `,
      [office_id]
    );

    if (office.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Selected office does not exist." },
        { status: 400 }
      );
    }

    const inserted = await pool.query(
      `
        INSERT INTO accounts_disbursement (
          account_code,
          account_name,
          nature_id,
          office_id,
          class_name,
          title_name,
          type_name,
          is_postable,
          created_by,
          created_at,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3::uuid,
          $4::uuid,
          $5,
          $6,
          $7,
          $8,
          $9,
          NOW(),
          NOW()
        )
        RETURNING id
      `,
      [
        cleanCode,
        cleanName,
        nature_id,
        office_id,
        typeof class_name === "string" ? class_name.trim() || null : null,
        typeof title_name === "string" ? title_name.trim() || null : null,
        typeof type_name === "string" ? type_name.trim() || null : null,
        Boolean(is_postable),
        userId,
      ]
    );

    const result = await pool.query(
      `
        ${ACCOUNT_SELECT}
        WHERE a.id = $1::uuid
        LIMIT 1
      `,
      [inserted.rows[0].id]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Disbursement account created successfully.",
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
