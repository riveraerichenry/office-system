"use client";

import { Plus } from "lucide-react";

interface Props {
  onClick: () => void;
}

export default function AddModuleCard({
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center"
    >
      <div
        className="
          w-20
          h-20
          rounded-2xl
          border-2
          border-dashed
          border-gray-300
          bg-white
          flex
          items-center
          justify-center
          shadow-sm
          transition-all
          duration-300
          hover:border-blue-500
          hover:bg-blue-50
          hover:shadow-lg
          group-hover:-translate-y-1
        "
      >
        <Plus
          size={34}
          className="text-gray-400 group-hover:text-blue-600"
        />
      </div>

      <span className="mt-3 text-[15px] font-medium text-gray-600">
        Add Module
      </span>
    </button>
  );
}