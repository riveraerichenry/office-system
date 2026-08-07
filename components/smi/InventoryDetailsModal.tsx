"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  X,
  Search,
  Package,
  Calendar,
  Hash,
  User,
  FileText,
} from "lucide-react";

import EditBookletModal from "./EditBookletModal";

type Props = {
  open: boolean;
  form: any;
  onClose: () => void;
};

export default function InventoryDetailsModal({
  open,
  form,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [booklets, setBooklets] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<any[]>([]);


  const [openEdit, setOpenEdit] = useState(false);
const [editBooklet, setEditBooklet] = useState<any>(null);

useEffect(() => {
  if (!open || !form) return;

  setBooklets([]);
  setSelected(null);
  setHistory([]);

  loadBooklets();
}, [open, form]);


  async function loadBooklets() {
    try {
      setLoading(true);

      const res = await axios.get(
        `/api/smi/inventory/${form.id}`
      );

      setBooklets(res.data.data ?? []);

      if (res.data.data.length > 0) {
        setSelected(res.data.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }


  async function loadHistory(){

    try{

        const res = await axios.get(
            `/api/smi/booklets/${selected.id}/history`
        );

        setHistory(res.data.data ?? []);

    }catch(err){

        console.error(err);

    }

}

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();

    return booklets.filter(
      (b) =>
        b.booklet_number
          ?.toLowerCase()
          .includes(keyword) ||
        b.status
          ?.toLowerCase()
          .includes(keyword)
    );
  }, [booklets, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="flex h-[85vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {form.form_code}
            </h2>

            <p className="text-sm text-slate-500">
              {form.form_name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-12 gap-5 p-5">

          {/* LEFT */}

            <div className="col-span-12 rounded-xl border overflow-hidden">

            <div className="border-b p-4 bg-slate-50">

                <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">
                    Registered Booklets
                </h3>

                <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    {filtered.length} Booklets
                </span>
                </div>

                <div className="relative mt-4">
                <Search
                    size={18}
                    className="absolute left-3 top-3 text-slate-400"
                />

                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search booklet number..."
                    className="w-full rounded-lg border py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none"
                />
                </div>

            </div>

            {loading ? (
                <div className="p-12 text-center text-slate-500">
                Loading booklets...
                </div>
            ) : filtered.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                No registered booklets.
                </div>
            ) : (
                <div className="max-h-[620px] overflow-auto">

                <table className="w-full">

                    <thead className="sticky top-0 bg-slate-100">

                    <tr className="text-left text-sm font-semibold text-slate-600">

                        <th className="px-4 py-3">
                        Control No.
                        </th>
                        <th className="px-4 py-3">
                        Series
                        </th>
                         <th className="px-4 py-3">
                        No. of Receipts
                        </th>


                        <th className="px-4 py-3">
                        Beginning
                        </th>

                        <th className="px-4 py-3">
                        Ending
                        </th>
                        <th className="px-4 py-3">
                        Date Registered
                        </th>

                        <th className="px-4 py-3 text-center">
                        Status
                        </th>

                    </tr>

                    </thead>

                    <tbody>

                    {filtered.map((booklet) => (

                        <tr
                            key={booklet.id}
                            onClick={() => {
                                setSelected(booklet);
                                setEditBooklet(booklet);
                                setOpenEdit(true);
                            }}
                            className={`cursor-pointer border-b transition ${
                                selected?.id === booklet.id
                                ? "bg-blue-50"
                                : "hover:bg-slate-50"
                            }`}
                            >

                        <td className="px-4 py-3 font-medium">
                            {booklet.control_no}
                        </td>
                        <td className="px-4 py-3 font-medium">
                            {booklet.series}
                        </td>
                        <td className="px-4 py-3 font-medium">
                            {booklet.receipt_count}
                        </td>

                        <td className="px-4 py-3">
                            {booklet.beginning_or}
                        </td>

                        <td className="px-4 py-3">
                            {booklet.ending_or}
                        </td>
                        <td className="px-4 py-3">
                        {booklet.created_at
                            ? new Date(booklet.created_at).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })
                            : "-"}
                        </td>

                        <td className="px-4 py-3 text-center">

                            <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold

                            ${
                                booklet.status === "AVAILABLE"
                                ? "bg-green-100 text-green-700"

                                : booklet.status === "ISSUED"
                                ? "bg-orange-100 text-orange-700"

                                : booklet.status === "CANCELLED"
                                ? "bg-red-100 text-red-700"

                                : "bg-slate-100 text-slate-700"
                            }`}
                            >
                            {booklet.status}
                            </span>

                        </td>

                        </tr>

                    ))}

                    </tbody>

                </table>

                </div>

                
            )}

    

            </div>

          {/* RIGHT

            <div className="col-span-4">

            <div className="rounded-xl border overflow-hidden">

                <div className="border-b bg-slate-50 p-4">
                <h3 className="text-lg font-semibold text-slate-800">
                    Booklet Details
                </h3>
                </div>

                {selected ? (
                <>
                    <div className="space-y-4 p-4">

                    <Field
                        label="Booklet Number"
                        value={selected.booklet_number}
                    />

                    <Field
                        label="Status"
                        value={
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold

                            ${
                            selected.status === "AVAILABLE"
                                ? "bg-green-100 text-green-700"

                                : selected.status === "ISSUED"
                                ? "bg-orange-100 text-orange-700"

                                : selected.status === "CANCELLED"
                                ? "bg-red-100 text-red-700"

                                : "bg-slate-100 text-slate-700"
                            }`}
                        >
                            {selected.status}
                        </span>
                        }
                    />

                    <Field
                        label="Beginning Series"
                        value={selected.beginning_series}
                    />

                    <Field
                        label="Ending Series"
                        value={selected.ending_series}
                    />

                    <Field
                        label="Fiscal Year"
                        value={selected.fiscal_year}
                    />

                    <Field
                        label="Registered By"
                        value={selected.registered_by}
                    />

                    <Field
                        label="Date Registered"
                        value={
                        selected.created_at
                            ? new Date(
                                selected.created_at
                            ).toLocaleDateString()
                            : "-"
                        }
                    />

                    <Field
                        label="Remarks"
                        value={selected.remarks || "-"}
                    />

                    </div>

                    <div className="border-t bg-slate-50 p-4">

                    <div className="grid gap-2">

                        <button
                        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                        >
                        Edit Booklet
                        </button>

                        <button
                        className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                        >
                        View History
                        </button>

                        {selected.status === "AVAILABLE" && (
                        <button
                            className="rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700"
                        >
                            Issue Booklet
                        </button>
                        )}

                    </div>

                    </div>

                        </>
                        ) : (
                        <div className="p-10 text-center text-slate-500">
                            Select a booklet from the list.
                        </div>
                        )}

                    </div>

                    </div>
                    <div className="mt-5 rounded-xl border">

            <div className="border-b p-4">

                <h3 className="font-semibold">

                    Transaction History

                </h3>

            </div>

            <div className="max-h-72 overflow-auto">

                {history.length===0 ? (

                    <div className="p-6 text-center text-slate-500">

                        No history available.

                    </div>

                ) : (

                    history.map(item=>(

                        <div
                            key={item.id}
                            className="border-b p-4"
                        >

                            <div className="flex justify-between">

                                <div>

                                    <div className="font-semibold">

                                        {item.action}

                                    </div>

                                    <div className="text-sm text-slate-500">

                                        {item.remarks}

                                    </div>

                                </div>

                                <div className="text-right">

                                    <div className="text-sm">

                                        {item.full_name}

                                    </div>

                                    <div className="text-xs text-slate-500">

                                        {new Date(item.created_at).toLocaleString()}

                                    </div>

                                </div>

                            </div>

                        </div>

                    ))

                )}

            </div>

        </div> */}

          </div>

          <EditBookletModal
            open={openEdit}
            booklet={editBooklet}
            onClose={() => {
                setOpenEdit(false);
                setEditBooklet(null);
            }}
            onSuccess={() => {
                loadBooklets();
                setOpenEdit(false);
                setEditBooklet(null);
            }}
            />

        </div>
        

      </div>




  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
}) {
  return (
    <div className="rounded-lg border p-3">

      <div className="flex items-center gap-2 text-sm text-slate-500">
        {icon}
        {label}
      </div>

      <div className="mt-2 font-semibold text-slate-800">
        {value || "-"}
      </div>

    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div className="mt-1 rounded-lg border bg-white px-3 py-2">
        {value}
      </div>
    </div>
  );
}