"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  X,
  BookOpen,
  FileText,
  Hash,
} from "lucide-react";

type Props = {
  open: boolean;
  item: any;
  onClose: () => void;

  onSelect: (booklet: any) => void;
};

export default function AssignBookletModal({
  open,
  item,
  onClose,
  onSelect,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const [booklets, setBooklets] =
    useState<any[]>([]);


  useEffect(() => {

    if (
      open &&
      item
    ) {

      loadBooklets();

    }

  }, [open, item]);

  async function loadBooklets() {

    try {

      setLoading(true);

      const res =
        await axios.get(
          "/api/rat/booklets",
          {
            params: {
              accountable_form_id:
                item.accountable_form_id,
            },
          }
        );

      setBooklets(
        res.data.data ?? []
      );

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  }


 

function handleSelect(booklet: any) {

  onSelect(booklet);

  onClose();

}

  if (!open)
    return null;

  return (

    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-6">

      <div className="w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">

          <div>

            <h2 className="text-xl font-bold text-slate-800">

              Assign Booklet

            </h2>

            <p className="text-sm text-slate-500">

              Select an available booklet.

            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-200"
          >

            <X size={22} />

          </button>

        </div>

        <div className="space-y-6 p-6">

          {/* Requested Form */}

<div className="rounded-xl border">

  <div className="border-b bg-slate-50 px-5 py-3">

    <div className="flex items-center gap-2 font-semibold text-slate-700">

      <FileText size={18} />

      Requested Accountable Form

    </div>

  </div>

  <div className="grid grid-cols-3 gap-6 p-5">

    <div>

      <div className="text-xs uppercase tracking-wide text-slate-500">
        Form Code
      </div>

      <div className="mt-1 font-semibold text-blue-700">

        {item?.form_code}

      </div>

    </div>

    <div>

      <div className="text-xs uppercase tracking-wide text-slate-500">
        Accountable Form
      </div>

      <div className="mt-1">

        {item?.form_name}

      </div>

    </div>

    <div>

      <div className="text-xs uppercase tracking-wide text-slate-500">
        Requested Quantity
      </div>

      <div className="mt-1 font-semibold">

        {item?.quantity}

      </div>

    </div>

  </div>

</div>

{/* Available Booklets */}

<div className="rounded-xl border">

  <div className="border-b bg-slate-50 px-5 py-3">

    <div className="flex items-center gap-2 font-semibold text-slate-700">

      <BookOpen size={18} />

      Available Booklets

    </div>

  </div>

  <div className="overflow-x-auto">

    <table className="w-full">
      <thead className="bg-slate-100">

        <tr className="text-left text-sm font-semibold text-slate-700">

          <th className="px-4 py-3">
            Form Code
          </th>

          <th className="px-4 py-3">
            Control No.
          </th>

          <th className="px-4 py-3">
            Series
          </th>

          <th className="px-4 py-3 text-center">
            Current OR
          </th>

          <th className="px-4 py-3 text-center">
            OR Range
          </th>

          <th className="px-4 py-3 text-center">
            Status
          </th>

        </tr>

      </thead>

      <tbody>

        {loading ? (

          <tr>


            <td
              colSpan={6}
              className="py-12 text-center text-slate-500"
            >

              Loading available booklets...

            </td>

          </tr>

        ) : booklets.length === 0 ? (

          <tr>

            <td
              colSpan={6}
              className="py-12 text-center text-slate-500"
            >

              No available booklet found.

            </td>

          </tr>

        ) : (

          booklets.map((booklet) => (

            <tr
              key={booklet.id}
              onClick={() =>
                handleSelect(booklet)
              }
              className="cursor-pointer border-b transition hover:bg-blue-50"
            >

              <td className="px-4 py-3 font-semibold text-indigo-600">

                {booklet.form_code}

              </td>

              
              <td className="px-4 py-3 font-semibold text-blue-700">

                {booklet.control_no}

              </td>

              <td className="px-4 py-3">

                {booklet.series}

              </td>

              <td className="px-4 py-3 text-center">

                {booklet.current_or}

              </td>

              <td className="px-4 py-3 text-center">

                {booklet.beginning_or}
                {" - "}
                {booklet.ending_or}

              </td>

              <td className="px-4 py-3 text-center">

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">

                  {booklet.status}

                </span>

              </td>

            </tr>

          ))

        )}

      </tbody>

    </table>

  </div>

</div>

{/* Footer */}

<div className="flex items-center justify-end gap-3 border-t pt-5">

  <button
    onClick={onClose}
    className="rounded-lg border border-slate-300 px-5 py-2 font-medium transition hover:bg-slate-100"
  >
    Cancel
  </button>



</div>

</div>

</div>

</div>
);
}