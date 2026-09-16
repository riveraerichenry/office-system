"use client";

type Props = {
  fundName: string;
  fundCode: string;
  consolidatedDate: string;
  consolidatedNo: string;
  accountableOfficer: string;
};

export default function ConsolidatedRCDHeader({
  fundName,
  fundCode,
  consolidatedDate,
  consolidatedNo,
  accountableOfficer,
}: Props) {
  function formatDate(value: string) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  }

  return (
    <section className="rcd-header">

      {/* =====================================================
          GOVERNMENT HEADER
      ===================================================== */}

      <div
        className="rcd-government-header"
        style={{
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          className="rcd-republic"
          style={{
            fontSize: "12px",
            lineHeight: "1.1",
          }}
        >
          Republic of the Philippines
        </div>

        <div
          className="rcd-province"
          style={{
            fontSize: "12px",
            lineHeight: "1.1",
          }}
        >
          Province of Palawan
        </div>

        <div
          className="rcd-municipality"
          style={{
            fontSize: "15px",
            fontWeight: 700,
            lineHeight: "1.1",
          }}
        >
          MUNICIPALITY OF TAYTAY
        </div>

        <div
          className="rcd-office"
          style={{
            fontSize: "15px",
            fontWeight: 700,
            lineHeight: "1.1",
          }}
        >
          OFFICE OF THE MUNICIPAL TREASURER
        </div>
      </div>


      {/* =====================================================
          HORIZONTAL LINE
      ===================================================== */}

      <div
        className="rcd-header-line"
        style={{
          width: "100%",
          marginTop: "6px",
          borderTop: "1px solid #000",
        }}
      />


      {/* =====================================================
          REPORT TITLE
      ===================================================== */}

      <div
        className="rcd-report-title"
        style={{
          width: "100%",
          textAlign: "center",
          fontSize: "14px",
          fontWeight: 700,
          marginTop: "15px",
          marginBottom: "15px",
        }}
      >
        REPORT OF COLLECTIONS AND DEPOSITS
      </div>


      {/* =====================================================
          HEADER INFORMATION
      ===================================================== */}

      <div
        className="rcd-header-information"
        style={{
          width: "100%",
          fontSize: "12px",
        }}
      >

        {/* ===================================================
            ROW 1
            FUND TYPE LEFT / DATE RIGHT
        =================================================== */}

        <div
          className="rcd-info-row"
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "6px",
          }}
        >

          {/* -------------------------------------------------
              FUND TYPE
          ------------------------------------------------- */}

          <div
            className="rcd-info-left"
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: "12px",
            }}
          >
            <span
              className="rcd-info-label"
              style={{
                fontWeight: 700,
                marginRight: "4px",
              }}
            >
              Fund Type:
            </span>

            <span className="rcd-info-value">
              {fundCode || fundName}

              {fundName && fundCode
                ? ` - ${fundName}`
                : ""}
            </span>
          </div>


          {/* -------------------------------------------------
              DATE
          ------------------------------------------------- */}

          <div
            className="rcd-info-right"
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "flex-end",
              textAlign: "right",
              fontSize: "12px",
            }}
          >
            <span
              className="rcd-info-label"
              style={{
                fontWeight: 700,
                marginRight: "4px",
              }}
            >
              Date:
            </span>

            <span className="rcd-info-value">
              {formatDate(consolidatedDate)}
            </span>
          </div>

        </div>


        {/* ===================================================
            ROW 2
            ACCOUNTABLE OFFICER LEFT / REPORT NO RIGHT
        =================================================== */}

        <div
          className="rcd-info-row"
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >

          {/* -------------------------------------------------
              ACCOUNTABLE OFFICER
          ------------------------------------------------- */}

          <div
            className="rcd-info-left"
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: "12px",
            }}
          >
            <span
              className="rcd-info-label"
              style={{
                fontWeight: 700,
                marginRight: "4px",
              }}
            >
              Accountable Officer:
            </span>

            <span className="rcd-info-value">
              {accountableOfficer}
            </span>
          </div>


          {/* -------------------------------------------------
              REPORT NUMBER
          ------------------------------------------------- */}

          <div
            className="rcd-info-right"
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "flex-end",
              textAlign: "right",
              fontSize: "12px",
            }}
          >
            <span
              className="rcd-info-label"
              style={{
                fontWeight: 700,
                marginRight: "4px",
              }}
            >
              Report No:
            </span>

            <span className="rcd-info-value">
              {consolidatedNo}
            </span>
          </div>

        </div>

      </div>

    </section>
  );
}