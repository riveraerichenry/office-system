"use client";

import Link from "next/link";
import { moduleIcons } from "@/lib/module-icons";
import { getModuleColor } from "@/lib/module-colors";

type Props = {
  id: string;
  module_name: string;
  icon: string;
  path: string;
};

export default function ModuleCard({
  module_name,
  icon,
  path,
}: Props) {
  const Icon = moduleIcons[icon];
  const color =
    getModuleColor(module_name);

  return (
    <Link href={path}>
      <div
        className="
          group
          w-28
          cursor-pointer
          rounded-3xl
          p-4
          hover:bg-white
          hover:shadow-xl
          transition-all
          duration-300
          flex
          flex-col
          items-center
        "
      >
        <div
          className={`
            h-16
            w-16
            rounded-2xl
            flex
            items-center
            justify-center
            shadow-md
            group-hover:scale-105
            transition
            ${color}
          `}
        >
          {Icon && <Icon size={28} />}
        </div>

        <p className="mt-3 text-sm font-medium text-center text-slate-700">
          {module_name}
        </p>
      </div>
    </Link>
  );
}