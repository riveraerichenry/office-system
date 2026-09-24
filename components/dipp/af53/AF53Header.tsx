"use client";

import { X } from "lucide-react";
import BookletHeader from "../general/BookletHeader";

type Props = {
    booklet: any;
    saving: boolean;
    onClose: () => void;
};

export default function AF53Header({
    booklet,
    saving,
    onClose,
}: Props) {
    return (
        <div className="relative shrink-0">

            <BookletHeader
                booklet={booklet}
            />

            <button
                type="button"
                disabled={saving}
                onClick={onClose}
                aria-label="Close AF53"
                className="
                    absolute
                    right-5
                    top-5
                    rounded-lg
                    p-2
                    text-slate-500
                    transition
                    hover:bg-slate-100
                    hover:text-slate-800
                    disabled:opacity-50
                "
            >
                <X size={22} />
            </button>

        </div>
    );
}
