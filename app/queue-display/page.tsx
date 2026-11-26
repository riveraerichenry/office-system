
"use client";

import { useEffect, useState } from "react";
import { Maximize } from "lucide-react";

type QueueCall = {
  queue_number: number;
  collector_id?: string;
  collector_name: string;
  call_type: "NEXT" | "RECALL";
  window_number: number | null;
  called_at: string;
};

type QueueDisplayData = {
  latest?: QueueCall | null;
  latest_call?: QueueCall | null;
  current?: QueueCall | null;
  collectors?: any[];
  recent_calls?: QueueCall[];
  highest_number?: number;
  total_issued?: number;
};

export default function QueueDisplayPage() {
  const [data, setData] = useState<QueueDisplayData | null>(null);
  const [clock, setClock] = useState<Date | null>(null);

  // FETCH QUEUE DATA
  useEffect(() => {
    let mounted = true;

    const fetchDisplay = async () => {
      try {
        const res = await fetch("/api/queue/display", {
          cache: "no-store",
        });

        if (!res.ok) return;

        const json = await res.json();

        if (mounted) {
          setData(json);
        }
      } catch (error) {
        console.error("Queue display error:", error);
      }
    };

    fetchDisplay();

    const interval = setInterval(fetchDisplay, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // CLOCK
  useEffect(() => {
    setClock(new Date());

    const interval = setInterval(() => {
      setClock(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // FULLSCREEN
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  // FORMAT QUEUE NUMBER
  const formatQueue = (num?: number | null) =>
    num != null ? String(num).padStart(3, "0") : "---";

  // FORMAT TIME
  const formatTime = (date?: string | null) => {
    if (!date) return "--:--";

    return new Date(date).toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Manila",
    });
  };

  // FORMAT DAY
  const formatDay = (date?: string | null) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-PH", {
      weekday: "long",
      timeZone: "Asia/Manila",
    });
  };

  // FORMAT CLOCK
  const formatClock = (date: Date | null) => {
    if (!date) return "";

    return date.toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Manila",
    });
  };

  // SORT CALL EVENTS - NEWEST FIRST
  const sortedCalls = [...(data?.recent_calls ?? [])].sort(
    (a, b) =>
      new Date(b.called_at).getTime() -
      new Date(a.called_at).getTime()
  );

  // GLOBAL LATEST CALL
  const latestCall: QueueCall | null =
    data?.latest ??
    data?.latest_call ??
    data?.current ??
    sortedCalls[0] ??
    null;

  // THE 4 LATEST CALLS GLOBALLY
  const windowData = sortedCalls.slice(0, 4);

  return (
    <main className="h-dvh w-full overflow-hidden bg-white text-gray-900">
      <div className="flex h-full min-h-0 flex-col overflow-hidden p-2 sm:p-4 lg:p-6">

        {/* HEADER */}
        <header className="mb-2 flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 pb-2 sm:mb-4 sm:pb-4">

          {/* LEFT: LOGOS + TITLE */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">

            {/* LOGOS */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <img
                src="/logo.png"
                alt="Logo 1"
                className="h-7 w-auto object-contain sm:h-12 lg:h-14"
              />

              <img
                src="/logo2.png"
                alt="Logo 2"
                className="h-7 w-auto object-contain sm:h-12 lg:h-14"
              />

              <img
                src="/logo3.jpg"
                alt="Logo 3"
                className="h-7 w-auto object-contain sm:h-12 lg:h-14"
              />
            </div>

            {/* TITLE */}
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold tracking-tight sm:text-xl lg:text-3xl">
                Municipal Treasurer{" "}
                <span className="text-orange-500">
                  Office
                </span>
              </h1>

              <p className="truncate text-[9px] text-gray-500 sm:text-xs lg:text-sm">
                Municipal Treasurer&apos;s Office
              </p>
            </div>
          </div>

          {/* RIGHT: CLOCK + FULLSCREEN */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">

            {/* CLOCK */}
            <div className="text-right">
              <div className="text-xs font-bold tabular-nums sm:text-xl lg:text-2xl">
                {formatClock(clock)}
              </div>

              <div className="hidden text-xs text-gray-500 sm:block">
                Philippine Time
              </div>
            </div>

            {/* FULLSCREEN */}
            <button
              onClick={toggleFullscreen}
              className="rounded-lg border border-gray-200 bg-gray-50 p-1.5 transition hover:bg-gray-100 sm:rounded-xl sm:p-3"
              title="Toggle Fullscreen"
            >
              <Maximize className="h-4 w-4 sm:h-6 sm:w-6" />
            </button>
          </div>
        </header>

        {/* MAIN TWO-COLUMN LAYOUT */}
        <div className="grid min-h-0 flex-1 grid-cols-12 gap-2 sm:gap-4">

          {/* LEFT: 8 COLUMNS */}
          <section className="col-span-8 flex min-h-0 flex-col">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:rounded-3xl">

              {/* NOW SERVING HEADER */}
              <div className="flex shrink-0 items-center justify-center bg-orange-500 px-2 py-2 sm:py-4 lg:py-5">
                <h2 className="text-sm font-black tracking-widest text-white sm:text-xl lg:text-3xl">
                  NOW SERVING
                </h2>
              </div>

              {/* MAIN DISPLAY */}
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-2 py-2 sm:px-5 sm:py-5 lg:px-8 lg:py-8">

                {/* QUEUE NUMBER */}
                <div className="w-full text-center">
                  <div className="font-black leading-none tracking-tight text-orange-500 [font-size:clamp(3rem,15vw,20rem)]">
                    {formatQueue(latestCall?.queue_number)}
                  </div>
                </div>

                {/* GREEN ANNOUNCEMENT PANEL */}
                <div className="mt-2 w-full sm:mt-4 lg:mt-6">
                  <div className="rounded-xl bg-emerald-600 px-3 py-3 text-white sm:rounded-3xl sm:px-6 sm:py-6 lg:px-8 lg:py-8">

                    {/* ROW 1 */}
                    <div className="flex flex-wrap items-center justify-between gap-2">

                      <p className="text-xs font-black tracking-widest sm:text-lg lg:text-2xl">
                        PLEASE PROCEED TO
                      </p>

                      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
                        <span className="text-xs font-bold sm:text-lg lg:text-xl">
                          {latestCall
                            ? formatTime(latestCall.called_at)
                            : "--:--"}
                        </span>

                        <span className="text-xs font-bold sm:text-lg lg:text-xl">
                          {latestCall
                            ? formatDay(latestCall.called_at)
                            : ""}
                        </span>
                      </div>
                    </div>

                    {/* ROW 2 */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/20 pt-3 sm:mt-5 sm:pt-5">

                      {/* WINDOW */}
                      <div className="font-black leading-none [font-size:clamp(1.5rem,4vw,5rem)]">
                        {latestCall?.window_number
                          ? `WINDOW ${latestCall.window_number}`
                          : "---"}
                      </div>

                      {/* COLLECTOR */}
                      <div className="min-w-0 text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70 sm:text-sm">
                          Collector
                        </p>

                        <p className="max-w-full break-words text-sm font-bold sm:text-xl lg:text-3xl">
                          {latestCall?.collector_name ??
                            "Waiting for next call"}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* LEFT PANEL FOOTER */}
              <div className="flex shrink-0 items-center justify-center border-t border-gray-100 px-2 py-2 sm:py-4">
                <p className="text-center text-xs font-medium text-orange-500 sm:text-base lg:text-lg">
                  Please wait for the number to be called and proceed to assigned window.
                </p>
              </div>

            </div>
          </section>

          {/* RIGHT: 4 COLUMNS */}
          <section className="col-span-4 flex min-h-0 flex-col">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:rounded-3xl">

              {/* WINDOWS HEADER */}
              <div className="shrink-0 bg-gray-900 px-2 py-2 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
                <h2 className="text-center text-sm font-black tracking-widest text-white sm:text-xl lg:text-2xl">
                  WINDOWS
                </h2>

                <p className="mt-1 text-center text-[10px] text-gray-400 sm:text-sm">
                  Latest Calls
                </p>
              </div>

              {/* THE 4 LATEST CALLS - NO SCROLL */}
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-2 sm:p-3 lg:p-4">

                {windowData.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-center text-xs text-gray-400 sm:text-sm">
                      No active calls
                    </p>
                  </div>
                ) : (
                  <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-2 sm:gap-3">

                    {windowData.map((call, index) => {
                      const isLatest = index === 0;

                      return (
                        <div
                          key={`${call.queue_number}-${call.window_number}-${call.called_at}`}
                          className={`flex min-h-0 flex-col overflow-hidden rounded-xl border sm:rounded-2xl transition-all ${
                            isLatest
                              ? "border-emerald-500 bg-emerald-50 shadow-md"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >

                          {/* WINDOW LABEL */}
                          <div
                            className={`shrink-0 px-1 py-2 text-center sm:px-3 sm:py-3 ${
                              isLatest
                                ? "bg-emerald-600"
                                : "bg-gray-100"
                            }`}
                          >
                            <p
                              className={`text-[10px] font-bold tracking-widest sm:text-sm ${
                                isLatest
                                  ? "text-white"
                                  : "text-gray-600"
                              }`}
                            >
                              WINDOW {call.window_number ?? "---"}
                            </p>
                          </div>

                          {/* QUEUE NUMBER */}
                          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-1 py-1 text-center sm:px-3 sm:py-4">

                            <div
                              className={`font-black leading-none tabular-nums [font-size:clamp(1.5rem,5vw,5rem)] ${
                                isLatest
                                  ? "text-emerald-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {formatQueue(call.queue_number)}
                            </div>

                            {/* COLLECTOR */}
                            <p className="mt-1 w-full truncate text-[9px] font-medium text-gray-600 sm:text-xs lg:text-sm">
                              {call.collector_name}
                            </p>

                          </div>

                        </div>
                      );
                    })}

                  </div>
                )}

              </div>

            </div>
          </section>

        </div>

      </div>
    </main>
  );
}
