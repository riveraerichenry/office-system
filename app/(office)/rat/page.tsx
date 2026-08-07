"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import ApprovedRISTable from "@/components/rat/ApprovedRISTable";
import RISDetailsModal from "@/components/rat/RISDetailsModal";
import RATTable from "@/components/rat/RATTable";
import RATDetailsModal from "@/components/rat/RATDetailsModal";

export default function RATPage() {

  /*
  |--------------------------------------------------------------------------
  | RAT Records
  |--------------------------------------------------------------------------
  */

  const [rats, setRats] =
    useState<any[]>([]);

  const [selectedRAT, setSelectedRAT] =
    useState<any>(null);

  const [ratSearch, setRatSearch] =
    useState("");

  const [ratMonth, setRatMonth] =
    useState("");

  const [ratFiscalYear, setRatFiscalYear] =
    useState("");

  const [ratStatus, setRatStatus] =
    useState("");

  const [fiscalYears, setFiscalYears] =
    useState<any[]>([]);

  const [openRATModal, setOpenRATModal] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Approved RIS
  |--------------------------------------------------------------------------
  */

  const [approvedRIS, setApprovedRIS] =
    useState<any[]>([]);

  const [selectedRIS, setSelectedRIS] =
    useState<any>(null);

  const [openModal, setOpenModal] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  const [loadingApproved, setLoadingApproved] =
    useState(false);

  const [loadingRAT, setLoadingRAT] =
    useState(false);

  const [search, setSearch] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    loadApprovedRIS();

  }, []);

  useEffect(() => {

    loadRATs();

  }, [
    ratSearch,
    ratMonth,
    ratFiscalYear,
    ratStatus,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Load Approved RIS
  |--------------------------------------------------------------------------
  */

  async function loadApprovedRIS() {

    try {

      setLoadingApproved(true);

      const res =
        await axios.get(
          "/api/rat/approved-ris",
          {
            params: {
              search,
            },
          }
        );

      setApprovedRIS(
        res.data.data ?? []
      );

      if (
        res.data.data?.length
      ) {

        setSelectedRIS(
          res.data.data[0]
        );

      } else {

        setSelectedRIS(null);

      }

    } catch (err) {

      console.error(err);

    } finally {

      setLoadingApproved(false);

    }

  }

  /*
  |--------------------------------------------------------------------------
  | Load RAT Records
  |--------------------------------------------------------------------------
  */

  async function loadRATs() {

    try {

      setLoadingRAT(true);

      const res =
        await axios.get(
          "/api/rat",
          {
            params: {
              search: ratSearch,
              month: ratMonth,
              fiscal_year: ratFiscalYear,
              status: ratStatus,
            },
          }
        );

      setRats(
        res.data.data ?? []
      );

      setFiscalYears(
        res.data.fiscalYears ?? []
      );

      if (
        res.data.data?.length
      ) {

        setSelectedRAT(
          res.data.data[0]
        );

      } else {

        setSelectedRAT(null);

      }

    } catch (err) {

      console.error(err);

    } finally {

      setLoadingRAT(false);

    }

  }

  return (

    <div className="grid grid-cols-12 gap-6">

      {/* Approved RIS */}

      <div className="col-span-3">

        <ApprovedRISTable
          data={approvedRIS}
          loading={loadingApproved}
          selected={selectedRIS}
          search={search}
          onSearch={setSearch}
          onRefresh={loadApprovedRIS}
          onSelect={(row) => {

            setSelectedRIS(row);

            setOpenModal(true);

          }}
        />

        <RISDetailsModal
          open={openModal}
          risId={selectedRIS?.id ?? null}
          onClose={() => {

            setOpenModal(false);

            setSelectedRIS(null);

          }}
          onSuccess={async () => {

            setOpenModal(false);

            setSelectedRIS(null);

            await loadApprovedRIS();

            await loadRATs();

          }}
        />

      </div>

      {/* RAT Records */}

      <div className="col-span-6">

        <RATTable
          data={rats}
          loading={loadingRAT}
          selected={selectedRAT}

          search={ratSearch}
          onSearch={setRatSearch}

          month={ratMonth}
          onMonthChange={setRatMonth}

          fiscalYear={ratFiscalYear}
          onFiscalYearChange={setRatFiscalYear}

          fiscalYears={fiscalYears}

          status={ratStatus}
          onStatusChange={setRatStatus}

          onSelect={(row) => {

            setSelectedRAT(row);

            setOpenRATModal(true);

          }}
        />
        <RATDetailsModal
          open={openRATModal}
          ratId={selectedRAT?.id ?? null}
          onClose={() => {

            setOpenRATModal(false);

            setSelectedRAT(null);

          }}
        />

      </div>

      {/* Third card */}

      <div className="col-span-3">

      </div>

    </div>

  );

}