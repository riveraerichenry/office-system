
"use client";

import { useEffect, useState } from "react";
import { Banknote, X, Loader2 } from "lucide-react";

export type CashTicketPayload = {
  ticket_number: string;
  ticket_date: string;
  number_of_tickets: number;
  amount: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CashTicketPayload) => void | Promise<void>;
};

const PRICE_PER_TICKET = 5.00;

const initialForm: CashTicketPayload = {
  ticket_number: "",
  ticket_date: new Date().toISOString().slice(0, 10),
  number_of_tickets: 1,
  amount: PRICE_PER_TICKET,
};

export default function CashTicketModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<CashTicketPayload>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        ...initialForm,
        ticket_date: new Date().toISOString().slice(0, 10),
      });
      setError("");
    }
  }, [open]);

  if (!open) return null;

  function updateField<K extends keyof CashTicketPayload>(
    field: K,
    value: CashTicketPayload[K]
  ) {
    setForm((current) => {
      const updated = { ...current, [field]: value };

      if (field === "number_of_tickets") {
        updated.amount =
          Number(updated.number_of_tickets) * PRICE_PER_TICKET;
      }

      return updated;
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!form.ticket_number.trim()) {
      setError("Please enter the cash ticket number.");
      return;
    }

    if (!form.ticket_date) {
      setError("Please select the ticket date.");
      return;
    }

    if (
      !Number.isInteger(form.number_of_tickets) ||
      form.number_of_tickets < 1
    ) {
      setError("Number of cash tickets must be at least 1.");
      return;
    }

    try {
      setSaving(true);

      await onSubmit({
        ticket_number: form.ticket_number.trim(),
        ticket_date: form.ticket_date,
        number_of_tickets: form.number_of_tickets,
        amount: form.number_of_tickets * PRICE_PER_TICKET,
      });

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save the cash ticket."
      );
    } finally {
      setSaving(false);
    }
  }

  const totalAmount =
    Number(form.number_of_tickets || 0) * PRICE_PER_TICKET;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cash-ticket-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <Banknote size={24} />
            </div>

            <div>
              <h2
                id="cash-ticket-title"
                className="text-xl font-bold text-slate-800"
              >
                Add Cash Ticket
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Register cash tickets at ₱5.00 each.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            {/* Cash Ticket Number */}
            <div>
              <label
                htmlFor="ticket_number"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Cash Ticket Number *
              </label>

              <input
                id="ticket_number"
                value={form.ticket_number}
                onChange={(event) =>
                  updateField("ticket_number", event.target.value)
                }
                required
                maxLength={100}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder="Enter ticket number"
              />
            </div>

            {/* Ticket Date */}
            <div>
              <label
                htmlFor="ticket_date"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Ticket Date *
              </label>

              <input
                id="ticket_date"
                type="date"
                value={form.ticket_date}
                onChange={(event) =>
                  updateField("ticket_date", event.target.value)
                }
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Number of Cash Tickets */}
            <div className="sm:col-span-2">
              <label
                htmlFor="number_of_tickets"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Number of Cash Tickets *
              </label>

              <input
                id="number_of_tickets"
                type="number"
                min="1"
                step="1"
                value={form.number_of_tickets}
                onChange={(event) =>
                  updateField(
                    "number_of_tickets",
                    event.target.value === ""
                      ? 0
                      : Number(event.target.value)
                  )
                }
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder="Enter number of tickets"
              />

              <p className="mt-1 text-xs text-slate-500">
                Fixed price: ₱5.00 per cash ticket.
              </p>
            </div>

            {/* Fixed Price */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Price Per Ticket
              </label>

              <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 font-semibold text-slate-700">
                ₱5.00
              </div>
            </div>

            {/* Total Amount */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Total Amount
              </label>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-lg font-bold text-emerald-700">
                ₱
                {totalAmount.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:col-span-2"
              >
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse justify-end gap-3 border-t bg-slate-50 p-5 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <Loader2 size={18} className="animate-spin" />
              )}
              {saving ? "Saving..." : "Save Cash Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
