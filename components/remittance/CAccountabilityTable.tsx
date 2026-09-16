"use client";

import React from "react";

export type AccountabilityRow = {
  formNo?: string;

  beginningBalanceQty?: number | string;
  beginningBalanceFrom?: string;
  beginningBalanceTo?: string;

  receiptsQty?: number | string;
  receiptsFrom?: string;
  receiptsTo?: string;

  issuedQty?: number | string;
  issuedFrom?: string;
  issuedTo?: string;

  endingBalanceQty?: number | string;
  endingBalanceFrom?: string;
  endingBalanceTo?: string;
};

type Props = {
  rows?: AccountabilityRow[];
};

export default function CAccountabilityTable({
  rows = [],
}: Props) {
  return (
    <div className="w-full">

      {/* ======================================================
          TABLE
      ====================================================== */}

      <table
        className="w-full border-collapse table-fixed"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          lineHeight: "1.1",
          marginTop: "18px",
        }}
      >

        <thead>

          {/* ==================================================
              SECTION TITLE
          ================================================== */}

          <tr>
            <th
              colSpan={13}
              className="border border-black text-left"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "14px",
                lineHeight: "1.1",
                fontWeight: 700,
                padding: "2px 3px",
              }}
            >
              C. ACCOUNTABILITY FOR ACCOUNTABLE FORMS
            </th>
          </tr>


          {/* ==================================================
              MAIN GROUP HEADERS
          ================================================== */}

          <tr>

            {/* FORM NO */}
            <th
              rowSpan={2}
              className="border border-black text-center align-middle"
              style={{
                width: "8%",
                padding: "2px",
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 400,
              }}
            >
              Form No
            </th>


            {/* BEGINNING BALANCE */}
            <th
              colSpan={3}
              className="border border-black text-center"
              style={{
                width: "23%",
                padding: "2px",
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 400,
              }}
            >
              Beg. Balance
              <br
                style={{
                  lineHeight: "1",
                }}
              />
              <span
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: "11px",
                  lineHeight: "1",
                  fontWeight: 400,
                }}
              >
                Inclusive SN
              </span>
            </th>


            {/* RECEIPTS */}
            <th
              colSpan={3}
              className="border border-black text-center"
              style={{
                width: "23%",
                padding: "2px",
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 400,
              }}
            >
              Receipts
              <br
                style={{
                  lineHeight: "1",
                }}
              />
              <span
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: "11px",
                  lineHeight: "1",
                  fontWeight: 400,
                }}
              >
                Inclusive SN
              </span>
            </th>


            {/* ISSUED */}
            <th
              colSpan={3}
              className="border border-black text-center"
              style={{
                width: "23%",
                padding: "2px",
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 400,
              }}
            >
              Issued
              <br
                style={{
                  lineHeight: "1",
                }}
              />
              <span
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: "11px",
                  lineHeight: "1",
                  fontWeight: 400,
                }}
              >
                Inclusive SN
              </span>
            </th>


            {/* ENDING BALANCES */}
            <th
              colSpan={3}
              className="border border-black text-center"
              style={{
                width: "23%",
                padding: "2px",
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 400,
              }}
            >
              Ending Balances
              <br
                style={{
                  lineHeight: "1",
                }}
              />
              <span
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: "11px",
                  lineHeight: "1",
                  fontWeight: 400,
                }}
              >
                Inclusive SN
              </span>
            </th>

          </tr>


          {/* ==================================================
              SUB HEADERS
          ================================================== */}

          <tr>

            {/* BEGINNING BALANCE */}

            <th
              className="border border-black text-center"
              style={{
                padding: "2px",
                fontFamily: "Arial, sans-serif",
                fontSize: "11px",
                lineHeight: "1.1",
                fontWeight: 400,
              }}
            >
              Qty
            </th>

            <th
              className="border border-black text-center"
              style={{
                padding: "2px",
                fontFamily: "Arial, sans-serif",
                fontSize: "11px",
                lineHeight: "1.1",
                fontWeight: 400,
              }}
            >
              From
            </th>

            <th
              className="border border-black text-center"
              style={{
                padding: "2px",
                fontFamily: "Arial, sans-serif",
                fontSize: "11px",
                lineHeight: "1.1",
                fontWeight: 400,
              }}
            >
              To
            </th>


            {/* RECEIPTS */}

            <th
              className="border border-black text-center"
              style={{
                padding: "2px",
                fontFamily: "Arial, sans-serif",
                fontSize: "11px",
                lineHeight: "1.1",
                fontWeight: 400,
              }}
            >
              Qty
            </th>

            <th
              className="border border-black text-center"
              style={{
                padding: "2px",
                fontFamily: "Arial, sans-serif",
                fontSize: "11px",
                lineHeight: "1.1",
                fontWeight: 400,
              }}
            >
              From
            </th>

            <th
              className="border border-black text-center"
              style={{
                padding: "2px",
                fontFamily: "Arial, sans-serif",
                fontSize: "11px",
                lineHeight: "1.1",
                fontWeight: 400,
              }}
            >
              To
            </th>


            {/* ISSUED */}

            <th
              className="border border-black text-center"
              style={{
                padding: "2px",
                fontFamily: "Arial, sans-serif",
                fontSize: "11px",
                lineHeight: "1.1",
                fontWeight: 400,
              }}
            >
              Qty
            </th>

            <th
              className="border border-black text-center"
              style={{
                padding: "2px",
                fontFamily: "Arial, sans-serif",
                fontSize: "11px",
                lineHeight: "1.1",
                fontWeight: 400,
              }}
            >
              From
            </th>

            <th
              className="border border-black text-center"
              style={{
                padding: "2px",
                fontFamily: "Arial, sans-serif",
                fontSize: "11px",
                lineHeight: "1.1",
                fontWeight: 400,
              }}
            >
              To
            </th>


            {/* ENDING BALANCE */}

            <th
              className="border border-black text-center"
              style={{
                padding: "2px",
                fontFamily: "Arial, sans-serif",
                fontSize: "11px",
                lineHeight: "1.1",
                fontWeight: 400,
              }}
            >
              Qty
            </th>

            <th
              className="border border-black text-center"
              style={{
                padding: "2px",
                fontFamily: "Arial, sans-serif",
                fontSize: "11px",
                lineHeight: "1.1",
                fontWeight: 400,
              }}
            >
              From
            </th>

            <th
              className="border border-black text-center"
              style={{
                padding: "2px",
                fontFamily: "Arial, sans-serif",
                fontSize: "11px",
                lineHeight: "1.1",
                fontWeight: 400,
              }}
            >
              To
            </th>

          </tr>

        </thead>


        {/* ====================================================
            BODY
        ==================================================== */}

        <tbody>

          {rows.length > 0 ? (

            rows.map((row, index) => (

              <tr key={index}>

                {/* FORM NO */}

                <td
                  className="border border-black text-left"
                  style={{
                    padding: "2px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "11px",
                    lineHeight: "1.1",
                    fontWeight: 400,
                  }}
                >
                  {row.formNo ?? ""}
                </td>


                {/* BEGINNING BALANCE */}

                <td
                  className="border border-black text-center"
                  style={{
                    padding: "2px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "11px",
                    lineHeight: "1.1",
                    fontWeight: 400,
                  }}
                >
                  {row.beginningBalanceQty ?? ""}
                </td>

                <td
                  className="border border-black text-center"
                  style={{
                    padding: "2px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "11px",
                    lineHeight: "1.1",
                    fontWeight: 400,
                  }}
                >
                  {row.beginningBalanceFrom ?? ""}
                </td>

                <td
                  className="border border-black text-center"
                  style={{
                    padding: "2px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "11px",
                    lineHeight: "1.1",
                    fontWeight: 400,
                  }}
                >
                  {row.beginningBalanceTo ?? ""}
                </td>


                {/* RECEIPTS */}

                <td
                  className="border border-black text-center"
                  style={{
                    padding: "2px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "11px",
                    lineHeight: "1.1",
                    fontWeight: 400,
                  }}
                >
                  {row.receiptsQty ?? ""}
                </td>

                <td
                  className="border border-black text-center"
                  style={{
                    padding: "2px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "11px",
                    lineHeight: "1.1",
                    fontWeight: 400,
                  }}
                >
                  {row.receiptsFrom ?? ""}
                </td>

                <td
                  className="border border-black text-center"
                  style={{
                    padding: "2px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "11px",
                    lineHeight: "1.1",
                    fontWeight: 400,
                  }}
                >
                  {row.receiptsTo ?? ""}
                </td>


                {/* ISSUED */}

                <td
                  className="border border-black text-center"
                  style={{
                    padding: "2px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "11px",
                    lineHeight: "1.1",
                    fontWeight: 400,
                  }}
                >
                  {row.issuedQty ?? ""}
                </td>

                <td
                  className="border border-black text-center"
                  style={{
                    padding: "2px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "11px",
                    lineHeight: "1.1",
                    fontWeight: 400,
                  }}
                >
                  {row.issuedFrom ?? ""}
                </td>

                <td
                  className="border border-black text-center"
                  style={{
                    padding: "2px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "11px",
                    lineHeight: "1.1",
                    fontWeight: 400,
                  }}
                >
                  {row.issuedTo ?? ""}
                </td>


                {/* ENDING BALANCE */}

                <td
                  className="border border-black text-center"
                  style={{
                    padding: "2px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "11px",
                    lineHeight: "1.1",
                    fontWeight: 400,
                  }}
                >
                  {row.endingBalanceQty ?? ""}
                </td>

                <td
                  className="border border-black text-center"
                  style={{
                    padding: "2px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "11px",
                    lineHeight: "1.1",
                    fontWeight: 400,
                  }}
                >
                  {row.endingBalanceFrom ?? ""}
                </td>

                <td
                  className="border border-black text-center"
                  style={{
                    padding: "2px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "11px",
                    lineHeight: "1.1",
                    fontWeight: 400,
                  }}
                >
                  {row.endingBalanceTo ?? ""}
                </td>

              </tr>

            ))

          ) : (

            <tr>

              <td
                className="border border-black"
                style={{
                  height: "18px",
                  padding: "2px",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "11px",
                  lineHeight: "1.1",
                  fontWeight: 400,
                }}
              >
                &nbsp;
              </td>

              {Array.from({ length: 12 }).map((_, index) => (

                <td
                  key={index}
                  className="border border-black"
                  style={{
                    height: "18px",
                    padding: "2px",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "11px",
                    lineHeight: "1.1",
                    fontWeight: 400,
                  }}
                >
                  &nbsp;
                </td>

              ))}

            </tr>

          )}

        </tbody>

      </table>

    </div>
  );
}