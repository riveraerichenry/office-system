"use client";

import {
  User,
  Calendar,
  Shield,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type Props = {
  selected: any;
};

export default function UserSummary({
  selected,
}: Props) {
  if (!selected) {
    return (
      <div className="rounded-[36px] bg-white p-8 shadow-xl">
        Select a user.
      </div>
    );
  }

  return (
    <div className="rounded-[36px] bg-white p-8 shadow-xl">

      {/* Avatar */}

      <div className="mb-8 flex flex-col items-center">

        <div className="
          mb-4
          flex
          h-24
          w-24
          items-center
          justify-center
          rounded-full
          bg-gradient-to-r
          from-cyan-400
          via-purple-400
          to-fuchsia-500
          text-white
          shadow-lg
        ">
          <User size={42} />
        </div>

        <h2 className="text-2xl font-bold">
          {selected.full_name}
        </h2>

        <p className="text-gray-500">
          @{selected.username}
        </p>

      </div>

      {/* Status */}

      <div className="mb-6 rounded-2xl border p-4">

        <div className="mb-3 flex items-center gap-2">

          {selected.is_active ? (
            <CheckCircle2
              className="text-green-500"
              size={18}
            />
          ) : (
            <XCircle
              className="text-red-500"
              size={18}
            />
          )}

          <span className="font-semibold">
            Status
          </span>

        </div>

        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            selected.is_active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {selected.is_active
            ? "Active"
            : "Inactive"}
        </span>

      </div>

      {/* Roles */}

      <div className="mb-6 rounded-2xl border p-4">

        <div className="mb-4 flex items-center gap-2">

          <Shield
            size={18}
            className="text-purple-500"
          />

          <span className="font-semibold">
            Assigned Roles
          </span>

        </div>

        <div className="flex flex-wrap gap-2">

          {(selected.roles || []).map(
            (role: any) => (
              <span
                key={role.id}
                className="
                  rounded-full
                  bg-gradient-to-r
                  from-cyan-400
                  via-purple-400
                  to-fuchsia-500
                  px-3
                  py-1
                  text-sm
                  font-medium
                  text-white
                "
              >
                {role.role_name}
              </span>
            )
          )}

        </div>

      </div>

      {/* Information */}

      <div className="rounded-2xl border p-4">

        <div className="mb-4 flex items-center gap-2">

          <Calendar
            size={18}
            className="text-blue-500"
          />

          <span className="font-semibold">
            Account Information
          </span>

        </div>

        <div className="space-y-3 text-sm">

          <div className="flex justify-between">

            <span className="text-gray-500">
              Created
            </span>

            <span>
              {selected.created_at
                ? new Date(
                    selected.created_at
                  ).toLocaleDateString()
                : "-"}
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-gray-500">
              Updated
            </span>

            <span>
              {selected.updated_at
                ? new Date(
                    selected.updated_at
                  ).toLocaleDateString()
                : "-"}
            </span>

          </div>

          <div className="flex justify-between">

            <span className="text-gray-500">
              Modules
            </span>

            <span>
              Coming Soon
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}