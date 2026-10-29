
"use client";

import { useRef } from "react";
import { Printer } from "lucide-react";
import type { CSSProperties } from "react";
import styles from "./PreviewCash.module.css";

export type PreviewCashDenomination = {
  denomination: number | string;
  quantity: number | string;
  subtotal?: number | string;
};

export type PreviewCashDeposit = {
  rcd_number: string;
  deposit_date: string;
  reference_number?: string | null;
  total_cash: number | string;
  cash_denominations?: PreviewCashDenomination[];
  bank_name?: string | null;
  account_name?: string | null;
  account_number?: string | null;
  remarks?: string | null;
};

type PreviewCashProps = {
  deposit: PreviewCashDeposit;
};

const STANDARD_DENOMINATIONS = [
  1000, 500, 200, 100, 50, 20, 10, 5, 1,
];

const formatAmountParts = (value: number | string) => {
  const numericValue = Number(value || 0);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  const [whole, decimal] = safeValue.toFixed(2).split(".");

  return {
    whole: Number(whole).toLocaleString("en-PH"),
    decimal,
  };
};

export default function PreviewCash({ deposit }: PreviewCashProps) {
  const previewRef = useRef<HTMLElement>(null);

  /*
   * Adjust the X and Y values to match your printed cash deposit slip.
   * X = distance from the left edge.
   * Y = distance from the top edge.
   */
  const receiptSettings = {
    accountName: {
      x: "60px",
      y: "518px",
      fontSize: "22px",
      letterSpacing: "1px",
    },

    accountNumber: {
      x: "38px",
      y: "475px",
      fontSize: "25px",
      letterSpacing: "10px",
    },

    denominations: {
      x: "50px",
      y: "580px",
      fontSize: "12px",
      letterSpacing: "0px",
      rowHeight: "16px",
    },

    quantityColumn: {
      x: "115px",
      fontSize: "15px",
      letterSpacing: "1px",
    },

    subtotalColumn: {
      x: "220px",
      fontSize: "15px",
      letterSpacing: "0px",
    },

    totalAmount: {
      x: "270px",
      y: "775px",
      fontSize: "15px",
      letterSpacing: "0px",
    },

    treasurerName: {
      text: "IMLYN B. PARAPINA",
      x: "100px",
      y: "802px",
      fontSize: "14px",
      letterSpacing: "1px",
    },

    treasurerTitle: {
      text: "MUNICIPAL TREASURER",
      x: "90px",
      y: "814px",
      fontSize: "14px",
      letterSpacing: "1px",
    },
  };

  const pagePositions: CSSProperties = {
    "--receipt-account-name-x": receiptSettings.accountName.x,
    "--receipt-account-name-y": receiptSettings.accountName.y,
    "--receipt-account-name-size": receiptSettings.accountName.fontSize,
    "--receipt-account-name-spacing":
      receiptSettings.accountName.letterSpacing,

    "--receipt-account-number-x": receiptSettings.accountNumber.x,
    "--receipt-account-number-y": receiptSettings.accountNumber.y,
    "--receipt-account-number-size":
      receiptSettings.accountNumber.fontSize,
    "--receipt-account-number-spacing":
      receiptSettings.accountNumber.letterSpacing,

    "--receipt-denominations-x": receiptSettings.denominations.x,
    "--receipt-denominations-y": receiptSettings.denominations.y,
    "--receipt-denominations-size":
      receiptSettings.denominations.fontSize,
    "--receipt-denominations-spacing":
      receiptSettings.denominations.letterSpacing,
    "--receipt-row-height": receiptSettings.denominations.rowHeight,

    "--receipt-quantity-x": receiptSettings.quantityColumn.x,
    "--receipt-quantity-size": receiptSettings.quantityColumn.fontSize,
    "--receipt-quantity-spacing":
      receiptSettings.quantityColumn.letterSpacing,

    "--receipt-subtotal-x": receiptSettings.subtotalColumn.x,
    "--receipt-subtotal-size": receiptSettings.subtotalColumn.fontSize,
    "--receipt-subtotal-spacing":
      receiptSettings.subtotalColumn.letterSpacing,

    "--receipt-total-amount-x": receiptSettings.totalAmount.x,
    "--receipt-total-amount-y": receiptSettings.totalAmount.y,
    "--receipt-total-amount-size": receiptSettings.totalAmount.fontSize,
    "--receipt-total-amount-spacing":
      receiptSettings.totalAmount.letterSpacing,

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

  /*
   * Build the standard denomination list.
   * Missing denominations get blank rows.
   * Existing quantities and subtotals are retained.
   */
  const denominations: PreviewCashDenomination[] = (() => {
    const source = deposit.cash_denominations ?? [];
    const byDenomination = new Map<number, PreviewCashDenomination>();

    for (const item of source) {
      const denomination = Number(item.denomination);

      if (Number.isFinite(denomination)) {
        byDenomination.set(denomination, item);
      }
    }

    return STANDARD_DENOMINATIONS.map(
      (denomination) =>
        byDenomination.get(denomination) ?? {
          denomination,
          quantity: 0,
          subtotal: 0,
        }
    );
  })();

  const totalParts = formatAmountParts(deposit.total_cash);

  const handlePrint = () => {
    const sourcePage = previewRef.current;

    if (!sourcePage) {
      alert("The A4 preview is not available.");
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

    const clonedPage = sourcePage.cloneNode(true) as HTMLElement;

    /*
     * Copy computed styles so the separate print window preserves
     * the preview layout, including the total amount.
     */
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

    for (const [property, value] of Object.entries(pagePositions)) {
      if (typeof value === "string") {
        clonedPage.style.setProperty(property, value);
      }
    }

    clonedPage.className = "cash-slip-print-page";

    Object.assign(clonedPage.style, {
      position: "relative",
      display: "block",
      zoom: "1",
      transform: "none",
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
          <title>Cash Deposit Slip</title>

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
              width: 210mm;
              height: 297mm;
              margin: 0;
              padding: 0;
              overflow: hidden;
              background: #fff;
            }

            body {
              font-family: Arial, Helvetica, sans-serif;
            }

            .cash-slip-print-page {
              position: relative !important;
              display: block !important;
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

            .cash-slip-print-page .denominations {
              display: flex !important;
              flex-direction: column !important;
              left: var(--receipt-denominations-x, 50px) !important;
              top: var(--receipt-denominations-y, 575px) !important;
              font-size: var(--receipt-denominations-size, 12px) !important;
              letter-spacing: var(--receipt-denominations-spacing, 0px) !important;
            }

            .cash-slip-print-page .denominationRow {
              display: flex !important;
              flex: 0 0 var(--receipt-row-height, 16px) !important;
              height: var(--receipt-row-height, 16px) !important;
              min-height: var(--receipt-row-height, 16px) !important;
              position: relative !important;
            }

            .cash-slip-print-page .totalAmount {
              display: grid !important;
              position: absolute !important;
              left: var(--receipt-total-amount-x, 210px) !important;
              top: var(--receipt-total-amount-y, 735px) !important;
              grid-template-columns: minmax(0, 1fr) 30px !important;
              column-gap: 8px !important;
              width: 100px !important;
              white-space: nowrap !important;
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
          {/* Account Name */}
          <div className={styles.accountName}>
            {deposit.account_name || ""}
          </div>

          {/* Account Number */}
          <div className={styles.accountNumber}>
            {deposit.account_number || ""}
          </div>

          {/* Quantity and Subtotal */}
          <div className={styles.denominations}>
            {denominations.map((item, index) => {
              const denomination = Number(item.denomination);
              const quantity = Number(item.quantity);
              const subtotal = Number(
                item.subtotal ?? denomination * quantity
              );
              const hasQuantity = quantity > 0;
              const subtotalParts = formatAmountParts(subtotal);

              return (
                <div
                  className={styles.denominationRow}
                  key={`${denomination}-${index}`}
                  style={{
                    height: receiptSettings.denominations.rowHeight,
                    minHeight: receiptSettings.denominations.rowHeight,
                    flex: `0 0 ${receiptSettings.denominations.rowHeight}`,
                  }}
                >
                  <span className={styles.quantityValue}>
                    {hasQuantity
                      ? quantity.toLocaleString("en-PH")
                      : "\u00A0"}
                  </span>

                  <span className={styles.subtotalValue}>
                    {hasQuantity ? (
                      <>
                        <span className={styles.subtotalWhole}>
                          {subtotalParts.whole}
                        </span>
                        <span className={styles.subtotalDecimal}>
                          .{subtotalParts.decimal}
                        </span>
                      </>
                    ) : null}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Total Amount */}
          <div className={styles.totalAmount}>
            <span className={styles.totalAmountWhole}>
              {totalParts.whole}
            </span>
            <span className={styles.totalAmountDecimal}>
              .{totalParts.decimal}
            </span>
          </div>

          {/* Municipal Treasurer */}
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
          disabled={
            !deposit.account_number &&
            !deposit.account_name &&
            denominations.every((item) => Number(item.quantity) <= 0)
          }
        >
          <Printer size={16} />
          Print A4
        </button>
      </div>
    </div>
  );
}
