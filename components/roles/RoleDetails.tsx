"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import ModulePermissionTable from "./ModulePermissionTable";

type Props = {
  selected: any;
  onRefresh: () => void;
};

export default function RoleDetails({
  selected,
  onRefresh,
}: Props) {

  const [form, setForm] = useState({
    role_name: "",
    description: "",
    is_active: true,
  });

  const [modules, setModules] =
    useState<any[]>([]);

  useEffect(() => {

    if (!selected) return;

    setForm({
      role_name: selected.role_name,
      description:
        selected.description ?? "",
      is_active:
        selected.is_active,
    });

    fetchModules();

  }, [selected]);

  async function fetchModules() {

    if (!selected) return;

    try {

      const res =
        await axios.get(
          `/api/roles/${selected.id}/modules`
        );

      setModules(res.data.data);

    } catch (err) {
      console.log(err);
    }

  }

  async function saveRole() {

    if (!selected) return;

    try {

      await axios.put(
        `/api/roles/${selected.id}`,
        form
      );

      await axios.put(
        `/api/roles/${selected.id}/modules`,
        {
          modules,
        }
      );

      alert("Role updated.");

      onRefresh();

    } catch (err) {

      console.log(err);

      alert("Failed to save.");

    }

  }

  async function deleteRole() {

    if (!selected) return;

    if (
      !confirm(
        "Delete this role?"
      )
    )
      return;

    try {

      await axios.delete(
        `/api/roles/${selected.id}`
      );

      alert("Role deleted.");

      onRefresh();

    } catch (err) {

      console.log(err);

    }

  }

  if (!selected) {
    return (
      <div className="rounded-[36px] bg-white p-8 shadow-xl">
        Select a role.
      </div>
    );
  }

  return (
    <div className="rounded-[36px] bg-white p-8 shadow-xl">

      <h2 className="mb-8 text-3xl font-bold">
        Role Details
      </h2>

      <div className="space-y-6">

        {/* Role Name */}

        <div>

          <label className="mb-2 block text-sm font-medium">
            Role Name
          </label>

          <input
            value={form.role_name}
            onChange={(e)=>
              setForm({
                ...form,
                role_name:
                  e.target.value,
              })
            }
            className="w-full rounded-xl border p-3 outline-none"
          />

        </div>

        {/* Description */}

        <div>

          <label className="mb-2 block text-sm font-medium">
            Description
          </label>

          <textarea
            rows={3}
            value={form.description}
            onChange={(e)=>
              setForm({
                ...form,
                description:
                  e.target.value,
              })
            }
            className="w-full rounded-xl border p-3 outline-none"
          />

        </div>

        {/* Active */}

        <div className="flex items-center justify-between rounded-xl border p-4">

          <div>

            <h3 className="font-semibold">
              Active Role
            </h3>

            <p className="text-sm text-gray-500">
              Users can use this role.
            </p>

          </div>

          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e)=>
              setForm({
                ...form,
                is_active:
                  e.target.checked,
              })
            }
            className="h-5 w-5"
          />

        </div>

        {/* Permissions */}

        <ModulePermissionTable
          modules={modules}
          onChange={setModules}
        />

      </div>

      <div className="mt-10 flex gap-4">

        <button
          onClick={deleteRole}
          className="
            rounded-xl
            bg-red-500
            px-8
            font-bold
            text-white
          "
        >
          Delete
        </button>

        <button
          onClick={saveRole}
          className="
            flex-1
            rounded-xl
            bg-gradient-to-r
            from-cyan-400
            via-purple-400
            to-fuchsia-500
            py-4
            font-bold
            text-white
          "
        >
          Save Changes
        </button>

      </div>

    </div>
  );

}