"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import UserTable from "@/components/users/UserTable";
import UserDetails from "@/components/users/UserDetails";
import UserSummary from "@/components/users/UserSummary";
import AddUserModal from "@/components/users/AddUserModal";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [openAdd, setOpenAdd] =
    useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);

      const [
        usersRes,
        rolesRes,
      ] = await Promise.all([
        axios.get("/api/users"),
        axios.get("/api/roles"),
      ]);

      const userData =
        usersRes.data.data || [];

      setUsers(userData);

      setRoles(
        rolesRes.data.data || []
      );

      if (
        userData.length > 0
      ) {
        setSelected(userData[0]);
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
        <UserTable
            users={users}
            selected={selected}
            onSelect={setSelected}
            loading={loading}
            onAdd={() => setOpenAdd(true)}
        />
    </div>

    <div className="col-span-8">
        <UserDetails
            selected={selected}
            roles={roles}
            onRefresh={fetchData}
        />
    </div>

</div>
</>
  );
}