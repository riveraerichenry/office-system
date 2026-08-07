"use client";

import axios from "axios";
import { useEffect, useState } from "react";

import BankTable from "@/components/dashboard/BankTable";
import BankDetails from "@/components/dashboard/BankDetails";
import BankAccountsCard from "@/components/dashboard/BankAccountsCard";
import AddBankModal from "@/components/dashboard/AddBankModal";

export default function BanksPage() {
  const [banks, setBanks] =
    useState<any[]>([]);

  const [selected, setSelected] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [showModal, setShowModal] =
    useState(false);

  useEffect(() => {
    fetchBanks();
  }, []);

  async function fetchBanks() {
    try {
      setLoading(true);

      const res =
        await axios.get(
          "/api/banks"
        );

      const data =
        res.data.data || [];

      setBanks(data);

      if (data.length > 0) {
        setSelected(data[0]);
      } else {
        setSelected(null);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT CARD */}
        <div className="col-span-4">
          <BankTable
            data={banks}
            selected={selected}
            onSelect={setSelected}
            loading={loading}
            onAdd={() =>
              setShowModal(true)
            }
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="col-span-8 space-y-6">
          {/* Bank Details */}
          <BankDetails
            selected={selected}
            onRefresh={fetchBanks}
          />

          {/* Bank Accounts */}
          <BankAccountsCard
            bank={selected}
          />
        </div>
      </div>

      <AddBankModal
        open={showModal}
        onClose={() =>
          setShowModal(false)
        }
        onSuccess={fetchBanks}
      />
    </>
  );
}