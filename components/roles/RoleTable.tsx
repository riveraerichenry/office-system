"use client";

import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
  roles: any[];
  selected: any;
  loading: boolean;
  onSelect: (role: any) => void;
  onAdd: () => void;
};

export default function RoleTable({
  roles,
  selected,
  loading,
  onSelect,
  onAdd,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const PER_PAGE = 10;

  const filtered =
    useMemo(() => {
      return roles.filter((role) =>
        role.role_name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );
    }, [roles, search]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filtered.length /
          PER_PAGE
      )
    );

  const rows =
    filtered.slice(
      (page - 1) *
        PER_PAGE,
      page * PER_PAGE
    );

  return (
    <div className="rounded-[36px] bg-white p-6 shadow-xl">

      <div className="mb-8 flex items-center justify-between">

        <h2 className="text-4xl font-bold">
          Roles
        </h2>

        <button
          onClick={onAdd}
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            bg-gradient-to-r
            from-cyan-400
            via-purple-400
            to-fuchsia-500
            text-white
            shadow-lg
          "
        >
          <Plus size={20} />
        </button>

      </div>

      <div className="mb-8">

        <div className="flex items-center gap-3 border-b pb-3">

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
            placeholder="Search role..."
            className="w-full outline-none"
          />

        </div>

      </div>

      <div className="min-h-[620px] space-y-3">

        {loading && (
          <div className="py-10 text-center">
            Loading...
          </div>
        )}

        {!loading &&
          rows.map((role) => (

            <button
              key={role.id}
              onClick={() =>
                onSelect(role)
              }
              className={`
                w-full
                rounded-3xl
                p-5
                text-left
                transition
                ${
                  selected?.id ===
                  role.id
                    ? "bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-500 text-white shadow-lg"
                    : "bg-gray-50 hover:bg-gray-100"
                }
              `}
            >

              <div className="text-lg font-bold">
                {role.role_name}
              </div>

              <div className="text-sm opacity-80">
                {role.description}
              </div>

            </button>

          ))}

      </div>

      <div className="mt-6 flex items-center justify-between">

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