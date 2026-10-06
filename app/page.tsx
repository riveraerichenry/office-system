"use client";

import Link from "next/link";

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  LockKeyhole,
  Users,
  X,
} from "lucide-react";

import { useState } from "react";

export default function Home() {
  const [showSystemModal, setShowSystemModal] = useState(false);

  return (
    <main className="min-h-screen bg-white text-slate-800">

      {/* ===================================================== */}
      {/* TOP GOVERNMENT BAR */}
      {/* ===================================================== */}

      <div className="bg-[#0B4EA2] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs sm:px-8">
          <p>
            Republic of the Philippines
          </p>

          <p className="hidden sm:block">
            Municipality of Taytay, Palawan
          </p>
        </div>
      </div>


      {/* ===================================================== */}
      {/* NAVIGATION */}
      {/* ===================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-8">

          {/* BRANDING */}

          <div className="flex items-center gap-4">

            <img
              src="/logo.png"
              alt="Municipal Treasury"
              className="h-14 w-14 object-contain"
            />

            <div className="h-12 w-px bg-slate-200" />

            <img
              src="/logo2.png"
              alt="Municipality of Taytay, Palawan"
              className="h-16 w-16 object-contain"
            />

            <div className="border-l border-slate-200 pl-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Municipal Government of
              </p>

              <h1 className="text-xl font-bold text-[#0B4EA2] sm:text-2xl">
                Taytay, Palawan
              </h1>

            </div>

          </div>


          {/* LOGIN */}

          <button
            type="button"
            onClick={() => setShowSystemModal(true)}
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              bg-[#0B4EA2]
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-[#083B7D]
            "
          >
            Login
            <ArrowRight size={17} />
          </button>

        </div>

      </header>


      {/* ===================================================== */}
      {/* HERO */}
      {/* ===================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B4EA2] via-[#0D57B8] to-[#083D7D]">

        {/* Orange bottom accent */}

        <div className="absolute bottom-0 left-0 h-2 w-full bg-[#F28C00]" />


        {/* Background decoration */}

        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-white/5" />

        <div className="absolute -bottom-56 -left-40 h-[550px] w-[550px] rounded-full bg-[#F28C00]/10" />


        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">

          {/* ================================================= */}
          {/* HERO LEFT */}
          {/* ================================================= */}

          <div className="text-white">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">

              <Building2 size={17} />

              Municipal Government of Taytay

            </div>


            <h2 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">

              Treasury Management

              <span className="block text-[#FFB13B]">
                System
              </span>

            </h2>


            <p className="mt-7 max-w-2xl text-lg leading-8 text-blue-100">

              A centralized office management platform designed
              to support efficient, secure, and accountable
              government operations in the Municipality of
              Taytay, Palawan.

            </p>


            {/* Buttons */}

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={() => setShowSystemModal(true)}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-[#F28C00]
                  px-7
                  py-3.5
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-black/10
                  transition
                  hover:bg-[#D97900]
                "
              >
                Access the System

                <ArrowRight size={18} />
              </button>


              <a
                href="#features"
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/30
                  bg-white/10
                  px-7
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  backdrop-blur
                  transition
                  hover:bg-white/20
                "
              >
                Learn More
              </a>

            </div>

          </div>


          {/* ================================================= */}
          {/* HERO RIGHT - LOGOS */}
          {/* ================================================= */}

          <div className="flex justify-center lg:justify-end">

            <div className="relative w-full max-w-md">

              <div className="rounded-3xl border border-white/20 bg-white p-8 shadow-2xl">

                {/* OFFICIAL LOGOS */}

                <div className="flex items-center justify-center gap-4 sm:gap-5">

                  {/* TREASURY */}

                  <div className="flex h-24 w-24 items-center justify-center">

                    <img
                      src="/logo.png"
                      alt="Municipal Treasury"
                      className="max-h-full max-w-full object-contain"
                    />

                  </div>


                  <div className="h-16 w-px bg-slate-200" />


                  {/* MUNICIPALITY */}

                  <div className="flex h-24 w-24 items-center justify-center">

                    <img
                      src="/logo2.png"
                      alt="Municipality of Taytay, Palawan"
                      className="max-h-full max-w-full object-contain"
                    />

                  </div>


                  <div className="h-16 w-px bg-slate-200" />


                  {/* BAGONG TAYTAY */}

                  <div className="flex h-24 w-24 items-center justify-center">

                    <img
                      src="/logo3.jpg"
                      alt="Bagong Taytay"
                      className="max-h-full max-w-full rounded-xl object-contain"
                    />

                  </div>

                </div>


                {/* DIVIDER */}

                <div className="my-7 h-px bg-slate-200" />


                {/* SYSTEM TITLE */}

                <div className="text-center">

                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Municipal Government of Taytay
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-[#0B4EA2]">
                    Treasury Management System
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Efficient • Secure • Accountable
                  </p>

                </div>


                {/* STATUS */}

                <div className="mt-7 flex items-center gap-3 rounded-xl bg-slate-50 p-4">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle2 size={21} />
                  </div>

                  <div>

                    <p className="text-sm font-bold text-slate-700">
                      System Ready
                    </p>

                    <p className="text-xs text-slate-500">
                      Authorized personnel access
                    </p>

                  </div>

                </div>

              </div>


              {/* ORANGE ACCENT */}

              <div className="absolute -bottom-3 left-10 right-10 h-3 rounded-b-2xl bg-[#F28C00]" />

            </div>

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* FEATURES */}
      {/* ===================================================== */}

      <section
        id="features"
        className="bg-slate-50"
      >

        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8">

          {/* SECTION HEADING */}

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#F28C00]">
              Office Operations
            </p>

            <h2 className="mt-3 text-3xl font-bold text-[#0B4EA2] sm:text-4xl">
              One system for better service
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Designed to help municipal personnel manage
              office transactions, records, and operations
              through a centralized platform.
            </p>

          </div>


          {/* FEATURE CARDS */}

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            <FeatureCard
              icon={<ClipboardCheck size={22} />}
              title="Transaction Management"
              description="Manage and monitor office transactions through a centralized system."
            />

            <FeatureCard
              icon={<FileText size={22} />}
              title="Records Management"
              description="Organize important records and information for easier access and monitoring."
            />

            <FeatureCard
              icon={<Users size={22} />}
              title="User Management"
              description="Manage authorized personnel and control access to system functions."
            />

            <FeatureCard
              icon={<LockKeyhole size={22} />}
              title="Secure Access"
              description="Protect sensitive information through controlled and authenticated access."
            />

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* SYSTEM PURPOSE */}
      {/* ===================================================== */}

      <section className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* LEFT */}

            <div>

              <div className="mb-4 h-1 w-16 rounded-full bg-[#F28C00]" />

              <h2 className="text-3xl font-bold text-[#0B4EA2]">

                Serving the Municipality

                <span className="block">
                  through digital transformation
                </span>

              </h2>


              <p className="mt-6 leading-8 text-slate-600">

                The Office Management System provides municipal
                personnel with a centralized platform for managing
                daily office operations and transactions while
                supporting efficient, transparent, and accountable
                public service.

              </p>


              <div className="mt-7 space-y-4">

                <CheckItem>
                  Centralized office information
                </CheckItem>

                <CheckItem>
                  Secure access for authorized personnel
                </CheckItem>

                <CheckItem>
                  Efficient transaction processing
                </CheckItem>

                <CheckItem>
                  Better monitoring and accountability
                </CheckItem>

              </div>

            </div>


            {/* RIGHT */}

            <div className="rounded-3xl bg-[#0B4EA2] p-10 text-white shadow-xl">

              {/* LOGO */}

              <div className="flex items-center gap-5">

                <img
                  src="/logo2.png"
                  alt="Municipality of Taytay, Palawan"
                  className="h-20 w-20 object-contain"
                />

                <div>

                  <p className="text-sm font-medium text-blue-200">
                    Municipality of
                  </p>

                  <p className="text-2xl font-bold">
                    Taytay, Palawan
                  </p>

                </div>

              </div>


              <div className="mt-8 h-px bg-white/20" />


              {/* BAGONG TAYTAY LOGO */}

              <div className="mt-8 flex items-center gap-5">

                <img
                  src="/logo3.jpg"
                  alt="Bagong Taytay"
                  className="h-20 w-20 rounded-xl object-contain"
                />

                <div>

                  <p className="mt-2 text-sm leading-6 text-blue-100">
                    Efficient and accountable public service
                    through modern digital systems.
                  </p>

                </div>

              </div>


              <div className="mt-8 h-1 w-20 rounded-full bg-[#F28C00]" />

            </div>

          </div>

        </div>

      </section>


      {/* ===================================================== */}
      {/* FOOTER */}
      {/* ===================================================== */}

      <footer className="bg-[#082F63] text-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">

          {/* FOOTER BRANDING */}

          <div className="flex items-center gap-4">

            <img
              src="/logo.png"
              alt="Municipal Treasury"
              className="h-12 w-12 object-contain"
            />

            <div>

              <p className="font-semibold">
                Municipal Government of Taytay
              </p>

              <p className="text-sm text-blue-200">
                Treasury Management System
              </p>

            </div>

          </div>


          <div className="text-sm text-blue-200">
            Efficient • Secure • Accountable
          </div>

        </div>


        <div className="border-t border-white/10">

          <div className="mx-auto max-w-7xl px-6 py-4 text-center text-xs text-blue-300 sm:px-8">

            © {new Date().getFullYear()} Municipal Government of
            Taytay, Palawan. All rights reserved.

          </div>

        </div>

      </footer>


      {/* ===================================================== */}
      {/* SYSTEM SELECTION MODAL */}
      {/* ===================================================== */}

      {showSystemModal && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowSystemModal(false);
            }
          }}
        >

          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="border-b border-slate-200 bg-white px-6 py-5 sm:px-8">

              <button
                type="button"
                onClick={() => setShowSystemModal(false)}
                className="
                  absolute
                  right-4
                  top-4
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-700
                "
                aria-label="Close"
              >
                <X size={20} />
              </button>


              <div className="pr-10">

                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#F28C00]">
                  System Access
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#0B4EA2] sm:text-3xl">
                  Select a System
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Choose the system you want to access.
                </p>

              </div>

            </div>


            {/* SYSTEM OPTIONS */}

            <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">

              {/* ================================================= */}
              {/* TMS */}
              {/* ================================================= */}

              <Link
                href="/login"
                onClick={() => setShowSystemModal(false)}
                className="
                  group
                  rounded-2xl
                  border
                  border-blue-100
                  bg-white
                  p-6
                  text-left
                  shadow-sm
                  transition
                  hover:-translate-y-1
                  hover:border-blue-300
                  hover:shadow-lg
                "
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-[#0B4EA2] transition group-hover:bg-[#0B4EA2] group-hover:text-white">

                  <img
                    src="/logo.png"
                    alt="Treasury Management System"
                    className="h-10 w-10 object-contain"
                  />

                </div>


                <h3 className="mt-5 text-xl font-bold text-slate-800">
                  Treasury Management System
                </h3>


                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Access the municipal treasury system for
                  treasury transactions, collections, disbursements,
                  accountable forms, and other treasury operations.
                </p>


                <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0B4EA2]">

                  Login to TMS

                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />

                </div>

              </Link>


              {/* ================================================= */}
              {/* BARANGAY TMS */}
              {/* ================================================= */}

              <Link
                href="/barangay_login"
                onClick={() => setShowSystemModal(false)}
                className="
                  group
                  rounded-2xl
                  border
                  border-orange-100
                  bg-white
                  p-6
                  text-left
                  shadow-sm
                  transition
                  hover:-translate-y-1
                  hover:border-orange-300
                  hover:shadow-lg
                "
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-50 text-[#F28C00] transition group-hover:bg-[#F28C00] group-hover:text-white">

                  <img
                    src="/logo2.png"
                    alt="Barangay Treasury Management System"
                    className="h-10 w-10 object-contain"
                  />

                </div>


                <h3 className="mt-5 text-xl font-bold text-slate-800">
                  Barangay Treasury Management System
                </h3>


                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Access the barangay treasury system for
                  barangay-level treasury transactions, collections,
                  and related operations.
                </p>


                <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#F28C00]">

                  Login to Barangay TMS

                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />

                </div>

              </Link>

            </div>


            {/* MODAL FOOTER */}

            <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center sm:px-8">

              <p className="text-xs text-slate-500">
                Please select the appropriate system to continue.
              </p>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}


/* ========================================================= */
/* FEATURE CARD */
/* ========================================================= */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0B4EA2]">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-800">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}


/* ========================================================= */
/* CHECK ITEM */
/* ========================================================= */

function CheckItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">

        <CheckCircle2 size={17} />

      </div>

      <p className="text-sm font-medium text-slate-700">
        {children}
      </p>

    </div>
  );
}