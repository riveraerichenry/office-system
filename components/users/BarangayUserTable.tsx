"use client";

import { useMemo, useState } from "react";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    User,
    CheckCircle2,
    XCircle,
} from "lucide-react";

interface BarangayUserTableProps {
    users: any[];
    loading: boolean;
    onSelect: (user: any) => void;
}

const ITEMS_PER_PAGE = 10;

export default function BarangayUserTable({
    users,
    loading,
    onSelect,
}: BarangayUserTableProps) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const filteredUsers = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return users;
        }

        return users.filter((user) => {

            const name = [
                user.first_name,
                user.middle_name,
                user.last_name,
            ]
                .filter(Boolean)
                .join(" ");

            return (
                name.toLowerCase().includes(keyword) ||
                String(user.username || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(user.role || "")
                    .toLowerCase()
                    .includes(keyword) ||
                String(user.barangay_name || "")
                    .toLowerCase()
                    .includes(keyword)
            );
        });
    }, [users, search]);

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredUsers.length / ITEMS_PER_PAGE
        )
    );

    const currentPage = Math.min(page, totalPages);

    const paginatedUsers = useMemo(() => {
        const start =
            (currentPage - 1) * ITEMS_PER_PAGE;

        return filteredUsers.slice(
            start,
            start + ITEMS_PER_PAGE
        );
    }, [filteredUsers, currentPage]);

    function handleSearch(value: string) {
        setSearch(value);
        setPage(1);
    }

    function getFullName(user: any) {
        return [
            user.first_name,
            user.middle_name,
            user.last_name,
        ]
            .filter(Boolean)
            .join(" ");
    }

    function formatDate(value: string) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "2-digit",
        });
    }

    return (
        <div className="space-y-4">

            {/* SEARCH */}
            <div className="relative max-w-md">

                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                        handleSearch(e.target.value)
                    }
                    placeholder="Search name, username, role or barangay..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

            </div>

            {/* TABLE */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">

                <table className="min-w-full divide-y divide-slate-200">

                    <thead className="bg-slate-50">

                        <tr>

                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                Name
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                Username
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                Role
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                Barangay
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                Status
                            </th>

                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                Created
                            </th>

                        </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100 bg-white">

                        {loading ? (

                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-5 py-12 text-center text-sm text-slate-500"
                                >
                                    Loading barangay users...
                                </td>
                            </tr>

                        ) : paginatedUsers.length === 0 ? (

                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-5 py-12 text-center text-sm text-slate-500"
                                >
                                    No barangay users found.
                                </td>
                            </tr>

                        ) : (

                            paginatedUsers.map((user) => (

                                <tr
                                    key={user.id}
                                    onClick={() =>
                                        onSelect(user)
                                    }
                                    className="cursor-pointer transition hover:bg-orange-50/50"
                                >

                                    <td className="px-5 py-4">

                                        <div className="flex items-center gap-3">

                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                                                <User size={17} />
                                            </div>

                                            <span className="font-medium text-slate-800">
                                                {getFullName(
                                                    user
                                                )}
                                            </span>

                                        </div>

                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-600">
                                        {user.username}
                                    </td>

                                    <td className="px-5 py-4">

                                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
                                            {user.role}
                                        </span>

                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-600">
                                        {user.barangay_name ||
                                            "—"}
                                    </td>

                                    <td className="px-5 py-4">

                                        {user.is_active ? (

                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                <CheckCircle2
                                                    size={14}
                                                />
                                                Active
                                            </span>

                                        ) : (

                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                                <XCircle
                                                    size={14}
                                                />
                                                Inactive
                                            </span>

                                        )}

                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-500">
                                        {formatDate(
                                            user.created_at
                                        )}
                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

            {/* PAGINATION */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-sm text-slate-500">
                    Showing{" "}
                    {filteredUsers.length === 0
                        ? 0
                        : (currentPage - 1) *
                              ITEMS_PER_PAGE +
                          1}{" "}
                    to{" "}
                    {Math.min(
                        currentPage *
                            ITEMS_PER_PAGE,
                        filteredUsers.length
                    )}{" "}
                    of {filteredUsers.length}
                </p>

                <div className="flex items-center gap-2">

                    <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() =>
                            setPage((value) =>
                                Math.max(1, value - 1)
                            )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft size={17} />
                    </button>

                    <span className="min-w-[80px] text-center text-sm font-medium text-slate-600">
                        {currentPage} / {totalPages}
                    </span>

                    <button
                        type="button"
                        disabled={
                            currentPage >= totalPages
                        }
                        onClick={() =>
                            setPage((value) =>
                                Math.min(
                                    totalPages,
                                    value + 1
                                )
                            )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronRight size={17} />
                    </button>

                </div>

            </div>

        </div>
    );
}