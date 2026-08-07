"use client";

import { BookOpen, CheckCircle2, Circle } from "lucide-react";
import { AssignedBooklet } from "@/lib/types/booklet";

type Props = {
    booklets: AssignedBooklet[];
    selected: AssignedBooklet | null;
    onSelect: (booklet: AssignedBooklet) => void;
};

export default function AssignedBooklets({
    booklets,
    selected,
    onSelect,
}: Props) {
    return (
        <div
            className="
                fixed
                top-24
                right-6
                w-[360px]
                max-h-[80vh]
                overflow-hidden
            "
        >
            <div className="rounded-xl border bg-white shadow-lg">

                {/* Header */}

                <div className="border-b px-4 py-3">

                    <div className="flex items-center gap-2">

                        <BookOpen
                            size={18}
                            className="text-blue-600"
                        />

                        <h2 className="font-semibold text-slate-800">
                            Available Booklets
                        </h2>

                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                        Select the booklet to use.
                    </p>

                </div>

                {/* List */}

                <div className="max-h-[65vh] overflow-y-auto">

                    {booklets.length === 0 && (

                        <div className="p-8 text-center text-sm text-slate-500">

                            No assigned booklets.

                        </div>

                    )}

                    {booklets.map((booklet) => {

                        const active =
                            selected?.lor_item_id ===
                            booklet.lor_item_id;

                        return (

                            <button
                                key={booklet.lor_item_id}
                                onClick={() => onSelect(booklet)}
                                className={`
                                    flex
                                    w-full
                                    items-center
                                    justify-between
                                    border-b
                                    px-4
                                    py-3
                                    text-sm
                                    transition

                                    ${
                                        active
                                            ? "bg-blue-50"
                                            : "hover:bg-slate-50"
                                    }
                                `}
                            >

                                {/* Left */}

                                <div className="flex items-center gap-3">

                                    {active ? (

                                        <CheckCircle2
                                            size={18}
                                            className="text-blue-600"
                                        />

                                    ) : (

                                        <Circle
                                            size={18}
                                            className="text-slate-400"
                                        />

                                    )}

                                    <span
                                        className={`
                                            font-medium

                                            ${
                                                active
                                                    ? "text-blue-700"
                                                    : "text-slate-800"
                                            }
                                        `}
                                    >
                                        {booklet.form_code}
                                    </span>

                                </div>

                                {/* Right */}

                                <div className="flex items-center gap-6 text-xs">

                                    <span className="text-slate-500">

                                        {booklet.remaining} left

                                    </span>

                                    <span
                                        className={`
                                            font-semibold

                                            ${
                                                active
                                                    ? "text-blue-700"
                                                    : "text-slate-700"
                                            }
                                        `}
                                    >

                                        OR {(booklet.current_or + 1).toLocaleString()}

                                    </span>

                                </div>

                            </button>

                        );

                    })}

                </div>

            </div>

        </div>
    );
}