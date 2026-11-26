
"use client";

import { useState } from "react";
import {
    RotateCcw,
    AlertTriangle,
    X,
    Loader2,
    CheckCircle2,
} from "lucide-react";

export default function QueueResetAdmin() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    async function resetQueue() {
        setLoading(true);
        setMessage("");
        setSuccess(false);

        try {
            const response = await fetch(
                "/api/queue/admin/reset",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to reset queue."
                );
            }

            setSuccess(true);
            setMessage(
                `Queue reset successfully. Session ${data.session.session_number} is now active.`
            );
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                onClick={() => {
                    setOpen(true);
                    setMessage("");
                    setSuccess(false);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-orange-700 shadow-sm transition hover:bg-orange-50"
            >
                <RotateCcw size={18} />
                Reset Queue
            </button>

            {open && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                                    <RotateCcw size={20} />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-gray-900">
                                        Reset Queue
                                    </h2>

                                    <p className="text-xs text-gray-500">
                                        Start a new queue session
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setOpen(false)}
                                disabled={loading}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-5">
                            {!success && (
                                <div className="mb-5 flex gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
                                    <AlertTriangle
                                        className="shrink-0 text-orange-600"
                                        size={22}
                                    />

                                    <div className="text-sm text-orange-900">
                                        <p className="font-semibold">
                                            Are you sure you want to reset?
                                        </p>

                                        <p className="mt-1 text-orange-800">
                                            A new queue session will begin
                                            at <strong>001</strong> for
                                            all windows.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2 text-sm text-gray-600">
                                <p>
                                    <strong>What will happen:</strong>
                                </p>

                                <ul className="list-disc space-y-1 pl-5">
                                    <li>Queue numbering starts again at 001.</li>
                                    <li>All windows use the new session.</li>
                                    <li>The TV display will show the new session.</li>
                                    <li>Previous queue records remain in the database.</li>
                                </ul>
                            </div>

                            {message && (
                                <div
                                    className={`mt-4 rounded-xl p-3 text-sm ${
                                        success
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-red-50 text-red-700"
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        {success && (
                                            <CheckCircle2
                                                size={18}
                                                className="shrink-0"
                                            />
                                        )}

                                        <span>{message}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-100 px-5 py-4">
                            <button
                                onClick={() => setOpen(false)}
                                disabled={loading}
                                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                {success ? "Close" : "Cancel"}
                            </button>

                            {!success && (
                                <button
                                    onClick={resetQueue}
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2
                                                size={17}
                                                className="animate-spin"
                                            />
                                            Resetting...
                                        </>
                                    ) : (
                                        <>
                                            <RotateCcw size={17} />
                                            Confirm Reset
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
