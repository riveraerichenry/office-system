"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import ModuleGrid from "@/components/dashboard/ModuleGrid";

interface Module {
  id: string;
  module_name: string;
  path: string;
  icon: string;
  background_color: string;

  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  can_print: boolean;
}

export default function DashboardPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchModules();
  }, []);

  async function fetchModules() {
    try {
      const res = await axios.get(
        "/api/user-modules"
      );

      if (res.data.success) {
        setModules(
          res.data.data || []
        );
      }

    } catch (error) {
      console.error(error);
    }
  }

  const filtered = useMemo(() => {
    return modules.filter((module) =>
      module.module_name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [modules, search]);

  return (
    <div className="min-h-[calc(100vh-80px)] px-8 py-10">

      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>
      </div>

      <div className="mx-auto mb-12 max-w-xl">
        <div className="flex items-center gap-3 rounded-2xl border bg-white px-5 py-4 shadow-sm">

          <Search size={20} />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search modules..."
            className="w-full outline-none"
          />

        </div>
      </div>

      <div className="flex justify-center">

        <ModuleGrid
          modules={filtered}
          variant="dashboard"
          showAdd={false}
        />

      </div>

    </div>
  );
}