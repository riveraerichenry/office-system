"use client";

import { User, Lock, Eye, EyeOff } from "lucide-react";
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
    <div className="min-h-screen bg-[#f6f6f6] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-xl px-10 py-14">
        {/* Title */}
        <h1
          className="text-5xl font-extrabold text-center mb-12"
          style={{
            textShadow: "2px 2px 0 rgba(0,0,0,0.2)",
          }}
        >
          Login
        </h1>

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
            <Form className="space-y-7">
              {/* Username */}
              <div>
                <label className="text-sm text-gray-700 block mb-2">
                  Username
                </label>

                <div className="flex items-center gap-3 border-b border-gray-300 pb-3">
                  <User size={18} className="text-gray-400" />

                  <Field
                    name="username"
                    placeholder="Type your username"
                    className="w-full outline-none placeholder:text-gray-400"
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
                <label className="text-sm text-gray-700 block mb-2">
                  Password
                </label>

                <div className="flex items-center gap-3 border-b border-gray-300 pb-3">
                  <Lock size={18} className="text-gray-400" />

                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Type your password"
                    className="w-full outline-none placeholder:text-gray-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
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
                  className="text-sm text-gray-500 hover:text-gray-700"
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
                className="w-full py-4 rounded-full text-white font-bold tracking-wide
                bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-500
                shadow-lg hover:scale-[1.02] transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "LOGGING IN..." : "LOGIN"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}