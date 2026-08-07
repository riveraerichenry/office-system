"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import RISStats from "@/components/ris/RISStats";
import RISTable from "@/components/ris/RISTable";
import RISDetailsModal from "@/components/ris/RISDetailsModal";
import RISHistory from "@/components/ris/RISHistoryCard";
import RegisterRISModal from "@/components/ris/RegisterRISModal";

export default function RISPage() {
  const [loading, setLoading] = useState(false);

  const [rows, setRows] = useState<any[]>([]);

  const [selected, setSelected] =
    useState<any>(null);

  const [openRegister, setOpenRegister] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [historyFilter, setHistoryFilter] =
    useState("my");

  const ROWS_PER_PAGE = 10;

  useEffect(() => {
    loadData();
  }, [historyFilter]);

  async function loadData() {
    try {
      setLoading(true);

      const res = await axios.get(
        "/api/ris",
        {
          params: {
            view: historyFilter,
          },
        }
      );

      setRows(res.data.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();

    return rows.filter(
      (r) =>
        r.ris_no
          ?.toLowerCase()
          .includes(keyword) ||
        r.accountable_officer
          ?.toLowerCase()
          .includes(keyword) ||
        r.status
          ?.toLowerCase()
          .includes(keyword)
    );
  }, [rows, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.ceil(
    filtered.length / ROWS_PER_PAGE
  );

  const paginated = filtered.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  return (
    <>
      <div className="space-y-6">

        <RISStats rows={rows} />

        <div className="grid grid-cols-12 gap-6">

          <div className="col-span-12 xl:col-span-8">

            <RISTable
              data={paginated}
              loading={loading}
              search={search}
              page={page}
              totalPages={totalPages}
              onSearch={setSearch}
              onPageChange={(p) => {
                if (p < 1) return;
                if (p > totalPages) return;

                setPage(p);
              }}
              onSelect={setSelected}
              onRequest={() =>
                setOpenRegister(true)
              }
            />

          </div>

          <div className="col-span-12 xl:col-span-4">

            <RISHistory
              rows={rows}
              filter={historyFilter}
              onFilterChange={
                setHistoryFilter
              }
            />

          </div>

        </div>

      </div>

      <RISDetailsModal
        open={!!selected}
        request={selected}
        onClose={() =>
          setSelected(null)
        }
      />

      <RegisterRISModal
        open={openRegister}
        onClose={() =>
          setOpenRegister(false)
        }
        onSuccess={async () => {
          setOpenRegister(false);
          await loadData();
        }}
      />
    </>
  );
}