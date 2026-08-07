"use client";

type Props = {
  modules: any[];
  onChange: (modules: any[]) => void;
};

const permissions = [
  "can_view",
  "can_add",
  "can_edit",
  "can_delete",
  "can_approve",
  "can_print",
];

const headers = [
  "View",
  "Add",
  "Edit",
  "Delete",
  "Approve",
  "Print",
];

export default function ModulePermissionTable({
  modules,
  onChange,
}: Props) {

  function toggle(
    index: number,
    permission: string
  ) {
    const copy = [...modules];

    copy[index] = {
      ...copy[index],
      [permission]:
        !copy[index][permission],
    };

    onChange(copy);
  }

  return (
    <div>

      <h3 className="mb-4 text-lg font-semibold">
        Module Permissions
      </h3>

      <div className="overflow-hidden rounded-2xl border">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="px-4 py-3 text-left">
                Module
              </th>

              {headers.map((header) => (

                <th
                  key={header}
                  className="px-3 py-3 text-center text-sm"
                >
                  {header}
                </th>

              ))}

            </tr>

          </thead>

          <tbody>

            {modules.map(
              (module, index) => (

                <tr
                  key={module.id}
                  className="border-t"
                >

                  <td className="px-4 py-4">

                    <div className="font-medium">
                      {module.module_name}
                    </div>

                    <div className="text-xs text-gray-500">
                      {module.path}
                    </div>

                  </td>

                  {permissions.map(
                    (permission) => (

                      <td
                        key={permission}
                        className="text-center"
                      >

                        <input
                          type="checkbox"
                          checked={
                            module[
                              permission
                            ]
                          }
                          onChange={() =>
                            toggle(
                              index,
                              permission
                            )
                          }
                          className="h-5 w-5 accent-cyan-500"
                        />

                      </td>

                    )
                  )}

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}