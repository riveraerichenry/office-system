"use client";

import { Fragment } from "react";

export type InventoryReportRow = {
  id: string;
  form_code: string;

  beginning_quantity: number;
  beginning_from: string | null;
  beginning_to: string | null;

  receipts_quantity: number;
  receipts_from: string | null;
  receipts_to: string | null;

  issued_quantity: number;
  issued_from: string | null;
  issued_to: string | null;

  ending_quantity: number;
  ending_from: string | null;
  ending_to: string | null;
};

type Props = {
  reportData: InventoryReportRow[];
  month: number;
  year: number;
  loading?: boolean;
};

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const sections = [
  { key: "beginning", label: "Beginning Balance" },
  { key: "receipts", label: "Receipts" },
  { key: "issued", label: "Issued" },
  { key: "ending", label: "Ending Balance" },
] as const;

function displayValue(value: string | null) {
  return value ?? "—";
}

export default function RAAFPreview({
  reportData,
  month,
  year,
  loading = false,
}: Props) {
  const validMonth = Math.min(12, Math.max(1, month));

  return (
    <div id="raaf-report-print" className="raaf-report-paper">
      <div className="raaf-report-heading">
        <p className="raaf-government-line">Republic of the Philippines</p>
        <p className="raaf-government-line">Municipality of Taytay, Palawan</p>
        <h1>Consolidated Report of Accountability for Accountable Forms</h1>
        <p className="raaf-report-period">
          For {MONTHS[validMonth - 1]} {year}
        </p>
      </div>

      {loading ? (
        <div className="raaf-report-message">
          Loading consolidated inventory report...
        </div>
      ) : (
        <div className="raaf-table-wrap">
          <table className="raaf-report-table">
            <thead>
              <tr>
                <th rowSpan={2} className="raaf-form-heading">
                  Accountable Form
                </th>
                {sections.map((section) => (
                  <th key={section.key} colSpan={3}>
                    {section.label}
                  </th>
                ))}
              </tr>
              <tr>
                {sections.map((section) => (
                  <Fragment key={section.key}>
                    <th>Qty</th>
                    <th>From OR</th>
                    <th>To OR</th>
                  </Fragment>
                ))}
              </tr>
            </thead>

            <tbody>
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan={13} className="raaf-empty-cell">
                    No inventory records found for this reporting period.
                  </td>
                </tr>
              ) : (
                reportData.map((row) => (
                  <tr key={row.id}>
                    <td className="raaf-form-code">{row.form_code}</td>
                    <td className="raaf-number">{row.beginning_quantity}</td>
                    <td>{displayValue(row.beginning_from)}</td>
                    <td>{displayValue(row.beginning_to)}</td>
                    <td className="raaf-number">{row.receipts_quantity}</td>
                    <td>{displayValue(row.receipts_from)}</td>
                    <td>{displayValue(row.receipts_to)}</td>
                    <td className="raaf-number">{row.issued_quantity}</td>
                    <td>{displayValue(row.issued_from)}</td>
                    <td>{displayValue(row.issued_to)}</td>
                    <td className="raaf-number">{row.ending_quantity}</td>
                    <td>{displayValue(row.ending_from)}</td>
                    <td>{displayValue(row.ending_to)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <footer className="raaf-certification">
        <div className="raaf-certification-text">
          <p className="raaf-certification-label">CERTIFICATION:</p>
          <p>
            I hereby certify the foregoing is a true statement of all
            accountable forms received, issued and transferred by me during
            the period above-stated and the correctness of the beginning
            balance.
          </p>
        </div>

        <div className="raaf-signature">
          <p className="raaf-signature-name">IMLYN B. PARAPINA</p>
          <p>Accountable Officer</p>
        </div>

        <div className="raaf-date">
          <p>
            {new Date().toLocaleDateString("en-PH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </footer>
    </div>
  );
}
