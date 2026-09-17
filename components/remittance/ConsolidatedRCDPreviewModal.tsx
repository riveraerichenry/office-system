

import {
  useEffect,
  useState,
} from "react";

import {
  X,
  Printer,
  Loader2,
} from "lucide-react";

import ConsolidatedRCDHeader from "./ConsolidatedRCDHeader";
import ConsolidatedRCDCollections from "./ConsolidatedRCDCollections";
import CAccountabilityTable from "./CAccountabilityTable";
import ConsolidatedRCDSummary from "./ConsolidatedRCDSummary";
import ConsolidatedRCDFooter from "./ConsolidatedRCDFooter";

import "./consolidated-rcd.css";

/* ============================================================
   CONSOLIDATED ITEM
============================================================ */

export type ConsolidatedItem = {
  id: string;
  no: number;

  collector: string;

  rcdId?: string;
  rcdNo?: string;
  rcdDate?: string | null;

  dateFrom?: string | null;
  dateTo?: string | null;

  rcdBy?: string;

  orFrom: string;
  orTo: string;
  orCount?: number;

  remittanceId: string;
  remittanceNo: string;
  remittanceDate?: string | null;
  remittanceStatus?: string;

  amount: number;
  remittanceAmount?: number;

  totalCollections?: number;
  totalRemittances?: number;
  totalDeposits?: number;
  balance?: number;

  rcdStatus?: string;
};

/* ============================================================
   CONSOLIDATED RCD
============================================================ */

export type ConsolidatedRCD = {
  id: string;

  consolidatedNo: string;
  consolidatedDate: string;

  fundSourceId: string | null;

  fundCode: string;
  fundName: string;
  fundAcronym: string | null;

  accountable: string;

  preparedBy: string | null;

  approvedBy: string | null;
  approvedByName?: string;
  approvedAt?: string | null;

  totalAmount: number;
  totalRemittances: number;

  status: string;
  remarks: string | null;

  createdAt?: string;
  updatedAt?: string;

  items: ConsolidatedItem[];
};

/* ============================================================
   API RESPONSE
============================================================ */

type ConsolidatedRCDResponse = {
  success: boolean;
  consolidated?: ConsolidatedRCD;
  count?: number;
  error?: string;
};

/* ============================================================
   PROPS
============================================================ */

