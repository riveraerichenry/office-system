"use client";

import { BookOpen, Hash, Calendar, FileText } from "lucide-react";

type Props = {
  booklet?: {
    booklet_no: string;
    form_name: string;
    series_from: string;
    series_to: string;
    remaining: number;
    issued_date: string;
    status: string;
  } | null;
};

export default function LoanedBookletCard({
  booklet,
}: Props) {
  if (!booklet) {
    return (
      <div className="sticky top-6">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3">
                <BookOpen
                  size={22}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="font-semibold">
                  Loaned Booklet
                </h2>

                <p className="text-xs text-gray-500">
                  Current assignment
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 text-center">

            <BookOpen
              size={48}
              className="mx-auto mb-3 text-gray-300"
            />

            <p className="font-medium text-gray-600">
              No Active Booklet
            </p>

            <p className="mt-1 text-sm text-gray-400">
              You currently don't have
              any assigned booklet.
            </p>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-6">

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-5 text-white">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-white/20 p-3">

              <BookOpen size={22} />

            </div>

            <div>

              <h2 className="font-semibold">
                Loaned Booklet
              </h2>

              <p className="text-xs text-blue-100">
                Currently Assigned
              </p>

            </div>

          </div>

        </div>

        <div className="space-y-5 p-5">

          <div>

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Form
            </p>

            <div className="mt-1 flex items-center gap-2">

              <FileText
                size={16}
                className="text-blue-600"
              />

              <span className="font-semibold">
                {booklet.form_name}
              </span>

            </div>

          </div>

          <div>

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Booklet Number
            </p>

            <div className="mt-1 flex items-center gap-2">

              <Hash
                size={16}
                className="text-blue-600"
              />

              <span className="font-semibold">
                {booklet.booklet_no}
              </span>

            </div>

          </div>

          <div>

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Series
            </p>

            <p className="mt-1 font-semibold">
              {booklet.series_from} - {booklet.series_to}
            </p>

          </div>

          <div>

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Remaining
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {booklet.remaining}
            </p>

            <p className="text-xs text-gray-500">
              Receipts Available
            </p>

          </div>

          <div>

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Issued Date
            </p>

            <div className="mt-1 flex items-center gap-2">

              <Calendar
                size={16}
                className="text-blue-600"
              />

              <span className="font-medium">
                {booklet.issued_date}
              </span>

            </div>

          </div>

          <div className="border-t pt-5">

            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">

              ● {booklet.status}

            </span>

          </div>

        </div>

      </div>

    </div>
  );
}