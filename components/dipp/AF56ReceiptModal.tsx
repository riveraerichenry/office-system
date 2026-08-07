"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import BookletHeader from "./general/BookletHeader";
import AF56BillingInformation from "./af56/AF56BillingInformation";
import AF56BillingResults from "./af56/AF56BillingResult";
import AF56BillingItems from "./af56/AF56BillingItems";
import UnrevisedPropertyModal from "./af56/unrevised/UnrevisedPropertyModal";

import Swal from "sweetalert2";

type Props = {
  open: boolean;
  booklet: any;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AF56ReceiptModal({
  open,
  booklet,
  onClose,
  onSuccess,
}: Props) { 
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);


  const [saving, setSaving] = useState(false);
  const [unrevisedOpen, setUnrevisedOpen] = useState(false);

    const [payor, setPayor] = useState("");

    const [paymentMode, setPaymentMode] =
    useState("Cash");

    const [remarks, setRemarks] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Search Billing
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) return;

    if (search.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        console.log("BOOKLET OBJECT");
console.log(booklet);

console.log("BOOKLET ID");
console.log(booklet.id);

        const res = await axios.get(
          "/api/rpt/billing/search",
          {
            params: {
              q: search,
            },
          }
        );

        setResults(res.data.data ?? []);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, open]);

  /*
  |--------------------------------------------------------------------------
  | Select Billing
  |--------------------------------------------------------------------------
  */

  const handleSelect = async (row: any) => {
    try {

        console.log("BOOKLET OBJECT");
console.log(booklet);

console.log("BOOKLET ID");
console.log(booklet.id);
      const res = await axios.get(
        `/api/rpt/billing/${row.id}`
      );

      setSelected(res.data.billing);

        setPayor(res.data.billing.owner_name ?? "");

        setPaymentMode("Cash");

        setRemarks("");

        setSearch("");

        setResults([]);
    } catch (err) {
      console.error(err);
    }
  };


  const handleProcess = async () => {
  if (!selected) {
    Swal.fire(
      "No Billing Selected",
      "Please select a billing first.",
      "warning"
    );
    return;
  }

  if (!payor.trim()) {
    Swal.fire(
      "Payor Required",
      "Please enter the payor name.",
      "warning"
    );
    return;
  }

  try {
    setSaving(true);


    console.log("BOOKLET");
console.log(booklet);

console.log("BOOKLET ID");
console.log(booklet.id);

    const res = await axios.post(
      "/api/dipp/transactions/rpt",
      {
        booklet_registration_id: booklet.id,

        billing_id: selected.id,

        receipt_date: new Date(),

        payor,

        payment_mode: paymentMode,

        remarks,
      }
    );

    Swal.fire({
      icon: "success",
      title: "Collection Processed",
      text:
        `OR No. ${res.data.or_number} successfully issued.`,
      confirmButtonColor: "#2563eb",
    });

    onSuccess();

    onClose();
  } catch (err: any) {
    Swal.fire(
      "Error",
      err.response?.data?.message ??
        "Unable to process collection.",
      "error"
    );
  } finally {
    setSaving(false);
  }
};

  if (!open || !booklet) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="flex h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <BookletHeader booklet={booklet} />

        {/* Body */}
            <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
            {/* Folder Tab */}
            <div className="ml-6 inline-block rounded-t-xl border border-b-0 bg-white px-4 py-3 shadow-sm">
                <AF56BillingInformation
                search={search}
                onSearch={setSearch}
                />
            </div>

            {/* Main Card */}
            <div className="-mt-px min-h-[600px] rounded-xl border bg-white p-6 shadow-sm">
                <AF56BillingResults
                loading={loading}
                results={results}
                selected={selected}
                onSelect={handleSelect}
                />

                {selected && (
                <AF56BillingItems
                    items={selected.items ?? []}
                />
                )}
            </div>
            </div>

            {/* Footer */}
            <div className="border-t bg-white px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Left */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="rounded-xl border border-slate-300 bg-white px-8 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => setUnrevisedOpen(true)}
                    className="rounded-xl bg-amber-600 px-8 py-3 font-medium text-white transition hover:bg-amber-700"
                  >
                    Unrevised Property
                  </button>
                </div>

                {/* Right */}
                <div className="flex items-center gap-4">
                <div className="text-right">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Grand Total
                    </div>

                    <div className="text-4xl font-bold text-blue-700">
                    ₱
                    {Number(selected?.grand_total ?? 0).toLocaleString(
                        "en-PH",
                        {
                        minimumFractionDigits: 2,
                        }
                    )}
                    </div>
                </div>

                <button
                    onClick={handleProcess}
                    disabled={!selected || saving}
                    className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                    {saving
                        ? "Processing..."
                        : "Process Collection"}
                </button>
                </div>

                <UnrevisedPropertyModal
                  open={unrevisedOpen}
                  booklet={booklet}
                  onClose={() => setUnrevisedOpen(false)}
                  onSuccess={() => {
                    setUnrevisedOpen(false);
                    onSuccess();
                  }}
/>
            </div>
            </div>
      </div>
    </div>
  );
}