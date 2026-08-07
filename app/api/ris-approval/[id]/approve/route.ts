import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { MODULE_PATHS } from "@/lib/module-paths";
import { createAudit } from "@/lib/audit";
import { notify } from "@/lib/notifications";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  req: NextRequest,
  { params }: Params
) {
  try {

    const token =
      req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const user =
      verifyToken(token) as any;

    if (
      !hasPermission(
        user.modules,
        MODULE_PATHS.RIS_APPROVAL,
        "approve"
      )
    ) {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    const { id } =
      await params;

    const existing =
      await pool.query(
        `
        SELECT *

        FROM ris_requests

        WHERE
          id=$1
        `,
        [id]
      );

    if (
      existing.rows.length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "RIS not found.",
        },
        {
          status: 404,
        }
      );
    }

    const ris =
      existing.rows[0];

    if (
      ris.status !==
      "PENDING"
    ) {
      return NextResponse.json(
        {
          message:
            "RIS is already processed.",
        },
        {
          status: 400,
        }
      );
    }

    const client =
      await pool.connect();

    try {

      await client.query(
        "BEGIN"
      );

      await client.query(
        `
        UPDATE ris_requests

        SET

            status='APPROVED',

            approved_by=$1,

            approved_date=NOW(),

            reviewed_at=NOW(),

            updated_by=$1,

            updated_at=NOW()

        WHERE id=$2
        `,
        [
          user.id,
          id,
        ]
      );

      await client.query(
        `
        INSERT INTO ris_workflow
        (
          ris_request_id,
          status,
          remarks,
          action_by
        )
        VALUES
        (
          $1,
          'APPROVED',
          'RIS approved.',
          $2
        )
        `,
        [
          id,
          user.id,
        ]
      );

      await client.query(
        "COMMIT"
      );

      await createAudit({
        module: "RIS Approval",
        recordId: id,
        action: "APPROVE",
        description:
          `Approved ${ris.ris_no}`,
        userId: user.id,
      });

      await notify({
        userIds: [
          ris.requested_by,
        ],
        title:
          "RIS Approved",
        message:
          `${ris.ris_no} has been approved.`,
        module: "RIS",
        recordId: id,
        notificationType:
          "SUCCESS",
        actionUrl:
          `/ris/${id}`,
      });

      return NextResponse.json({
        success: true,
        message:
          "RIS approved successfully.",
      });

    } catch (err) {

      await client.query(
        "ROLLBACK"
      );

      throw err;

    } finally {

      client.release();

    }

  } catch (err: any) {

    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Server Error",
      },
      {
        status: 500,
      }
    );
  }
}