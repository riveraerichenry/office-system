
"use client";

import { useState } from "react";
import { FilePlus2 } from "lucide-react";

import ManualRCDModal from "./ManualRCDModal";

type FundSource = {
  id: string;
  fundCode: string;
  fundName: string;
  acronym: string | null;
};

type Props = {
  fundSources: FundSource[];
  onCreated: () => void;
};

export default function ManualRCDLauncher({
  fundSources,
  onCreated,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        <FilePlus2 size={16} />
        Manual RCD
      </button>

      <ManualRCDModal
        open={open}
        fundSources={fundSources}
        onClose={() => setOpen(false)}
        onCreated={onCreated}
      />
    </>
  );
}
