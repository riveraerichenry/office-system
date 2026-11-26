import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const body = await request.json();

    const {
      dv_id,
      bank_account_id,
      booklet_registration_id,
      check_date,
      remarks,
    } = body;

    if (
      !dv_id ||
      !bank_account_id ||
      !booklet_registration_id ||
      !check_date
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields.",
        },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // =========================================================
    // 1. LOCK AND FETCH DV
    // =========================================================
    const dvResult = await client.query(
      `
      SELECT
        id,
        dv_no,
        grand_total,
        status
      FROM disbursement_vouchers
      WHERE id = $1
      FOR UPDATE
      `,
      [dv_id]
    );

    if (dvResult.rows.length === 0) {
      throw new Error("Disbursement voucher not found.");
    }

    const dv = dvResult.rows[0];

    // =========================================================
    // 2. CHECK IF DV IS ALREADY ASSIGNED
    // =========================================================
    const existingAssignment = await client.query(
      `
      SELECT id
      FROM budget_check_issuance
      WHERE dv_id = $1
      `,
      [dv_id]
    );

    if (existingAssignment.rows.length > 0) {
      throw new Error(
        "This DV already has an assigned check."
      );
    }

    // =========================================================
    // 3. LOCK AND FETCH CHECK BOOKLET
    // =========================================================
    const bookletResult = await client.query(
      `
      SELECT
        id,
        bank_account_id,
        current_check_no,
        ending_check_no,
        issued_checks,
        remaining_checks,
        total_checks
      FROM check_booklet_registration
      WHERE id = $1
      FOR UPDATE
      `,
      [booklet_registration_id]
    );

    if (bookletResult.rows.length === 0) {
      throw new Error(
        "Registered check booklet not found."
      );
    }

    const booklet = bookletResult.rows[0];

    // =========================================================
    // 4. VALIDATE BANK ACCOUNT
    // =========================================================
    if (
      String(booklet.bank_account_id) !==
      String(bank_account_id)
    ) {
      throw new Error(
        "The registered booklet does not belong to the selected bank account."
      );
    }

    // =========================================================
    // 5. VALIDATE REMAINING CHECKS
    // =========================================================
    if (Number(booklet.remaining_checks) <= 0) {
      throw new Error(
        "This check booklet has no remaining checks."
      );
    }

    if (!booklet.current_check_no) {
      throw new Error(
        "No current check number is registered."
      );
    }

    // =========================================================
    // 6. VALIDATE CHECK NUMBER
    // =========================================================
    const checkNumber = String(
      booklet.current_check_no
    ).trim();

    const endingCheckNumber = String(
      booklet.ending_check_no
    ).trim();

    if (!/^\d+$/.test(checkNumber)) {
      throw new Error(
        "The current check number must be numeric."
      );
    }

    if (!/^\d+$/.test(endingCheckNumber)) {
      throw new Error(
        "The ending check number must be numeric."
      );
    }

    const currentCheckBigInt = BigInt(checkNumber);
    const endingCheckBigInt = BigInt(endingCheckNumber);

    if (currentCheckBigInt > endingCheckBigInt) {
      throw new Error(
        "The current check number exceeds the booklet's ending check number."
      );
    }

    // =========================================================
    // 7. CHECK FOR DUPLICATE CHECK NUMBER
    // =========================================================
    const duplicateCheck = await client.query(
      `
      SELECT id
      FROM budget_check_issuance
      WHERE bank_account_id = $1
        AND check_number = $2
      `,
      [bank_account_id, checkNumber]
    );

    if (duplicateCheck.rows.length > 0) {
      throw new Error(
        `Check number ${checkNumber} has already been assigned.`
      );
    }

    // =========================================================
    // 8. COMPUTE NEXT CHECK NUMBER
    // =========================================================
    const nextBigInt =
      currentCheckBigInt + BigInt(1);

    const paddedNextCheckNumber = nextBigInt
      .toString()
      .padStart(checkNumber.length, "0");

    const hasNextCheck =
      nextBigInt <= endingCheckBigInt &&
      Number(booklet.remaining_checks) > 1;

    const nextCheckNumber = hasNextCheck
      ? paddedNextCheckNumber
      : null;

    // =========================================================
    // 9. UPDATE BOOKLET COUNTS
    // =========================================================
    const newIssuedChecks =
      Number(booklet.issued_checks || 0) + 1;

    const newRemainingChecks =
      Number(booklet.remaining_checks || 0) - 1;

    // =========================================================
    // 10. INSERT CHECK ASSIGNMENT
    // =========================================================
    await client.query(
      `
      INSERT INTO budget_check_issuance (
        dv_id,
        dv_no,
        check_number,
        check_date,
        bank_account_id,
        booklet_registration_id,
        amount,
        remarks,
        status
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        'ASSIGNED'
      )
      `,
      [
        dv.id,
        dv.dv_no,
        checkNumber,
        check_date,
        bank_account_id,
        booklet_registration_id,
        dv.grand_total,
        remarks || null,
      ]
    );

    // =========================================================
    // 11. UPDATE CHECK BOOKLET
    // =========================================================
    await client.query(
      `
      UPDATE check_booklet_registration
      SET
        current_check_no = $1,
        issued_checks = $2,
        remaining_checks = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      `,
      [
        nextCheckNumber,
        newIssuedChecks,
        newRemainingChecks,
        booklet_registration_id,
      ]
    );

    // =========================================================
    // 12. COMMIT
    // =========================================================
    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Check assigned successfully.",
      data: {
        dv_id: dv.id,
        dv_no: dv.dv_no,
        check_number: checkNumber,
        check_date,
        amount: dv.grand_total,
        bank_account_id,
        booklet_registration_id,
        next_check_number: nextCheckNumber,
        remaining_checks: newRemainingChecks,
      },
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "Check assignment rollback error:",
        rollbackError
      );
    }

    console.error(
      "Check assignment API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to assign check.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}