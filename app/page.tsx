"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Eye,
  Flame,
  LockKeyhole,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Slot = {
  id: number;
  available_date: string;
  available_time: string;
  status: string;
};

function labelFor(i: number) {
  return i === 0 ? "Hot" : i === 1 ? "Warm" : "Chill";
}

export default function Home() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selected, setSelected] = useState<Slot | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");

  async function load() {
    const r = await fetch("/api/slots");
    const j = await r.json();

    if (r.ok) {
      setSlots(j.slots);

      if (j.slots[0] && !selectedDate) {
        setSelectedDate(j.slots[0].available_date);
      }
    } else {
      setError(j.error || "Could not load slots.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const dates = useMemo(
    () => Array.from(new Set(slots.map((s) => s.available_date))),
    [slots]
  );

  const daySlots = slots.filter(
    (s) => s.available_date === selectedDate
  );

  async function reserve() {
    if (!selected) return;

    if (!firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }

    setBooking(true);
    setError("");

    const r = await fetch("/api/reserve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slotId: selected.id,
        firstName: firstName.trim(),
      }),
    });

    const j = await r.json();

    if (!r.ok) {
      setError(j.error || "Could not reserve this slot.");
      await load();
    } else {
      setConfirmed(true);
    }

    setBooking(false);
  }

  if (confirmed) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <section className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[.04] p-8 text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-pink-500">
            <Sparkles />
          </div>

          <p className="text-xs font-bold uppercase tracking-[.3em] text-white/40">
            Second Round With JD
          </p>

          <h1 className="mt-2 text-4xl font-black">
            IT&apos;S OFFICIAL.
          </h1>

          <p className="mt-3 text-white/60">
            Your reservation has been secured.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 p-4 font-bold">
            {new Date(
              selected!.available_date + "T12:00:00"
            ).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            · {selected!.available_time}
          </div>

          <p className="mt-4 text-sm text-white/40">
            See you soon, {firstName.trim()} 😉
          </p>

          <button
            onClick={() => {
              setConfirmed(false);
              setSelected(null);
              setFirstName("");
              load();
            }}
            className="mt-6 rounded-full bg-white px-6 py-3 font-black text-black"
          >
            Back to calendar
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-7 sm:px-6">
      <div className="mx-auto max-w-5xl">

        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/icon.svg"
              className="h-14 w-14 rounded-2xl"
              alt="Second Round"
            />

            <div>
              <p className="text-2xl font-black">
                Second Round With JD
              </p>

              <p className="text-sm text-white/55">
                You pick the time. I&apos;ll make it unforgettable. 💖
              </p>
            </div>
          </div>

          <a
            href="/admin"
            className="rounded-full border border-pink-400/50 px-4 py-2 text-sm font-bold text-pink-300"
          >
            Admin
          </a>
        </header>

        <section className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#151022] to-[#0e0a18] p-5 shadow-2xl sm:p-9">

          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-pink-300">
              <Sparkles size={18} />

              <span className="font-bold">
                CONGRATULATIONS
              </span>

              <Sparkles size={18} />
            </div>

            <p className="mt-2 text-2xl font-black sm:text-3xl">
              YOU MADE IT TO THE SECOND ROUND.
            </p>
          </div>

          <div className="my-7 h-px bg-white/10" />

          <h2 className="mb-4 text-xl font-black">
            <span className="mr-3 inline-grid h-9 w-9 place-items-center rounded-full bg-pink-500 text-sm">
              1
            </span>
            Choose a date
          </h2>

          {dates.length === 0 ? (
            <p className="rounded-2xl border border-white/10 p-6 text-white/50">
              No availability yet. Check back soon. 👀
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {dates.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setSelectedDate(d);
                    setSelected(null);
                  }}
                  className={`rounded-2xl border p-4 text-center ${
                    selectedDate === d
                      ? "border-pink-400 bg-pink-500/10"
                      : "border-white/10 bg-white/[.03]"
                  }`}
                >
                  <div className="text-sm text-white/50">
                    {new Date(
                      d + "T12:00:00"
                    ).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </div>

                  <div className="text-3xl font-black">
                    {new Date(
                      d + "T12:00:00"
                    ).getDate()}
                  </div>

                  <div className="text-sm text-white/50">
                    {new Date(
                      d + "T12:00:00"
                    ).toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="my-8 h-px bg-white/10" />

          <h2 className="mb-3 text-xl font-black">
            <span className="mr-3 inline-grid h-9 w-9 place-items-center rounded-full bg-pink-500 text-sm">
              2
            </span>
            Choose a time slot
          </h2>

          <p className="mb-4 text-sm text-white/60">
            <Eye
              size={16}
              className="mr-2 inline text-purple-300"
            />
            People are watching this slot 👀
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {daySlots.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={`rounded-2xl border p-5 text-left ${
                  selected?.id === s.id
                    ? "border-pink-400 bg-pink-500/10"
                    : "border-white/10 bg-white/[.03]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black">
                    {s.available_time}
                  </span>

                  <span className="text-sm">
                    {i === 0 ? (
                      <Flame className="text-orange-400" />
                    ) : (
                      <Sparkles className="text-purple-300" />
                    )}
                  </span>
                </div>

                <div className="mt-2 text-sm text-pink-300">
                  <Eye size={14} className="mr-1 inline" />
                  {Math.max(
                    1,
                    Math.floor(2 + (s.id % 11))
                  )}{" "}
                  people watching
                </div>

                <div className="mt-2 text-xs font-bold uppercase tracking-widest text-white/35">
                  {labelFor(i)}
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <div className="mt-7 rounded-3xl border border-white/10 bg-white/[.04] p-5">

              {/* FIRST NAME */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-bold text-white/70">
                  Your first name
                </label>

                <input
                  type="text"
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(e.target.value)
                  }
                  placeholder="First name"
                  maxLength={40}
                  autoComplete="given-name"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-pink-400"
                />
              </div>

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-xl text-white/30 line-through">
                      $75
                    </span>

                    <span className="text-5xl font-black text-pink-400">
                      $0
                    </span>
                  </div>

                  <p className="font-bold">
                    For you, because you&apos;re a baddie 😉
                  </p>

                  <p className="mt-2 text-xs text-white/40">
                    <LockKeyhole
                      size={12}
                      className="mr-1 inline"
                    />
                    No payment required.
                  </p>
                </div>

                <button
                  onClick={reserve}
                  disabled={booking}
                  className="rounded-2xl bg-pink-500 px-7 py-4 font-black shadow-lg shadow-pink-500/20 disabled:opacity-50"
                >
                  {booking
                    ? "SECURING…"
                    : "🔒 Secure My Spot"}
                </button>

              </div>

              {error && (
                <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </p>
              )}

            </div>
          )}
        </section>

        <footer className="py-8 text-center text-sm text-white/40">
          powered by{" "}
          <span className="font-bold text-pink-400">
            NZK_App
          </span>
        </footer>

      </div>
    </main>
  );
}