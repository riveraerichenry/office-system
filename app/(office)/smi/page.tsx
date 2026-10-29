
"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import InventoryTable from "@/components/smi/InventoryTable";
import RegisterBookletModal from "@/components/smi/RegisterBookletModal";
import BookletHistoryCard from "@/components/smi/BookletHistoryCard";
import InventoryDetailsModal from "@/components/smi/InventoryDetailsModal";

import CashTicketModal, {
  type CashTicketPayload,
} from "@/components/smi/CashTicketModal";

import type { CashTicketRow } from "@/components/smi/CashTicketTable";
import type { InventoryReportRow } from "@/components/smi/InventoryReportPreview";
import type { InventoryReportOptions } from "@/components/smi/GenerateInventoryReportModal";

export default function SMIPage() {
  const currentYear = new Date().getFullYear().toString();

  // Accountable Forms
  const [inventory, setInventory] = useState<any[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState(currentYear);
  const [loading, setLoading] = useState(false);

  const [openInventory, setOpenInventory] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);

  // Cash Tickets
  const [cashTickets, setCashTickets] = useState<CashTicketRow[]>([]);
  const [cashTicketLoading, setCashTicketLoading] = useState(false);
  const [cashTicketError, setCashTicketError] = useState("");
  const [openCashTicket, setOpenCashTicket] = useState(false);

  // Inventory Report
  const [reportLoading] = useState(false);
  const [reportData] = useState<InventoryReportRow[]>([]);
  const [reportMonth, setReportMonth] = useState(
    new Date().getMonth() + 1
  );
  const [reportYear, setReportYear] = useState(
    new Date().getFullYear()
  );

  // Load Accountable Forms
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [inventoryRes, formRes, historyRes] = await Promise.all([
        axios.get("/api/smi/inventory", {
          params: {
            search,
            year: yearFilter,
          },
        }),
        axios.get("/api/accountable-forms/master"),
        axios.get("/api/smi/history"),
      ]);

      setInventory(inventoryRes.data.data ?? []);
      setYears(inventoryRes.data.years ?? []);
      setForms(formRes.data.data ?? []);
      setHistory(historyRes.data.data ?? []);
    } catch (error) {
      console.error("Failed to load SMI data:", error);
    } finally {
      setLoading(false);
    }
  }, [search, yearFilter]);

  // Load Cash Tickets
  const loadCashTickets = useCallback(async () => {
    try {
      setCashTicketLoading(true);
      setCashTicketError("");

      const response = await axios.get("/api/smi/cash-tickets", {
        params: {
          _t: Date.now(),
        },
      });

      setCashTickets(response.data.data ?? []);
    } catch (error) {
      console.error("Failed to load cash tickets:", error);

      setCashTicketError(
        axios.isAxiosError(error)
          ? error.response?.data?.message ||
              error.response?.data?.error ||
              "Failed to load cash tickets."
          : "Failed to load cash tickets."
      );
    } finally {
      setCashTicketLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    void loadCashTickets();
  }, [loadCashTickets]);

  // View Accountable Form Details
  const handleView = (row: any) => {
    setSelectedForm(row);
    setOpenInventory(true);
  };

  // Register Cash Ticket
  const handleCashTicketSubmit = useCallback(
    async (payload: CashTicketPayload) => {
      try {
        await axios.post("/api/smi/cash-tickets", payload);

        await loadCashTickets();
        setOpenCashTicket(false);
      } catch (error) {
        console.error("Failed to save cash ticket:", error);

        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.message ||
              error.response?.data?.error ||
              "Failed to save cash ticket."
          );
        }

        throw error;
      }
    },
    [loadCashTickets]
  );

  // Inventory Report Period
  const handleReportPeriodChange = useCallback(
    (month: number, year: number) => {
      setReportMonth(month);
      setReportYear(year);
    },
    []
  );

  const handleGenerateReport = useCallback(
    (options: InventoryReportOptions) => {
      console.log("Inventory report options:", {
        ...options,
        month: reportMonth,
        year: reportYear,
      });
    },
    [reportMonth, reportYear]
  );

  // Filter Accountable Forms
  const filtered = inventory.filter((item) => {
    const keyword = search.trim().toLowerCase();

    return (
      String(item.form_code ?? "")
        .toLowerCase()
        .includes(keyword) ||
      String(item.form_name ?? "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  return (
    <>
      <div className="grid grid-cols-1 grid-cols-12 gap-6">
        {/* Inventory Component: Contains Both Inventory Types */}
        <div className="col-span-12 xl:col-span-8">
          <InventoryTable
            data={filtered}
            years={years}
            loading={loading}
            search={search}
            yearFilter={yearFilter}
            onSearch={setSearch}
            onYearFilter={setYearFilter}
            onSelect={handleView}
            onAdd={() => setOpenRegister(true)}
            reportData={reportData}
            reportLoading={reportLoading}
            onReportPeriodChange={handleReportPeriodChange}
            onGenerateReport={handleGenerateReport}
            cashTickets={cashTickets}
            cashTicketLoading={cashTicketLoading}
            cashTicketError={cashTicketError}
            onRefreshCashTickets={loadCashTickets}
            onAddCashTicket={() => setOpenCashTicket(true)}
          />
        </div>

        {/* Booklet History */}
        <div className="col-span-12 xl:col-span-4">
          <BookletHistoryCard history={history} />
        </div>
      </div>

      {/* Register Accountable Form Booklet */}
      <RegisterBookletModal
        open={openRegister}
        forms={forms}
        onClose={() => setOpenRegister(false)}
        onOpen={() => setOpenRegister(true)}
        onSuccess={loadData}
      />

      {/* Accountable Form Details */}
      <InventoryDetailsModal
        open={openInventory}
        form={selectedForm}
        onClose={() => {
          setOpenInventory(false);
          setSelectedForm(null);
        }}
      />

      {/* Register Cash Ticket */}
      <CashTicketModal
        open={openCashTicket}
        onClose={() => setOpenCashTicket(false)}
        onSubmit={handleCashTicketSubmit}
      />
    </>
  );
}
