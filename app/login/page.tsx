"use client";

import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useRouter } from "next/navigation";

const LoginSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Back to Home */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#F28C00] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">

          {/* Header */}
          <div className="bg-[#F28C00] px-6 py-7 text-center">

            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md p-2">
                <img
                  src="/logo2.png"
                  alt="Municipality of Taytay"
                  className="w-16 h-16 object-contain"
                />
              </div>
            </div>

            {/* System Title */}
            <h1 className="text-2xl font-bold text-white">
              Treasury Management
            </h1>

            <p className="text-orange-100 mt-1 text-sm">
              System
            </p>

            <p className="text-orange-50 text-xs mt-3">
              Municipality of Taytay, Palawan
            </p>
          </div>

          {/* Form */}
          <div className="px-6 py-7">

            {/* Sign In */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-800">
                Sign In
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Enter your account credentials.
              </p>
            </div>

            <Formik
              initialValues={{
                username: "",
                password: "",
              }}
              validationSchema={LoginSchema}
              onSubmit={async (
                values,
                { setSubmitting, setStatus }
              ) => {
                try {
                  setStatus("");

                  const res = await axios.post(
                    "/api/auth/login",
                    values,
                    {
                      withCredentials: true,
                    }
                  );

                  if (res.data.success) {
                    router.replace(res.data.redirectTo);
                  }
                } catch (error: any) {
                  setStatus(
                    error?.response?.data?.message ||
                      "Invalid username or password"
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, status }) => (
                <Form className="space-y-5">

                  {/* Username */}
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Username
                    </label>

                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                      <Field
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Enter username"
                        autoComplete="username"
                        disabled={isSubmitting}
                        className="
                          w-full
                          h-12
                          pl-11
                          pr-4
                          rounded-lg
                          border
                          border-slate-300
                          bg-white
                          text-slate-800
                          placeholder:text-slate-400
                          outline-none
                          transition
                          focus:border-[#F28C00]
                          focus:ring-2
                          focus:ring-orange-100
                          disabled:bg-slate-100
                        "
                      />
                    </div>

                    <ErrorMessage
                      name="username"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                      <Field
                        id="password"
                        name="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Enter password"
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        className="
                          w-full
                          h-12
                          pl-11
                          pr-12
                          rounded-lg
                          border
                          border-slate-300
                          bg-white
                          text-slate-800
                          placeholder:text-slate-400
                          outline-none
                          transition
                          focus:border-[#F28C00]
                          focus:ring-2
                          focus:ring-orange-100
                          disabled:bg-slate-100
                        "
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        disabled={isSubmitting}
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          text-slate-400
                          hover:text-[#F28C00]
                          transition
                        "
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Forgot Password */}
                  <div className="text-right">
                    <button
                      type="button"
                      className="
                        text-sm
                        text-slate-500
                        hover:text-[#F28C00]
                        transition
                      "
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Login Error */}
                  {status && (
                    <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
                      {status}
                    </div>
                  )}

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                      w-full
                      h-12
                      rounded-lg
                      bg-[#F28C00]
                      hover:bg-[#E98200]
                      text-white
                      font-semibold
                      flex
                      items-center
                      justify-center
                      gap-2
                      transition
                      disabled:opacity-60
                      disabled:cursor-not-allowed
                      shadow-sm
                    "
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        Sign In
                      </>
                    )}
                  </button>

                </Form>
              )}
            </Formik>

            {/* System Information */}
            <div className="mt-7 pt-5 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-500">
                Authorized Personnel Only
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Municipality of Taytay, Palawan
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-5">
          © {new Date().getFullYear()} Municipality of Taytay,
          Palawan
        </p>

      </div>
    </main>
  );
}