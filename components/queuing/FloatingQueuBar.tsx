
"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  RotateCcw,
  Minus,
  Plus,
  Grip,
  Loader2,
} from "lucide-react";

type CurrentQueue = {
  queue_number: number;
  formatted_number: string;
  called_at: string;
};

type Position = {
  x: number;
  y: number;
};

function formatQueueNumber(number: number) {
  return String(number).padStart(3, "0");
}

export default function FloatingQueueBar() {
  const [windowNumber, setWindowNumber] = useState("1");
  const [current, setCurrent] = useState<CurrentQueue | null>(null);
  const [loading, setLoading] = useState(false);

  // MINIMIZED BY DEFAULT
  const [minimized, setMinimized] = useState(true);

  const [position, setPosition] = useState<Position>({
    x: 16,
    y: 16,
  });

  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const floatingRef = useRef<HTMLDivElement>(null);

  /* =========================================================
     INITIAL POSITION: TOP-CENTER
  ========================================================= */

  useEffect(() => {
    const updatePosition = () => {
      const width =
        floatingRef.current?.offsetWidth ?? 320;

      setPosition({
        x: Math.max(
          8,
          (window.innerWidth - width) / 2
        ),
        y: 16,
      });
    };

    updatePosition();

    const frame = requestAnimationFrame(updatePosition);

    window.addEventListener("resize", updatePosition);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
    };
  }, [minimized]);

  /* =========================================================
     LOAD CURRENT QUEUE
     SEQUENTIAL POLLING
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const loadCurrent = async () => {
      try {
        const response = await fetch(
          "/api/queue/my-current",
          {
            cache: "no-store",
          }
        );

        if (!mounted) return;

        if (!response.ok) {
          console.warn(
            "Current queue request failed:",
            response.status
          );

          return;
        }

        const result = await response.json();

        if (!mounted) return;

        setCurrent(result.current ?? null);
      } catch (error) {
        if (mounted) {
          console.warn(
            "Load current queue error:",
            error
          );
        }
      } finally {
        if (mounted) {
          timer = setTimeout(
            loadCurrent,
            3000
          );
        }
      }
    };

    loadCurrent();

    return () => {
      mounted = false;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  /* =========================================================
     DRAG HANDLING
  ========================================================= */

  useEffect(() => {
    const handleMove = (
      e: MouseEvent | TouchEvent
    ) => {
      if (!dragRef.current) return;

      const point =
        e instanceof TouchEvent
          ? e.touches[0]
          : e;

      if (!point) return;

      const dx =
        point.clientX - dragRef.current.startX;

      const dy =
        point.clientY - dragRef.current.startY;

      const width =
        floatingRef.current?.offsetWidth ?? 320;

      const height =
        floatingRef.current?.offsetHeight ?? 100;

      const newX = Math.max(
        8,
        Math.min(
          window.innerWidth - width - 8,
          dragRef.current.initialX + dx
        )
      );

      const newY = Math.max(
        8,
        Math.min(
          window.innerHeight - height - 8,
          dragRef.current.initialY + dy
        )
      );

      setPosition({
        x: newX,
        y: newY,
      });

      if (e instanceof TouchEvent) {
        e.preventDefault();
      }
    };

    const handleEnd = () => {
      dragRef.current = null;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);

    window.addEventListener("touchmove", handleMove, {
      passive: false,
    });

    window.addEventListener("touchend", handleEnd);
    window.addEventListener("touchcancel", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
    };
  }, []);

  /* =========================================================
     START DRAG
  ========================================================= */

  const startDrag = (
    e: React.MouseEvent | React.TouchEvent
  ) => {
    const target = e.target as HTMLElement;

    if (target.closest("button, select")) {
      return;
    }

    const point =
      "touches" in e
        ? e.touches[0]
        : e;

    if (!point) return;

    dragRef.current = {
      startX: point.clientX,
      startY: point.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  /* =========================================================
     QUEUE ACTION
  ========================================================= */

  const handleQueue = async (
    action: "NEXT" | "RECALL"
  ) => {
    if (!windowNumber) {
      alert("Please select a window.");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        action === "NEXT"
          ? "/api/queue/next"
          : "/api/queue/recall",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            window_number: Number(windowNumber),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Queue operation failed."
        );

        return;
      }

      const queue = result.queue;

      if (queue) {
        setCurrent({
          queue_number: Number(queue.queue_number),

          formatted_number:
            queue.formatted_number ??
            formatQueueNumber(
              Number(queue.queue_number)
            ),

          called_at: queue.called_at,
        });
      }
    } catch (error) {
      console.error(
        "Queue operation error:",
        error
      );

      alert(
        "Unable to connect to queue server."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     MINIMIZED CONTROLLER
  ========================================================= */

  if (minimized) {
    return (
      <div
        ref={floatingRef}
        data-queue-floating
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          zIndex: 9999,
        }}
        className="flex max-w-[calc(100vw-16px)] items-center gap-1 rounded-2xl bg-emerald-700 p-2 shadow-2xl"
      >
        {/* DRAG HANDLE */}
        <div
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          className="cursor-move touch-none rounded-lg p-2 text-white/70 hover:bg-emerald-600 hover:text-white"
          title="Drag queue controller"
        >
          <Grip size={20} />
        </div>

        {/* CURRENT QUEUE / EXPAND */}
        <button
          onClick={() => setMinimized(false)}
          className="rounded-xl px-2 py-1 text-white transition hover:bg-emerald-600"
          title="Open Queue Controller"
        >
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
              Serving
            </p>

            <p className="text-3xl font-black leading-none tabular-nums">
              {current?.formatted_number ?? "---"}
            </p>

            <p className="mt-1 text-xs font-semibold">
              Window {windowNumber}
            </p>
          </div>
        </button>

        {/* NEXT BUTTON */}
        <button
          disabled={loading}
          onClick={() => handleQueue("NEXT")}
          className="flex min-w-[65px] flex-col items-center justify-center gap-1 rounded-xl bg-white px-3 py-3 font-black text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
          title="Call Next Queue"
        >
          {loading ? (
            <Loader2
              size={22}
              className="animate-spin"
            />
          ) : (
            <ArrowRight size={22} />
          )}

          <span className="text-xs">
            NEXT
          </span>
        </button>

        {/* EXPAND BUTTON */}
        <button
          onClick={() => setMinimized(false)}
          className="rounded-lg p-2 text-white transition hover:bg-emerald-600"
          title="Expand"
        >
          <Plus size={20} />
        </button>
      </div>
    );
  }

  /* =========================================================
     EXPANDED CONTROLLER
  ========================================================= */

  return (
    <div
      ref={floatingRef}
      data-queue-floating
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 9999,
      }}
      className="w-[320px] max-w-[calc(100vw-16px)] overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-2xl"
    >
      {/* HEADER / DRAG HANDLE */}
      <div
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        className="flex cursor-move touch-none items-center justify-between bg-emerald-700 px-4 py-3 text-white"
      >
        <div className="flex items-center gap-2">
          <Grip size={18} />

          <span className="font-bold">
            Queue Controller
          </span>
        </div>

        {/* MINIMIZE */}
        <button
          onClick={() => setMinimized(true)}
          className="rounded-lg p-1 hover:bg-emerald-600"
          title="Minimize"
        >
          <Minus size={18} />
        </button>
      </div>

      <div className="space-y-4 p-4">

        {/* WINDOW SELECT */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Your Window
          </label>

          <select
            value={windowNumber}
            onChange={(e) =>
              setWindowNumber(e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-bold text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            {Array.from(
              { length: 20 },
              (_, i) => i + 1
            ).map((n) => (
              <option
                key={n}
                value={String(n)}
              >
                Window {n}
              </option>
            ))}
          </select>
        </div>

        {/* CURRENT NUMBER */}
        <div className="rounded-xl bg-emerald-50 p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Your Latest Number
          </p>

          <div className="mt-2 text-6xl font-black tabular-nums text-emerald-700">
            {current?.formatted_number ?? "---"}
          </div>

          <p className="mt-2 text-sm font-semibold text-gray-500">
            Window {windowNumber}
          </p>
        </div>

        {/* BUTTONS */}
        <div className="grid grid-cols-2 gap-3">

          {/* NEXT */}
          <button
            disabled={loading}
            onClick={() => handleQueue("NEXT")}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-4 font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2
                className="animate-spin"
                size={18}
              />
            ) : (
              <ArrowRight size={18} />
            )}

            NEXT
          </button>

          {/* RECALL */}
          <button
            disabled={loading || !current}
            onClick={() => handleQueue("RECALL")}
            className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-4 font-black text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? (
              <Loader2
                className="animate-spin"
                size={18}
              />
            ) : (
              <RotateCcw size={18} />
            )}

            RECALL
          </button>

        </div>
      </div>
    </div>
  );
}
