"use client";

type Props = {
  totalAmount: number;
};

function formatAmount(value: number) {
  return Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ConsolidatedRCDSummary({
  totalAmount,
}: Props) {
  const formattedTotal = formatAmount(totalAmount);

  return (
    <section
      style={{
        width: "100%",
        marginTop: "20px",
        marginBottom: "8px",
      }}
    >
      {/* ============================================================
          D. SUMMARY OF COLLECTIONS AND REMITTANCES / DEPOSITS
      ============================================================ */}

      <div
        style={{
          width: "100%",
          borderTop: "1px solid #000",
          borderLeft: "1px solid #000",
          borderRight: "1px solid #000",

          paddingTop: "2px",
          paddingBottom: "2px",
          paddingLeft: "6px",
          paddingRight: "6px",

          fontFamily: "Arial, sans-serif",
          fontSize: "9px",
          lineHeight: "1.1",
          fontWeight: 400,
        }}
      >
        {/* ==========================================================
            TITLE
        =========================================================== */}

        <div
          style={{
            marginTop: "20px",
            marginBottom: "7px",

            fontFamily: "Arial, sans-serif",
            fontSize: "12px",
            lineHeight: "1.1",
            fontWeight: 700,
          }}
        >
          D. SUMMARY OF COLLECTIONS AND REMITTANCES / DEPOSITS - List of Check
        </div>

        {/* ==========================================================
            BEGINNING BALANCE
        =========================================================== */}

        <div
          style={{
            display: "flex",
            width: "100%",

            marginTop: "0px",
            marginBottom: "6px",

            fontFamily: "Arial, sans-serif",
            fontSize: "12px",
            lineHeight: "1.1",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: "36%",
              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              lineHeight: "1.1",
              fontWeight: 600,
            }}
          >
            Beginning Balance
          </div>

          <div
            style={{
              width: "14%",
              textAlign: "right",

              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              lineHeight: "1.1",
              fontWeight: 600,
            }}
          >
            0.00
          </div>
        </div>

        {/* ==========================================================
            ADD: COLLECTIONS
        =========================================================== */}

        <div
          style={{
            display: "flex",
            width: "100%",

            marginTop: "0px",
            marginBottom: "6px",

            fontFamily: "Arial, sans-serif",
            fontSize: "9px",
            lineHeight: "1.1",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: "36%",
              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              lineHeight: "1.1",
              fontWeight: 600,
            }}
          >
            ADD: &nbsp; Collections
          </div>

          <div
            style={{
              width: "14%",
              textAlign: "right",

              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              lineHeight: "1.1",
              fontWeight: 600,
            }}
          >
            0.00
          </div>
        </div>

        {/* ==========================================================
            CASH
        =========================================================== */}

        <div
          style={{
            display: "flex",
            width: "100%",

            marginTop: "0px",
            marginBottom: "7px",

            fontFamily: "Arial, sans-serif",
            fontSize: "10px",
            lineHeight: "1.1",
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: "36%",

              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              lineHeight: "1.1",
              fontWeight: 700,
            }}
          >
            CASH
          </div>

          <div
            style={{
              width: "14%",
              textAlign: "right",

              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
              lineHeight: "1.1",
              fontWeight: 700,
            }}
          >
            {formattedTotal}
          </div>
        </div>

        {/* ==========================================================
            CHECKS
        =========================================================== */}

        <div
          style={{
            display: "flex",
            width: "100%",

            marginTop: "0px",
            marginBottom: "6px",

            fontFamily: "Arial, sans-serif",
            fontSize: "9px",
            lineHeight: "1.1",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: "36%",

              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              lineHeight: "1.1",
              fontWeight: 600,
            }}
          >
            CHECKS
          </div>

          <div
            style={{
              width: "14%",
              textAlign: "right",

              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              lineHeight: "1.1",
              fontWeight: 600,
            }}
          >
            .00
          </div>
        </div>

        {/* ==========================================================
            BLANK AMOUNT LINE
        =========================================================== */}

        <div
          style={{
            display: "flex",
            width: "100%",

            marginTop: "0px",
            marginBottom: "6px",

            fontFamily: "Arial, sans-serif",
            fontSize: "9px",
            lineHeight: "1.1",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: "36%",

              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              lineHeight: "1.1",
              fontWeight: 600,
            }}
          >
            &nbsp;
          </div>

          <div
            style={{
              width: "14%",
              textAlign: "right",

              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              lineHeight: "1.1",
              fontWeight: 600,
            }}
          >
            0.00
          </div>
        </div>

        {/* ==========================================================
            LESS: REMITTANCES / DEPOSITS TO
        =========================================================== */}

        <div
          style={{
            display: "flex",
            width: "100%",

            marginTop: "0px",
            marginBottom: "6px",

            fontFamily: "Arial, sans-serif",
            fontSize: "9px",
            lineHeight: "1.1",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: "36%",

              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              lineHeight: "1.1",
              fontWeight: 600,
            }}
          >
            LESS: Remittances / Deposits to
          </div>

          <div
            style={{
              width: "14%",
              textAlign: "right",

              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              lineHeight: "1.1",
              fontWeight: 600,
            }}
          >
            0.00
          </div>
        </div>

        {/* ==========================================================
            CASHIERS
        =========================================================== */}

        <div
          style={{
            display: "flex",
            width: "100%",

            marginTop: "0px",
            marginBottom: "7px",

            fontFamily: "Arial, sans-serif",
            fontSize: "10px",
            lineHeight: "1.1",
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: "36%",

              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              lineHeight: "1.1",
              fontWeight: 700,
            }}
          >
            Cashiers
          </div>

          <div
            style={{
              width: "14%",
              textAlign: "right",

              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
              lineHeight: "1.1",
              fontWeight: 700,
            }}
          >
            {formattedTotal}
          </div>
        </div>

        {/* ==========================================================
            TREASURER / DEPOSITORY BANK
        =========================================================== */}

        <div
          style={{
            display: "flex",
            width: "100%",

            marginTop: "0px",
            marginBottom: "6px",

            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            lineHeight: "1.1",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: "36%",

              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              lineHeight: "1.1",
              fontWeight: 600,
            }}
          >
            Treasurer/Depository Bank
          </div>

          <div
            style={{
              width: "14%",
              textAlign: "right",

              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              lineHeight: "1.1",
              fontWeight: 600,
            }}
          >
            0.00
          </div>
        </div>

        {/* ==========================================================
            BALANCE
        =========================================================== */}

        <div
          style={{
            display: "flex",
            width: "100%",

            marginTop: "0px",
            marginBottom: "6px",

            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            lineHeight: "1.1",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: "36%",

              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
              lineHeight: "1.1",
              fontWeight: 600,
            }}
          >
            Balance
          </div>

          <div
            style={{
              width: "14%",
              textAlign: "right",

              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
              lineHeight: "1.1",
              fontWeight: 600,
            }}
          >
            0.00
          </div>
        </div>

        {/* ==========================================================
            FINAL AMOUNT
        =========================================================== */}

        <div
          style={{
            display: "flex",
            width: "100%",

            marginTop: "0px",
            marginBottom: "0px",

            fontFamily: "Arial, sans-serif",
            fontSize: "12px",
            lineHeight: "1.1",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: "36%",

              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
              lineHeight: "1.1",
              fontWeight: 600,
            }}
          >
            &nbsp;
          </div>

          <div
            style={{
              width: "14%",
              textAlign: "right",

              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              lineHeight: "1.1",
              fontWeight: 600,
            }}
          >
            0.00
          </div>
        </div>
      </div>
    </section>
  );
}