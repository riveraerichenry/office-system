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

export default function ReleaseTable({

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
            Waiting for Release
          </h2>

          <p className="text-sm text-slate-500">
            Fully Assigned RAT awaiting release.
          </p>

        </div>

        <button
          onClick={onRefresh}
          className="rounded-lg border px-4 py-2 hover:bg-slate-50"
        >
          Refresh
        </button>

      </div>

      <div className="border-b p-4">

        <input
          value={search}
          onChange={(e)=>
            onSearch(e.target.value)
          }
          placeholder="Search..."
          className="w-full rounded-xl border px-4 py-2"
        />

      </div>

      <div className="max-h-[700px] overflow-auto">

        <table className="w-full">

          <thead className="sticky top-0 bg-slate-50">

            <tr>

              <th className="px-4 py-3 text-left">
                RAT No.
              </th>

              <th className="px-4 py-3 text-left">
                Officer
              </th>

              <th className="px-4 py-3 text-center">
                Booklets
              </th>

            </tr>

          </thead>

          <tbody>

            {

              loading &&

              <tr>

                <td
                  colSpan={3}
                  className="py-10 text-center"
                >
                  Loading...
                </td>

              </tr>

            }

            {

              !loading &&

              data.length===0 &&

              <tr>

                <td
                  colSpan={3}
                  className="py-10 text-center text-slate-500"
                >
                  No records found.
                </td>

              </tr>

            }

            {

              data.map((item:any)=>(

                <tr

                  key={item.id}

                  onClick={()=>
                    onSelect(item)
                  }

                  className={`cursor-pointer border-t hover:bg-blue-50

                  ${

                    selected?.id===item.id

                    ?

                    "bg-blue-100"

                    :

                    ""

                  }`}

                >

                  <td className="px-4 py-4">

                    <div className="font-medium">
                      {item.rat_no}
                    </div>

                    <div className="text-xs text-slate-500">
                      {item.ris_no}
                    </div>

                  </td>

                  <td className="px-4 py-4">

                    {item.officer}

                  </td>

                  <td className="px-4 py-4 text-center">

                    {item.assigned_booklets}

                  </td>

                </tr>

              ))

            }

          </tbody>

        </table>

      </div>

    </div>

  );

}