"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
    Eye,
    EyeOff,
    LockKeyhole,
    LogIn,
    User,
    ArrowLeft,
} from "lucide-react";

export default function BarangayLoginPage() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError("");

        if (!username.trim() || !password) {
            setError("Please enter your username and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "/api/auth/barangay_login",
                {
                    username: username.trim(),
                    password,
                }
            );

            if (response.data?.success) {
                router.push("/barangay_dashboard");
            } else {
                setError(
                    response.data?.message ||
                        "Login failed. Please try again."
                );
            }
        } catch (err: any) {
            console.error("Barangay login error:", err);

            setError(
                err?.response?.data?.message ||
                    "Invalid username or password."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* Back to landing page */}
                <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                    {/* Header */}
                    <div className="bg-blue-900 px-6 py-7 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md">
                                <img
                                    src="/logo3.jpg"
                                    alt="Municipality of Taytay"
                                    className="w-16 h-16 object-contain"
                                />
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-white">
                            Barangay Treasury
                        </h1>

                        <p className="text-blue-100 mt-1 text-sm">
                            Management System
                        </p>

                        <p className="text-blue-200 text-xs mt-3">
                            Municipality of Taytay, Palawan
                        </p>
                    </div>

                    {/* Form */}
                    <div className="px-6 py-7">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-slate-800">
                                Sign In
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Enter your barangay account credentials.
                            </p>
                        </div>

                        <form
                            onSubmit={handleLogin}
                            className="space-y-5"
                        >
                            {/* Username */}
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-semibold text-slate-700 mb-2"
                                >
                                    Username
                                </label>

                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
                                        placeholder="Enter username"
                                        autoComplete="username"
                                        disabled={loading}
                                        className="w-full h-12 pl-11 pr-4 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-semibold text-slate-700 mb-2"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Enter password"
                                        autoComplete="current-password"
                                        disabled={loading}
                                        className="w-full h-12 pl-11 pr-12 rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                        disabled={loading}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                                    <p className="text-sm font-medium text-red-700">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Login */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        Sign In
                                    </>
                                )}
                            </button>
                        </form>

                        {/* System information */}
                        <div className="mt-7 pt-5 border-t border-slate-200 text-center">
                            <p className="text-xs text-slate-500">
                                Authorized Barangay Personnel Only
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                                Municipality of Taytay, Palawan
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-400 mt-5">
                    © {new Date().getFullYear()} Municipality of Taytay,
                    Palawan
                </p>
            </div>
        </main>
    );
}