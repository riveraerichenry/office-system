"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import AssignedRATTable from "@/components/lor/AssignedRATTable";
import LORTable from "@/components/lor/LORTable";
import ReleaseBookletModal from "@/components/lor/ReleaseBookletModal";

import LORDetailsModal from "@/components/lor/LORDetailsModal";

export default function LORPage() {

  /*
  |--------------------------------------------------------------------------
  | LOR Records
  |--------------------------------------------------------------------------
  */

  const [openLORModal, setOpenLORModal] =
    useState(false);

  const [lors, setLors] =
    useState<any[]>([]);

  const [selectedLOR, setSelectedLOR] =
    useState<any>(null);

  const [lorSearch, setLorSearch] =
    useState("");

  const [lorYear, setLorYear] =
    useState("");

  const [lorOfficer, setLorOfficer] =
    useState("");

  const [officers, setOfficers] =
    useState<any[]>([]);

  /*
  |--------------------------------------------------------------------------
  | Assigned RAT
  |--------------------------------------------------------------------------
  */

  const [assignedRAT, setAssignedRAT] =
    useState<any[]>([]);

  const [selectedRAT, setSelectedRAT] =
    useState<any>(null);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  const [loadingAssigned, setLoadingAssigned] =
    useState(false);

  const [loadingLOR, setLoadingLOR] =
    useState(false);

  const [search, setSearch] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Modal
  |--------------------------------------------------------------------------
  */

  const [openModal, setOpenModal] =
    useState(false);

  const [selectedBooklet, setSelectedBooklet] =
    useState<any>(null);

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    loadAssignedRAT();

  }, [search]);

  useEffect(() => {

    loadLORs();

  }, [

    lorSearch,

    lorYear,

    lorOfficer,

  ]);

  /*
  |--------------------------------------------------------------------------
  | Load Assigned RAT
  |--------------------------------------------------------------------------
  */

  async function loadAssignedRAT() {

    try {

      setLoadingAssigned(true);

      const res =
        await axios.get(
          "/api/lor/assigned-rat",
          {
            params: {
              search,
            },
          }
        );

      const rows =
        res.data.data ?? [];

      setAssignedRAT(rows);

      if (
        rows.length > 0 &&
        !selectedRAT
      ) {

        setSelectedRAT(rows[0]);

      }

      if (
        rows.length === 0
      ) {

        setSelectedRAT(null);

      }

    } catch (err) {

      console.error(err);

    } finally {

      setLoadingAssigned(false);

    }

  }

  /*
  |--------------------------------------------------------------------------
  | Load LOR Records
  |--------------------------------------------------------------------------
  */

  async function loadLORs() {

    try {

      setLoadingLOR(true);

      const res =
        await axios.get(
          "/api/lor",
          {
            params: {

              search: lorSearch,

              year: lorYear,

              officer: lorOfficer,

            },
          }
        );

      const rows =
        res.data.data ?? [];

      setLors(rows);

      setOfficers(
        res.data.officers ?? []
      );

      if (
        rows.length > 0 &&
        !selectedLOR
      ) {

        setSelectedLOR(rows[0]);

      }

      if (
        rows.length === 0
      ) {

        setSelectedLOR(null);

      }

    } catch (err) {

      console.error(err);

    } finally {

      setLoadingLOR(false);

    }

  }

  /*
  |--------------------------------------------------------------------------
  | Years
  |--------------------------------------------------------------------------
  */

  const years =
    useMemo(() => {

      return Array.from(

        new Set(

          lors.map(

            (r) =>

              new Date(
                r.released_at
              ).getFullYear()

          )

        )

      )

      .sort(
        (a: any, b: any) =>
          b - a
      );

    }, [lors]);

  return (

    <>

      <div className="grid grid-cols-12 gap-6">

        {/* Assigned Booklets */}

        <div className="col-span-3">

          <AssignedRATTable

            data={assignedRAT}

            loading={loadingAssigned}

            selected={selectedBooklet}

            search={search}

            onSearch={setSearch}

            onRefresh={loadAssignedRAT}

            onSelect={(row) => {

              setSelectedBooklet(row);

              setSelectedRAT(row);

              setOpenModal(true);



            }}

          />

        </div>

        {/* Released Booklets */}

        <div className="col-span-6">

          <LORTable

            data={lors}

            loading={loadingLOR}

            selected={selectedLOR}

            search={lorSearch}

            yearFilter={lorYear}

            officerFilter={lorOfficer}

            years={years}

            officers={officers}

            onSearch={setLorSearch}

            onYearFilter={setLorYear}

            onOfficerFilter={setLorOfficer}

            onRefresh={loadLORs}

            onSelect={(row) => {

              setSelectedLOR(row);

              setOpenLORModal(true);

            }}

          />

        </div>

        {/* Details */}

        <div className="col-span-3">

          {/* Next:
              LOR Details Panel
          */}

        </div>

      </div>

      <ReleaseBookletModal

        open={openModal}

        selected={selectedBooklet}

        onClose={() => {

          setOpenModal(false);

          setSelectedBooklet(null);

        }}

        onSuccess={async () => {

          setOpenModal(false);

          setSelectedBooklet(null);

          await loadAssignedRAT();

          await loadLORs();

        }}

      />
      <LORDetailsModal

        open={openLORModal}

        selected={selectedLOR}

        onClose={() => {

          setOpenLORModal(false);

          setSelectedLOR(null);

        }}

      />

    </>

  );

}