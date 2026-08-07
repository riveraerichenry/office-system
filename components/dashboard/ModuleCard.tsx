"use client";

import Link from "next/link";
import * as Icons from "lucide-react";
import { Pencil } from "lucide-react";

interface Module {
  id: string;
  module_name: string;
  icon: string;
  path: string;
  description?: string;
  background_color?: string;
}

interface Props {
  module: Module;
  onEdit?: (module: Module) => void;
}

export default function ModuleCard({
  module,
  onEdit,
}: Props) {
  const Icon =
    (Icons as any)[module.icon] ??
    Icons.Box;

  return (
    <div className="group relative">
      {/* Edit Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onEdit?.(module);
        }}
        className="
          absolute
          -top-1
          -right-1
          z-20
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-full
          bg-white
          text-gray-600
          shadow-lg
          transition-all
          hover:bg-blue-500
          hover:text-white
        "
      >
        <Pencil size={16} />
      </button>

      <Link
        href={module.path}
        className="flex flex-col items-center"
      >
        <div
          className="
            w-20
            h-20
            rounded-2xl
            flex
            items-center
            justify-center
            text-white
            shadow-lg
            transition-all
            duration-300
            group-hover:-translate-y-1
            group-hover:shadow-xl
          "
          style={{
            backgroundColor:
              module.background_color ??
              "#4F6BFF",
          }}
        >
          <Icon size={34} />
        </div>

        <span
          className="
            mt-3
            text-center
            text-[15px]
            font-medium
            leading-6
            max-w-[130px]
            line-clamp-2
          "
        >
          {module.module_name}
        </span>
      </Link>
    </div>
  );
}