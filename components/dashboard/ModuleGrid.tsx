"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { moduleIcons } from "@/lib/module-icons";

type Module = {
  id: string;
  module_name: string;
  icon: string;
  path: string;
  background_color?: string;
};

type Props = {
  modules?: Module[];
  variant?: "dashboard" | "launcher";
  showAdd?: boolean;
  onAddModule?: () => void;
};

export default function ModuleGrid({
  modules = [],
  variant = "dashboard",
  showAdd = false,
  onAddModule,
}: Props) {
  const isDashboard =
    variant === "dashboard";

  return (
    <div
      className={
        isDashboard
          ? "grid grid-cols-5 gap-8"
          : "grid grid-cols-4 gap-4"
      }
    >
      {modules.map((module) => {
        const Icon =
          moduleIcons[module.icon];

        return (
          <Link
            href={module.path}
            key={module.id}
          >
            <div
              className={`group cursor-pointer rounded-3xl transition-all hover:bg-gray-50 ${
                isDashboard
                  ? "w-32 p-5"
                  : "p-4"
              }`}
            >
              <div
                className={`mx-auto mb-3 flex items-center justify-center rounded-2xl shadow-md transition-all group-hover:scale-105 ${
                  isDashboard
                    ? "h-20 w-20"
                    : "h-16 w-16"
                }`}
                style={{
                  backgroundColor:
                    module.background_color ??
                    "#4F6BFF",
                }}
              >
                {Icon && (
                  <Icon
                    size={
                      isDashboard
                        ? 32
                        : 26
                    }
                    className="text-white"
                  />
                )}
              </div>

              <p
                className={`text-center font-medium text-slate-700 ${
                  isDashboard
                    ? "text-base"
                    : "text-sm"
                }`}
              >
                {module.module_name}
              </p>
            </div>
          </Link>
        );
      })}

      {showAdd && (
        <button
          onClick={onAddModule}
          className={`group rounded-3xl transition-all hover:bg-gray-50 ${
            isDashboard
              ? "w-32 p-5"
              : "p-4"
          }`}
        >
          <div
            className={`mx-auto mb-3 flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition-all group-hover:border-blue-500 group-hover:bg-blue-50 ${
              isDashboard
                ? "h-20 w-20"
                : "h-16 w-16"
            }`}
          >
            <Plus
              size={
                isDashboard
                  ? 32
                  : 26
              }
              className="text-gray-500 group-hover:text-blue-600"
            />
          </div>

          <p className="text-center font-medium text-slate-700">
            Add Module
          </p>
        </button>
      )}
    </div>
  );
}