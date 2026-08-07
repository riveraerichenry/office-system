"use client";

import axios from "axios";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

type Props = {
  selected: any;
  onRefresh: () => void;
};

export default function ApprovalDetails({
  selected,
  onRefresh,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const [details, setDetails] =
    useState<any>(null);

  useEffect(() => {

    if (!selected) {
      setDetails(null);
      return;
    }

    loadDetails();

  }, [selected]);

  async function loadDetails() {

    try {

      setLoading(true);

      const res =
        await axios.get(
          `/api/ris/approval/${selected.id}`
        );

      setDetails(
        res.data.data
      );

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }

  }

  async function approveRIS() {

    if (!details) return;

    const result =
      await Swal.fire({

        title:
          "Approve RIS?",

        text:
          "This request will be approved.",

        icon:
          "question",

        showCancelButton:
          true,

        confirmButtonText:
          "Approve",

      });

    if (!result.isConfirmed)
      return;

    try {

      await axios.patch(
        `/api/ris/approval/${details.id}/approve`
      );

      Swal.fire({
        icon: "success",
        title:
          "Approved",
        text:
          "RIS approved successfully.",
      });

      await loadDetails();

      onRefresh();

    } catch (err: any) {

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data
            ?.message ??
          "Server Error",
      });

    }

  }

  if (!selected) {

    return (

      <div className="flex h-full items-center justify-center rounded-2xl border bg-white">

        <div className="text-center">

          <h2 className="text-xl font-semibold">

            RIS Approval

          </h2>

          <p className="mt-2 text-gray-500">

            Select a pending RIS.

          </p>

        </div>

      </div>

    );

  }

  if (loading || !details) {

    return (

      <div className="rounded-2xl border bg-white p-10">

        Loading...

      </div>

    );

  }

  return (

<div className="space-y-6">

<div className="rounded-2xl border bg-white">

<div className="border-b p-5">

<h2 className="text-lg font-semibold">

RIS Information

</h2>

</div>

<div className="grid grid-cols-2 gap-6 p-6">

<div>

<p className="text-sm text-gray-500">

RIS No

</p>

<p className="font-semibold">

{details.ris_no}

</p>

</div>

<div>

<p className="text-sm text-gray-500">

Status

</p>

<p className="font-semibold">

{details.status}

</p>

</div>

<div>

<p className="text-sm text-gray-500">

Requested By

</p>

<p className="font-semibold">

{details.requested_by_name}

</p>

</div>

<div>

<p className="text-sm text-gray-500">

Request Date

</p>

<p className="font-semibold">

{details.request_date}

</p>

</div>

<div className="col-span-2">

<p className="text-sm text-gray-500">

Remarks

</p>

<p className="font-semibold">

{details.remarks || "-"}

</p>

</div>

</div>

</div>

<div className="rounded-2xl border bg-white">

<div className="border-b p-5">

<h2 className="text-lg font-semibold">

Requested Items

</h2>

</div>

<table className="w-full">

<thead className="bg-gray-50">

<tr>

<th className="p-3 text-left">

Form Code

</th>

<th className="p-3 text-left">

Form Name

</th>

<th className="p-3 text-center">

Quantity

</th>

<th className="p-3 text-left">

Remarks

</th>

</tr>

</thead>

<tbody>

{details.items.map(
(item:any)=>(

<tr
key={item.id}
className="border-t"
>

<td className="p-3">

{item.form_code}

</td>

<td className="p-3">

{item.form_name}

</td>

<td className="p-3 text-center">

{item.quantity}

</td>

<td className="p-3">

{item.remarks || "-"}

</td>

</tr>

)
)}

</tbody>

</table>

</div>

<div className="rounded-2xl border bg-white">

<div className="border-b p-5">

<h2 className="text-lg font-semibold">

Workflow

</h2>

</div>

<table className="w-full">

<thead className="bg-gray-50">

<tr>

<th className="p-3">

Date

</th>

<th className="p-3">

Status

</th>

<th className="p-3">

Remarks

</th>

<th className="p-3">

By

</th>

</tr>

</thead>

<tbody>

{details.workflow.map(
(row:any)=>(

<tr
key={row.id}
className="border-t"
>

<td className="p-3">

{row.action_date}

</td>

<td className="p-3">

{row.status}

</td>

<td className="p-3">

{row.remarks}

</td>

<td className="p-3">

{row.full_name}

</td>

</tr>

)
)}

</tbody>

</table>

</div>

<div className="flex justify-end">

<button
onClick={approveRIS}
className="rounded-xl bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
>

Approve RIS

</button>

</div>

</div>

  );

}