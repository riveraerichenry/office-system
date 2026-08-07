"use client";

export default function OfficerDetails({
  selected,
}: {
  selected: any;
}) {
  if (!selected) {
    return (
      <div className="rounded-[40px] bg-white shadow-xl px-10 py-14">
        No user selected
      </div>
    );
  }

  return (
    <div className="rounded-[40px] bg-white shadow-xl px-10 py-12">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-4xl font-extrabold">
          Officer Details
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Field
          label="First Name"
          value={
            selected.first_name
          }
        />

        <Field
          label="Middle Name"
          value={
            selected.middle_name
          }
        />

        <Field
          label="Last Name"
          value={
            selected.last_name
          }
        />

        <Field
          label="Suffix"
          value={
            selected.suffix
          }
        />

        <Field
          label="Position"
          value={
            selected.position
          }
        />

        <Field
          label="Office"
          value={
            selected.office
          }
        />

        <Field
          label="Designation"
          value={
            selected.designation
          }
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div>
      <label className="text-sm text-gray-700 block mb-2">
        {label}
      </label>

      <div className="border-b border-gray-300 pb-3 font-medium">
        {value || "-"}
      </div>
    </div>
  );
}