
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  authorize,
} from "@/lib/authorize";

import {
  pool,
} from "@/lib/db";

import {
  MODULE_PATHS,
} from "@/lib/module-paths";

export async function POST(req: NextRequest) {
  let client: any = null;

  try {
    // ============================================================
    // AUTHORIZATION
    // ============================================================

    const user = await authorize(
      req,
      MODULE_PATHS.DIPP,
      "view"
    );

    // ============================================================
    // REQUEST BODY
    // ============================================================

    const body = await req.json();

    const {
      booklet_registration_id,
      receipt_date,
      payor,
      gender,
      payment_mode,
      cash_amount,
      check_amount,
      grand_total,

      owner_name,
      owner_address,
      owner_municipality,
      owner_province,

      transferee_name,
      transferee_address,
      transferee_municipality,
      transferee_province,

      buying_price,
      cattle_sex,
      cattle_age,

      title_of_ownership_number,
      issuing_municipality,
      issuing_province,

      transfer_date,

      brand_municipality,
      brand_owner,
    } = body;

    // ============================================================
    // VALIDATION
    // ============================================================

    if (!booklet_registration_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Booklet registration is required.",
        },
        { status: 400 }
      );
    }

    if (!receipt_date) {
      return NextResponse.json(
        {
          success: false,
          message: "Receipt date is required.",
        },
        { status: 400 }
      );
    }

    if (!payor || !String(payor).trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Payor is required.",
        },
        { status: 400 }
      );
    }

    if (!["Cash", "Check", "Cash + Check"].includes(payment_mode)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment mode.",
        },
        { status: 400 }
      );
    }

    const finalCashAmount = Number(cash_amount ?? 0);
    const finalCheckAmount = Number(check_amount ?? 0);
    const finalGrandTotal = Number(grand_total);

    if (
      !Number.isFinite(finalCashAmount) ||
      finalCashAmount < 0 ||
      !Number.isFinite(finalCheckAmount) ||
      finalCheckAmount < 0 ||
      !Number.isFinite(finalGrandTotal) ||
      finalGrandTotal < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid cash, check, or total amount.",
        },
        { status: 400 }
      );
    }

    const cashCents = Math.round(finalCashAmount * 100);
    const checkCents = Math.round(finalCheckAmount * 100);
    const totalCents = Math.round(finalGrandTotal * 100);

    if (cashCents + checkCents !== totalCents) {
      return NextResponse.json(
        {
          success: false,
          message: "Grand total must equal cash amount plus check amount.",
        },
        { status: 400 }
      );
    }

    if (
      (payment_mode === "Cash" && checkCents !== 0) ||
      (payment_mode === "Check" && cashCents !== 0) ||
      (
        payment_mode === "Cash + Check" &&
        (cashCents <= 0 || checkCents <= 0)
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Cash and check amounts do not match the payment mode.",
        },
        { status: 400 }
      );
    }

    const requiredFields: [string, unknown][] = [
      ["Current owner name", owner_name],
      ["Current owner address", owner_address],
      ["Current owner municipality", owner_municipality],
      ["Current owner province", owner_province],
      ["Transfer to name", transferee_name],
      ["Transfer to address", transferee_address],
      ["Transfer to municipality", transferee_municipality],
      ["Transfer to province", transferee_province],
      ["Title of ownership number", title_of_ownership_number],
      ["Issuing municipality", issuing_municipality],
      ["Issuing province", issuing_province],
      ["Brand municipality", brand_municipality],
      ["Brand owner", brand_owner],
    ];

    for (const [label, value] of requiredFields) {
      if (!value || !String(value).trim()) {
        return NextResponse.json(
          {
            success: false,
            message: `${label} is required.`,
          },
          { status: 400 }
        );
      }
    }

    if (!["Male", "Female"].includes(cattle_sex)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid cattle sex.",
        },
        { status: 400 }
      );
    }

    const finalBuyingPrice = Number(buying_price);

    if (
      !Number.isFinite(finalBuyingPrice) ||
      finalBuyingPrice < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid buying price.",
        },
        { status: 400 }
      );
    }

    let finalCattleAge: number | null = null;

    if (
      cattle_age !== undefined &&
      cattle_age !== null &&
      cattle_age !== ""
    ) {
      finalCattleAge = Number(cattle_age);

      if (
        !Number.isFinite(finalCattleAge) ||
        finalCattleAge < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid cattle age.",
          },
          { status: 400 }
        );
      }
    }

    if (!transfer_date) {
      return NextResponse.json(
        {
          success: false,
          message: "Transfer date is required.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // DATABASE CONNECTION
    // ============================================================

    client = await pool.connect();

    // ============================================================
    // BEGIN TRANSACTION
    // ============================================================

    await client.query("BEGIN");

    // ============================================================
    // LOCK AND VERIFY BOOKLET
    // ============================================================

    const bookletResult = await client.query(
      `
        SELECT
          sbr.id AS booklet_registration_id,
          sbr.current_or,
          sbr.ending_or,
          sbr.status AS booklet_status,

          lr.id AS lor_release_id,
          lr.status AS lor_status,
          lr.is_active,
          lr.accountable_officer_id,

          af.id AS accountable_form_id,
          af.form_code

        FROM smi_booklet_registration sbr

        INNER JOIN lor_releases lr
          ON lr.booklet_registration_id = sbr.id

        INNER JOIN accountable_forms af
          ON af.id = lr.accountable_form_id

        WHERE
          sbr.id = $1
          AND lr.accountable_officer_id = $2
          AND lr.is_active = TRUE
          AND lr.status = 'ACTIVE'

        FOR UPDATE
      `,
      [
        booklet_registration_id,
        user.id,
      ]
    );

    if (bookletResult.rows.length === 0) {
      throw new Error(
        "The selected booklet is not assigned to the current user."
      );
    }

    const booklet = bookletResult.rows[0];

    const formCode = String(
      booklet.form_code || ""
    ).trim().toUpperCase();

    if (formCode !== "AF52") {
      throw new Error(
        `Selected booklet is ${formCode}, not AF52.`
      );
    }

    const currentOR = Number(booklet.current_or);
    const endingOR = Number(booklet.ending_or);

    if (
      !Number.isFinite(currentOR) ||
      !Number.isFinite(endingOR) ||
      currentOR <= 0 ||
      currentOR > endingOR
    ) {
      throw new Error(
        "This AF52 booklet has no valid remaining O.R. numbers."
      );
    }

    // ============================================================
    // INSERT TRANSACTION HEADER
    // ============================================================

    const transactionResult = await client.query(
      `
        INSERT INTO dipp_transactions (
          or_number,
          receipt_date,
          booklet_registration_id,
          lor_release_id,
          accountable_form_id,
          collector_id,
          payor,
          gender,
          payment_mode,
          remarks,
          grand_total,
          status,
          encoded_by,
          transaction_type
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, 'ISSUED', $12, 'AF52'
        )
        RETURNING id, or_number
      `,
      [
        String(currentOR),
        receipt_date,
        booklet.booklet_registration_id,
        booklet.lor_release_id,
        booklet.accountable_form_id,
        booklet.accountable_officer_id,
        String(payor).trim(),
        gender || null,
        payment_mode,
        null,
        Number((totalCents / 100).toFixed(2)),
        user.id,
      ]
    );

    const transactionId = transactionResult.rows[0].id;
    const orNumber = transactionResult.rows[0].or_number;

    // ============================================================
    // INSERT AF52 DETAILS
    // ============================================================

    await client.query(
      `
        INSERT INTO dipp_af52_items (
          transaction_id,
          municipality,
          province,

          owner_name,
          owner_address,
          owner_municipality,
          owner_province,

          transferee_name,
          transferee_address,
          transferee_municipality,
          transferee_province,

          buying_price,
          cattle_sex,
          cattle_age,

          title_of_ownership_number,
          issuing_municipality,
          issuing_province,

          transfer_date,

          brand_municipality,
          brand_owner
        )
        VALUES (
          $1, $2, $3,
          $4, $5, $6, $7,
          $8, $9, $10, $11,
          $12, $13, $14,
          $15, $16, $17,
          $18,
          $19, $20
        )
      `,
      [
        transactionId,
        "Taytay",
        "Palawan",

        String(owner_name).trim(),
        String(owner_address).trim(),
        String(owner_municipality).trim(),
        String(owner_province).trim(),

        String(transferee_name).trim(),
        String(transferee_address).trim(),
        String(transferee_municipality).trim(),
        String(transferee_province).trim(),

        Number(finalBuyingPrice.toFixed(2)),
        cattle_sex,
        finalCattleAge,

        String(title_of_ownership_number).trim(),
        String(issuing_municipality).trim(),
        String(issuing_province).trim(),

        transfer_date,

        String(brand_municipality).trim(),
        String(brand_owner).trim(),
      ]
    );

    // ============================================================
    // ADVANCE BOOKLET
    // ============================================================

    const nextOR = currentOR + 1;

    const bookletStatus =
      nextOR > endingOR
        ? "CONSUMED"
        : "IN USE";

    await client.query(
      `
        UPDATE smi_booklet_registration
        SET
          current_or = $1,
          status = $2,
          updated_at = NOW()
        WHERE id = $3
      `,
      [
        nextOR,
        bookletStatus,
        booklet.booklet_registration_id,
      ]
    );

    // ============================================================
    // COMMIT
    // ============================================================

    await client.query("COMMIT");

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        message: "AF52 transaction successfully issued.",
        transaction_id: transactionId,
        or_number: orNumber,
        next_or: nextOR > endingOR ? null : nextOR,
        cash_amount: cashCents / 100,
        check_amount: checkCents / 100,
        grand_total: totalCents / 100,
        booklet_status: bookletStatus,
      },
      { status: 201 }
    );

  } catch (error: any) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Ignore rollback errors.
      }
    }

    console.error("====================================");
    console.error("AF52 TRANSACTION API ERROR");
    console.error(error);
    console.error("====================================");

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to process AF52 transaction.",
      },
      { status: 500 }
    );

  } finally {
    if (client) {
      client.release();
    }
  }
}
