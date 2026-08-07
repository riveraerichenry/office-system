"use client";

import {
  Bell,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import OfficerAppLauncher from "./OfficerAppLauncher";
import Link from "next/link";

type UserType = {
  id: string;
  username: string;
  role: string;
};

export default function OfficerTopbar() {
  const router = useRouter();

  const [user, setUser] =
    useState<UserType | null>(null);

  const [dropdownOpen, setDropdownOpen] =
    useState(false);

  const [openLauncher, setOpenLauncher] =
    useState(false);

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUser();
  }, []);

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

  async function fetchUser() {
    try {
      const res = await axios.get(
        "/api/auth/me"
      );

      setUser(res.data.user);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleLogout() {
    await axios.post(
      "/api/auth/logout"
    );

    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 h-20 bg-white px-8 shadow-sm">
      <div className="relative flex h-full items-center justify-between">
        {/* Left */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Officer Portal
          </h1>

          <p className="text-xs text-gray-500">
            Treasury Management System
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* 9 Dot Launcher */}
          <button
            onClick={() =>
              setOpenLauncher(
                !openLauncher
              )
            }
            className="rounded-full p-3 transition hover:bg-gray-100"
          >
            <div className="grid grid-cols-3 gap-[3px]">
              {Array.from({
                length: 9,
              }).map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-gray-600"
                />
              ))}
            </div>
          </button>

          {/* Notification */}
          <button className="rounded-full p-3 transition hover:bg-gray-100">
            <Bell size={20} />
          </button>

          {/* Profile */}
          <div
            ref={dropdownRef}
            className="relative"
          >
            <button
              onClick={() =>
                setDropdownOpen(
                  !dropdownOpen
                )
              }
              className="flex items-center gap-3 rounded-2xl px-3 py-2 transition hover:bg-gray-100"
            >
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {user?.username}
                </p>

                <p className="text-xs text-gray-500">
                  Accountable Officer
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
                {(
                  user?.username ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>
            </button>

            {dropdownOpen && (
              <div className="
  absolute right-8 top-20 z-50
  w-[420px]
  rounded-[32px]
  bg-white/95
  backdrop-blur-xl
  p-6
  shadow-[0_30px_80px_rgba(15,23,42,0.18)]
">
                <Link href="/officer/profile">
                  <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 hover:bg-gray-50">
                    <User size={18} />
                    Profile
                  </button>
                </Link>

                <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 hover:bg-gray-50">
                  <Settings size={18} />
                  Settings
                </button>

                <button
                  onClick={
                    handleLogout
                  }
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <OfficerAppLauncher
          open={openLauncher}
          onClose={() =>
            setOpenLauncher(false)
          }
        />
      </div>
    </header>
  );
}