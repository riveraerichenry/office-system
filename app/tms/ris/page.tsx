"use client";

import axios from "axios";
import {
  useEffect,
  useState,
} from "react";

import RISTable from "@/components/dashboard/RISTable";
import RISDetails from "@/components/dashboard/RISDetails";
import AddRISModal from "@/components/dashboard/AddRISModal";

export default function RISPage() {
  const [years, setYears] =
    useState<any[]>([]);

  const [risList, setRisList] =
    useState<any[]>([]);

  const [selectedRIS, setSelectedRIS] =
    useState<any>(null);

  const [selectedYear, setSelectedYear] =
    useState<number | null>(
      null
    );

  const [selectedMonth, setSelectedMonth] =
    useState<string>("");

  // NEW
  const [view, setView] =
    useState<"my" | "all">(
      "my"
    );

  const [loading, setLoading] =
    useState(false);

  const [openModal, setOpenModal] =
    useState(false);

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchRIS();
    }
  }, [
    selectedYear,
    selectedMonth,
    view,
  ]);

  async function fetchYears() {
    try {
      setLoading(true);

      const res =
        await axios.get(
          "/api/ris/years"
        );

      const rows =
        res.data.data || [];

      setYears(rows);

      if (
        rows.length > 0
      ) {
        setSelectedYear(
          rows[0]
            .fiscal_year
        );
      } else {
        setSelectedYear(
          new Date().getFullYear()
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRIS() {
    if (!selectedYear)
      return;

    try {
      setLoading(true);

      let url =
        `/api/ris?year=${selectedYear}&view=${view}`;

      if (selectedMonth) {
        url += `&month=${selectedMonth}`;
      }

      const res =
        await axios.get(url);

      const rows =
        res.data.data || [];

      setRisList(rows);

      if (
        rows.length > 0
      ) {
        await handleSelect(
          rows[0]
        );
      } else {
        setSelectedRIS(
          null
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(
    row: any
  ) {
    try {
      const res =
        await axios.get(
          `/api/ris/${row.id}`
        );

      setSelectedRIS(
        res.data.data
      );
    } catch (error) {
      console.log(error);
    }
  }

  function refresh() {
    fetchRIS();
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="col-span-8">
          <RISTable
            data={risList}
            selected={
              selectedRIS
            }
            loading={loading}
            years={years}
            selectedYear={
              selectedYear
            }
            selectedMonth={
              selectedMonth
            }
            view={view}
            onViewChange={
              setView
            }
            onYearChange={
              setSelectedYear
            }
            onMonthChange={
              setSelectedMonth
            }
            onSelect={
              handleSelect
            }
            onAdd={() =>
              setOpenModal(
                true
              )
            }
          />
        </div>

        {/* RIGHT */}
        <div className="col-span-4">
          <RISDetails
            selected={
              selectedRIS
            }
            onRefresh={
              refresh
            }
          />
        </div>
      </div>

      <AddRISModal
        open={openModal}
        onClose={() =>
          setOpenModal(
            false
          )
        }
        onSuccess={refresh}
      />
    </>
  );
}