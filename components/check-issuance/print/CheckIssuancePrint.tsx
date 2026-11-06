
"use client";

import { Printer } from "lucide-react";

import DBPPrint from "./DBPPrint";
import LBPPrint from "./LBPPrint";
import type { CheckPrintDetails } from "./printTypes";
import { numberToWords } from "./printTypes";

import styles from "./check-issuance-print.module.css";

type Props = {
  details: CheckPrintDetails;
};

export default function CheckIssuancePrint({ details }: Props) {
  const bankCode = details.bank_code?.trim().toUpperCase() ?? "";
  const amount = Number(details.total_amount) || 0;
  const amountInWords = numberToWords(amount);

  function handleReprint() {
    if (bankCode !== "DBP" && bankCode !== "LBP") {
      window.alert(
        `No print format configured for bank code: ${
          bankCode || "Unknown"
        }`
      );
      return;
    }

    // Open the browser print dialog from the button click.
    window.print();
  }

  return (
    <>
      <button
        type="button"
        onClick={handleReprint}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
      >
        <Printer size={16} />
        Reprint
      </button>

      <div id="check-issuance-print" className={styles.printRoot}>
        {bankCode === "DBP" && (
          <DBPPrint
            details={details}
            amount={amount}
            amountInWords={amountInWords}
          />
        )}

        {bankCode === "LBP" && (
          <LBPPrint
            
          />
        )}
      </div>
    </>
  );
}
