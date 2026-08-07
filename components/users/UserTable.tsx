"use client";

import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
  users: any[];
  selected: any;
  onSelect: (user: any) => void;
  loading: boolean;
  onAdd: () => void;
};

export default function UserTable({
  users,
  selected,
  onSelect,
  loading,
  onAdd,
}: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const PER_PAGE = 10;

  const filtered = useMemo(() => {
    return users.filter((user) => {
      const keyword = search.toLowerCase();

      const roles = (user.roles || [])
        .map((r: any) => r.role_name)
        .join(" ")
        .toLowerCase();

      return (
        user.username?.toLowerCase().includes(keyword) ||
        user.full_name?.toLowerCase().includes(keyword) ||
        roles.includes(keyword)
      );
    });
  }, [users, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PER_PAGE)
  );

  const rows = filtered.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Users
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage registered users and their roles.
          </p>
        </div>

        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={16} />
          Add User
        </button>

      </div>

      {/* Search */}

      <div className="border-b border-gray-200 p-5">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search users..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />

        </div>

      </div>

      {/* User List */}

      <div className="space-y-2 p-5 min-h-[620px]">

        {loading && (
          <div className="py-10 text-center text-gray-500">
            Loading users...
          </div>
        )}

        {!loading &&
          rows.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              className={`w-full rounded-lg border p-4 text-left transition ${
                selected?.id === user.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between">

                <div>

                  <h3 className="font-semibold text-gray-900">
                    {user.full_name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    @{user.username}
                  </p>

                </div>

              </div>

              <div className="mt-3 flex flex-wrap gap-2">

                {(user.roles || []).map((role: any) => (
                  <span
                    key={role.id}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                      selected?.id === user.id
                        ? "border-blue-200 bg-blue-100 text-blue-700"
                        : "border-gray-200 bg-gray-100 text-gray-700"
                    }`}
                  >
                    {role.role_name}
                  </span>
                ))}

              </div>

            </button>
          ))}

      </div>

      {/* Pagination */}

      <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">

        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="rounded-md border border-gray-300 p-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="text-sm text-gray-600">
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="rounded-md border border-gray-300 p-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>

      </div>

    </div>
  );
}