"use client";

type Props = {
  data: any[];
  loading: boolean;
  selected: any;

  search: string;

  onSearch: (value: string) => void;

  onRefresh: () => void;

  onSelect: (item: any) => void;
};

export default function GenerateRATTable({
  data,
  loading,
  selected,

  search,

  onSearch,

  onRefresh,

  onSelect,
}: Props) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm">

      <div className="flex items-center justify-between border-b p-4">

        <div>

          <h2 className="text-lg font-semibold">
            Approved RIS
          </h2>

          <p className="text-sm text-slate-500">
            Waiting for RAT generation
          </p>

        </div>

        <button
          onClick={onRefresh}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
        >
          Refresh
        </button>

      </div>

      <div className="border-b p-4">

        <input
          value={search}
          onChange={(e) =>
            onSearch(
              e.target.value
            )
          }
          placeholder="Search RIS..."
          className="w-full rounded-lg border px-4 py-2"
        />

      </div>

      <div className="max-h-[650px] overflow-auto">

        <table className="w-full">

          <thead className="sticky top-0 bg-slate-50">

            <tr>

              <th className="px-4 py-3 text-left">
                RIS No.
              </th>

              <th className="px-4 py-3 text-left">
                Requester
              </th>

              <th className="px-4 py-3 text-center">
                Items
              </th>

              <th className="px-4 py-3 text-left">
                Approved
              </th>

            </tr>

          </thead>

          <tbody>

            {loading && (

              <tr>

                <td
                  colSpan={4}
                  className="py-12 text-center text-slate-500"
                >
                  Loading...
                </td>

              </tr>

            )}

            {!loading &&
              data.length === 0 && (

              <tr>

                <td
                  colSpan={4}
                  className="py-12 text-center text-slate-500"
                >
                  No approved RIS found.
                </td>

              </tr>

            )}

            {!loading &&
              data.map((item) => (

              <tr
                key={item.id}
                onClick={() =>
                  onSelect(item)
                }
                className={`cursor-pointer border-t transition hover:bg-blue-50

                ${
                  selected?.id ===
                  item.id
                    ? "bg-blue-100"
                    : ""
                }`}
              >

                <td className="px-4 py-4 font-medium">
                  {item.ris_no}
                </td>

                <td className="px-4 py-4">
                  {item.requester}
                </td>

                <td className="px-4 py-4 text-center">
                  {item.total_items}
                </td>

                <td className="px-4 py-4">
                  {item.approved_date
                    ? new Date(
                        item.approved_date
                      ).toLocaleDateString()
                    : "-"}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}