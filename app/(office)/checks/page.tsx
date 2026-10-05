
"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import BookletTable, {
  type Booklet,
} from "@/components/checks/BookletTable";
import RegisterBookletModal from "@/components/checks/RegisterBookletModal";
import BookletDetailsModal from "@/components/checks/BookletDetailsModal";

export default function ChecksPage() {
  const [booklets, setBooklets] = useState<Booklet[]>([]);
  const [selectedBooklet, setSelectedBooklet] =
    useState<Booklet | null>(null);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBooklets = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/checks/booklets", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load check booklets."
        );
      }

      setBooklets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load check booklets:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load check booklets."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBooklets();
  }, [loadBooklets]);

  const handleRegistrationSuccess = async () => {
    setShowRegisterModal(false);
    await loadBooklets();
  };

  const handleSelectBooklet = (booklet: Booklet) => {
    setSelectedBooklet(booklet);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Checks
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage registered check booklets and their check numbers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void loadBooklets()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
            >
              <Plus size={17} />
              Register Booklet
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void loadBooklets()}
              className="font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-16 text-center text-sm text-gray-500">
            Loading check booklets...
          </div>
        ) : (
          <BookletTable
            booklets={booklets}
            onSelect={handleSelectBooklet}
          />
        )}
      </div>

      {showRegisterModal && (
        <RegisterBookletModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}

      {selectedBooklet && (
        <BookletDetailsModal
          booklet={selectedBooklet}
          onClose={() => setSelectedBooklet(null)}
        />
      )}
    </main>
  );
}
