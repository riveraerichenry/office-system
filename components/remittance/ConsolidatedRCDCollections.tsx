"use client";

import type {
  ConsolidatedItem,
} from "./ConsolidatedRCDPreviewModal";

/* ============================================================
   PROPS
============================================================ */

type Props = {
  items: ConsolidatedItem[];
  totalAmount: number;
};

/* ============================================================
   FORMAT AMOUNT
============================================================ */

function formatAmount(value: number) {
  return Number(value || 0).toLocaleString(
    "en-PH",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function ConsolidatedRCDCollections({
  items,
  totalAmount,
}: Props) {
  return (
    <section
      className="rcd-section rcd-collections"
      style={{
        width: "100%",

        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        lineHeight: "1.1",

        marginTop: "0px",
        marginBottom: "0px",
      }}
    >
      {/* ======================================================
          SECTION TITLE
      ====================================================== */}

      <div
        className="rcd-section-title"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          lineHeight: "1.1",
          fontWeight: 700,

          marginTop: "15px",
          marginBottom: "0px",

          breakAfter: "avoid",
          pageBreakAfter: "avoid",
        }}
      >
        A. COLLECTIONS
      </div>

      {/* ======================================================
          TABLE

          IMPORTANT:
          This is ONE table.

          The browser is allowed to split this table
          between Page 1 and Page 2.
      ====================================================== */}

      <table
        className="rcd-table rcd-collections-table"
        style={{
          width: "100%",

          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          lineHeight: "1.1",

          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}
      >
        {/* ====================================================
            HEADER

            Browser repeats this THEAD automatically
            when the table continues to another printed page.
        ==================================================== */}

        <thead
          style={{
            display: "table-header-group",
          }}
        >
          {/* --------------------------------------------------
              MAIN HEADER
          -------------------------------------------------- */}

          <tr
            style={{
              breakInside: "avoid",
              pageBreakInside: "avoid",
            }}
          >
            <th
              rowSpan={2}
              className="rcd-col-form"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 700,

                breakInside: "avoid",
                pageBreakInside: "avoid",
              }}
            >
              Type (Form No.)
            </th>

            <th
              colSpan={3}
              className="rcd-col-or"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 700,

                breakInside: "avoid",
                pageBreakInside: "avoid",
              }}
            >
              Official Receipt/Serial No.
            </th>

            <th
              rowSpan={2}
              className="rcd-col-amount"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 700,

                breakInside: "avoid",
                pageBreakInside: "avoid",
              }}
            >
              Amount
            </th>
          </tr>

          {/* --------------------------------------------------
              SUB HEADER
          -------------------------------------------------- */}

          <tr
            style={{
              breakInside: "avoid",
              pageBreakInside: "avoid",
            }}
          >
            <th
              className="rcd-col-from"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 700,

                breakInside: "avoid",
                pageBreakInside: "avoid",
              }}
            >
              From
            </th>

            <th
              className="rcd-col-to"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 700,

                breakInside: "avoid",
                pageBreakInside: "avoid",
              }}
            >
              To
            </th>

            <th
              className="rcd-col-report"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 700,

                breakInside: "avoid",
                pageBreakInside: "avoid",
              }}
            >
              Report No.
            </th>
          </tr>
        </thead>

        {/* ====================================================
            BODY
        ==================================================== */}

        <tbody>
          {/* ==================================================
              SECTION 2
          ================================================== */}

          <tr
            className="rcd-collections-subtitle-row"
            style={{
              breakInside: "avoid",
              pageBreakInside: "avoid",
            }}
          >
            <td
              colSpan={5}
              className="rcd-liquidating-title"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "13px",
                lineHeight: "1.1",
                fontWeight: 700,

                breakInside: "avoid",
                pageBreakInside: "avoid",
              }}
            >
              <span
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: "13px",
                  lineHeight: "1.1",
                  fontWeight: 700,
                }}
              >
                2. For Liquidating Officer/Treasurer
              </span>
            </td>
          </tr>

          {/* ==================================================
              REMITTANCE HEADER
          ================================================== */}

          <tr
            className="rcd-collections-remittance-header"
            style={{
              breakInside: "avoid",
              pageBreakInside: "avoid",
            }}
          >
            <th
              className="rcd-liquidating-collector"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 700,
              }}
            >
              Collector
            </th>

            <th
              className="rcd-liquidating-or-from"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 700,
              }}
            >
              OR From
            </th>

            <th
              className="rcd-liquidating-or-to"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 700,
              }}
            >
              OR To
            </th>

            <th
              className="rcd-liquidating-remittance"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 700,
              }}
            >
              Remittance No.
            </th>

            <th
              className="rcd-liquidating-amount"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 700,
              }}
            >
              Amount
            </th>
          </tr>

          {/* ==================================================
              DATA ROWS

              These rows may move to Page 2.

              Individual rows will NOT be split.
          ================================================== */}

          {items.length > 0 ? (
            items.map((item) => (
              <tr
                key={`remittance-${item.id}`}
                className="rcd-collection-data-row"
                style={{
                  breakInside: "avoid",
                  pageBreakInside: "avoid",
                }}
              >
                {/* --------------------------------------------
                    COLLECTOR
                -------------------------------------------- */}

                <td
                  className="rcd-center"
                  style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: "12px",
                    lineHeight: "1.1",
                    fontWeight: 400,

                    breakInside: "avoid",
                    pageBreakInside: "avoid",
                  }}
                >
                  {item.collector || ""}
                </td>

                {/* --------------------------------------------
                    OR FROM
                -------------------------------------------- */}

                <td
                  className="rcd-center"
                  style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: "12px",
                    lineHeight: "1.1",
                    fontWeight: 400,

                    breakInside: "avoid",
                    pageBreakInside: "avoid",
                  }}
                >
                  {item.orFrom || ""}
                </td>

                {/* --------------------------------------------
                    OR TO
                -------------------------------------------- */}

                <td
                  className="rcd-center"
                  style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: "12px",
                    lineHeight: "1.1",
                    fontWeight: 400,

                    breakInside: "avoid",
                    pageBreakInside: "avoid",
                  }}
                >
                  {item.orTo || ""}
                </td>

                {/* --------------------------------------------
                    REMITTANCE NUMBER
                -------------------------------------------- */}

                <td
                  className="rcd-center"
                  style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: "12px",
                    lineHeight: "1.1",
                    fontWeight: 400,

                    breakInside: "avoid",
                    pageBreakInside: "avoid",
                  }}
                >
                  {item.remittanceNo || ""}
                </td>

                {/* --------------------------------------------
                    AMOUNT
                -------------------------------------------- */}

                <td
                  className="rcd-amount"
                  style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: "12px",
                    lineHeight: "1.1",
                    fontWeight: 400,

                    textAlign: "right",

                    breakInside: "avoid",
                    pageBreakInside: "avoid",
                  }}
                >
                  {formatAmount(item.amount)}
                </td>
              </tr>
            ))
          ) : (
            <tr
              style={{
                breakInside: "avoid",
                pageBreakInside: "avoid",
              }}
            >
              <td
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: "12px",
                  lineHeight: "1.1",
                  fontWeight: 400,
                }}
              >
                &nbsp;
              </td>

              <td
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: "12px",
                  lineHeight: "1.1",
                  fontWeight: 400,
                }}
              >
                &nbsp;
              </td>

              <td
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: "12px",
                  lineHeight: "1.1",
                  fontWeight: 400,
                }}
              >
                &nbsp;
              </td>

              <td
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: "12px",
                  lineHeight: "1.1",
                  fontWeight: 400,
                }}
              >
                &nbsp;
              </td>

              <td
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: "12px",
                  lineHeight: "1.1",
                  fontWeight: 400,
                  textAlign: "right",
                }}
              >
                &nbsp;
              </td>
            </tr>
          )}

          {/* ==================================================
              TOTAL

              Keep total with the table flow.
          ================================================== */}

          <tr
            className="rcd-total-row"
            style={{
              breakInside: "avoid",
              pageBreakInside: "avoid",
            }}
          >
            <td
              colSpan={4}
              className="rcd-total-label"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 700,

                breakInside: "avoid",
                pageBreakInside: "avoid",
              }}
            >
              TOTAL
            </td>

            <td
              className="rcd-total-amount"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 700,

                textAlign: "right",

                breakInside: "avoid",
                pageBreakInside: "avoid",
              }}
            >
              {formatAmount(totalAmount)}
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}