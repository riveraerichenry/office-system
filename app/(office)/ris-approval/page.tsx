"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import ApprovalSummary from "@/components/ris-approval/ApprovalSummary";
import PendingRequestTable from "@/components/ris/ris-approval/PendingRequestTable";
import ProcessedRequestTable from "@/components/ris/ris-approval/ProcessedRequestTable";
import ApprovalHistoryCard from "@/components/ris/ris-approval/ApprovalHistoryCard";
import RISDetailsModal from "@/components/ris/ris-approval/RISDetailModal";

import Swal from "sweetalert2";


export default function RISApprovalPage() {
  const currentYear = new Date().getFullYear().toString();
  const [selectedRows, setSelectedRows] =
  useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  const [pending, setPending] = useState<any[]>([]);
  const [processed, setProcessed] = useState<any[]>([]);

  const [summary, setSummary] = useState({
    pending: 0,
    approved: 0,
    issued: 0,
    total: 0,
  });

  const [history, setHistory] = useState<any[]>([]);

  const [selected, setSelected] = useState<any>(null);

  const [openDetails, setOpenDetails] =
    useState(false);

  const [selectedRISId, setSelectedRISId] =
    useState<string | null>(null);

  const [searchPending, setSearchPending] = useState("");
  const [searchProcessed, setSearchProcessed] = useState("");

  const [yearFilter, setYearFilter] =
    useState(currentYear);

  useEffect(() => {
    loadData();
  }, [yearFilter]);

  async function loadData() {
  try {
    setLoading(true);

    const [
      approvalRes,
      historyRes,
    ] = await Promise.all([

      axios.get(
        "/api/ris/approval",
        {
          params: {
            fiscal_year: yearFilter,
          },
        }
      ),

      axios.get(
        "/api/ris/approval/history"
      ),

    ]);

    setPending(
      approvalRes.data.pending ?? []
    );

    setProcessed(
      approvalRes.data.processed ?? []
    );

    setSummary(
      approvalRes.data.summary
    );

    setHistory(
      historyRes.data.data ?? []
    );

  } catch (err) {

    console.error(err);

  } finally {

    setLoading(false);

  }
}


async function handleApproveSelected() {
  if (selectedRows.length === 0) return;

  const result = await Swal.fire({
    title: "Approve RIS Request(s)?",
    html: `
      You are about to approve
      <b>${selectedRows.length}</b>
      selected RIS request(s).
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Approve",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#16a34a",
  });

  if (!result.isConfirmed) return;

  try {
    await axios.patch(
      "/api/ris/approval/approve",
      {
        ids: selectedRows,
      }
    );

    Swal.fire({
      icon: "success",
      title: "Approved",
      text: "Selected RIS request(s) have been approved.",
      timer: 1500,
      showConfirmButton: false,
    });

    setSelectedRows([]);

    await loadData();

  } catch (err: any) {

    Swal.fire({
      icon: "error",
      title: "Approval Failed",
      text:
        err.response?.data?.message ??
        "Unable to approve request.",
    });

  }
}

  return (
    <div className="space-y-6">

      <ApprovalSummary
        summary={summary}
      />

      <div className="grid grid-cols-12 gap-6">

        {/* Pending */}
        <div className="col-span-5">
          <PendingRequestTable
            rows={pending}
            loading={loading}
            search={searchPending}
            onSearch={setSearchPending}
            selected={selected}
            onSelect={(row) => {
              setSelected(row);
              setSelectedRISId(row.id);
              setOpenDetails(true);
            }}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            onApproveSelected={handleApproveSelected}
          />
        </div>

        {/* Approved / Issued */}
        <div className="col-span-4">
          <ProcessedRequestTable
            rows={processed}
            loading={loading}
            search={searchProcessed}
            onSearch={setSearchProcessed}
            selected={selected}
            onSelect={(row) => {
              setSelected(row);
              setSelectedRISId(row.id);
              setOpenDetails(true);
            }}
          />
        </div>

        {/* History */}
        <div className="col-span-3">

          <ApprovalHistoryCard history={history} />
        </div>

      </div>
      <RISDetailsModal
  open={openDetails}
  risId={selectedRISId}
  onClose={() => {
    setOpenDetails(false);
    setSelectedRISId(null);
  }}
/>

    </div>

  );
}