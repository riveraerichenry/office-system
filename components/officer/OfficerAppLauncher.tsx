"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import axios from "axios";
import { moduleIcons } from "@/lib/module-icons";

type Module = {
  id: string;
  module_name: string;
  icon: string;
  path: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function OfficerAppLauncher({
  open,
  onClose,
}: Props) {
  const ref =
    useRef<HTMLDivElement>(null);

  const [modules, setModules] =
    useState<Module[]>([]);

  useEffect(() => {
    fetchModules();
  }, []);

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

  async function fetchModules() {
    try {
      const res = await axios.get(
        "/api/assigned-modules"
      );

      setModules(
        res.data.data || []
      );
    } catch (error) {
      console.log(error);
    }
  }

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
          className="
            absolute right-8 top-20 z-50
            w-[420px]
            rounded-[32px]
            bg-white/95
            backdrop-blur-xl
            p-6
            shadow-[0_30px_80px_rgba(15,23,42,0.18)]
          "
        >
          <div className="mb-5">
            <h3 className="text-xl font-bold">
              Quick Access
            </h3>

            <p className="text-sm text-gray-500">
              Your modules
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {modules.map(
              (module) => {
                const Icon =
                  moduleIcons[
                    module.icon
                  ];

                return (
                  <Link
                    key={
                      module.id
                    }
                    href={
                      module.path
                    }
                  >
                    <div className="group cursor-pointer rounded-3xl p-4 transition hover:bg-gray-50">
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-500 text-white shadow-md group-hover:scale-105 transition">
                        {Icon && (
                          <Icon
                            size={26}
                          />
                        )}
                      </div>

                      <p className="text-center text-sm font-medium text-slate-700">
                        {
                          module.module_name
                        }
                      </p>
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}