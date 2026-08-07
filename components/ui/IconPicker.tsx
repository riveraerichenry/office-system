"use client";

import { useState } from "react";
import { iconOptions } from "@/lib/icon-options";
import { ChevronDown } from "lucide-react";

export default function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] =
    useState(false);

  const selected =
    iconOptions.find(
      (item) =>
        item.name === value
    );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() =>
          setOpen(!open)
        }
        className="
          flex w-full items-center justify-between
          rounded-2xl border border-gray-300
          bg-white px-4 py-3
        "
      >
        <div className="flex items-center gap-3">
          {selected && (
            <selected.icon
              size={18}
            />
          )}

          <span>
            {value ||
              "Select Icon"}
          </span>
        </div>

        <ChevronDown size={18} />
      </button>

      {open && (
        <div
          className="
            absolute z-50 mt-2 w-full
            max-h-72 overflow-auto
            rounded-2xl border
            border-gray-200 bg-white
            shadow-xl
          "
        >
          {iconOptions.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    onChange(
                      item.name
                    );
                    setOpen(
                      false
                    );
                  }}
                  className={`
                    flex w-full items-center gap-3
                    px-4 py-3 text-left
                    hover:bg-gray-50
                    ${
                      value ===
                      item.name
                        ? "bg-blue-50"
                        : ""
                    }
                  `}
                >
                  <Icon size={18} />
                  {item.name}
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}