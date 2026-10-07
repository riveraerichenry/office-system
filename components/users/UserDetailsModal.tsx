"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
    X,
    User,
    Save,
    Trash2,
    Eye,
    EyeOff,
} from "lucide-react";

import RolePicker from "@/components/users/RolePicker";

interface UserDetailsModalProps {
    open: boolean;
    user: any;
    roles: any[];
    onClose: () => void;
    onUpdated: () => Promise<void>;
}

export default function UserDetailsModal({
    open,
    user,
    roles,
    onClose,
    onUpdated,
}: UserDetailsModalProps) {
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [selectedRoles, setSelectedRoles] = useState<
        string[]
    >([]);

    const [showPassword, setShowPassword] =
        useState(false);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) {
            return;
        }

        setUsername(user.username || "");
        setFullName(user.full_name || "");
        setPassword("");

        setIsActive(
            user.is_active === undefined
                ? true
                : user.is_active
        );

        const userRoleIds = Array.isArray(user.roles)
            ? user.roles
                  .map((role: any) => role.id)
                  .filter(Boolean)
                  .map((id: any) => String(id))
            : [];

        setSelectedRoles(userRoleIds);

        setError("");
    }, [user]);

    if (!open || !user) {
        return null;
    }

    async function handleSave() {
        try {
            setSaving(true);
            setError("");

            await axios.put(
                `/api/users/${user.id}`,
                {
                    username,
                    full_name: fullName,
                    password:
                        password.trim() !== ""
                            ? password
                            : undefined,
                    is_active: isActive,
                    roles: selectedRoles,
                }
            );

            await onUpdated();

            onClose();
        } catch (error: any) {
            console.error(error);

            setError(
                error?.response?.data?.message ||
                    "Failed to update user."
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${fullName}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleting(true);
            setError("");

            await axios.delete(
                `/api/users/${user.id}`
            );

            await onUpdated();

            onClose();
        } catch (error: any) {
            console.error(error);

            setError(
                error?.response?.data?.message ||
                    "Failed to delete user."
            );
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

            <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                            <User size={20} />
                        </div>

                        <div>
                            <h2 className="font-bold text-slate-800">
                                User Details
                            </h2>

                            <p className="text-xs text-slate-500">
                                Manage system user
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={
                            saving || deleting
                        }
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* BODY */}
                <div className="max-h-[65vh] overflow-y-auto p-6">

                    {error && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-5">

                        {/* USERNAME */}
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                Username
                            </label>

                            <input
                                type="text"
                                value={username}
                                onChange={(e) =>
                                    setUsername(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    saving || deleting
                                }
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            />
                        </div>

                        {/* FULL NAME */}
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                Full Name
                            </label>

                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) =>
                                    setFullName(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    saving || deleting
                                }
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            />
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                New Password
                            </label>

                            <div className="relative">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        saving ||
                                        deleting
                                    }
                                    placeholder="Leave blank to keep current password"
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            (value) =>
                                                !value
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>

                            </div>

                            <p className="mt-1.5 text-xs text-slate-500">
                                Leave blank if you do not want
                                to change the password.
                            </p>
                        </div>

                        {/* ROLES */}
                        <div>

                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                Roles
                            </label>

                            <RolePicker
                                roles={roles}
                                selectedRoles={
                                    selectedRoles
                                }
                                onChange={
                                    setSelectedRoles
                                }
                            />

                        </div>

                        {/* STATUS */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                            <label className="flex cursor-pointer items-center justify-between gap-4">

                                <div>
                                    <p className="font-semibold text-slate-700">
                                        Account Status
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Allow this user to access
                                        the system.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsActive(
                                            (value) =>
                                                !value
                                        )
                                    }
                                    disabled={
                                        saving ||
                                        deleting
                                    }
                                    className={`relative h-7 w-12 rounded-full transition ${
                                        isActive
                                            ? "bg-green-500"
                                            : "bg-slate-300"
                                    }`}
                                >
                                    <span
                                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                                            isActive
                                                ? "left-6"
                                                : "left-1"
                                        }`}
                                    />
                                </button>

                            </label>

                        </div>

                        {/* ID */}
                        <div>

                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                User ID
                            </label>

                            <div className="rounded-lg bg-slate-100 px-4 py-3 font-mono text-xs text-slate-600 break-all">
                                {user.id}
                            </div>

                        </div>

                    </div>

                </div>

                {/* FOOTER */}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={
                            saving || deleting
                        }
                        className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Trash2 size={17} />

                        {deleting
                            ? "Deleting..."
                            : "Delete"}
                    </button>

                    <div className="flex gap-3">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={
                                saving || deleting
                            }
                            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={
                                saving || deleting
                            }
                            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save size={17} />

                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}