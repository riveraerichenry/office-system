"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import FundSourceTable from "./FundSourceTable";
import FundSourceDetails from "./FundSourceDetails";
import AddFundSourceModal from "@/components/tms/AddFundSourceModal";


type FundSource = {
  id: string;
  fund_code: string;
  acronym: string;
  seq_no: string;
  fund_name: string;
  remarks: string;
};

export default function FundSourcePage() {
  const [loading, setLoading] =
    useState(true);

  const [openModal, setOpenModal] =
    useState(false);

  const [fundSources, setFundSources] =
    useState<FundSource[]>([]);

  const [selected, setSelected] =
    useState<FundSource | null>(
      null
    );

  useEffect(() => {
    fetchFundSources();
  }, []);

  async function fetchFundSources() {
    try {
      setLoading(true);

      const res =
        await axios.get(
          "/api/fund-sources"
        );

      const data =
        res.data.data || [];

      setFundSources(data);

      if (data.length > 0) {
        setSelected(data[0]);
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
        <div className="col-span-4">
          <FundSourceTable
            data={fundSources}
            selected={selected}
            onSelect={setSelected}
            loading={loading}
            onAdd={() =>
              setOpenModal(true)
            }
          />
        </div>

        <div className="col-span-8">
          <FundSourceDetails
            selected={selected}
            onRefresh={
              fetchFundSources
            }
          />
        </div>
      </div>

      <AddFundSourceModal
        open={openModal}
        onClose={() =>
          setOpenModal(false)
        }
        onSuccess={
          fetchFundSources
        }
      />
    </>
  );
}