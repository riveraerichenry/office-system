"use client";

import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export default function UserTable({
  data,
  selected,
  onSelect,
  loading,
  onAdd,
}: any) {
  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const ITEMS_PER_PAGE = 10;

  const filtered = data.filter(
    (user: any) =>
      user.username
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        ) ||
      user.role
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

  const totalPages =
    Math.ceil(
      filtered.length /
        ITEMS_PER_PAGE
    ) || 1;

  const rows = filtered.slice(
    (page - 1) *
      ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="rounded-[40px] bg-white shadow-xl px-6 py-7">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-extrabold">
          Users
        </h1>

        <button
          onClick={onAdd}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-500 text-white shadow-lg"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="mb-7">
        <div className="flex items-center gap-3 border-b border-gray-300 pb-3">
          <Search
            size={18}
            className="text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => {
              setSearch(
                e.target.value
              );
              setPage(1);
            }}
            placeholder="Search user"
            className="w-full outline-none"
          />
        </div>
      </div>

      <div className="space-y-3 min-h-[600px]">
        {loading && (
          <div>Loading...</div>
        )}

        {!loading &&
          rows.map(
            (user: any) => (
              <button
                key={user.id}
                onClick={() =>
                  onSelect(user)
                }
                className={`w-full rounded-[28px] px-5 py-5 text-left ${
                  selected?.id ===
                  user.id
                    ? "bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-500 text-white shadow-lg"
                    : "bg-[#f8f8f8] hover:bg-gray-100"
                }`}
              >
                <p className="font-bold">
                  {
                    user.username
                  }
                </p>

                <p className="text-sm opacity-80">
                  {user.role}
                </p>
              </button>
            )
          )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          disabled={page === 1}
          onClick={() =>
            setPage(page - 1)
          }
        >
          <ChevronLeft />
        </button>

        <span>
          Page {page} of{" "}
          {totalPages}
        </span>

        <button
          disabled={
            page === totalPages
          }
          onClick={() =>
            setPage(page + 1)
          }
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}