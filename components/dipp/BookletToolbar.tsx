"use client";

import { BookOpen } from "lucide-react";
import { AssignedBooklet } from "@/lib/types/booklet";

type Props = {
    booklet: AssignedBooklet | null;
};

export default function BookletToolbar({
    booklet,
}: Props) {

    if (!booklet) return null;

    return (

        <div className="mb-6 rounded-xl border bg-white px-6 py-4 shadow-sm">

            <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                    <BookOpen
                        size={20}
                        className="text-blue-600"
                    />

                    <div>

                        <div className="text-lg font-semibold">

                            {booklet.control_no}

                        </div>

                        <div className="text-sm text-slate-500">

                            {booklet.form_name}

                        </div>

                    </div>

                </div>

                <div className="flex gap-8">

                    <div className="text-center">

                        <div className="text-xs uppercase text-slate-400">

                            Next OR

                        </div>

                        <div className="font-bold text-blue-700">

                            {(booklet.current_or + 1).toLocaleString()}

                        </div>

                    </div>

                    <div className="text-center">

                        <div className="text-xs uppercase text-slate-400">

                            Remaining

                        </div>

                        <div className="font-bold text-green-700">

                            {booklet.remaining}

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}