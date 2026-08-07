"use client";

import axios from "axios";
import {
  useEffect,
  useState,
} from "react";

import SMITable from "@/components/dashboard/SMITable";
import SMIDetails from "@/components/dashboard/SMIDetails";
import AddSMIModal from "@/components/dashboard/AddSMIModal";

export default function SMIPage() {
  const [years, setYears] =
    useState<any[]>([]);

  const [forms, setForms] =
    useState<any[]>([]);

  const [inventory, setInventory] =
    useState<any[]>([]);

  const [officers, setOfficers] =
    useState<any[]>([]);

  const [selectedYear, setSelectedYear] =
    useState<number | null>(
      null
    );

  const [selectedForm, setSelectedForm] =
  useState<string>("");

  const [
    selectedInventory,
    setSelectedInventory,
  ] = useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  const [openModal, setOpenModal] =
    useState(false);

  useEffect(() => {
    fetchInitial();
  }, []);

  useEffect(() => {
  if (selectedYear) {
    fetchInventory();
  }
}, [
  selectedYear,
  selectedForm,
]);

  async function fetchInitial() {
    try {
      setLoading(true);

      const [
        yearsRes,
        formsRes,
        officersRes,
      ] = await Promise.all([
        axios.get(
          "/api/accountable-form-inventory/years"
        ),
        axios.get(
          "/api/accountable-forms/master"
        ),
        axios.get(
          "/api/accountable-officer/list"
        ),
      ]);

      const yearRows =
        yearsRes.data.data ||
        [];

      const formRows =
        formsRes.data.data ||
        [];

      setYears(yearRows);
      setForms(formRows);

      setOfficers(
        officersRes.data.data ||
          []
      );

      if (
        yearRows.length >
        0
      ) {
        setSelectedYear(
          yearRows[0]
            .fiscal_year
        );
      }

      setSelectedForm("");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchInventory() {
    if (!selectedYear)
  return;

    try {
      setLoading(true);

      const url = selectedForm
  ? `/api/accountable-form-inventory?year=${selectedYear}&form_id=${selectedForm}`
  : `/api/accountable-form-inventory?year=${selectedYear}`;

const res =
  await axios.get(url);

      const rows =
        res.data.data ||
        [];

      setInventory(rows);

      if (
        rows.length > 0
      ) {
        setSelectedInventory(
          rows[0]
        );
      } else {
        setSelectedInventory(
          null
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  function refresh() {
    fetchInventory();
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="col-span-8">
          <SMITable
            data={inventory}
            selected={
              selectedInventory
            }
            onSelect={
              setSelectedInventory
            }
            loading={loading}
            onAdd={() =>
              setOpenModal(
                true
              )
            }
            years={years}
            forms={forms}
            selectedYear={
              selectedYear
            }
            selectedForm={
              selectedForm
            }
            onYearChange={
              setSelectedYear
            }
            onFormChange={
              setSelectedForm
            }
          />
        </div>

        {/* RIGHT */}
        <div className="col-span-4">
          <SMIDetails
            selected={
              selectedInventory
            }
            officers={
              officers
            }
            onRefresh={
              refresh
            }
          />
        </div>
      </div>

      <AddSMIModal
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