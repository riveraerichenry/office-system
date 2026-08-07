"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import InventoryTable from "@/components/smi/InventoryTable";

import RegisterBookletModal from "@/components/smi/RegisterBookletModal";

import BookletHistoryCard from "@/components/smi/BookletHistoryCard";

import InventoryDetailsModal from "@/components/smi/InventoryDetailsModal";

export default function SMIPage() {
  const currentYear = new Date().getFullYear().toString();

  const [inventory, setInventory] = useState<any[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [openInventory, setOpenInventory] = useState(false);



  const [openRegister, setOpenRegister] = useState(false);


  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] =
    useState(currentYear);

  useEffect(() => {
    loadData();
  }, [search, yearFilter]);

  async function loadData() {
    try {
      setLoading(true);

      const [
        inventoryRes,
        formRes,
        historyRes,
      ] = await Promise.all([
        axios.get("/api/smi/inventory", {
          params: {
            search,
            year: yearFilter,
          },
        }),

        axios.get(
          "/api/accountable-forms/master"
        ),

        axios.get("/api/smi/history"),
      ]);

      setInventory(
        inventoryRes.data.data ?? []
      );

      setYears(
        inventoryRes.data.years ?? []
      );

      setForms(formRes.data.data ?? []);

      setHistory(historyRes.data.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleView(row: any) {
  setSelectedForm(row);
  setOpenInventory(true);
}


  const filtered = inventory.filter(
    (item) => {
      const keyword =
        search.toLowerCase();

      return (
        item.form_code
          ?.toLowerCase()
          .includes(keyword) ||
        item.form_name
          ?.toLowerCase()
          .includes(keyword)
      );
    }
  );

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <InventoryTable
              data={filtered}
              years={years}
              loading={loading}
              search={search}
              yearFilter={yearFilter}
              onSearch={setSearch}
              onYearFilter={setYearFilter}
              onSelect={handleView}
              onAdd={() =>
                setOpenRegister(true)
              }
            />
          </div>

          <div className="col-span-4">
            <BookletHistoryCard
              history={history}
            />
          </div>
        </div>
      </div>

      <RegisterBookletModal
        open={openRegister}
        forms={forms}
        onClose={() =>
          setOpenRegister(false)
        }
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