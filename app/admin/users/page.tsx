"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
    Users,
    Building2,
    UserPlus,
} from "lucide-react";

import UserTable from "@/components/users/UserTable";
import BarangayUserTable from "@/components/users/BarangayUserTable";
import UserDetailsModal from "@/components/users/UserDetailsModal";
import BarangayUserDetailsModal from "@/components/users/BarangayUserDetailsModal";
import AddUserModal from "@/components/users/AddUserModal";
import AddBarangayUserModal from "@/components/users/AddBarangayUserModal";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [barangayUsers, setBarangayUsers] =
        useState<any[]>([]);

    const [roles, setRoles] = useState<any[]>([]);

    const [loadingUsers, setLoadingUsers] =
        useState(true);

    const [loadingBarangayUsers, setLoadingBarangayUsers] =
        useState(true);

    const [selectedUser, setSelectedUser] =
        useState<any>(null);

    const [selectedBarangayUser, setSelectedBarangayUser] =
        useState<any>(null);

    const [userModalOpen, setUserModalOpen] =
        useState(false);

    const [barangayUserModalOpen, setBarangayUserModalOpen] =
        useState(false);

    const [addUserModalOpen, setAddUserModalOpen] =
        useState(false);

    const [addBarangayUserModalOpen, setAddBarangayUserModalOpen] =
        useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        await Promise.all([
            fetchUsers(),
            fetchBarangayUsers(),
            fetchRoles(),
        ]);
    }

    async function fetchUsers() {
        try {
            setLoadingUsers(true);

            const response = await axios.get(
                "/api/users"
            );

            setUsers(response.data?.data || []);
        } catch (error) {
            console.error(
                "Failed to load users:",
                error
            );

            setUsers([]);
        } finally {
            setLoadingUsers(false);
        }
    }

    async function fetchBarangayUsers() {
        try {
            setLoadingBarangayUsers(true);

            const response = await axios.get(
                "/api/barangay_users"
            );

            setBarangayUsers(
                response.data?.data || []
            );
        } catch (error) {
            console.error(
                "Failed to load barangay users:",
                error
            );

            setBarangayUsers([]);
        } finally {
            setLoadingBarangayUsers(false);
        }
    }

    async function fetchRoles() {
        try {
            const response = await axios.get(
                "/api/roles"
            );

            setRoles(response.data?.data || []);
        } catch (error) {
            console.error(
                "Failed to load roles:",
                error
            );

            setRoles([]);
        }
    }

    function handleUserSelect(user: any) {
        setSelectedUser(user);
        setUserModalOpen(true);
    }

    function handleBarangayUserSelect(
        user: any
    ) {
        setSelectedBarangayUser(user);
        setBarangayUserModalOpen(true);
    }

    async function handleUserUpdated() {
        await fetchUsers();
    }

    async function handleBarangayUserUpdated() {
        await fetchBarangayUsers();
    }

    async function handleUserAdded() {
        setAddUserModalOpen(false);

        await fetchUsers();
    }

    async function handleBarangayUserAdded() {
        setAddBarangayUserModalOpen(false);

        await fetchBarangayUsers();
    }

    return (
        <div className="space-y-6">

            {/* PAGE HEADER */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                        <Users size={25} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            User Management
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage system users and
                            barangay users.
                        </p>
                    </div>

                </div>

            </div>

            {/* LEFT + RIGHT */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                {/* USERS */}
                <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                <Users size={20} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800">
                                    Users
                                </h2>

                                <p className="text-xs text-slate-500">
                                    System users
                                </p>
                            </div>

                        </div>

                        <div className="flex items-center gap-3">

                            <span className="text-sm font-medium text-slate-500">
                                {users.length}{" "}
                                {users.length === 1
                                    ? "user"
                                    : "users"}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setAddUserModalOpen(
                                        true
                                    )
                                }
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                <UserPlus size={17} />
                                Add User
                            </button>

                        </div>

                    </div>

                    <div className="p-4">

                        <UserTable
                            users={users}
                            loading={loadingUsers}
                            onSelect={
                                handleUserSelect
                            }
                        />

                    </div>

                </section>

                {/* BARANGAY USERS */}
                <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                                <Building2 size={20} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800">
                                    Barangay Users
                                </h2>

                                <p className="text-xs text-slate-500">
                                    Barangay system users
                                </p>
                            </div>

                        </div>

                        <div className="flex items-center gap-3">

                            <span className="text-sm font-medium text-slate-500">
                                {barangayUsers.length}{" "}
                                {barangayUsers.length === 1
                                    ? "user"
                                    : "users"}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setAddBarangayUserModalOpen(
                                        true
                                    )
                                }
                                className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                            >
                                <UserPlus size={17} />
                                Add User
                            </button>

                        </div>

                    </div>

                    <div className="p-4">

                        <BarangayUserTable
                            users={barangayUsers}
                            loading={
                                loadingBarangayUsers
                            }
                            onSelect={
                                handleBarangayUserSelect
                            }
                        />

                    </div>

                </section>

            </div>

            {/* ADD SYSTEM USER */}
            <AddUserModal
                open={addUserModalOpen}
                onClose={() =>
                    setAddUserModalOpen(false)
                }
                roles={roles}
                onSuccess={
                    handleUserAdded
                }
            />

            {/* ADD BARANGAY USER */}
            <AddBarangayUserModal
                open={
                    addBarangayUserModalOpen
                }
                onClose={() =>
                    setAddBarangayUserModalOpen(
                        false
                    )
                }
                onSuccess={
                    handleBarangayUserAdded
                }
            />

            {/* SYSTEM USER DETAILS */}
            <UserDetailsModal
                open={userModalOpen}
                user={selectedUser}
                roles={roles}
                onClose={() => {
                    setUserModalOpen(false);
                    setSelectedUser(null);
                }}
                onUpdated={
                    handleUserUpdated
                }
            />

            {/* BARANGAY USER DETAILS */}
            <BarangayUserDetailsModal
                open={
                    barangayUserModalOpen
                }
                user={
                    selectedBarangayUser
                }
                onClose={() => {
                    setBarangayUserModalOpen(
                        false
                    );
                    setSelectedBarangayUser(
                        null
                    );
                }}
                onUpdated={
                    handleBarangayUserUpdated
                }
            />

        </div>
    );
}