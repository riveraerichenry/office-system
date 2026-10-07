"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
    X,
    UserPlus,
    Eye,
    EyeOff,
} from "lucide-react";

interface AddBarangayUserModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => Promise<void>;
}

export default function AddBarangayUserModal({
    open,
    onClose,
    onSuccess,
}: AddBarangayUserModalProps) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");

    const [email, setEmail] = useState("");
    const [barangayId, setBarangayId] = useState("");
    const [role, setRole] = useState("staff");
    const [isActive, setIsActive] = useState(true);

    const [barangays, setBarangays] =
        useState<any[]>([]);

    const [showPassword, setShowPassword] =
        useState(false);

    const [saving, setSaving] = useState(false);
    const [loadingBarangays, setLoadingBarangays] =
        useState(false);

    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) {
            return;
        }

        resetForm();
        fetchBarangays();
    }, [open]);

    function resetForm() {
        setUsername("");
        setPassword("");
        setFirstName("");
        setMiddleName("");
        setLastName("");
        setEmail("");
        setBarangayId("");
        setRole("staff");
        setIsActive(true);
        setError("");
        setShowPassword(false);
    }

    async function fetchBarangays() {
        try {
            setLoadingBarangays(true);

            const response = await axios.get(
                "/api/barangays"
            );

            setBarangays(
                response.data?.data || []
            );
        } catch (error) {
            console.error(
                "Failed to load barangays:",
                error
            );

            setBarangays([]);
        } finally {
            setLoadingBarangays(false);
        }
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        if (!username.trim()) {
            setError("Username is required.");
            return;
        }

        if (!password.trim()) {
            setError("Password is required.");
            return;
        }

        if (!firstName.trim()) {
            setError("First name is required.");
            return;
        }

        if (!lastName.trim()) {
            setError("Last name is required.");
            return;
        }

        if (!role.trim()) {
            setError("Role is required.");
            return;
        }

        try {
            setSaving(true);

            await axios.post(
                "/api/barangay_users",
                {
                    username: username.trim(),
                    password,
                    first_name: firstName.trim(),
                    middle_name:
                        middleName.trim() || null,
                    last_name: lastName.trim(),
                    email:
                        email.trim() || null,
                    barangay_id:
                        barangayId || null,
                    role: role.trim(),
                    is_active: isActive,
                }
            );

            await onSuccess();

            resetForm();
        } catch (error: any) {
            console.error(error);

            setError(
                error?.response?.data?.message ||
                    "Failed to create barangay user."
            );
        } finally {
            setSaving(false);
        }
    }

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

            <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                            <UserPlus size={20} />
                        </div>

                        <div>
                            <h2 className="font-bold text-slate-800">
                                Add Barangay User
                            </h2>

                            <p className="text-xs text-slate-500">
                                Create a new barangay
                                system user.
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="max-h-[65vh] overflow-y-auto"
                >

                    <div className="space-y-5 p-6">

                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                {error}
                            </div>
                        )}

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
                                disabled={saving}
                                placeholder="Enter username"
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
                            />
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                Password
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
                                    disabled={saving}
                                    placeholder="Enter password"
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
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
                        </div>

                        {/* NAME */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    First Name
                                </label>

                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) =>
                                        setFirstName(
                                            e.target.value
                                        )
                                    }
                                    disabled={saving}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    Middle Name
                                </label>

                                <input
                                    type="text"
                                    value={middleName}
                                    onChange={(e) =>
                                        setMiddleName(
                                            e.target.value
                                        )
                                    }
                                    disabled={saving}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    Last Name
                                </label>

                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) =>
                                        setLastName(
                                            e.target.value
                                        )
                                    }
                                    disabled={saving}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
                                />
                            </div>

                        </div>

                        {/* EMAIL */}
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                                disabled={saving}
                                placeholder="Optional"
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
                            />
                        </div>

                        {/* BARANGAY */}
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                Barangay
                            </label>

                            <select
                                value={barangayId}
                                onChange={(e) =>
                                    setBarangayId(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    saving ||
                                    loadingBarangays
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
                            >
                                <option value="">
                                    Select Barangay
                                </option>

                                {barangays.map(
                                    (barangay) => (
                                        <option
                                            key={
                                                barangay.id
                                            }
                                            value={
                                                barangay.id
                                            }
                                        >
                                            {
                                                barangay.barangay_name
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {/* ROLE */}
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                Role
                            </label>

                            <select
                                value={role}
                                onChange={(e) =>
                                    setRole(
                                        e.target.value
                                    )
                                }
                                disabled={saving}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
                            >
                                <option value="staff">
                                    Staff
                                </option>

                                <option value="admin">
                                    Admin
                                </option>
                            </select>
                        </div>

                        {/* STATUS */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="font-semibold text-slate-700">
                                        Account Status
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Allow this user to
                                        access the barangay
                                        system.
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
                                    disabled={saving}
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

                            </div>

                        </div>

                    </div>

                    {/* FOOTER */}
                    <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <UserPlus size={17} />

                            {saving
                                ? "Creating..."
                                : "Create User"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}