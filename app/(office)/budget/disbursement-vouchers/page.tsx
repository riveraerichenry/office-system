
"use client";

import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";

import DVTable from "../components/disbursement-vouchers/DVTable";
import DVFormModal from "../components/disbursement-vouchers/DVFormModal";
import DVDetailsModal, {
  type DVDetailRecord,
} from "../components/disbursement-vouchers/DVDetailsModal";

import type {
  DVFormData,
  DVRecord,
  OBRRecord,
} from "../components/disbursement-vouchers/types";

const API = "/budget/api/disbursement-vouchers";
const OBR_API = "/budget/api/obrs";

function getArrayResponse(json: any): any[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.obrs)) return json.obrs;
  if (Array.isArray(json?.rows)) return json.rows;
  return [];
}

function normalizeOBR(row: any): OBRRecord {
  return {
    ...row,
    id: String(row.id ?? ""),
    obr_number: String(
      row.obr_number ?? row.obr_no ?? ""
    ),
    office_name:
      row.office_name ??
      row.office?.office_name ??
      "",
    sub_office_name:
      row.sub_office_name ??
      row.sub_office?.sub_office_name ??
      "",
    category_code:
      row.category_code ??
      row.category?.category_code ??
      "",
    category_name:
      row.category_name ??
      row.category?.category_name ??
      "",
    account_code:
      row.account_code ??
      row.account?.account_code ??
      "",
    account_name:
      row.account_name ??
      row.account?.account_name ??
      "",
    particulars: row.particulars ?? "",
    obligation_amount:
      row.obligation_amount ??
      row.total_allocation ??
      row.total_amount ??
      0,
  };
}

export default function DisbursementVouchersPage() {
  const [rows, setRows] = useState<DVRecord[]>([]);
  const [obrs, setObrs] = useState<OBRRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingObrs, setLoadingObrs] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [open, setOpen] = useState(false);

  const [selectedDV, setSelectedDV] =
    useState<DVDetailRecord | null>(null);

  // ============================================================
  // FETCH DV LIST
  // ============================================================

  const fetchRows = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch(API, {
        method: "GET",
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok || json.success === false) {
        throw new Error(
          json.message ||
          json.error ||
          "Unable to load disbursement vouchers."
        );
      }

      setRows(getArrayResponse(json));

    } catch (error) {
      await Swal.fire(
        "Unable to load",
        error instanceof Error
          ? error.message
          : "Request failed.",
        "error"
      );

    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // FETCH AVAILABLE OBRS
  // ============================================================

  const fetchObrs = useCallback(async () => {
    setLoadingObrs(true);

    try {
      const res = await fetch(
        `${OBR_API}?available_for_dv=true`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const json = await res.json();

      if (!res.ok || json.success === false) {
        throw new Error(
          json.message ||
          json.error ||
          "Unable to load OBR records."
        );
      }

      const records = getArrayResponse(json)
        .map(normalizeOBR)
        .filter(
          (obr) =>
            obr.id &&
            obr.obr_number &&
            Number(obr.obligation_amount) > 0
        );

      setObrs(records);

      if (!records.length) {
        throw new Error(
          "There are no available OBRs for a new disbursement voucher."
        );
      }

    } finally {
      setLoadingObrs(false);
    }
  }, []);

  // ============================================================
  // VIEW DV DETAILS
  // ============================================================

  const viewDV = async (row: DVRecord) => {
    setLoadingDetails(true);
    setSelectedDV(null);

    try {
      const res = await fetch(
        `${API}?id=${encodeURIComponent(row.id)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.message ||
          json.error ||
          "Unable to load voucher details."
        );
      }

      const detail = json.data;

      if (!detail || !Array.isArray(detail.items)) {
        throw new Error(
          "The server did not return the attached OBR records."
        );
      }

      console.log("DV DETAILS:", detail);
      console.log("DV ATTACHED OBRS:", detail.items);

      setSelectedDV(detail);

    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Unable to open voucher",
        text:
          error instanceof Error
            ? error.message
            : "Request failed.",
      });

    } finally {
      setLoadingDetails(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  // ============================================================
  // CREATE DV
  // ============================================================

  const createDV = async (data: DVFormData) => {
    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(
        json.message ||
        json.error ||
        "Unable to save DV."
      );
    }

    setOpen(false);

    await fetchRows();

    await Swal.fire({
      icon: "success",
      title: "DV saved",
      text:
        "Disbursement voucher has been recorded. No check was issued.",
      timer: 1800,
      showConfirmButton: false,
    });
  };

  // ============================================================
  // OPEN CREATE MODAL
  // ============================================================

  const openCreate = async () => {
    try {
      await fetchObrs();
      setOpen(true);

    } catch (error) {
      await Swal.fire(
        "Unable to load OBRs",
        error instanceof Error
          ? error.message
          : "Request failed.",
        "info"
      );
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <main className="space-y-5 p-4 sm:p-6">

      <DVTable
        rows={rows}
        loading={loading}
        onCreate={() => void openCreate()}
        onRefresh={() => void fetchRows()}
        onView={(row) => void viewDV(row)}
      />

      {/* CREATE DV */}
      {open && (
        <DVFormModal
          obrs={obrs}
          onClose={() => setOpen(false)}
          onSave={createDV}
        />
      )}

      {/* VIEW DV DETAILS */}
      {selectedDV && (
        <DVDetailsModal
          data={selectedDV}
          onClose={() => setSelectedDV(null)}
        />
      )}

      {/* LOADING OBRS */}
      {loadingObrs && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/30 p-4">
          <div className="rounded-lg bg-white px-6 py-5 text-sm font-medium text-slate-700 shadow-xl">
            Loading available OBR records...
          </div>
        </div>
      )}

      {/* LOADING DV DETAILS */}
      {loadingDetails && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/30 p-4">
          <div className="rounded-lg bg-white px-6 py-5 text-sm font-medium text-slate-700 shadow-xl">
            Loading voucher details...
          </div>
        </div>
      )}

    </main>
  );
}
