import { Search } from "lucide-react";

type Props = {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export default function SearchBox({
  value,
  placeholder = "Search...",
  onChange,
}: Props) {
  return (
    <div className="relative">

      <Search
        size={18}
        className="absolute left-3 top-3 text-gray-400"
      />

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 py-2 pl-10 pr-4 transition focus:border-blue-500 focus:outline-none"
      />

    </div>
  );
}