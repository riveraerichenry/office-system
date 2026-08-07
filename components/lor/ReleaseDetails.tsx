"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

type Props = {
  rat: any;
  onSuccess: () => void;
};

export default function ReleaseDetails({
  rat,
  onSuccess,
}: Props) {


    const [fundSources, setFundSources] =
  useState<any[]>([]);

const [selectedFunds, setSelectedFunds] =
  useState<Record<string, string>>({});


  useEffect(() => {

  loadFundSources();

}, []);

async function loadFundSources() {

  const res =
    await axios.get(
      "/api/fund-sources"
    );

  setFundSources(
    res.data.data
  );

}

  async function release() {

    if (!rat) return;

    const confirm =
      await Swal.fire({

        title: "Release Accountability?",

        text:
          "This will officially release all assigned booklets.",

        icon: "question",

        showCancelButton: true,

        confirmButtonText: "Release",

      });

    if (!confirm.isConfirmed)
      return;

    /*
|--------------------------------------------------------------------------
| Validate Fund Sources
|--------------------------------------------------------------------------
*/

for (const item of rat.items) {

  if (!selectedFunds[item.id]) {

    await Swal.fire({

      icon: "warning",

      title: "Fund Source Required",

      text: `Please select a fund source for ${item.form_name}.`

    });

    return;

  }

}



    try {

      const res =
  await axios.post(
    "/api/lor/release",
    {

      rat_id:
        rat.header.id,

      funds:
        selectedFunds,

    }
  );

      await Swal.fire({

        icon: "success",

        title: "Released",

        text:
          res.data.message,

      });

      onSuccess();

    } catch (err: any) {

      Swal.fire({

        icon: "error",

        title: "Error",

        text:
          err.response?.data?.message ??
          "Unable to release accountability.",

      });

    }

  }

  if (!rat) {

    return (

      <div className="flex min-h-[700px] items-center justify-center rounded-2xl border bg-white text-slate-500 shadow-sm">

        Select a RAT.

      </div>

    );

  }

  return (

    <div className="rounded-2xl border bg-white shadow-sm">

      <div className="border-b px-6 py-4">

        <h2 className="text-lg font-semibold">

          Release Accountability

        </h2>

        <p className="text-sm text-slate-500">

          Review assigned booklets before releasing.

        </p>

      </div>

      <div className="space-y-6 p-6">

        <div className="grid grid-cols-2 gap-6">

          <Info
            label="RAT No."
            value={rat.header?.rat_no}
          />

          <Info
            label="RIS No."
            value={rat.header?.ris_no}
          />

          <Info
            label="Officer"
            value={rat.header?.officer}
          />

          <Info
            label="Generated"
            value={formatDate(
              rat.header?.generated_at
            )}
          />

          <Info
            label="Status"
            value={rat.header?.status}
          />

          <Info
            label="Assigned Booklets"
            value={
              rat.items?.length ?? 0
            }
          />

        </div>

        <div>

          <h3 className="mb-3 text-base font-semibold">

            Assigned Booklets

          </h3>

          <div className="overflow-hidden rounded-xl border">

            <table className="w-full">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-4 py-3 text-left">
                    Booklet
                  </th>

                  <th className="px-4 py-3 text-left">
                    Form
                  </th>

                  <th className="px-4 py-3 text-left">
                    Series
                  </th>

                  <th className="px-4 py-3">
                    Fund Source
                    </th>

                    <th className="px-4 py-3">
                    Beginning OR
                    </th>

                    <th className="px-4 py-3">
                    Ending OR
                    </th>

                </tr>

              </thead>

              <tbody>

                {

                  rat.items?.map(
                    (item:any)=>(

                      <tr
                        key={item.id}
                        className="border-t"
                      >

                        <td className="px-4 py-3">

                          {item.control_no}

                        </td>

                        <td className="px-4 py-3">

                          <div className="font-medium">

                            {item.form_name}

                          </div>

                          <div className="text-xs text-slate-500">

                            {item.form_code}

                          </div>

                        </td>

                        <td className="px-4 py-3">

                          {item.series}

                        </td>

                        <td className="px-4 py-3">

                            <select

                                value={
                                selectedFunds[item.id] || ""
                                }

                                onChange={(e)=>

                                setSelectedFunds({

                                    ...selectedFunds,

                                    [item.id]:
                                    e.target.value,

                                })

                                }

                                className="w-full rounded-lg border px-3 py-2"

                            >

                                <option value="">

                                Select Fund Source

                                </option>

                                {

                                fundSources.map(

                                    (fund:any)=>(

                                    <option

                                        key={fund.id}

                                        value={fund.id}

                                    >

                                        {fund.fund_code} - {fund.fund_name}

                                    </option>

                                    )

                                )

                                }

                            </select>

                            </td>

                        <td className="px-4 py-3">

                          {item.beginning_or}

                        </td>

                        <td className="px-4 py-3 font-semibold text-blue-600">

                          {item.current_or}

                        </td>

                        <td className="px-4 py-3">

                          {item.ending_or}

                        </td>

                      </tr>

                    )
                  )

                }

              </tbody>

            </table>

          </div>

        </div>

      </div>

      <div className="flex justify-end gap-3 border-t p-6">

        <button

          onClick={release}

          className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"

        >

          Release Accountability

        </button>

      </div>

    </div>

  );

}

function Info({

  label,

  value,

}:{

  label:string;

  value:any;

}){

  return(

    <div>

      <div className="text-xs uppercase tracking-wide text-slate-500">

        {label}

      </div>

      <div className="mt-1 font-medium">

        {value ?? "-"}

      </div>

    </div>

  );

}

function formatDate(value:any){

  if(!value) return "-";

  return new Date(value).toLocaleDateString();

}