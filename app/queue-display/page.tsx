
"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize, Volume2, VolumeX } from "lucide-react";

type QueueCall = {
  id?: number;
  queue_number: number;
  formatted_number?: string;
  collector_id?: string;
  collector_name: string;
  window_number: number;
  call_type?: "NEXT" | "RECALL";
  called_at: string;
};

type QueueDisplayData = {
  latest?: QueueCall | null;
  latest_call?: QueueCall | null;
  current?: QueueCall | null;
  recent_calls?: QueueCall[];
  total_today?: number;
};

type AudioContextConstructor = typeof AudioContext;

declare global {
  interface Window {
    webkitAudioContext?: AudioContextConstructor;
  }
}

/* =========================================================
   HELPERS
========================================================= */

function formatQueueNumber(number: number) {
  return String(number).padStart(3, "0");
}

function getCallKey(call: QueueCall) {
  return `${call.queue_number}-${call.called_at}-${call.window_number}`;
}

/* =========================================================
   DING-DONG CHIME
========================================================= */

function playDingDong(audioContext: AudioContext) {
  if (audioContext.state !== "running") return;

  const playTone = (
    frequency: number,
    startTime: number,
    duration: number,
    volume = 0.5
  ) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
      frequency,
      startTime
    );

    gain.gain.setValueAtTime(0.001, startTime);

    gain.gain.linearRampToValueAtTime(
      volume,
      startTime + 0.05
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      startTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  const now = audioContext.currentTime;

  // DING - two harmonics
  playTone(880, now, 0.5, 0.5);
  playTone(1320, now, 0.4, 0.25);

  // DONG - lower two harmonics
  playTone(659.25, now + 0.55, 0.65, 0.5);
  playTone(987.75, now + 0.55, 0.5, 0.25);
}

/* =========================================================
   VOICE ANNOUNCEMENT
========================================================= */

