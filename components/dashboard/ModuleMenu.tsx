"use client";

import {
  MoreVertical,
  Pencil,
  Palette,
  Copy,
  EyeOff,
  Trash2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface Props {
  module: any;
  onEdit: (module: any) => void;
}

export default function ModuleMenu({
  module,
  onEdit,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="rounded-full p-1.5 hover:bg-black/10"
        >
            <MoreVertical size={18} />
        </button>
        </DropdownMenuTrigger>

      <DropdownMenuContent align="end">

        <DropdownMenuItem
          onClick={() => onEdit(module)}
        >
          <Pencil
            size={16}
            className="mr-2"
          />
          Edit Module
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Palette
            size={16}
            className="mr-2"
          />
          Change Color
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Copy
            size={16}
            className="mr-2"
          />
          Duplicate
        </DropdownMenuItem>

        <DropdownMenuItem>
          <EyeOff
            size={16}
            className="mr-2"
          />
          Deactivate
        </DropdownMenuItem>

        <DropdownMenuItem className="text-red-600">
          <Trash2
            size={16}
            className="mr-2"
          />
          Delete
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}