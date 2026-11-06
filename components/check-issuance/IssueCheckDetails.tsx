"use client";

import type { Signatory } from "./IssueCheckTypes";

type Props = {
  dvNo: string;
  setDvNo: (value: string) => void;

  checkDate: string;
  setCheckDate: (value: string) => void;

  payee: string;
  setPayee: (value: string) => void;

  payor: string;
  setPayor: (value: string) => void;

  signatory1: string;
  setSignatory1: (value: string) => void;

  signatory2: string;
  setSignatory2: (value: string) => void;

  particulars: string;
  setParticulars: (value: string) => void;

  signatories: Signatory[];
  loadingSignatories: boolean;
  signatoryError: string;
  onRetrySignatories: () => void;
};

const DEFAULT_PAYOR = "Municipality of Taytay, Palawan";

const inputClass =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

function Field({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

export default function IssueCheckDetails({
  dvNo,
  setDvNo,
  checkDate,
  setCheckDate,
  payee,
  setPayee,
  payor,
  setPayor,
  signatory1,
  setSignatory1,
  signatory2,
  setSignatory2,
  particulars,
  setParticulars,
  signatories,
  loadingSignatories,
  signatoryError,
  onRetrySignatories,
}: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-800">
          Transaction Details
        </h3>
      </div>

      <div className="space-y-4 p-4">
        {/* ROW 1 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field
            label="DV No."
            value={dvNo}
            onChange={setDvNo}
            placeholder="Enter DV number"
            required
          />

          <Field
            label="Check Date"
            type="date"
            value={checkDate}
            onChange={setCheckDate}
            required
          />

          <Field
            label="Payor"
            value={payor}
            onChange={setPayor}
            placeholder={DEFAULT_PAYOR}
            required
          />
        </div>

        {/* ROW 2: PAYEE */}
        <div>
          <Field
            label="Payee"
            value={payee}
            onChange={setPayee}
            placeholder="Enter payee"
            required
          />
        </div>

        {/* ROW 3: REMARKS AND SIGNATORIES */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label className={labelClass}>
              Particulars / Remarks
            </label>

            <textarea
              value={particulars}
              onChange={(event) => setParticulars(event.target.value)}
              rows={4}
              placeholder="Enter transaction particulars"
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* SIGNATORY 1 */}
            <div>
              <label className={labelClass}>
                Signatory 1 <span className="text-red-500">*</span>
              </label>

              <select
                value={signatory1}
                onChange={(event) => setSignatory1(event.target.value)}
                required
                disabled={loadingSignatories}
                className={inputClass}
              >
                <option value="">
                  {loadingSignatories
                    ? "Loading signatories..."
                    : "Select Signatory 1"}
                </option>

                {signatories.map((signatory) => (
                  <option key={signatory.id} value={signatory.id}>
                    {signatory.full_name} —{" "}
                    {signatory.position || signatory.office || ""}
                  </option>
                ))}
              </select>
            </div>

            {/* SIGNATORY 2 */}
            <div>
              <label className={labelClass}>
                Signatory 2 <span className="text-red-500">*</span>
              </label>

              <select
                value={signatory2}
                onChange={(event) => setSignatory2(event.target.value)}
                required
                disabled={loadingSignatories}
                className={inputClass}
              >
                <option value="">
                  {loadingSignatories
                    ? "Loading signatories..."
                    : "Select Signatory 2"}
                </option>

                {signatories.map((signatory) => (
                  <option key={signatory.id} value={signatory.id}>
                    {signatory.full_name} —{" "}
                    {signatory.position || signatory.office || ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SIGNATORY ERROR */}
        {signatoryError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {signatoryError}

            <button
              type="button"
              onClick={onRetrySignatories}
              className="ml-2 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </section>
  );
}