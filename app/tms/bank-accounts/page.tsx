"use client";

import axios from "axios";
import {
  useEffect,
  useState,
} from "react";

import BankAccountTable from "@/components/dashboard/BankAccountTable";
import BankAccountDetails from "@/components/dashboard/BankAccountDetails";
import AddBankAccountModal from "@/components/dashboard/BankAccountModal";

export default function Page() {
  const [data, setData] =
    useState<any[]>([]);

  const [banks, setBanks] =
    useState<any[]>([]);

  const [selected, setSelected] =
    useState<any>(null);

  const [open, setOpen] =
    useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [
      accountsRes,
      banksRes,
    ] = await Promise.all([
      axios.get(
        "/api/bank-accounts"
      ),
      axios.get("/api/banks"),
    ]);

    setData(
      accountsRes.data.data ||
        []
    );

    setBanks(
      banksRes.data.data || []
    );

    if (
      accountsRes.data.data
        ?.length
    ) {
      setSelected(
        accountsRes.data
          .data[0]
      );
    }
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <BankAccountTable
            data={data}
            selected={selected}
            onSelect={
              setSelected
            }
            onAdd={() =>
              setOpen(true)
            }
          />
        </div>

        <div className="col-span-8">
          <BankAccountDetails
            selected={selected}
            banks={banks}
            onRefresh={
              fetchData
            }
          />
        </div>
      </div>

      <AddBankAccountModal
        open={open}
        onClose={() =>
          setOpen(false)
        }
        banks={banks}
        onSuccess={
          fetchData
        }
      />
    </>
  );
}