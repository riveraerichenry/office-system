"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { Search } from "lucide-react";
import ModuleGrid from "./ModuleGrid";
import {
  AnimatePresence,
  motion,
} from "framer-motion";

type Module = {
  id: string;
  module_name: string;
  icon: string;
  path: string;
  description?: string;
  color?: string;
  background_color?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  modules?: Module[];
};

export default function AppLauncher({
  open,
  onClose,
  modules = [],
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");

  // ---------------------------------------------
  // Close when clicking outside
  // ---------------------------------------------

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener(
        "mousedown",
        handler
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handler
      );
    };
  }, [open, onClose]);

  // ---------------------------------------------
  // Reset search when launcher closes
  // ---------------------------------------------

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  // ---------------------------------------------
  // Filter modules
  // ---------------------------------------------

  const filtered = modules.filter((module) =>
    module.module_name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{
            opacity: 0,
            y: -8,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: -8,
            scale: 0.97,
          }}
          transition={{
            duration: 0.15,
          }}
          className="
            absolute
            right-4
            top-[72px]
            z-50
            w-[420px]
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            shadow-[0_20px_60px_rgba(15,23,42,0.18)]
          "
        >
          {/* Header */}

          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Applications
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Your assigned modules
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                {modules.length}
              </span>
            </div>
          </div>

          {/* Search */}

          <div className="px-5 pt-4">
            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-3
                transition
                focus-within:border-slate-300
                focus-within:bg-white
              "
            >
              <Search
                size={17}
                className="shrink-0 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="
                  w-full
                  bg-transparent
                  text-sm
                  text-slate-800
                  outline-none
                  placeholder:text-slate-400
                "
                placeholder="Search applications..."
                autoFocus
              />
            </div>
          </div>

          {/* Applications */}

          <div className="max-h-[430px] overflow-y-auto px-5 py-5">
            {filtered.length > 0 ? (
              <ModuleGrid
                modules={filtered}
                variant="launcher"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <Search
                    size={20}
                    className="text-slate-400"
                  />
                </div>

                <p className="text-sm font-medium text-slate-700">
                  No applications found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try another search term.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}

          {filtered.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-3">
              <p className="text-center text-[11px] text-slate-400">
                Showing {filtered.length} of{" "}
                {modules.length} assigned applications
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}