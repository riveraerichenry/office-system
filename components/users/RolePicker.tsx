"use client";

type Props = {
  roles: any[];
  selectedRoles: string[];
  onChange: (roles: string[]) => void;
};

export default function RolePicker({
  roles,
  selectedRoles,
  onChange,
}: Props) {
  function toggleRole(roleId: string) {
    if (selectedRoles.includes(roleId)) {
      onChange(selectedRoles.filter((id) => id !== roleId));
    } else {
      onChange([...selectedRoles, roleId]);
    }
  }

  return (
    <div>

      {/* Header */}

      <div className="mb-3 flex items-center justify-between">

        <div>

          <h3 className="text-sm font-semibold text-gray-900">
            Assigned Roles
          </h3>

          <p className="text-xs text-gray-500">
            Select one or more roles for this user.
          </p>

        </div>

        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
          {selectedRoles.length} Selected
        </span>

      </div>

      {/* Role List */}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">

        {roles.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-500">
            No roles available.
          </div>
        ) : (
          roles.map((role: any, index: number) => {
            const checked = selectedRoles.includes(role.id);

            return (
              <label
                key={role.id}
                className={`
                  flex items-center justify-between
                  px-4 py-3
                  transition
                  cursor-pointer
                  ${
                    checked
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  }
                  ${
                    index !== roles.length - 1
                      ? "border-b border-gray-200"
                      : ""
                  }
                `}
              >
                <div className="flex items-center gap-3">

                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRole(role.id)}
                    className="
                      h-4
                      w-4
                      rounded
                      border-gray-300
                      text-blue-600
                      focus:ring-blue-500
                    "
                  />

                  <span className="text-sm font-medium text-gray-800">
                    {role.role_name}
                  </span>

                </div>

                {checked && (
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    Assigned
                  </span>
                )}

              </label>
            );
          })
        )}

      </div>

    </div>
  );
}