function announceQueue(
  call: QueueCall,
  audioContext: AudioContext
) {
  if (!("speechSynthesis" in window)) return;

  // Stop any previous voice
  window.speechSynthesis.cancel();

  // Play chime
  playDingDong(audioContext);

  const queueNumber = formatQueueNumber(
    call.queue_number
  )
    .split("")
    .join(" ");

  const announcement = new SpeechSynthesisUtterance(
    `Queue number ${queueNumber}. Please proceed to window ${call.window_number}.`
  );

  announcement.lang = "en-US";
  announcement.rate = 0.85;
  announcement.pitch = 1;
  announcement.volume = 1;

  // Speak after the chime
  setTimeout(() => {
    window.speechSynthesis.speak(announcement);
  }, 1400);
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function QueueDisplayPage() {
  const [data, setData] = useState<QueueDisplayData | null>(null);

  // IMPORTANT:
  // Initialize clock values as empty strings to prevent
  // server/client hydration mismatch.
  const [timeString, setTimeString] = useState("");
  const [dateString, setDateString] = useState("");

  const [audioEnabled, setAudioEnabled] = useState(false);

  const lastAnnouncedCallRef = useRef<string | null>(null);
  const initializedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  /* =========================================================
     CLOCK
  ========================================================= */

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      setTimeString(
        now.toLocaleTimeString("en-PH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );

      setDateString(
        now.toLocaleDateString("en-PH", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      );
    };

    // Initial update after hydration
    updateClock();

    const timer = setInterval(updateClock, 1000);

    return () => clearInterval(timer);
  }, []);

  /* =========================================================
     QUEUE POLLING
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const fetchQueue = async () => {
      try {
        const response = await fetch(
          "/api/queue/display",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const result: QueueDisplayData =
          await response.json();

        if (!mounted) return;

        const calls = [
          ...(result.recent_calls ?? []),
        ].sort(
          (a, b) =>
            new Date(b.called_at).getTime() -
            new Date(a.called_at).getTime()
        );

        const latestCall =
          result.latest ??
          result.latest_call ??
          result.current ??
          calls[0] ??
          null;

        setData({
          ...result,
          recent_calls: calls,
          latest: latestCall,
        });

        /* =================================================
           NEW CALL DETECTION
        ================================================= */

        if (latestCall) {
          const callKey = getCallKey(latestCall);

          // Initial load: don't announce old calls
          if (!initializedRef.current) {
            lastAnnouncedCallRef.current = callKey;
            initializedRef.current = true;
          } else if (
            lastAnnouncedCallRef.current !== callKey
          ) {
            lastAnnouncedCallRef.current = callKey;

            if (
              audioEnabled &&
              audioContextRef.current
            ) {
              announceQueue(
                latestCall,
                audioContextRef.current
              );
            }
          }
        }
      } catch (error) {
        console.error(
          "Queue display fetch error:",
          error
        );
      }
    };

    fetchQueue();

    const interval = setInterval(
      fetchQueue,
      3000
    );

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [audioEnabled]);

  /* =========================================================
     CALL HISTORY
  ========================================================= */

  const sortedCalls = [
    ...(data?.recent_calls ?? []),
  ].sort(
    (a, b) =>
      new Date(b.called_at).getTime() -
      new Date(a.called_at).getTime()
  );

  const latestCall =
    data?.latest ??
    data?.latest_call ??
    data?.current ??
    sortedCalls[0] ??
    null;

  // Latest 4 call events globally
  const latestFourCalls = sortedCalls.slice(0, 4);

  /* =========================================================
     FULLSCREEN
  ========================================================= */

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

  /* =========================================================
     ENABLE AUDIO
  ========================================================= */

  const enableAudio = async () => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          window.webkitAudioContext;

        if (!AudioContextClass) {
          alert(
            "Web Audio is not supported by this browser."
          );

          return;
        }

        audioContextRef.current =
          new AudioContextClass();
      }

      const audioContext = audioContextRef.current;

      // Unlock audio
      if (audioContext.state !== "running") {
        await audioContext.resume();
      }

      if (audioContext.state !== "running") {
        alert("Unable to activate audio.");
        return;
      }

      // TEST DING-DONG
      playDingDong(audioContext);

      // TEST VOICE
      const testSpeech =
        new SpeechSynthesisUtterance(
          "Queue announcement system ready."
        );

      testSpeech.lang = "en-US";
      testSpeech.rate = 0.9;
      testSpeech.pitch = 1;
      testSpeech.volume = 1;

      setTimeout(() => {
        window.speechSynthesis.speak(testSpeech);
      }, 1400);

      setAudioEnabled(true);
    } catch (error) {
      console.error(
        "Audio activation error:",
        error
      );

      alert("Unable to activate audio.");
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="h-dvh w-full overflow-hidden bg-white text-gray-900">
      <div className="flex h-full min-h-0 flex-col p-3 md:p-5">

        {/* HEADER */}
        <header className="mb-3 flex shrink-0 items-center justify-between gap-3 border-b-4 border-orange-500 pb-3 md:mb-5 md:pb-4">

          {/* LOGOS */}
          <div className="flex shrink-0 items-center gap-2 md:gap-4">
            <img
              src="/logo.png"
              alt="Logo 1"
              className="h-10 w-10 object-contain md:h-16 md:w-16"
            />

            <img
              src="/logo2.png"
              alt="Logo 2"
              className="h-10 w-10 object-contain md:h-16 md:w-16"
            />

            <img
              src="/logo3.jpg"
              alt="Logo 3"
              className="h-10 w-10 object-contain md:h-16 md:w-16"
            />
          </div>

          {/* TIME + DATE */}
          <div className="min-w-0 flex-1 text-center">

            {/* TIME */}
            <p className="mt-1 text-sm font-bold text-slate-700 md:text-5xl">
              {timeString}
            </p>

            {/* DATE / DAY */}
            <p className="text-xs font-semibold text-slate-500 md:text-3xl">
              {dateString}
            </p>
          </div>

          {/* CONTROLS */}
          <div className="flex shrink-0 items-center gap-2">

            {/* VOICE */}
            <button
              onClick={enableAudio}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition md:px-4 ${
                audioEnabled
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-orange-100 text-orange-700"
              }`}
              title="Enable Voice Announcement"
            >
              {audioEnabled ? (
                <Volume2 size={20} />
              ) : (
                <VolumeX size={20} />
              )}

              <span className="hidden md:inline">
                {audioEnabled
                  ? "VOICE ON"
                  : ""}
              </span>
            </button>

            {/* FULLSCREEN */}
            <button
              onClick={toggleFullscreen}
              className="rounded-xl bg-gray-100 p-3 transition hover:bg-gray-200"
              title="Fullscreen"
            >
              <Maximize size={20} />
            </button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-12 lg:gap-5">

          {/* LEFT PANEL */}
          <section className="flex min-h-0 flex-col overflow-hidden lg:col-span-8">

            {/* NOW SERVING */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border-2 border-emerald-100 bg-white shadow-sm">

              {/* TITLE */}
              <div className="shrink-0 bg-emerald-700 px-4 py-3 text-center md:px-8 md:py-5">
                <h2 className="text-2xl font-black uppercase tracking-widest text-white md:text-5xl">
                  NOW SERVING
                </h2>
              </div>

              {/* NUMBER */}
              <div className="flex min-h-0 flex-1 items-center justify-center bg-white px-3 py-4">
                <div className="text-center">
                  <div className="font-black leading-none tracking-tight text-orange-500 [font-variant-numeric:tabular-nums] text-[clamp(5rem,18vw,18rem)]">
                    {latestCall
                      ? formatQueueNumber(
                          latestCall.queue_number
                        )
                      : "---"}
                  </div>

                  <p className="mt-2 text-lg font-bold uppercase tracking-widest text-gray-400 md:mt-4 md:text-3xl">
                    Queue Number
                  </p>
                </div>
              </div>

              {/* PROCEED PANEL */}
              <div className="shrink-0 bg-emerald-700 px-4 py-4 text-white md:px-8 md:py-8">

                <div className="flex flex-col items-center justify-center gap-3 text-center md:flex-row md:justify-between md:gap-6">

                  <div className="flex w-full flex-col items-center justify-center text-center">

                    {/* WINDOW */}
                    <p className="text-2xl font-black uppercase md:text-5xl">
                      {latestCall
                        ? `WINDOW ${latestCall.window_number}`
                        : "---"}
                    </p>

                  </div>
                </div>

                {/* COLLECTOR */}
                <div className="min-w-0 flex-1 text-center">
                  <p className="truncate text-lg font-bold md:text-6xl">
                    {latestCall?.collector_name
                      ?.split(" ")[0]
                      .toUpperCase() ?? "---"}
                  </p>
                </div>
              </div>
            </div>

            {/* INSTRUCTION */}
            <div className="mt-3 shrink-0 rounded-2xl bg-orange-500 px-4 py-3 text-center md:mt-5 md:px-8 md:py-5">
              <p className="text-sm font-black uppercase tracking-wide text-white md:text-2xl">
                Please wait for the number to be called and proceed to your assigned window.
              </p>
            </div>
          </section>

          {/* RIGHT PANEL */}
          <section className="flex min-h-0 flex-col overflow-hidden lg:col-span-4">

            {/* TITLE */}
            <div className="mb-3 shrink-0 rounded-2xl bg-orange-500 px-3 py-3 text-center md:mb-4 md:py-4">
              <h2 className="text-xl font-black uppercase tracking-wider text-white md:text-3xl">
                Latest Calls
              </h2>
            </div>

            {/* FOUR LATEST CALLS */}
            <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2 overflow-hidden md:gap-4">

              {latestFourCalls.map((call, index) => {
                const isLatest = index === 0;

                return (
                  <div
                    key={getCallKey(call)}
                    className={`flex min-h-0 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 p-2 text-center md:rounded-3xl md:p-4 ${
                      isLatest
                        ? "border-emerald-500 bg-emerald-700 text-white shadow-lg"
                        : "border-gray-200 bg-gray-50 text-gray-800"
                    }`}
                  >
                    <p
                      className={`text-xs font-black uppercase tracking-widest md:text-xl ${
                        isLatest
                          ? "text-emerald-100"
                          : "text-gray-400"
                      }`}
                    >
                      WINDOW {call.window_number}
                    </p>

                    <div className="my-1 font-black leading-none tracking-tight [font-variant-numeric:tabular-nums] text-[clamp(2.5rem,7vw,6rem)]">
                      {formatQueueNumber(
                        call.queue_number
                      )}
                    </div>

                    <p
                      className={`max-w-full truncate text-sm font-black md:text-4xl ${
                        isLatest
                          ? "text-emerald-100"
                          : "text-gray-500"
                      }`}
                    >
                      {call.collector_name
                        .split(" ")[0]
                        .toUpperCase()}
                    </p>
                  </div>
                );
              })}

              {/* EMPTY CARDS */}
              {Array.from(
                {
                  length: Math.max(
                    0,
                    4 - latestFourCalls.length
                  ),
                },
                (_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="flex min-h-0 items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 md:rounded-3xl"
                  >
                    <p className="text-3xl font-black text-gray-200 md:text-6xl">
                      ---
                    </p>
                  </div>
                )
              )}
            </div>
          </section>
        </div>

        {/* FOOTER - OPTIONAL */}
        {/*
        <footer className="mt-2 flex shrink-0 items-center justify-center gap-2 text-xs font-semibold md:mt-3 md:text-sm">
          {audioEnabled ? (
            <>
              <Volume2
                size={16}
                className="text-emerald-600"
              />

              <span className="text-emerald-700">
                Voice announcements enabled
              </span>
            </>
          ) : (
            <>
              <VolumeX
                size={16}
                className="text-orange-500"
              />

              <span className="text-orange-600">
                Click ENABLE VOICE to activate announcements
              </span>
            </>
          )}
        </footer>
        */}
      </div>
    </main>
  );
}
