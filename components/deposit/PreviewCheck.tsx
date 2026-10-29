
"use client";

import { useRef } from "react";
import { Printer } from "lucide-react";
import type { CSSProperties } from "react";
import styles from "./PreviewCash.module.css";

export type PreviewCheckItem = {
  id: string;
  item_type?: string;
  check_type?: string | null;
  check_number?: string | null;
  check_date?: string | null;
  issuing_bank?: string | null;
  check_remarks?: string | null;
  remarks?: string | null;
  amount: number | string;
};

export type PreviewCheckDeposit = {
  rcd_number: string;
  deposit_date: string;
  reference_number?: string | null;
  total_amount?: number | string;
  total_checks?: number | string;
  checks?: PreviewCheckItem[];
  bank_name?: string | null;
  account_name?: string | null;
  account_number?: string | null;
  remarks?: string | null;
};

type PreviewCheckProps = {
  deposit: PreviewCheckDeposit;
  items?: PreviewCheckItem[];
  checkType?: "ON_US" | "LOCAL";
};

const amountParts = (value: number | string) => {
  const amount = Number(value || 0).toFixed(2);
  const [whole, decimal] = amount.split(".");

  return {
    whole: Number(whole).toLocaleString("en-PH"),
    decimal: decimal ?? "00",
  };
};

