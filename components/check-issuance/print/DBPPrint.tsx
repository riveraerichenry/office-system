import type { CSSProperties } from "react";
import type { CheckPrintDetails } from "./printTypes";
import { formatPrintAmount } from "./printTypes";

type Props = {
  details: CheckPrintDetails;
  amount: number;
  amountInWords: string;
};

// ==========================================
// LANDBANK PRINT LAYOUT CONFIGURATION
// Positions: millimeters
// Font sizes: points
// Character spacing: pixels
// ==========================================

const dbp_LAYOUT = {
  page: {
    width: "330mm",
    height: "216mm",
  },

  // DATE - INDEPENDENT POSITIONING
  date: {
    month: {
      x: 149,
      y: 15,
      width: 15,
      fontSize: 10,
      letterSpacing: "4px",
    },

    day: {
      x: 162,
      y: 15,
      width: 15,
      fontSize: 10,
      letterSpacing: "4px",
    },

    year: {
      x: 176,
      y: 15,
      width: 30,
      fontSize: 10,
      letterSpacing: "4px",
    },
  },

  payee: {
    x: 25,
    y: 22,
    width: 270,
    fontSize: 14,
    letterSpacing: "0px",
  },

  amount: {
    x: 165,
    y: 23,
    width: 70,
    fontSize: 11,
    letterSpacing: "0px",
  },

  words: {
    x: 25,
    y: 32,
    width: 280,
    fontSize: 12,
    letterSpacing: "0px",
  },

  // FIRST SIGNATORY
  signatory1: {
    name: {
      x: 60,
      y: 52,
      width: 110,
      fontSize: 11,
      letterSpacing: "0px",
    },

    position: {
      x: 57,
      y: 56,
      width: 110,
      fontSize: 9,
      letterSpacing: "0px",
    },
  },

  // SECOND SIGNATORY
  signatory2: {
    name: {
      x: 117,
      y: 52,
      width: 110,
      fontSize: 11,
      letterSpacing: "0px",
    },

    position: {
      x: 117,
      y: 56,
      width: 110,
      fontSize: 9,
      letterSpacing: "0px",
    },
  },
};

// ==========================================
// FIELD CONFIGURATION
// ==========================================

type FieldConfig = {
  x: number;
  y: number;
  width: number;
  fontSize: number;
  letterSpacing?: string;
};

function fieldStyle(config: FieldConfig): CSSProperties {
  return {
    position: "absolute",
    left: `${config.x}mm`,
    top: `${config.y}mm`,
    width: `${config.width}mm`,
    fontSize: `${config.fontSize}pt`,
    letterSpacing: config.letterSpacing ?? "normal",
  };
}

// ==========================================
// DATE FORMAT
// SEPARATE MONTH, DAY, YEAR
// EACH DIGIT HAS SPACING
// ==========================================

function getdbpDate(value: string | null | undefined) {
  if (!value) {
    return {
      month: "",
      day: "",
      year: "",
    };
  }

  const dateValue = String(value).trim();

  let mm = "";
  let dd = "";
  let yyyy = "";

  // DATE ONLY: YYYY-MM-DD
  // Preserve the exact date without timezone conversion.
  const dateOnlyMatch = dateValue.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (dateOnlyMatch) {
    yyyy = dateOnlyMatch[1];
    mm = dateOnlyMatch[2];
    dd = dateOnlyMatch[3];
  } else {
    // DATETIME: Convert timestamp to Philippine local date.
    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return {
        month: "",
        day: "",
        year: "",
      };
    }

    const parts = new Intl.DateTimeFormat("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(parsedDate);

    mm =
      parts.find((part) => part.type === "month")?.value || "";

    dd =
      parts.find((part) => part.type === "day")?.value || "";

    yyyy =
      parts.find((part) => part.type === "year")?.value || "";
  }

  return {
    month: mm.split("").join(" "),
    day: dd.split("").join(" "),
    year: yyyy.split("").join(" "),
  };
}

// ==========================================
// DBP PRINT COMPONENT
// ==========================================

export default function dbpPrint({
  details,
  amount,
  amountInWords,
}: Props) {
  const date = getdbpDate(details.check_date);

  return (
    <article
      className="bank-print dbp-print"
      style={{
        position: "relative",
        width: dbp_LAYOUT.page.width,
        height: dbp_LAYOUT.page.height,
        overflow: "hidden",
        background: "white",
        color: "black",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* ================================== */}
      {/* DATE - MONTH */}
      {/* ================================== */}

      <div style={fieldStyle(dbp_LAYOUT.date.month)}>
        <strong style={{ whiteSpace: "pre" }}>
          {date.month}
        </strong>
      </div>

      {/* ================================== */}
      {/* DATE - DAY */}
      {/* ================================== */}

      <div style={fieldStyle(dbp_LAYOUT.date.day)}>
        <strong style={{ whiteSpace: "pre" }}>
          {date.day}
        </strong>
      </div>

      {/* ================================== */}
      {/* DATE - YEAR */}
      {/* ================================== */}

      <div style={fieldStyle(dbp_LAYOUT.date.year)}>
        <strong style={{ whiteSpace: "pre" }}>
          {date.year}
        </strong>
      </div>

      {/* ================================== */}
      {/* PAYEE */}
      {/* ================================== */}

      <div style={fieldStyle(dbp_LAYOUT.payee)}>
        <strong>{details.payee || ""}</strong>
      </div>

      {/* ================================== */}
      {/* AMOUNT */}
      {/* ================================== */}

      <div style={fieldStyle(dbp_LAYOUT.amount)}>
        {formatPrintAmount(amount)}
      </div>

      {/* ================================== */}
      {/* AMOUNT IN WORDS */}
      {/* ================================== */}

      <div style={fieldStyle(dbp_LAYOUT.words)}>
        <strong>{amountInWords}</strong>
      </div>

      {/* ================================== */}
      {/* FIRST SIGNATORY - NAME */}
      {/* ================================== */}

      <div
        style={{
          ...fieldStyle(dbp_LAYOUT.signatory1.name),
          textAlign: "center",
          fontWeight: "bold",
          textTransform: "uppercase",
        }}
      >
        {details.signatory_1_name || ""}
      </div>

      {/* ================================== */}
      {/* FIRST SIGNATORY - POSITION */}
      {/* ================================== */}

      <div
        style={{
          ...fieldStyle(dbp_LAYOUT.signatory1.position),
          textAlign: "center",
        }}
      >
        {details.signatory_1_position || ""}
      </div>

      {/* ================================== */}
      {/* SECOND SIGNATORY - NAME */}
      {/* ================================== */}

      <div
        style={{
          ...fieldStyle(dbp_LAYOUT.signatory2.name),
          textAlign: "center",
          fontWeight: "bold",
          textTransform: "uppercase",
        }}
      >
        {details.signatory_2_name || ""}
      </div>

      {/* ================================== */}
      {/* SECOND SIGNATORY - POSITION */}
      {/* ================================== */}

      <div
        style={{
          ...fieldStyle(dbp_LAYOUT.signatory2.position),
          textAlign: "center",
        }}
      >
        {details.signatory_2_position || ""}
      </div>
    </article>
  );
}