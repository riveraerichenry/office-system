"use client";

import axios from "axios";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import ModuleCard from "@/components/dashboard/ModuleCard";
import AddModuleCard from "@/components/dashboard/AddModuleCard";
import AddModuleModal from "@/components/dashboard/AddModuleModal";

interface Module {
  id: string;
  module_name: string;
  icon: string;
  path: string;
  description?: string;
  background_color?: string;
  sort_order?: number;
}

export default function DashboardPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);

  // NEW
  const [editingModule, setEditingModule] =
    useState<Module | null>(null);

  useEffect(() => {
    fetchModules();
  }, []);

  async function fetchModules() {
    try {
      const res = await axios.get("/api/modules");

      if (res.data.success) {
        setModules(res.data.data);
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
    <>
      <div className="min-h-screen bg-[#F6F7FB] px-10 py-8">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-center text-4xl font-bold">
            Admin Dashboard
          </h1>
        </div>

        {/* Search */}
        <div className="mx-auto mb-14 max-w-lg">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow">
            <Search
              size={20}
              className="text-gray-400"
            />

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

        {/* Module Grid */}
        <div className="flex justify-center">
          <div
            className="
              grid
              grid-cols-2
              gap-x-20
              gap-y-16
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
              xl:grid-cols-6
            "
          >
            {/* Add Module */}
            <AddModuleCard
              onClick={() => {
                setEditingModule(null);
                setOpenModal(true);
              }}
            />

            {/* Existing Modules */}
            {filtered.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                onEdit={(module) => {
                  setEditingModule(module);
                  setOpenModal(true);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AddModuleModal
        open={openModal}
        module={editingModule}
        onClose={() => {
          setEditingModule(null);
          setOpenModal(false);

          // Refresh modules after closing
          fetchModules();
        }}
      />
    </>
  );
}