type Props = {
  id: string | null;
  onClose: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function ConsolidatedRCDPreviewModal({
  id,
  onClose,
}: Props) {
  const [data, setData] =
    useState<ConsolidatedRCD | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /* ==========================================================
     LOAD CONSOLIDATED RCD
  ========================================================== */

  useEffect(() => {
    if (!id) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadConsolidatedRCD() {
      try {
        setLoading(true);
        setError(null);
        setData(null);

        console.log(
          "Loading Consolidated RCD:",
          id
        );

        const response = await fetch(
          `/api/remittance/consolidated/${id}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const result =
          (await response.json()) as ConsolidatedRCDResponse;

        console.log(
          "Consolidated RCD API response:",
          result
        );

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.error ||
              "Failed to load Consolidated RCD."
          );
        }

        if (!result.consolidated) {
          throw new Error(
            "No Consolidated RCD data was returned."
          );
        }

        if (cancelled) {
          return;
        }

        setData(
          result.consolidated
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Load Consolidated RCD error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load Consolidated RCD."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadConsolidatedRCD();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* ==========================================================
     CLOSED
  ========================================================== */

  if (!id) {
    return null;
  }

  /* ==========================================================
     PRINT
  ========================================================== */

  function handlePrint() {
    const printRoot =
      document.getElementById(
        "consolidated-rcd-print"
      );

    if (!printRoot) {
      console.error(
        "Consolidated RCD print area not found."
      );
      return;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "width=1200,height=900"
    );

    if (!printWindow) {
      alert(
        "Please allow pop-ups for this site so the report can be printed."
      );
      return;
    }

    const styles: string[] = [];

    document
      .querySelectorAll(
        'link[rel="stylesheet"]'
      )
      .forEach((link) => {
        const href =
          link.getAttribute("href");

        if (!href) return;

        styles.push(
          `<link rel="stylesheet" href="${new URL(
            href,
            window.location.href
          ).href}" />`
        );
      });

    document
      .querySelectorAll("style")
      .forEach((style) => {
        styles.push(
          style.outerHTML
        );
      });

    const clonedReport =
      printRoot.cloneNode(
        true
      ) as HTMLElement;

    printWindow.document.open();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Consolidated RCD</title>
          ${styles.join("\n")}
          <style>
            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
              width: 100% !important;
              min-width: 0 !important;
              overflow: visible !important;
            }

            body {
              display: block !important;
            }

            #consolidated-rcd-print {
              position: static !important;
              left: auto !important;
              top: auto !important;
              width: 8.5in !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
              overflow: visible !important;
              display: block !important;
            }

            .consolidated-rcd-print-container {
              width: 8.5in !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
              overflow: visible !important;
              display: block !important;
            }

            .consolidated-rcd-paper {
              width: 8.5in !important;
              min-width: 8.5in !important;
              max-width: 8.5in !important;
              height: 13in !important;
              min-height: 13in !important;
              max-height: 13in !important;
              margin: 0 !important;
              padding: 0.20in 0.25in !important;
              box-sizing: border-box !important;
              background: #fff !important;
              box-shadow: none !important;
              overflow: hidden !important;
              display: block !important;
              position: relative !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            .consolidated-rcd-paper:not(:last-child) {
              page-break-after: always !important;
              break-after: page !important;
            }

            .consolidated-rcd-paper:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }

            @page {
              size: 8.5in 13in;
              margin: 0;
            }

            @media print {
              html,
              body {
                margin: 0 !important;
                padding: 0 !important;
                width: 8.5in !important;
                min-width: 8.5in !important;
                background: #fff !important;
              }

              #consolidated-rcd-print {
                position: static !important;
                left: auto !important;
                top: auto !important;
                width: 8.5in !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
                display: block !important;
              }

              .consolidated-rcd-paper {
                width: 8.5in !important;
                height: 13in !important;
                min-height: 13in !important;
                max-height: 13in !important;
                box-sizing: border-box !important;
                margin: 0 !important;
                padding: 0.20in 0.25in !important;
                overflow: hidden !important;
                display: block !important;
                position: relative !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }

              .consolidated-rcd-paper:not(:last-child) {
                page-break-after: always !important;
                break-after: page !important;
              }

              .consolidated-rcd-paper:last-child {
                page-break-after: auto !important;
                break-after: auto !important;
              }
            }
          </style>
        </head>
        <body>
          ${clonedReport.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    const startPrinting =
      async () => {
        try {
          if (
            printWindow.document.fonts
          ) {
            await printWindow
              .document
              .fonts
              .ready;
          }
        } catch {
          // Ignore font loading errors.
        }

        await new Promise<void>(
          (resolve) => {
            setTimeout(
              resolve,
              500
            );
          }
        );

        printWindow.focus();
        printWindow.print();
      };

    if (
      printWindow.document.readyState ===
      "complete"
    ) {
      void startPrinting();
    } else {
      printWindow.onload = () => {
        void startPrinting();
      };
    }

    printWindow.onafterprint = () => {
      printWindow.close();
    };
  }

  /* ==========================================================
     FUND SOURCE 106 — BASIC + SEF SPLIT
  ========================================================== */

  const fundSourceId = String(
    data?.fundSourceId ?? ""
  ).trim();

  const fundCode = String(
    data?.fundCode ?? ""
  ).trim();

  const isFundSource106 =
    fundSourceId === "106" ||
    fundCode === "106";

  const splitAmount = (
    value: any
  ): number => {
    const amount = Number(
      value ?? 0
    );

    if (
      !Number.isFinite(amount)
    ) {
      return 0;
    }

    return amount / 2;
  };

  const sourceItems = Array.isArray(data?.items)
    ? data.items
    : [];

  /* ==========================================================
     FUND SOURCE 106

     The API keeps the original consolidated amounts.
     The collection component performs the 50/50 display split
     for BASIC and SEF.
  ========================================================== */

  const splitTotalAmount = isFundSource106
    ? splitAmount(data?.totalAmount)
    : Number(data?.totalAmount ?? 0);

  const splitTotalRemittances = isFundSource106
    ? splitAmount(data?.totalRemittances)
    : Number(data?.totalRemittances ?? 0);

  const reportPages = isFundSource106
    ? [
        {
          key: "basic",
          fundName:
            "106 - GENERAL RPT - BASIC",
          fundAcronym:
            "GENERAL RPT - BASIC",
          totalAmount:
            splitTotalAmount,
          totalRemittances:
            splitTotalRemittances,
          items: sourceItems,
        },
        {
          key: "sef",
          fundName:
            "106 - GENERAL RPT - SEF",
          fundAcronym:
            "GENERAL RPT - SEF",
          totalAmount:
            splitTotalAmount,
          totalRemittances:
            splitTotalRemittances,
          items: sourceItems,
        },
      ]
    : [
        {
          key: "normal",
          fundName:
            data?.fundName ?? "",
          fundAcronym:
            data?.fundAcronym ?? null,
          totalAmount:
            Number(
              data?.totalAmount ?? 0
            ),
          totalRemittances:
            Number(
              data?.totalRemittances ?? 0
            ),
          items: sourceItems,
        },
      ];

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div
      className="
        fixed
        inset-0
        z-[99999]
        flex
        items-center
        justify-center
        bg-black/50
        p-4
      "
    >
      <div
        className="
          flex
          h-[96vh]
          w-full
          max-w-5xl
          flex-col
          overflow-hidden
          rounded-xl
          bg-slate-200
          shadow-2xl
        "
      >
        {/* ====================================================
            TOOLBAR
        ==================================================== */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-slate-300
            bg-white
            px-5
            py-3
          "
        >
          <div>
            <h2
              className="
                text-base
                font-bold
                text-slate-800
              "
            >
              Consolidated RCD Preview
            </h2>

            <p
              className="
                text-xs
                text-slate-500
              "
            >
              {loading
                ? "Loading..."
                : data?.consolidatedNo ||
                  "Consolidated RCD"}
            </p>
          </div>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <button
              type="button"
              onClick={handlePrint}
              disabled={
                loading || !data
              }
              className="
                inline-flex
                h-9
                items-center
                gap-2
                rounded-lg
                bg-blue-600
                px-4
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Printer size={15} />
              Print
            </button>

            <button
              type="button"
              onClick={onClose}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-slate-300
                bg-white
                text-slate-600
                transition
                hover:bg-slate-50
              "
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ====================================================
            BODY
        ==================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-auto
            bg-slate-200
            p-5
          "
        >
          {/* ==================================================
              LOADING
          ================================================== */}

          {loading && (
            <div
              className="
                flex
                min-h-[500px]
                items-center
                justify-center
              "
            >
              <div
                className="
                  flex
                  flex-col
                  items-center
                  gap-3
                  rounded-xl
                  bg-white
                  px-10
                  py-8
                  shadow-sm
                "
              >
                <Loader2
                  size={32}
                  className="
                    animate-spin
                    text-blue-600
                  "
                />

                <span
                  className="
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Loading Consolidated RCD...
                </span>

                <span
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Retrieving report details...
                </span>
              </div>
            </div>
          )}

          {/* ==================================================
              ERROR
          ================================================== */}

          {!loading && error && (
            <div
              className="
                mx-auto
                max-w-3xl
                rounded-xl
                border
                border-red-200
                bg-red-50
                p-5
                text-sm
                text-red-700
              "
            >
              <div
                className="
                  mb-2
                  font-bold
                "
              >
                Failed to load Consolidated RCD
              </div>

              <div>
                {error}
              </div>

              <div
                className="
                  mt-3
                  text-xs
                  text-red-500
                "
              >
                Consolidated RCD ID: {id}
              </div>
            </div>
          )}

          {/* ==================================================
              PRINTABLE PAPER
          ================================================== */}

          {!loading &&
            !error &&
            data && (
              <div
                id="consolidated-rcd-print"
                className="
                  consolidated-rcd-print-container
                "
              >
                {reportPages.map(
                  (
                    page,
                    index
                  ) => (
                    <div
                      key={page.key}
                      className="
                        consolidated-rcd-paper
                      "
                      style={{
                        pageBreakAfter:
                          index <
                          reportPages.length -
                            1
                            ? "always"
                            : "auto",
                        breakAfter:
                          index <
                          reportPages.length -
                            1
                            ? "page"
                            : "auto",
                      }}
                    >
                      {/* ==================================================
                          HEADER
                      ================================================== */}

                      <ConsolidatedRCDHeader
                        fundName={
                          page.fundName
                        }
                        fundCode={
                          data.fundCode
                        }
                        consolidatedDate={
                          data.consolidatedDate
                        }
                        consolidatedNo={
                          data.consolidatedNo
                        }
                        accountableOfficer={
                          data.accountable
                        }
                      />

                      {/* ==================================================
                          A. COLLECTIONS
                      ================================================== */}

                      <ConsolidatedRCDCollections
                        items={
                          page.items
                        }
                        totalAmount={
                          isFundSource106
                            ? Number(
                                data.totalAmount ?? 0
                              )
                            : page.totalAmount
                        }
                        splitAmount={
                          isFundSource106
                        }
                      />

                      {/* ==================================================
                          C. ACCOUNTABILITY
                      ================================================== */}

                      <section
                        className="consolidated-rcd-section-c"
                        style={{
                          marginTop:
                            "10px",
                          marginBottom:
                            "6px",
                          width: "100%",
                        }}
                      >
                        <CAccountabilityTable />
                      </section>

                      {/* ==================================================
                          D. SUMMARY
                      ================================================== */}

                      <section
                        className="consolidated-rcd-section-d"
                        style={{
                          width: "100%",
                        }}
                      >
                        <ConsolidatedRCDSummary
                          totalAmount={
                            page.totalAmount
                          }
                        />
                      </section>

                      {/* ==================================================
                          FOOTER / CERTIFICATION
                      ================================================== */}

                      <section
                        className="consolidated-rcd-footer-section"
                        style={{
                          width: "100%",
                        }}
                      >
                        <ConsolidatedRCDFooter
                          accountableName={
                            data.accountable
                          }
                          treasurerName="IMLYN B. PARAPINA"
                          rcdDate={
                            data.consolidatedDate
                          }
                          totalAmount={
                            page.totalAmount
                          }
                          pageNumber={
                            index + 1
                          }
                        />
                      </section>
                    </div>
                  )
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}