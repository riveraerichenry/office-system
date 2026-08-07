"use client";

import { Formik, Form, Field } from "formik";
import axios from "axios";

export default function ModulePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">
        Add Module
      </h1>

      <Formik
        initialValues={{
          module_name: "",
          icon: "",
          path: "",
          description: "",
        }}
        onSubmit={async (values) => {
          await axios.post("/api/modules", values);
        }}
      >
        <Form className="space-y-4 bg-white p-6 rounded-3xl shadow">
          <Field
            name="module_name"
            placeholder="Module Name"
            className="w-full border p-3 rounded-xl"
          />

          <Field
            name="icon"
            placeholder="Icon Name"
            className="w-full border p-3 rounded-xl"
          />

          <Field
            name="path"
            placeholder="/dashboard/users"
            className="w-full border p-3 rounded-xl"
          />

          <Field
            name="description"
            placeholder="Description"
            className="w-full border p-3 rounded-xl"
          />

          <button className="px-6 py-3 rounded-xl bg-blue-600 text-white">
            Save Module
          </button>
        </Form>
      </Formik>
    </div>
  );
}