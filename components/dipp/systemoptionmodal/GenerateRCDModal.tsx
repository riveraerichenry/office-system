"use client";


import { CalendarDays } from "lucide-react";
import {
    useEffect,
    useState,
} from "react";

import axios from "axios";

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function GenerateRCDModal({
    open,
    onClose,
}: Props) {

    const [dateTo, setDateTo] = useState(() => {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    const hours = String(
        now.getHours()
    ).padStart(2, "0");

    const minutes = String(
        now.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;

});

    const [fundSourceId, setFundSourceId] =
        useState("");

    const [fundSources, setFundSources] =
        useState<any[]>([]);



    useEffect(() => {

        if (!open) return;

        loadFundSources();

    }, [open]);

    async function loadFundSources() {

        try {

            const res =
                await axios.get(
                    "/api/fund-sources"
                );

            setFundSources(
                res.data.data ?? []
            );

        }

        catch (err) {

            console.error(err);

        }

    }

    if (!open) return null;

    return (

        <div
            className="
                fixed
                inset-0
                z-[70]
                flex
                items-center
                justify-center
                bg-black/50
                p-6
            "
        >

            <div
                className="
                    flex
                    w-full
                    max-w-4xl
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    bg-white
                    shadow-2xl
                "
            >

                {/* Header */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-b
                        bg-blue-900
                        px-6
                        py-4
                        text-white
                    "
                >

                    <div>

                        <h2 className="text-lg font-bold">
                            Generate RCD Report
                        </h2>

                        <p className="text-sm text-blue-100">
                            Generate Report of Collections and Deposits
                        </p>

                    </div>

                    <button
                        onClick={onClose}
                        className="
                            rounded-lg
                            px-3
                            py-1
                            text-xl
                            hover:bg-white/20
                        "
                    >
                        ×
                    </button>

                </div>

                {/* Body */}

                <div
                    className="
                        space-y-5
                        bg-slate-100
                        p-6
                    "
                >

                    <div
                        className="
                            rounded-xl
                            border
                            bg-white
                            p-6
                            shadow-sm
                        "
                    >

                        <h3
                            className="
                                mb-5
                                text-sm
                                font-semibold
                                uppercase
                                tracking-wide
                                text-slate-700
                            "
                        >
                            Report Parameters
                        </h3>

                        <div className="space-y-5">

                            {/* Fund Source */}

                            <div>

                                <label
                                    className="
                                        mb-1
                                        block
                                        text-sm
                                        font-medium
                                        text-slate-700
                                    "
                                >
                                    Fund Source
                                </label>

                                <select

                                    value={fundSourceId}

                                    onChange={(e) =>
                                        setFundSourceId(
                                            e.target.value
                                        )
                                    }

                                    className="
                                        w-full
                                        rounded-lg
                                        border
                                        border-slate-300
                                        bg-white
                                        px-3
                                        py-2
                                    "

                                >

                                    <option value="">
                                        -- Select Fund Source --
                                    </option>

                                    {

                                        fundSources.map(

                                            (x: any) => (

                                                <option
                                                    key={x.id}
                                                    value={x.id}
                                                >

                                                    {x.fund_code}
                                                    {" - "}
                                                    {x.fund_name}

                                                </option>

                                            )

                                        )

                                    }

                                </select>

                            </div>

                            {/* Report Period */}

                              <div
                                  className="
                                      grid
                                      grid-cols-1
                                      gap-5
                                  "
                              >

                                  <div>

                                      <label
                                          className="
                                              mb-2
                                              block
                                              text-sm
                                              font-medium
                                              text-slate-700
                                          "
                                      >
                                          Remittance Date
                                      </label>

                                      <div
                                          className="
                                              flex
                                              items-center
                                              justify-between
                                              rounded-lg
                                              border
                                              border-slate-300
                                              bg-white
                                              px-4
                                              py-3
                                          "
                                      >

                                          <div>

                                              <p
                                                  className="
                                                      text-xs
                                                      font-medium
                                                      uppercase
                                                      tracking-wide
                                                      text-slate-500
                                                  "
                                              >
                                                  Selected Date
                                              </p>

                                              <p className="text-lg font-semibold text-slate-800">

                                                  {

                                                      dateTo

                                                          ?

                                                          new Date(dateTo)

                                                              .toLocaleString(

                                                                  "en-PH",

                                                                  {

                                                                      weekday: "long",

                                                                      year: "numeric",

                                                                      month: "long",

                                                                      day: "numeric",

                                                                      hour: "numeric",

                                                                      minute: "2-digit",

                                                                      hour12: true,

                                                                  }

                                                              )

                                                          :

                                                          "-"

                                                  }

                                              </p>

                                          </div>

                                          <div className="relative">

                                              <input
                                                  type="datetime-local"
                                                  value={dateTo}
                                                  onChange={(e) =>
                                                      setDateTo(e.target.value)
                                                  }
                                                  className="absolute inset-0 cursor-pointer opacity-0"
                                              />

                                              <button
                                                  type="button"
                                                  className="rounded-lg border border-slate-300 bg-white p-2 hover:bg-slate-100"
                                              >
                                                  <CalendarDays size={18} />
                                              </button>

                                          </div>

                                      </div>

                                  </div>

                              </div>

                        </div>

                    </div>

                </div>

                {/* Footer */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-t
                        bg-white
                        px-6
                        py-4
                    "
                >

                    <button
                        onClick={onClose}
                        className="
                            rounded-xl
                            border
                            border-slate-300
                            bg-white
                            px-8
                            py-3
                            font-medium
                            text-slate-700
                            transition
                            hover:bg-slate-50
                        "
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => {

                            console.log({

                                fundSourceId,


                                dateTo,

                            });

                        }}
                        className="
                            rounded-xl
                            bg-blue-600
                            px-8
                            py-3
                            font-semibold
                            text-white
                            transition
                            hover:bg-blue-700
                        "
                    >
                        Generate RCD
                    </button>

                </div>

            </div>

        </div>

    );

}