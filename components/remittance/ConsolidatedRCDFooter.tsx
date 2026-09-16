"use client";

import React from "react";

type Props = {
  accountableName?: string;
  treasurerName?: string;
  rcdDate?: string | null;
  totalAmount: number;
  pageNumber?: number;
};

/* ============================================================
   FORMAT NUMERIC AMOUNT
============================================================ */

function formatAmount(value: number) {
  return Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ============================================================
   FORMAT DATE
============================================================ */

function formatDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-PH", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

/* ============================================================
   NUMBER TO WORDS
============================================================ */

function numberToWords(value: number): string {
  const ones = [
    "",
    "ONE",
    "TWO",
    "THREE",
    "FOUR",
    "FIVE",
    "SIX",
    "SEVEN",
    "EIGHT",
    "NINE",
    "TEN",
    "ELEVEN",
    "TWELVE",
    "THIRTEEN",
    "FOURTEEN",
    "FIFTEEN",
    "SIXTEEN",
    "SEVENTEEN",
    "EIGHTEEN",
    "NINETEEN",
  ];

  const tens = [
    "",
    "",
    "TWENTY",
    "THIRTY",
    "FORTY",
    "FIFTY",
    "SIXTY",
    "SEVENTY",
    "EIGHTY",
    "NINETY",
  ];

  function convertHundreds(num: number): string {
    let result = "";

    if (num >= 100) {
      result += `${ones[Math.floor(num / 100)]} HUNDRED`;
      num %= 100;

      if (num > 0) {
        result += " ";
      }
    }

    if (num >= 20) {
      result += tens[Math.floor(num / 10)];
      num %= 10;

      if (num > 0) {
        result += `-${ones[num]}`;
      }
    } else if (num > 0) {
      result += ones[num];
    }

    return result;
  }

  function convertNumber(num: number): string {
    if (num === 0) {
      return "ZERO";
    }

    let result = "";

    const millions = Math.floor(num / 1_000_000);
    num %= 1_000_000;

    const thousands = Math.floor(num / 1_000);
    num %= 1_000;

    const hundreds = num;

    if (millions > 0) {
      result += `${convertHundreds(millions)} MILLION`;
    }

    if (thousands > 0) {
      if (result) {
        result += " ";
      }

      result += `${convertHundreds(thousands)} THOUSAND`;
    }

    if (hundreds > 0) {
      if (result) {
        result += " ";
      }

      result += convertHundreds(hundreds);
    }

    return result;
  }

  const amount = Number(value || 0);

  if (!Number.isFinite(amount)) {
    return "ZERO PESOS ONLY";
  }

  const roundedAmount = Math.round(amount * 100) / 100;

  const pesos = Math.floor(roundedAmount);

  const centavos = Math.round(
    (roundedAmount - pesos) * 100
  );

  let result = convertNumber(pesos);

  if (pesos === 1) {
    result += " PESO";
  } else {
    result += " PESOS";
  }

  if (centavos > 0) {
    result += ` AND ${convertNumber(centavos)} CENTAVOS`;
  }

  result += " ONLY";

  return result;
}

/* ============================================================
   COMPONENT
============================================================ */

export default function ConsolidatedRCDFooter({
  accountableName,
  treasurerName = "IMLYN B. PARAPINA",
  rcdDate,
  totalAmount,
  pageNumber = 1,
}: Props) {
  const displayDate = formatDate(rcdDate);

  const displayAmount = formatAmount(totalAmount);

  /* ============================================================
     DYNAMIC AMOUNT IN WORDS
  ============================================================ */

  const displayAmountInWords =
    numberToWords(totalAmount);

  return (
    <div
      className="consolidated-rcd-footer"
      style={{
        marginTop: "auto",
        paddingTop: "8px",

        fontFamily: "Arial, sans-serif",
        fontSize: "9px",
        lineHeight: "1.15",
      }}
    >
      {/* ============================================================
          CERTIFICATION / VERIFICATION
      ============================================================ */}

      <table
        className="w-full border-collapse table-fixed"
        style={{
          tableLayout: "fixed",
          width: "100%",

          fontFamily: "Arial, sans-serif",
          fontSize: "9px",
          lineHeight: "1.15",

          borderCollapse: "collapse",
        }}
      >
        <tbody>

          {/* ======================================================
              FIRST ROW
              
              IMPORTANT:
              TOP + LEFT + RIGHT borders only.
              NO BOTTOM BORDER.
          ======================================================= */}

          <tr>
            {/* ======================================================
                CERTIFICATION
            ======================================================= */}

            <td
              className="border-l border-r border-t border-black align-top"
              style={{
                width: "50%",
                height: "125px",
                padding: "5px 7px",
                verticalAlign: "top",

                fontFamily: "Arial, sans-serif",
                fontSize: "9px",
                lineHeight: "1.15",
                fontWeight: 400,

                borderBottom: "none",
              }}
            >
              {/* CERTIFICATION TITLE */}

              <div
                style={{
                  marginTop: "0px",
                  marginBottom: "6px",

                  fontFamily: "Arial, sans-serif",
                  fontSize: "12px",
                  lineHeight: "1.1",
                  fontWeight: 700,

                  textAlign: "left",
                }}
              >
                CERTIFICATION:
              </div>

              {/* CERTIFICATION CONTENT */}

              <div
                style={{
                  paddingLeft: "3px",
                  paddingRight: "3px",

                  fontFamily: "Arial, sans-serif",
                  fontSize: "12px",
                  lineHeight: "1.35",
                  fontWeight: 400,

                  textAlign: "justify",
                  textJustify: "inter-word",
                }}
              >
                I hereby certify that the foregoing report
                of collections and deposits, and
                accountability for accountable forms is
                true and correct.
              </div>
            </td>

            {/* ======================================================
                VERIFICATION AND ACKNOWLEDGEMENT
            ======================================================= */}

            <td
              className="border-l border-r border-t border-black align-top"
              style={{
                width: "50%",
                height: "125px",
                padding: "5px 7px",
                verticalAlign: "top",

                fontFamily: "Arial, sans-serif",
                fontSize: "9px",
                lineHeight: "1.15",
                fontWeight: 400,

                borderBottom: "none",
              }}
            >
              {/* VERIFICATION TITLE */}

              <div
                style={{
                  marginTop: "0px",
                  marginBottom: "6px",

                  fontFamily: "Arial, sans-serif",
                  fontSize: "12px",
                  lineHeight: "1.1",
                  fontWeight: 700,

                  textAlign: "left",
                }}
              >
                VERIFICATION AND ACKNOWLEDGEMENT
              </div>

              {/* VERIFICATION CONTENT */}

              <div
                style={{
                  paddingLeft: "3px",
                  paddingRight: "3px",

                  fontFamily: "Arial, sans-serif",
                  fontSize: "12px",
                  lineHeight: "1.35",
                  fontWeight: 400,

                  textAlign: "justify",
                  textJustify: "inter-word",
                }}
              >
                I hereby certify that the foregoing report
                of collections has been verified and
                acknowledge the receipt of{" "}

                <span
                  style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: "12px",
                    lineHeight: "1.35",
                    fontWeight: 700,
                  }}
                >
                  {displayAmountInWords}
                </span>
              </div>

              {/* ==================================================
                  NUMERIC AMOUNT
              ================================================== */}

              <div
                style={{
                  marginTop: "10px",
                  paddingRight: "5px",

                  fontFamily: "Arial, sans-serif",
                  fontSize: "15px",
                  lineHeight: "1.1",
                  fontWeight: 700,

                  textAlign: "right",
                }}
              >
                {displayAmount}
              </div>
            </td>
          </tr>

          {/* ============================================================
              NAMES / SIGNATURES

              IMPORTANT:
              NO TOP BORDER.
              Therefore there is NO horizontal line between
              Certification/Verification and Names/Signatures.
          ============================================================ */}

          <tr>
            {/* ======================================================
                ACCOUNTABLE OFFICER
            ======================================================= */}

            <td
              className="border-l border-r border-b border-black align-bottom"
              style={{
                height: "48px",
                padding: "2px 5px",
                verticalAlign: "bottom",

                fontFamily: "Arial, sans-serif",
                fontSize: "9px",
                lineHeight: "1.15",
                fontWeight: 400,

                borderTop: "none",
              }}
            >
              {/* ======================================================
                  ACCOUNTABLE NAME + SIGNATURE LINE
              ======================================================= */}

              <div
                style={{
                  width: "100%",
                  textAlign: "center",

                  marginTop: "0px",
                  marginBottom: "0px",
                }}
              >
                {/* ACCOUNTABLE NAME */}

                <div
                  style={{
                    marginTop: "0px",
                    marginBottom: "2px",

                    fontFamily: "Arial, sans-serif",
                    fontSize: "12px",
                    lineHeight: "1.1",
                    fontWeight: 700,

                    textAlign: "center",
                  }}
                >
                  {accountableName ||
                    "ACCOUNTABLE OFFICER"}
                </div>

                {/* LINE BETWEEN NAME AND POSITION */}

                <div
                  style={{
                    width: "55%",
                    marginLeft: "auto",
                    marginRight: "auto",

                    borderTop: "1px solid #000",

                    marginTop: "0px",
                    marginBottom: "2px",
                  }}
                />

                {/* NAME AND SIGNATURE */}

                <div
                  style={{
                    marginTop: "0px",
                    marginBottom: "0px",

                    fontFamily: "Arial, sans-serif",
                    fontSize: "12px",
                    lineHeight: "1.1",
                    fontWeight: 400,

                    textAlign: "center",
                  }}
                >
                  Name and Signature
                </div>
              </div>

              {/* DATE */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",

                  marginTop: "3px",

                  fontFamily: "Arial, sans-serif",
                  fontSize: "12px",
                  lineHeight: "1.1",
                  fontWeight: 400,
                }}
              >
                <span
                  style={{
                    marginRight: "28px",

                    fontFamily: "Arial, sans-serif",
                    fontSize: "9px",
                    lineHeight: "1.1",
                    fontWeight: 400,
                  }}
                >
                  {displayDate}
                </span>
              </div>
            </td>

            {/* ======================================================
                MUNICIPAL TREASURER
            ======================================================= */}

            <td
              className="border-l border-r border-b border-black align-bottom"
              style={{
                height: "48px",
                padding: "2px 5px",
                verticalAlign: "bottom",

                fontFamily: "Arial, sans-serif",
                fontSize: "9px",
                lineHeight: "1.15",
                fontWeight: 400,

                borderTop: "none",
              }}
            >
              {/* TREASURER NAME + POSITION */}

              <div
                style={{
                  width: "100%",
                  textAlign: "center",

                  marginTop: "40px",
                  marginBottom: "0px",
                }}
              >
                {/* TREASURER NAME */}

                <div
                  style={{
                    marginTop: "0px",
                    marginBottom: "2px",

                    fontFamily: "Arial, sans-serif",
                    fontSize: "11px",
                    lineHeight: "1.1",
                    fontWeight: 700,

                    textAlign: "center",
                  }}
                >
                  {treasurerName}
                </div>

                {/* LINE BETWEEN NAME AND POSITION */}

                <div
                  style={{
                    width: "55%",
                    marginLeft: "auto",
                    marginRight: "auto",

                    borderTop: "1px solid #000",

                    marginTop: "0px",
                    marginBottom: "2px",
                  }}
                />

                {/* POSITION */}

                <div
                  style={{
                    marginTop: "0px",
                    marginBottom: "0px",

                    fontFamily: "Arial, sans-serif",
                    fontSize: "12px",
                    lineHeight: "1.1",
                    fontWeight: 400,

                    textAlign: "center",
                  }}
                >
                  Municipal Treasurer
                </div>
              </div>

              {/* DATE */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",

                  marginTop: "3px",

                  fontFamily: "Arial, sans-serif",
                  fontSize: "9px",
                  lineHeight: "1.1",
                  fontWeight: 400,
                }}
              >
                <span
                  style={{
                    marginRight: "28px",

                    fontFamily: "Arial, sans-serif",
                    fontSize: "9px",
                    lineHeight: "1.1",
                    fontWeight: 400,
                  }}
                >
                  {displayDate}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ============================================================
          DATE OF RCD / PAGE NUMBER
      ============================================================ */}

      <div
        style={{
          borderTop: "1px solid #000",

          marginTop: "5px",
          paddingTop: "3px",

          display: "flex",
          justifyContent: "space-between",

          fontFamily: "Arial, sans-serif",
          fontSize: "9px",
          lineHeight: "1.1",
          fontWeight: 400,
        }}
      >
        {/* DATE OF RCD */}

        <span
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "9px",
            lineHeight: "1.1",
            fontWeight: 400,
          }}
        >
          Date of RCD: {displayDate}
        </span>

        {/* PAGE NUMBER */}

        <span
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "9px",
            lineHeight: "1.1",
            fontWeight: 400,
          }}
        >
          Page {pageNumber}
        </span>
      </div>
    </div>
  );
}