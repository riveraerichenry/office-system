"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import RoleTable from "@/components/roles/RoleTable";
import RoleDetails from "@/components/roles/RoleDetails";
import AddRoleModal from "@/components/roles/AddRoleModal";

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [openAdd, setOpenAdd] =
    useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  async function fetchRoles() {
    try {
      setLoading(true);

      const res =
        await axios.get("/api/roles");

      setRoles(res.data.data);

      if (res.data.data.length > 0) {
        setSelected(res.data.data[0]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-6">

        <div className="col-span-4">

          <RoleTable
            roles={roles}
            selected={selected}
            loading={loading}
            onSelect={setSelected}
            onAdd={() =>
              setOpenAdd(true)
            }
          />

        </div>

        <div className="col-span-8">

          <RoleDetails
            selected={selected}
            onRefresh={fetchRoles}
          />

        </div>

      </div>

      <AddRoleModal
        open={openAdd}
        onClose={() =>
          setOpenAdd(false)
        }
        onSuccess={fetchRoles}
      />
    </>
  );
}