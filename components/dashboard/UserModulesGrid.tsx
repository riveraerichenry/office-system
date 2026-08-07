"use client";

import { moduleIcons } from "@/lib/module-icons";

type Props = {
  modules: any[];
  selectedModules: string[];
  editable?: boolean;
  onToggle?: (
    moduleId: string
  ) => void;
};

export default function UserModulesGrid({
  modules,
  selectedModules,
  editable = false,
  onToggle,
}: Props) {
  return (
    <div className="grid grid-cols-4 gap-6">
      {modules.map((module) => {
        const assigned =
          selectedModules.includes(
            module.id
          );

        const Icon =
          moduleIcons[
            module.icon
          ];

        return (
          <button
            key={module.id}
            disabled={!editable}
            onClick={() =>
              onToggle?.(
                module.id
              )
            }
            className={`
              group rounded-3xl p-3
              transition-all
              ${
                editable
                  ? "hover:scale-105"
                  : ""
              }
            `}
          >
            <div className="flex flex-col items-center">
              {/* Icon Box */}
              <div
                className={`
                  mb-3 flex h-16 w-16
                  items-center justify-center
                  rounded-2xl shadow-md transition-all
                  ${
                    assigned
                      ? `
                        bg-gradient-to-r
                        from-cyan-400
                        via-purple-400
                        to-fuchsia-500
                        text-white
                      `
                      : `
                        bg-gray-100
                        text-gray-400
                        border border-gray-200
                      `
                  }
                `}
              >
                {Icon && (
                  <Icon size={28} />
                )}
              </div>

              {/* Name */}
              <p
                className={`
                  text-center text-sm font-medium
                  ${
                    assigned
                      ? "text-slate-800"
                      : "text-gray-400"
                  }
                `}
              >
                {module.module_name}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}