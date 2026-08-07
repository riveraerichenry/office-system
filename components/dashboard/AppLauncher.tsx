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
  const ref =
    useRef<HTMLDivElement>(null);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    function handler(
      e: MouseEvent
    ) {
      if (
        ref.current &&
        !ref.current.contains(
          e.target as Node
        )
      ) {
        onClose();
      }
    }

    document.addEventListener(
      "mousedown",
      handler
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handler
      );
  }, [onClose]);

  const filtered =
    modules.filter((module) =>
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
            y: -20,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: -20,
            scale: 0.95,
          }}
          className="absolute right-8 top-20 z-50 w-[560px] rounded-[32px] border bg-white p-6 shadow-2xl"
        >
          <div className="mb-5">
            <h3 className="text-xl font-bold">
              Quick Access
            </h3>
          </div>

          <div className="mb-6 flex items-center gap-3 rounded-2xl border px-4 py-3">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full outline-none"
              placeholder="Search modules..."
            />
          </div>

          <ModuleGrid
            modules={filtered}
            variant="launcher"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}