"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import UserProfileCard from "@/components/officer/UserProfileCard";
import OfficerProfileCard from "@/components/officer/OfficerProfileCard";

export default function OfficerProfilePage() {
  const [profile, setProfile] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);

      const res = await axios.get(
        "/api/accountable-officer"
      );

      setProfile(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>No profile found</div>;
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-4">
        <UserProfileCard
          profile={profile}
          onRefresh={fetchProfile}
        />
      </div>

      <div className="col-span-8">
        <OfficerProfileCard
          profile={profile}
          onRefresh={fetchProfile}
        />
      </div>
    </div>
  );
}