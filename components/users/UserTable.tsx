"use client";

import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";



type UserTableProps = {
  users: any[];
  selected: any;
  onSelect: (user: any) => void;
  loading: boolean;
  onAdd: () => void;
};



export default function UserTable({
  users,
  selected,
  onSelect,
  loading,
  onAdd,
}: UserTableProps) {

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);


  const ITEMS_PER_PAGE = 10;



  /*
  |--------------------------------------------------------------------------
  | FILTER USERS
  |--------------------------------------------------------------------------
  */

  const filtered =
    useMemo(() => {

      const keyword =
        search
          .trim()
          .toLowerCase();


      if (!keyword) {
        return users;
      }


      return users.filter(
        (user: any) => {

          return (
            user.username
              ?.toLowerCase()
              .includes(keyword) ||

            user.role
              ?.toLowerCase()
              .includes(keyword) ||

            user.full_name
              ?.toLowerCase()
              .includes(keyword) ||

            user.email
              ?.toLowerCase()
              .includes(keyword)
          );

        }
      );

    }, [
      users,
      search,
    ]);



  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filtered.length /
          ITEMS_PER_PAGE
      )
    );


  const rows =
    filtered.slice(
      (page - 1) *
        ITEMS_PER_PAGE,

      page *
        ITEMS_PER_PAGE
    );



  /*
  |--------------------------------------------------------------------------
  | RESET PAGE WHEN SEARCH CHANGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    setPage(1);

  }, [
    search,
  ]);



  /*
  |--------------------------------------------------------------------------
  | KEEP PAGE VALID
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (
      page >
      totalPages
    ) {

      setPage(
        totalPages
      );

    }

  }, [
    page,
    totalPages,
  ]);



  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (

    <div className="rounded-[40px] bg-white px-6 py-7 shadow-xl">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <h1 className="text-4xl font-extrabold text-gray-900">
          Users
        </h1>


        <button
          type="button"
          onClick={onAdd}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-500 text-white shadow-lg transition hover:scale-105"
        >

          <Plus size={20} />

        </button>

      </div>



      {/* SEARCH */}

      <div className="mb-7">

        <div className="flex items-center gap-3 border-b border-gray-300 pb-3">

          <Search
            size={18}
            className="text-gray-400"
          />


          <input
            type="text"
            value={search}
            onChange={(e) => {

              setSearch(
                e.target.value
              );

              setPage(1);

            }}
            placeholder="Search user"
            className="w-full bg-transparent text-sm outline-none"
          />

        </div>

      </div>



      {/* USERS */}

      <div className="min-h-[600px] space-y-3">

        {/* LOADING */}

        {loading && (

          <div className="flex min-h-[400px] items-center justify-center">

            <span className="text-sm text-gray-500">
              Loading users...
            </span>

          </div>

        )}



        {/* EMPTY */}

        {!loading &&
          rows.length === 0 && (

            <div className="flex min-h-[400px] items-center justify-center">

              <span className="text-sm text-gray-500">
                No users found.
              </span>

            </div>

          )}



        {/* ROWS */}

        {!loading &&
          rows.map(
            (user: any) => {

              const isSelected =
                selected?.id ===
                user.id;


              return (

                <button
                  key={user.id}
                  type="button"
                  onClick={() =>
                    onSelect(user)
                  }
                  className={`w-full rounded-[28px] px-5 py-5 text-left transition ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-500 text-white shadow-lg"
                      : "bg-[#f8f8f8] text-gray-900 hover:bg-gray-100"
                  }`}
                >

                  <div className="flex items-center justify-between gap-3">

                    <div className="min-w-0">

                      <p className="truncate font-bold">
                        {user.username ||
                          "Unnamed User"}
                      </p>


                      <p
                        className={`mt-1 truncate text-sm ${
                          isSelected
                            ? "text-white/80"
                            : "text-gray-500"
                        }`}
                      >
                        {user.full_name ||
                          user.email ||
                          "No additional information"}
                      </p>

                    </div>


                    {user.role && (

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >

                        {user.role}

                      </span>

                    )}

                  </div>

                </button>

              );

            }
          )}

      </div>



      {/* PAGINATION */}

      <div className="mt-6 flex items-center justify-between">

        {/* PREVIOUS */}

        <button
          type="button"
          disabled={
            page === 1
          }
          onClick={() =>
            setPage(
              (prev) =>
                Math.max(
                  prev - 1,
                  1
                )
            )
          }
          className="rounded-full p-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
        >

          <ChevronLeft
            size={22}
          />

        </button>



        {/* PAGE */}

        <span className="text-sm font-medium text-gray-600">

          Page {page} of{" "}
          {totalPages}

        </span>



        {/* NEXT */}

        <button
          type="button"
          disabled={
            page ===
            totalPages
          }
          onClick={() =>
            setPage(
              (prev) =>
                Math.min(
                  prev + 1,
                  totalPages
                )
            )
          }
          className="rounded-full p-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
        >

          <ChevronRight
            size={22}
          />

        </button>

      </div>

    </div>

  );

}