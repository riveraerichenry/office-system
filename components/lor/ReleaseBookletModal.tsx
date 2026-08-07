"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  X,
  Receipt,
  User,
  Landmark,
  Calendar,
  FileText,
} from "lucide-react";

type Props = {
  open: boolean;
  selected: any;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ReleaseBookletModal({
  open,
  selected,
  onClose,
  onSuccess,
}: Props) {

  const [fundSources, setFundSources] =
    useState<any[]>([]);

  const [fundSourceId, setFundSourceId] =
    useState("");

  const [remarks, setRemarks] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {

    if (!open) return;

    loadFundSources();

  }, [open]);

  async function loadFundSources() {

    try {

      const res =
        await axios.get(
          "/api/fund-sources"
        );

      setFundSources(
        res.data.data ?? []
      );

    } catch (err) {

      console.error(err);

    }

  }

  async function releaseBooklet() {

    try {

      setSaving(true);

      await axios.post(
        "/api/lor/release",
        {
          rat_item_id:
            selected.id,

          fund_source_id:
            fundSourceId,

          remarks,
        }
      );

      onSuccess();

    } catch (err) {

      console.error(err);

    } finally {

      setSaving(false);

    }

  }

  if (!open || !selected)
    return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b p-5">

          <div>

            <h2 className="text-xl font-semibold">

              Release Booklet

            </h2>

            <p className="text-sm text-slate-500">

              Confirm booklet release.

            </p>

          </div>

          <button
            onClick={onClose}
          >

            <X />

          </button>

        </div>

        {/* Body */}

        <div className="space-y-6 p-6">

          {/* Booklet */}

          <div>

            <h3 className="mb-3 flex items-center gap-2 font-semibold">

              <Receipt size={18} />

              Booklet Information

            </h3>

            <div className="grid grid-cols-2 gap-4">

              <div>

                <label className="text-xs text-slate-500">

                  Form Code

                </label>

                <div className="rounded-lg border bg-slate-50 p-3">

                  {selected.form_code}

                </div>

              </div>

              <div>

                <label className="text-xs text-slate-500">

                  Booklet Control No.

                </label>

                <div className="rounded-lg border bg-slate-50 p-3">

                  {selected.control_no}

                </div>

              </div>

              <div className="col-span-2">

                <label className="text-xs text-slate-500">

                  Coverage

                </label>

                <div className="rounded-lg border bg-slate-50 p-3">

                  {selected.beginning_or}
                  {" - "}
                  {selected.ending_or}

                </div>

              </div>

            </div>

          </div>

          {/* Release */}

          <div>

            <h3 className="mb-3 flex items-center gap-2 font-semibold">

              <Landmark size={18} />

              Release Information

            </h3>

            <div>

              <label className="text-xs text-slate-500">

                Destination Fund

              </label>

              <select
                value={fundSourceId}
                onChange={(e)=>
                  setFundSourceId(
                    e.target.value
                  )
                }
                className="mt-1 w-full rounded-lg border p-3"
              >

                <option value="">

                  Select Fund Source

                </option>

                {

                  fundSources.map((f)=>(

                    <option
                      key={f.id}
                      value={f.id}
                    >

                      {f.fund_code}
                      {" - "}
                      {f.fund_name}

                    </option>

                  ))

                }

              </select>

            </div>

          </div>

          {/* Assignment */}

          <div>

            <h3 className="mb-3 flex items-center gap-2 font-semibold">

              <User size={18} />

              Assignment Details

            </h3>

            <div className="grid grid-cols-2 gap-4">

              <div>

                <label className="text-xs text-slate-500">

                  Accountable Officer

                </label>

                <div className="rounded-lg border bg-slate-50 p-3">

                  {selected.accountable_officer}

                </div>

              </div>

              <div>

                <label className="text-xs text-slate-500">

                  Assigned By

                </label>

                <div className="rounded-lg border bg-slate-50 p-3">

                  {selected.assigned_by}

                </div>

              </div>

              <div className="col-span-2">

                <label className="text-xs text-slate-500">

                  Assigned Date & Time

                </label>

                <div className="rounded-lg border bg-slate-50 p-3">

                  {

                    selected.generated_at

                    ?

                    new Date(
                      selected.generated_at
                    ).toLocaleString()

                    :

                    "-"

                  }

                </div>

              </div>

            </div>

          </div>

          {/* Remarks */}

          <div>

            <h3 className="mb-3 flex items-center gap-2 font-semibold">

              <FileText size={18} />

              Remarks

            </h3>

            <textarea
              rows={3}
              value={remarks}
              onChange={(e)=>
                setRemarks(
                  e.target.value
                )
              }
              className="w-full rounded-lg border p-3"
              placeholder="Optional remarks..."
            />

          </div>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t p-5">

          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2"
          >

            Cancel

          </button>

          <button
            disabled={
              saving ||
              !fundSourceId
            }
            onClick={
              releaseBooklet
            }
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white disabled:opacity-50"
          >

            {saving
              ? "Releasing..."
              : "Release Booklet"}

          </button>

        </div>

      </div>

    </div>

  );

}