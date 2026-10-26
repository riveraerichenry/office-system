"use client";

import { useEffect, useMemo, useState } from "react";
import RAAFPreview, { type InventoryReportRow } from "./RAAFPreview";
import "./raaf-print.css";

type Props = {
  open: boolean;
  onClose: () => void;
  reportData?: InventoryReportRow[];
  loading?: boolean;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function RAAFModal({
  open,
  onClose,
  reportData = [],
  loading = false,
}: Props) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, index) => currentYear - 5 + index);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="raaf-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="raaf-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="raaf-modal-title"
      >
        <header className="raaf-modal-header no-print">
          <div>
            <h2 id="raaf-modal-title">RAAF Reports</h2>
            <p>Consolidated Report of Accountability for Accountable Forms</p>
          </div>
          <button
            type="button"
            className="raaf-icon-button"
            onClick={onClose}
            aria-label="Close RAAF modal"
          >
            ×
          </button>
        </header>

        <div className="raaf-toolbar no-print">
          <div className="raaf-period-controls">
            <label>
              Reporting month
              <select
                value={month}
                onChange={(event) => setMonth(Number(event.target.value))}
              >
                {MONTHS.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Reporting year
              <select
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
              >
                {years.map((itemYear) => (
                  <option key={itemYear} value={itemYear}>
                    {itemYear}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="raaf-toolbar-actions">
            <button
              type="button"
              className="raaf-button raaf-button-primary"
              onClick={handlePrint}
              disabled={loading}
            >
              Print Report
            </button>
            <button
              type="button"
              className="raaf-button raaf-button-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        <div className="raaf-modal-body">
          <RAAFPreview
            reportData={reportData}
            month={month}
            year={year}
            loading={loading}
          />
        </div>
      </section>
    </div>
  );
}
