"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import InventoryTable from "@/components/smi/InventoryTable";
import RegisterBookletModal from "@/components/smi/RegisterBookletModal";
import BookletHistoryCard from "@/components/smi/BookletHistoryCard";
import InventoryDetailsModal from "@/components/smi/InventoryDetailsModal";

import type { InventoryReportRow } from "@/components/smi/InventoryReportPreview";
import type { InventoryReportOptions } from "@/components/smi/GenerateInventoryReportModal";

export default function SMIPage() {
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = new Date().getMonth() + 1;

  const [inventory, setInventory] = useState<any[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [openInventory, setOpenInventory] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);

  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState(currentYear);

  const [reportMonth, setReportMonth] = useState(currentMonth);
  const [reportYear, setReportYear] = useState(Number(currentYear));

  const [reportData, setReportData] = useState<InventoryReportRow[]>([]);

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

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleView = (row: any) => {
    setSelectedForm(row);
    setOpenInventory(true);
  };

  const handleReportPeriodChange = useCallback(
    (month: number, year: number) => {
      setReportMonth(month);
      setReportYear(year);

      // The report API and its response schema have not yet
      // been confirmed. Do not fabricate report rows here.
      setReportData([]);
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

      // Connect the existing report-generation workflow here
      // once the report modal's options and API contract are confirmed.
    },
    [reportMonth, reportYear]
  );

  const filtered = inventory.filter((item) => {
    const keyword = search.trim().toLowerCase();

    return (
      item.form_code?.toLowerCase().includes(keyword) ||
      item.form_name?.toLowerCase().includes(keyword)
    );
  });

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 grid-cols-12 gap-6">
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
            />
          </div>

          <div className="col-span-12 xl:col-span-4">
            <BookletHistoryCard history={history} />
          </div>
        </div>
      </div>

      <RegisterBookletModal
        open={openRegister}
        forms={forms}
        onClose={() => setOpenRegister(false)}
        onOpen={() => setOpenRegister(true)}
        onSuccess={loadData}
      />

      <InventoryDetailsModal
        open={openInventory}
        form={selectedForm}
        onClose={() => {
          setOpenInventory(false);
          setSelectedForm(null);
        }}
      />
    </>
  );
}