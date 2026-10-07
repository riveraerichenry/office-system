"use client";

import {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import UserTable from "@/components/users/UserTable";
import UserDetails from "@/components/users/UserDetails";
import AddUserModal from "@/components/users/AddUserModal";

export default function UsersPage() {
  const [users, setUsers] =
    useState<any[]>([]);

  const [roles, setRoles] =
    useState<any[]>([]);

  const [selected, setSelected] =
    useState<any>(null);

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
        usersRes.data?.data || [];

      const roleData =
        rolesRes.data?.data || [];

      setUsers(userData);
      setRoles(roleData);

      if (userData.length > 0) {
        setSelected(userData[0]);
      } else {
        setSelected(null);
      }

    } catch (err) {

      console.error(
        "Failed to fetch users:",
        err
      );

    } finally {

      setLoading(false);

    }
  }


  return (
    <>
      <div className="grid grid-cols-12 gap-6">

        {/* USER TABLE */}

        <div className="col-span-12 lg:col-span-4">

          <UserTable
            users={users}
            selected={selected}
            onSelect={setSelected}
            loading={loading}
            onAdd={() =>
              setOpenAdd(true)
            }
          />

        </div>


        {/* USER DETAILS */}

        <div className="col-span-12 lg:col-span-8">

          <UserDetails
            selected={selected}
            roles={roles}
            onRefresh={fetchData}
          />

        </div>

      </div>


      {/* ADD USER MODAL */}

      <AddUserModal
        open={openAdd}
        onClose={() =>
          setOpenAdd(false)
        }
        roles={roles}
        onSuccess={async () => {
          setOpenAdd(false);
          await fetchData();
        }}
      />
    </>
  );
}