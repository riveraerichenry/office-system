"use client";

import {
  Bell,
  User,
  Settings,
  LogOut,
  CheckCheck,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import AppLauncher from "./AppLauncher";
import axios from "axios";
import { useRouter } from "next/navigation";

type Module = {
  id: string;
  module_name: string;
  icon: string;
  path: string;
};

type UserType = {
  id: string;
  username: string;
  role: string;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  module: string | null;
  record_id: string | null;
  action_url: string | null;
  notification_type: string | null;
  priority: string | null;
  is_read: boolean;
  created_at: string;
};

export default function Topbar() {
  const router = useRouter();

  const [modules, setModules] =
    useState<Module[]>([]);

  const [user, setUser] =
    useState<UserType | null>(null);

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [unread, setUnread] =
    useState(0);

  const [openLauncher, setOpenLauncher] =
    useState(false);

  const [dropdownOpen, setDropdownOpen] =
    useState(false);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  const notificationRef =
    useRef<HTMLDivElement>(null);


     useEffect(() => {
    fetchModules();
    fetchUser();
    // fetchNotifications();
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

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          e.target as Node
        )
      ) {
        setNotificationOpen(false);
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

  async function fetchModules() {
    try {
      const res = await axios.get(
        "/api/user-modules"
      );

      setModules(
        res.data.data || []
      );
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchUser() {
    try {
      const res = await axios.get(
        "/api/auth/me"
      );

      setUser(
        res.data.user
      );
    } catch (err) {
      console.log(err);
    }
  }

  // async function fetchNotifications() {
  //   try {
  //     const res = await axios.get(
  //       "/api/notifications"
  //     );

  //     setNotifications(
  //       res.data.data || []
  //     );

  //     setUnread(
  //       res.data.unread || 0
  //     );

  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  // async function markAsRead(
  //   id: string
  // ) {
  //   try {
  //     await axios.patch(
  //       "/api/notifications/read",
  //       {
  //         id,
  //       }
  //     );

  //     fetchNotifications();

  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  // async function markAllRead() {
  //   try {
  //     await axios.patch(
  //       "/api/notifications/read-all"
  //     );

  //     fetchNotifications();

  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

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

        <div className="text-2xl font-bold tracking-tight text-slate-900">
          OfficeSys
        </div>

        {/* Right */}

        <div className="flex items-center gap-2">

          {/* Launcher */}

          {/* <button
            onClick={() =>
              setOpenLauncher(!openLauncher)
            }
            className="rounded-full p-3 transition hover:bg-gray-100"
          >
            <div className="grid grid-cols-3 gap-[3px]">
              {Array.from({ length: 9 }).map(
                (_, i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-gray-600"
                  />
                )
              )}
            </div>
          </button> */}

          {/* Notifications */}

          {/* <div
            ref={notificationRef}
            className="relative"
          >
            <button
              onClick={() => {
                  const next = !notificationOpen;

                  setNotificationOpen(next);

                  if (next) {
                      fetchNotifications();
                  }
              }}
              className="relative rounded-full p-3 transition hover:bg-gray-100"
            >
              <Bell size={20} />

              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                  {unread}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-3 w-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                <div className="flex items-center justify-between border-b px-5 py-4">

                  <h3 className="font-semibold">
                    Notifications
                  </h3>

                  {notifications.length >
                    0 && (
                    <button
                      onClick={
                        markAllRead
                      }
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <CheckCheck
                        size={16}
                      />
                      Mark all read
                    </button>
                  )}

                </div>

                <div className="max-h-[450px] overflow-y-auto">

                  {notifications.length ===
                  0 ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                      No notifications.
                    </div>
                  ) : (
                    notifications.map(
                      (
                        notification
                      ) => (
                        <Link
                          key={
                            notification.id
                          }
                          href={
                            notification.action_url ||
                            "#"
                          }
                          onClick={() => {
                            markAsRead(
                              notification.id
                            );
                            setNotificationOpen(
                              false
                            );
                          }}
                          className={`block border-b p-4 transition hover:bg-slate-50 ${
                            !notification.is_read
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <p className="font-semibold text-slate-800">
                            {
                              notification.title
                            }
                          </p>

                          <p className="mt-1 text-sm text-slate-600">
                            {
                              notification.message
                            }
                          </p>

                          <p className="mt-2 text-xs text-slate-400">
                            {new Date(
                              notification.created_at
                            ).toLocaleString()}
                          </p>
                        </Link>
                      )
                    )
                  )}

                </div>

              </div>
            )}

          </div> */}


          {/* User */}

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
                  {user?.role}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-700 font-semibold text-white">
                {(
                  user?.username ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-16 z-50 w-64 rounded-3xl border border-gray-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">

                <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-gray-50">
                  <User size={18} />
                  Profile
                </button>

                <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-gray-50">
                  <Settings size={18} />
                  Settings
                </button>

                <button
                  onClick={
                    handleLogout
                  }
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>

              </div>
            )}

          </div>

        </div>

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