"use client";

import {
  User,
  Settings,
  LogOut,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import AppLauncher from "./AppLauncher";
import axios from "axios";
import { useRouter } from "next/navigation";

type Module = {
  id: string;
  module_name: string;
  icon: string;
  path: string;
  description?: string;
  color?: string;
  background_color?: string;
};

type UserType = {
  id: string;
  username: string;
  role: string;
};

export default function Topbar() {
  const router = useRouter();

  // ---------------------------------------------
  // State
  // ---------------------------------------------

  const [modules, setModules] =
    useState<Module[]>([]);

  const [user, setUser] =
    useState<UserType | null>(null);

  const [openLauncher, setOpenLauncher] =
    useState(false);

  const [dropdownOpen, setDropdownOpen] =
    useState(false);

  // ---------------------------------------------
  // Refs
  // ---------------------------------------------

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  // ---------------------------------------------
  // Initial Load
  // ---------------------------------------------

  useEffect(() => {
    fetchModules();
    fetchUser();
  }, []);

  // ---------------------------------------------
  // Close User Dropdown
  // ---------------------------------------------

  useEffect(() => {
    function handleClickOutside(
      e: MouseEvent
    ) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          e.target as Node
        )
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  // ---------------------------------------------
  // Fetch Assigned Modules
  // ---------------------------------------------

  async function fetchModules() {
    try {
      const res = await axios.get(
        "/api/user-modules"
      );

      setModules(
        res.data.data || []
      );
    } catch (err) {
      console.error(
        "Failed to load assigned modules:",
        err
      );

      setModules([]);
    }
  }

  // ---------------------------------------------
  // Fetch Current User
  // ---------------------------------------------

  async function fetchUser() {
    try {
      const res = await axios.get(
        "/api/auth/me"
      );

      setUser(
        res.data.user
      );
    } catch (err) {
      console.error(
        "Failed to load current user:",
        err
      );
    }
  }

  // ---------------------------------------------
  // Logout
  // ---------------------------------------------

  async function handleLogout() {
    try {
      await axios.post(
        "/api/auth/logout"
      );

      router.push("/login");
    } catch (err) {
      console.error(
        "Logout failed:",
        err
      );
    }
  }

  // ---------------------------------------------
  // Render
  // ---------------------------------------------

  return (
    <header
      className="
        sticky
        top-0
        z-40
        h-20
        bg-white
        px-8
        shadow-sm
      "
    >
      <div
        className="
          relative
          flex
          h-full
          items-center
          justify-between
        "
      >

        {/* =========================================
            LEFT
        ========================================= */}

        <div
          className="
            text-2xl
            font-bold
            tracking-tight
            text-slate-900
          "
        >
          OfficeSys
        </div>


        {/* =========================================
            RIGHT
        ========================================= */}

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          {/* =======================================
              APPLICATION LAUNCHER
          ======================================= */}

          <button
            type="button"
            onClick={() =>
              setOpenLauncher(
                !openLauncher
              )
            }
            aria-label="Applications"
            aria-expanded={
              openLauncher
            }
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              transition
              hover:bg-slate-100
              active:scale-95
            "
          >
            <div
              className="
                grid
                grid-cols-3
                gap-[4px]
              "
            >
              {Array.from({
                length: 9,
              }).map(
                (_, index) => (
                  <span
                    key={index}
                    className="
                      h-[5px]
                      w-[5px]
                      rounded-full
                      bg-slate-600
                    "
                  />
                )
              )}
            </div>
          </button>


          {/* =======================================
              USER
          ======================================= */}

          <div
            ref={dropdownRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setDropdownOpen(
                  !dropdownOpen
                )
              }
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                px-3
                py-2
                transition
                hover:bg-gray-100
              "
            >

              {/* User Information */}

              <div className="text-right">
                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  {user?.username}
                </p>

                <p
                  className="
                    text-xs
                    text-gray-500
                  "
                >
                  {user?.role}
                </p>
              </div>


              {/* Avatar */}

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-700
                  font-semibold
                  text-white
                "
              >
                {(
                  user?.username ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

            </button>


            {/* =====================================
                USER DROPDOWN
            ===================================== */}

            {dropdownOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-16
                  z-50
                  w-64
                  rounded-3xl
                  border
                  border-gray-200
                  bg-white
                  p-2
                  shadow-[0_20px_60px_rgba(15,23,42,0.18)]
                "
              >

                {/* Profile */}

                <button
                  type="button"
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-2xl
                    px-4
                    py-3
                    text-left
                    transition
                    hover:bg-gray-50
                  "
                >
                  <User
                    size={18}
                    className="text-slate-600"
                  />

                  <span
                    className="
                      text-sm
                      font-medium
                      text-slate-700
                    "
                  >
                    Profile
                  </span>
                </button>


                {/* Settings */}

                <button
                  type="button"
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-2xl
                    px-4
                    py-3
                    text-left
                    transition
                    hover:bg-gray-50
                  "
                >
                  <Settings
                    size={18}
                    className="text-slate-600"
                  />

                  <span
                    className="
                      text-sm
                      font-medium
                      text-slate-700
                    "
                  >
                    Settings
                  </span>
                </button>


                {/* Divider */}

                <div
                  className="
                    my-1
                    border-t
                    border-slate-100
                  "
                />


                {/* Logout */}

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-2xl
                    px-4
                    py-3
                    text-left
                    text-red-600
                    transition
                    hover:bg-red-50
                  "
                >
                  <LogOut
                    size={18}
                  />

                  <span
                    className="
                      text-sm
                      font-medium
                    "
                  >
                    Logout
                  </span>
                </button>

              </div>
            )}

          </div>

        </div>


        {/* =========================================
            APPLICATION LAUNCHER PANEL
        ========================================= */}

        <AppLauncher
          open={openLauncher}
          onClose={() =>
            setOpenLauncher(false)
          }
          modules={modules}
        />

      </div>
    </header>
  );
}