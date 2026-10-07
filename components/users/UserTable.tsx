"use client";

import {
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";



type Props = {
  users: any[];
  loading: boolean;
  onSelect: (user: any) => void;
};



export default function UserTable({
  users,
  loading,
  onSelect,
}: Props) {

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);


  const PER_PAGE = 10;



  /*
  |--------------------------------------------------------------------------
  | FILTER
  |--------------------------------------------------------------------------
  */

  const filtered =
    useMemo(() => {

      const keyword =
        search
          .trim()
          .toLowerCase();


      return users.filter(
        (user: any) => {

          const roles =
            (user.roles || [])
              .map(
                (role: any) =>
                  role.role_name
              )
              .join(" ")
              .toLowerCase();


          return (

            user.username
              ?.toLowerCase()
              .includes(keyword)

            ||

            user.full_name
              ?.toLowerCase()
              .includes(keyword)

            ||

            roles.includes(keyword)

            ||

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
          PER_PAGE
      )
    );


  const rows =
    filtered.slice(
      (page - 1) *
        PER_PAGE,

      page *
        PER_PAGE
    );



  /*
  |--------------------------------------------------------------------------
  | RESET PAGE ON SEARCH
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

    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

      {/* ================================================================
          HEADER
      ================================================================ */}

      <div className="border-b border-gray-200 px-6 py-5">

        <div>

          <h2 className="text-xl font-semibold text-gray-900">
            Users
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select a user to view details.
          </p>

        </div>

      </div>



      {/* ================================================================
          SEARCH
      ================================================================ */}

      <div className="border-b border-gray-200 p-5">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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
            placeholder="Search users..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />

        </div>

      </div>



      {/* ================================================================
          USER LIST
      ================================================================ */}

      <div className="min-h-[620px] space-y-2 p-5">

        {/* LOADING */}

        {loading && (

          <div className="py-10 text-center text-gray-500">

            Loading users...

          </div>

        )}



        {/* EMPTY */}

        {!loading &&
          rows.length === 0 && (

            <div className="py-10 text-center text-gray-500">

              No users found.

            </div>

          )}



        {/* USERS */}

        {!loading &&
          rows.map(
            (user: any) => (

              <button
                key={user.id}
                type="button"
                onClick={() =>
                  onSelect(user)
                }
                className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
              >

                <div className="flex items-start justify-between">

                  <div>

                    <h3 className="font-semibold text-gray-900">

                      {user.full_name ||
                        "Unnamed User"}

                    </h3>


                    <p className="mt-1 text-sm text-gray-500">

                      @{user.username}

                    </p>

                  </div>

                </div>



                {/* ROLES */}

                <div className="mt-3 flex flex-wrap gap-2">

                  {(user.roles || []).map(
                    (role: any) => (

                      <span
                        key={role.id}
                        className="rounded-md border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                      >

                        {role.role_name}

                      </span>

                    )
                  )}

                </div>

              </button>

            )
          )}

      </div>



      {/* ================================================================
          PAGINATION
      ================================================================ */}

      <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">

        {/* PREVIOUS */}

        <button
          type="button"
          disabled={
            page === 1
          }
          onClick={() =>
            setPage(
              (current) =>
                Math.max(
                  current - 1,
                  1
                )
            )
          }
          className="rounded-md border border-gray-300 p-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >

          <ChevronLeft
            size={18}
          />

        </button>



        {/* PAGE */}

        <span className="text-sm text-gray-600">

          Page{" "}

          <strong>
            {page}
          </strong>

          {" "}of{" "}

          <strong>
            {totalPages}
          </strong>

        </span>



        {/* NEXT */}

        <button
          type="button"
          disabled={
            page === totalPages
          }
          onClick={() =>
            setPage(
              (current) =>
                Math.min(
                  current + 1,
                  totalPages
                )
            )
          }
          className="rounded-md border border-gray-300 p-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >

          <ChevronRight
            size={18}
          />

        </button>

      </div>

    </div>

  );

}