export default function PreviewCheck({
  deposit,
  items,
  checkType = "ON_US",
}: PreviewCheckProps) {
  const previewRef = useRef<HTMLElement>(null);

  const checks = (items ?? deposit.checks ?? []).filter(
    (item) =>
      !item.check_type ||
      item.check_type.toUpperCase() === checkType
  );

  const total = checks.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const label = checkType === "ON_US" ? "ON US" : "LOCAL";

  const receiptSettings = {
    accountName: {
      x: "60px",
      y: "560px",
      fontSize: "22px",
      letterSpacing: "1px",
    },

    accountNumber: {
      x: "40px",
      y: "520px",
      fontSize: "25px",
      letterSpacing: "9px",
    },

    rows: {
      x: "25px",
      y: "605px",
      fontSize: "15px",
      letterSpacing: "0px",
      rowHeight: "20px",
    },

    checkNumberColumn: {
      x: "115px",
      fontSize: "15px",
      letterSpacing: "0px",
    },

    amountColumn: {
      x: "215px",
      fontSize: "15px",
      letterSpacing: "0px",
      decimalGap: "15px",
    },

    // Independently position and format the total amount.
    totalAmount: {
      x: "215px",
      y: "70px",
      fontSize: "15px",
      letterSpacing: "0px",
      decimalGap: "15px",
    },

    treasurerName: {
      text: "IMLYN B. PARAPINA",
      x: "85px",
      y: "785px",
      fontSize: "14px",
      letterSpacing: "1px",
    },

    treasurerTitle: {
      text: "MUNICIPAL TREASURER",
      x: "70px",
      y: "800px",
      fontSize: "14px",
      letterSpacing: "1px",
    },
  };

  const pagePositions: CSSProperties = {
    "--receipt-account-name-x": receiptSettings.accountName.x,
    "--receipt-account-name-y": receiptSettings.accountName.y,
    "--receipt-account-name-size":
      receiptSettings.accountName.fontSize,
    "--receipt-account-name-spacing":
      receiptSettings.accountName.letterSpacing,

    "--receipt-account-number-x": receiptSettings.accountNumber.x,
    "--receipt-account-number-y": receiptSettings.accountNumber.y,
    "--receipt-account-number-size":
      receiptSettings.accountNumber.fontSize,
    "--receipt-account-number-spacing":
      receiptSettings.accountNumber.letterSpacing,

    "--receipt-denominations-x": receiptSettings.rows.x,
    "--receipt-denominations-y": receiptSettings.rows.y,
    "--receipt-denominations-size": receiptSettings.rows.fontSize,
    "--receipt-denominations-spacing":
      receiptSettings.rows.letterSpacing,
    "--receipt-row-height": receiptSettings.rows.rowHeight,

    "--receipt-quantity-x": receiptSettings.checkNumberColumn.x,
    "--receipt-quantity-size":
      receiptSettings.checkNumberColumn.fontSize,
    "--receipt-quantity-spacing":
      receiptSettings.checkNumberColumn.letterSpacing,

    "--receipt-subtotal-x": receiptSettings.amountColumn.x,
    "--receipt-subtotal-size": receiptSettings.amountColumn.fontSize,
    "--receipt-subtotal-spacing":
      receiptSettings.amountColumn.letterSpacing,
    "--receipt-subtotal-gap": receiptSettings.amountColumn.decimalGap,

    "--receipt-total-amount-x": receiptSettings.totalAmount.x,
    "--receipt-total-amount-y": receiptSettings.totalAmount.y,
    "--receipt-total-amount-size":
      receiptSettings.totalAmount.fontSize,
    "--receipt-total-amount-spacing":
      receiptSettings.totalAmount.letterSpacing,
    "--receipt-total-amount-gap":
      receiptSettings.totalAmount.decimalGap,

    "--receipt-treasurer-name-x": receiptSettings.treasurerName.x,
    "--receipt-treasurer-name-y": receiptSettings.treasurerName.y,
    "--receipt-treasurer-name-size":
      receiptSettings.treasurerName.fontSize,
    "--receipt-treasurer-name-spacing":
      receiptSettings.treasurerName.letterSpacing,

    "--receipt-treasurer-title-x": receiptSettings.treasurerTitle.x,
    "--receipt-treasurer-title-y": receiptSettings.treasurerTitle.y,
    "--receipt-treasurer-title-size":
      receiptSettings.treasurerTitle.fontSize,
    "--receipt-treasurer-title-spacing":
      receiptSettings.treasurerTitle.letterSpacing,
  } as CSSProperties;

  const handlePrint = () => {
    const sourcePage = previewRef.current;

    if (!sourcePage) {
      alert("The check slip preview is not available.");
      return;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "width=1000,height=900"
    );

    if (!printWindow) {
      alert("Please allow pop-ups for this site and try again.");
      return;
    }

    // Print the actual rendered preview, not a regenerated table.
    const clonedPage = sourcePage.cloneNode(true) as HTMLElement;

    const copyComputedStyles = (
      source: Element,
      target: Element
    ) => {
      const computedStyle = window.getComputedStyle(source);
      const targetElement = target as HTMLElement;

      for (let i = 0; i < computedStyle.length; i++) {
        const property = computedStyle.item(i);

        targetElement.style.setProperty(
          property,
          computedStyle.getPropertyValue(property)
        );
      }

      const sourceChildren = Array.from(source.children);
      const targetChildren = Array.from(target.children);

      sourceChildren.forEach((child, index) => {
        const targetChild = targetChildren[index];

        if (targetChild) {
          copyComputedStyles(child, targetChild);
        }
      });
    };

    copyComputedStyles(sourcePage, clonedPage);

    // Preserve the position variables for the print document.
    for (const [property, value] of Object.entries(pagePositions)) {
      if (typeof value === "string") {
        clonedPage.style.setProperty(property, value);
      }
    }

    clonedPage.className = "check-slip-print-page";

    Object.assign(clonedPage.style, {
      position: "relative",
      display: "block",
      flex: "none",
      zoom: "1",
      transform: "none",
      transformOrigin: "top left",
      width: "210mm",
      minWidth: "210mm",
      maxWidth: "210mm",
      height: "297mm",
      minHeight: "297mm",
      maxHeight: "297mm",
      margin: "0",
      padding: "0",
      border: "none",
      boxShadow: "none",
      overflow: "hidden",
      boxSizing: "border-box",
      background: "#fff",
      color: "#000",
      visibility: "visible",
    });

    const doc = printWindow.document;

    doc.open();

    doc.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>${label} Check Deposit Slip</title>

          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }

            *,
            *::before,
            *::after {
              box-sizing: border-box;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }

            html,
            body {
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              background: #fff !important;
            }

            body {
              font-family: Arial, Helvetica, sans-serif;
            }

            .check-slip-print-page {
              position: relative !important;
              display: block !important;
              flex: none !important;
              width: 210mm !important;
              min-width: 210mm !important;
              max-width: 210mm !important;
              height: 297mm !important;
              min-height: 297mm !important;
              max-height: 297mm !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
              overflow: hidden !important;
              zoom: 1 !important;
              transform: none !important;
              background: #fff !important;
              color: #000 !important;
              visibility: visible !important;
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            .check-slip-print-page .accountName {
              position: absolute !important;
              left: var(--receipt-account-name-x, 60px) !important;
              top: var(--receipt-account-name-y, 560px) !important;
              font-size: var(--receipt-account-name-size, 22px) !important;
              letter-spacing: var(--receipt-account-name-spacing, 1px) !important;
            }

            .check-slip-print-page .accountNumber {
              position: absolute !important;
              left: var(--receipt-account-number-x, 40px) !important;
              top: var(--receipt-account-number-y, 520px) !important;
              font-size: var(--receipt-account-number-size, 25px) !important;
              letter-spacing: var(--receipt-account-number-spacing, 9px) !important;
            }

            .check-slip-print-page .denominations {
              position: absolute !important;
              left: var(--receipt-denominations-x, 30px) !important;
              top: var(--receipt-denominations-y, 595px) !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: stretch !important;
              font-size: var(--receipt-denominations-size, 15px) !important;
              letter-spacing: var(--receipt-denominations-spacing, 0px) !important;
            }

            .check-slip-print-page .denominationRow {
              position: relative !important;
              display: flex !important;
              flex: 0 0 var(--receipt-row-height, 22px) !important;
              width: 350px !important;
              height: var(--receipt-row-height, 22px) !important;
              min-height: var(--receipt-row-height, 22px) !important;
              align-items: flex-start !important;
              box-sizing: border-box !important;
              white-space: nowrap !important;
            }

            .check-slip-print-page .quantityValue {
              position: absolute !important;
              left: var(--receipt-quantity-x, 115px) !important;
              top: 0 !important;
              white-space: pre !important;
            }

            .check-slip-print-page .subtotalValue {
              position: absolute !important;
              display: grid !important;
              grid-template-columns: minmax(0, 1fr) 30px !important;
              column-gap: var(--receipt-subtotal-gap, 18px) !important;
              white-space: nowrap !important;
              font-variant-numeric: tabular-nums !important;
            }

            .check-slip-print-page .subtotalWhole {
              display: block !important;
              min-width: 0 !important;
              text-align: right !important;
              white-space: nowrap !important;
            }

            .check-slip-print-page .subtotalDecimal {
              display: block !important;
              width: 30px !important;
              text-align: left !important;
              white-space: nowrap !important;
            }

            .check-slip-print-page .treasurerName {
              position: absolute !important;
              left: var(--receipt-treasurer-name-x, 85px) !important;
              top: var(--receipt-treasurer-name-y, 780px) !important;
              font-size: var(--receipt-treasurer-name-size, 14px) !important;
              letter-spacing: var(--receipt-treasurer-name-spacing, 1px) !important;
            }

            .check-slip-print-page .treasurerTitle {
              position: absolute !important;
              left: var(--receipt-treasurer-title-x, 70px) !important;
              top: var(--receipt-treasurer-title-y, 800px) !important;
              font-size: var(--receipt-treasurer-title-size, 14px) !important;
              letter-spacing: var(--receipt-treasurer-title-spacing, 1px) !important;
            }

            .check-slip-print-page .actions {
              display: none !important;
            }

            .check-slip-print-page .denominationRow:last-child .subtotalValue {
              column-gap: var(--receipt-total-amount-gap, 18px) !important;
              font-size: var(--receipt-total-amount-size, 15px) !important;
              letter-spacing: var(--receipt-total-amount-spacing, 0px) !important;
            }
          </style>
        </head>
        <body></body>
      </html>
    `);

    doc.close();
    doc.body.appendChild(clonedPage);

    printWindow.requestAnimationFrame(() => {
      printWindow.requestAnimationFrame(() => {
        printWindow.focus();
        printWindow.print();
      });
    });
  };

  return (
    <div className={styles.previewRoot}>
      <div className={styles.pageViewport}>
        <article
          ref={previewRef}
          className={styles.paper}
          style={pagePositions}
        >
          <div className={styles.accountName}>
            {deposit.account_name || ""}
          </div>

          <div className={styles.accountNumber}>
            {deposit.account_number || ""}
          </div>

          <div className={styles.denominations}>
            {/* Empty heading row retained for existing layout spacing. */}
            <div
              className={styles.denominationRow}
              style={{
                height: "22px",
                minHeight: "22px",
                flex: "0 0 22px",
                fontWeight: 700,
              }}
            />

            {/* Individual check rows */}
            {checks.map((item, index) => {
              const parts = amountParts(item.amount);

              return (
                <div
                  className={styles.denominationRow}
                  key={item.id || `${item.check_number}-${index}`}
                  style={{
                    height: receiptSettings.rows.rowHeight,
                    minHeight: receiptSettings.rows.rowHeight,
                    flex: `0 0 ${receiptSettings.rows.rowHeight}`,
                  }}
                >
                  <span
                    title={item.issuing_bank ?? ""}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: "108px",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.issuing_bank || "—"}
                  </span>

                  <span
                    className={styles.quantityValue}
                    style={{
                      left: receiptSettings.checkNumberColumn.x,
                      minWidth: "95px",
                      letterSpacing: "0px",
                    }}
                  >
                    {item.check_number || "—"}
                  </span>

                  <span
                    className={styles.subtotalValue}
                    style={{
                      left: receiptSettings.amountColumn.x,
                      width: "125px",
                      gridTemplateColumns: "minmax(0, 1fr) 30px",
                      columnGap: receiptSettings.amountColumn.decimalGap,
                    }}
                  >
                    <span className={styles.subtotalWhole}>
                      {parts.whole}
                    </span>

                    <span className={styles.subtotalDecimal}>
                      .{parts.decimal}
                    </span>
                  </span>
                </div>
              );
            })}

            {/* Total amount only; no TOTAL CHECKS label. */}
            <div
              className={styles.denominationRow}
              style={{
                height: "22px",
                minHeight: "22px",
                flex: "0 0 22px",
              }}
            >
              <span
                className={styles.subtotalValue}
                style={{
                  left: receiptSettings.totalAmount.x,
                  top: receiptSettings.totalAmount.y,
                  width: "125px",
                  gridTemplateColumns: "minmax(0, 1fr) 30px",
                  columnGap: receiptSettings.totalAmount.decimalGap,
                  fontSize: receiptSettings.totalAmount.fontSize,
                  letterSpacing: receiptSettings.totalAmount.letterSpacing,
                  fontWeight: 700,
                }}
              >
                <span className={styles.subtotalWhole}>
                  {amountParts(total).whole}
                </span>

                <span className={styles.subtotalDecimal}>
                  .{amountParts(total).decimal}
                </span>
              </span>
            </div>
          </div>

          <div className={styles.treasurerName}>
            {receiptSettings.treasurerName.text}
          </div>

          <div className={styles.treasurerTitle}>
            {receiptSettings.treasurerTitle.text}
          </div>
        </article>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={handlePrint}
          disabled={checks.length === 0}
        >
          <Printer size={16} />
          Print {label} Check Slip
        </button>
      </div>
    </div>
  );
}
