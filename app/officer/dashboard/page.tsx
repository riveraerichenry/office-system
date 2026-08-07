"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AccountableOfficerModal from "../AccountableOfficerModal";

export default function OfficerDashboard() {
  const [showModal, setShowModal] =
    useState(false);

  useEffect(() => {
    checkOfficer();
  }, []);

  async function checkOfficer() {
    const res = await axios.get(
      "/api/accountable-officer/me"
    );

    if (!res.data.exists) {
      setShowModal(true);
    }
  }

  return (
    <>
      <div className="rounded-[40px] bg-white p-10 shadow-xl">
        <h1 className="text-4xl font-bold">
          Welcome Officer
        </h1>
      </div>

      <AccountableOfficerModal
        open={showModal}
        onSuccess={() =>
          setShowModal(false)
        }
      />
    </>
  );
}