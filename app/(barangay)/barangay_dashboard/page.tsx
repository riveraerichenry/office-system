"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import {
    Building2,
    ChevronDown,
    LogOut,
    Menu,
    TrendingUp,
    User,
    X,
} from "lucide-react";

import CreateTransaction from "@/components/barangay/CreateTransaction";
import BarangayRecentTransactions from "@/components/barangay/BarangayRecentTransactions";

interface BarangayInfo {
    id: string;
    code: string;
    name: string;
    municipality: string;
    province: string;
}

interface BarangayUser {
    id: string;
    username: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    email?: string | null;
    role: string;
    barangay: BarangayInfo;
}

export default function BarangayDashboardPage() {
    const router = useRouter();

    const [user, setUser] = useState<BarangayUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        loadUser();
    }, []);

    async function loadUser() {
        try {
            const response = await axios.get(
                "/api/auth/barangay_me"
            );

            if (response.data?.success) {
                setUser(response.data.user);
            } else {
                router.replace("/barangay_login");
            }
        } catch (error) {
            console.error(
                "Failed to load barangay user:",
                error
            );

            router.replace("/barangay_login");
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        if (loggingOut) {
            return;
        }

        try {
            setLoggingOut(true);

            await axios.post(
                "/api/auth/barangay_logout"
            );

            router.push("/");
        } catch (error) {
            console.error(
                "Barangay logout failed:",
                error
            );

            setLoggingOut(false);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-100 flex items-center justify-center">

                <div className="flex flex-col items-center gap-4">

                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />

                    <p className="text-sm font-medium text-slate-600">
                        Loading dashboard...
                    </p>

                </div>

            </main>
        );
    }

    if (!user) {
        return null;
    }

    const fullName = [
        user.first_name,
        user.middle_name,
        user.last_name,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <main className="min-h-screen bg-slate-100">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">

                <div className="h-16 px-4 lg:px-6 flex items-center justify-between">

                    {/* LEFT */}

                    <div className="flex items-center gap-3">

                        {/* MOBILE MENU */}

                        <button
                            type="button"
                            onClick={() =>
                                setMobileMenuOpen(
                                    !mobileMenuOpen
                                )
                            }
                            className="
                                lg:hidden
                                w-10
                                h-10
                                rounded-lg
                                hover:bg-slate-100
                                flex
                                items-center
                                justify-center
                            "
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5 text-slate-700" />
                            ) : (
                                <Menu className="w-5 h-5 text-slate-700" />
                            )}
                        </button>

                        {/* LOGO */}

                        <div className="w-10 h-10 rounded-lg bg-blue-900 flex items-center justify-center overflow-hidden">

                            <img
                                src="/logo2.png"
                                alt="Municipality of Taytay"
                                className="w-full h-full object-contain"
                            />

                        </div>

                        {/* TITLE */}

                        <div>

                            <h1 className="text-sm sm:text-base font-bold text-slate-800 leading-tight">
                                Barangay Treasury
                            </h1>

                            <p className="text-xs text-slate-500 hidden sm:block">
                                Management System
                            </p>

                        </div>

                    </div>

                    {/* USER MENU */}

                    <div className="relative">

                        <button
                            type="button"
                            onClick={() =>
                                setMenuOpen(!menuOpen)
                            }
                            className="
                                flex
                                items-center
                                gap-3
                                rounded-lg
                                px-2
                                py-2
                                hover:bg-slate-100
                                transition
                            "
                        >

                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">

                                <User className="w-5 h-5 text-blue-700" />

                            </div>

                            <div className="hidden md:block text-left">

                                <p className="text-sm font-semibold text-slate-800">
                                    {fullName}
                                </p>

                                <p className="text-xs text-slate-500 capitalize">
                                    {user.role}
                                </p>

                            </div>

                            <ChevronDown className="w-4 h-4 text-slate-500 hidden md:block" />

                        </button>

                        {/* DROPDOWN */}

                        {menuOpen && (
                            <div className="absolute right-0 top-12 w-56 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50">

                                <div className="px-4 py-3 border-b border-slate-100">

                                    <p className="text-sm font-semibold text-slate-800">
                                        {fullName}
                                    </p>

                                    <p className="text-xs text-slate-500 mt-1">
                                        @{user.username}
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setMenuOpen(false)
                                    }
                                    className="
                                        w-full
                                        px-4
                                        py-2.5
                                        flex
                                        items-center
                                        gap-3
                                        text-sm
                                        text-slate-700
                                        hover:bg-slate-50
                                    "
                                >

                                    <User className="w-4 h-4" />

                                    My Profile

                                </button>

                                <div className="border-t border-slate-100 my-1" />

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="
                                        w-full
                                        px-4
                                        py-2.5
                                        flex
                                        items-center
                                        gap-3
                                        text-sm
                                        text-red-600
                                        hover:bg-red-50
                                        disabled:opacity-50
                                        disabled:cursor-not-allowed
                                    "
                                >

                                    {loggingOut ? (
                                        <span className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                    ) : (
                                        <LogOut className="w-4 h-4" />
                                    )}

                                    {loggingOut
                                        ? "Signing Out..."
                                        : "Sign Out"}

                                </button>

                            </div>
                        )}

                    </div>

                </div>

            </header>

            {/* =====================================================
                MOBILE BARANGAY INFORMATION
            ====================================================== */}

            {mobileMenuOpen && (
                <div className="lg:hidden bg-white border-b border-slate-200 shadow-sm">

                    <div className="p-4">

                        <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">

                                <Building2 className="w-5 h-5 text-blue-700" />

                            </div>

                            <div>

                                <p className="text-xs text-slate-500">
                                    Barangay
                                </p>

                                <p className="text-sm font-bold text-slate-800">
                                    {user.barangay.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                    {user.barangay.municipality},{" "}
                                    {user.barangay.province}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>
            )}

            {/* =====================================================
                MAIN CONTENT
            ====================================================== */}

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* =================================================
                    WELCOME HEADER
                ================================================== */}

                <div className="mb-6">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                        {/* WELCOME */}

                        <div>

                            <p className="text-sm font-medium text-blue-700 mb-1">
                                Barangay Treasury Dashboard
                            </p>

                            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">
                                Welcome, {user.first_name}
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Monitor collections and manage
                                treasury transactions for your
                                barangay.
                            </p>

                        </div>

                        {/* BARANGAY */}

                        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">

                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">

                                <Building2 className="w-5 h-5 text-blue-700" />

                            </div>

                            <div>

                                <p className="text-xs text-slate-500">
                                    Barangay
                                </p>

                                <p className="text-sm font-bold text-slate-800">
                                    {user.barangay.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                    {user.barangay.municipality},{" "}
                                    {user.barangay.province}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    CTC / AF51 TRANSACTION CARDS
                ================================================== */}

                <div className="mb-6">

                    <CreateTransaction />

                </div>

                {/* =================================================
                    RECENT TRANSACTIONS
                ================================================== */}

                <div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

                        <div className="px-5 py-4 border-b border-slate-200">

                            <h3 className="text-base font-bold text-slate-800">
                                Recent Transactions
                            </h3>

                            <p className="text-xs text-slate-500 mt-1">
                                Latest transactions recorded by your
                                barangay
                            </p>

                        </div>

                        <div className="p-5">

                            <BarangayRecentTransactions />

                        </div>

                    </div>

                </div>

                {/* =================================================
                    COLLECTION ACTIVITY
                ================================================== */}

                <div className="mt-6">

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">

                        <div className="px-5 py-4 border-b border-slate-200">

                            <h3 className="text-base font-bold text-slate-800">
                                Collection Activity
                            </h3>

                            <p className="text-xs text-slate-500 mt-1">
                                Overview of your barangay treasury activity
                            </p>

                        </div>

                        <div className="p-8">

                            <div className="min-h-[180px] flex flex-col items-center justify-center text-center">

                                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">

                                    <TrendingUp className="w-6 h-6 text-blue-700" />

                                </div>

                                <h4 className="text-sm font-semibold text-slate-700">
                                    Collection activity will appear here
                                </h4>

                                <p className="text-xs text-slate-400 mt-1 max-w-md">
                                    Once transactions are recorded,
                                    collection activity and daily
                                    revenue information can be displayed
                                    in this section.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}