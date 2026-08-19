"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarPlus,
  LockKeyhole,
  LogOut,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";

type Slot = {
  id: number;
  available_date: string;
  available_time: string;
  status: "available" | "reserved";
};

type Reservation = {
  id: number;
  first_name: string | null;
  status: string;
  created_at: string;
  availability: {
    id: number;
    available_date: string;
    available_time: string;
  } | null;
};

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cancelling, setCancelling] = useState<number | null>(null);

  async function load() {
    const r = await fetch("/api/admin/availability");

    if (r.ok) {
      const j = await r.json();
      setSlots(j.slots);
      setAuthed(true);

      const rr = await fetch("/api/admin/reservations");

      if (rr.ok) {
        const jj = await rr.json();
        setReservations(jj.reservations ?? []);
      }
    } else {
      setAuthed(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function login() {
    setBusy(true);
    setError("");

    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
      }),
    });

    const j = await r.json();

    if (!r.ok) {
      setError(j.error);
    } else {
      setAuthed(true);
      setPassword("");
      load();
    }

    setBusy(false);
  }

  async function add() {
    setBusy(true);
    setError("");

    const r = await fetch("/api/admin/availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date,
        time,
      }),
    });

    const j = await r.json();

    if (!r.ok) {
      setError(j.error);
    } else {
      setDate("");
      await load();
    }

    setBusy(false);
  }

  async function remove(id: number) {
    const r = await fetch(
      `/api/admin/availability?id=${id}`,
      {
        method: "DELETE",
      }
    );

    const j = await r.json();

    if (!r.ok) {
      setError(j.error);
    } else {
      await load();
    }
  }

  async function cancelReservation(id: number) {
    const confirmed = window.confirm(
      "Cancel this reservation?"
    );

    if (!confirmed) return;

    setCancelling(id);
    setError("");

    const r = await fetch(
      `/api/admin/reservations?id=${id}`,
      {
        method: "DELETE",
      }
    );

    const j = await r.json();

    if (!r.ok) {
      setError(j.error || "Could not cancel reservation.");
    } else {
      await load();
    }

    setCancelling(null);
  }

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    setAuthed(false);
  }

  const grouped = useMemo(
    () =>
      slots.reduce<Record<string, Slot[]>>(
        (a, s) => {
          (a[s.available_date] ??= []).push(s);
          return a;
        },
        {}
      ),
    [slots]
  );

  if (!authed) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[.04] p-7">
          <div className="mb-5 flex items-center gap-3">
            <img
              src="/icon.svg"
              className="h-12 w-12 rounded-xl"
              alt="Second Round"
            />

            <div>
              <p className="text-xs uppercase tracking-[.25em] text-white/40">
                Second Round
              </p>

              <h1 className="text-2xl font-black">
                Admin access
              </h1>
            </div>
          </div>

          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            onKeyDown={(e) =>
              e.key === "Enter" && login()
            }
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-pink-400"
          />

          <button
            onClick={login}
            disabled={busy}
            className="mt-3 w-full rounded-2xl bg-pink-500 px-4 py-3 font-black text-white disabled:opacity-50"
          >
            {busy ? "Checking…" : "Sign in"}
          </button>

          {error && (
            <p className="mt-3 text-sm text-red-300">
              {error}
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-5 sm:p-8">
      <div className="mx-auto max-w-5xl">

        <header className="mb-7 flex items-center justify-between rounded-3xl border border-white/10 bg-white/[.04] p-5">
          <div className="flex items-center gap-3">
            <img
              src="/icon.svg"
              className="h-12 w-12 rounded-xl"
              alt="Second Round"
            />

            <div>
              <p className="text-xs uppercase tracking-[.25em] text-white/40">
                Booking Calendar
              </p>

              <h1 className="text-2xl font-black">
                Admin Dashboard
              </h1>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm"
          >
            <LogOut size={16} />
            Log out
          </button>
        </header>

        {/* ADD AVAILABILITY */}

        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[.04] p-5">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-white/40">
            Add availability
          </p>

          <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
            />

            <input
              type="time"
              value={time}
              onChange={(e) =>
                setTime(e.target.value)
              }
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
            />

            <button
              onClick={add}
              disabled={!date || busy}
              className="flex items-center justify-center gap-2 rounded-2xl bg-pink-500 px-5 py-3 font-black disabled:opacity-40"
            >
              <Plus size={18} />
              Add slot
            </button>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-300">
              {error}
            </p>
          )}
        </section>

        {/* RESERVATIONS */}

        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[.04] p-5">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-white/40">
              Reservations
            </p>

            <h2 className="mt-1 text-xl font-black">
              People who secured a spot
            </h2>
          </div>

          {reservations.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center text-white/40">
              No reservations yet. 👀
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.map((reservation) => {
                const slot = reservation.availability;

                return (
                  <div
                    key={reservation.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black">
                            {reservation.first_name ||
                              "Unknown"}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              reservation.status ===
                              "confirmed"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-white/10 text-white/40"
                            }`}
                          >
                            {reservation.status.toUpperCase()}
                          </span>
                        </div>

                        {slot && (
                          <p className="mt-2 text-sm text-white/50">
                            {new Date(
                              slot.available_date +
                                "T12:00:00"
                            ).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}{" "}
                            · {slot.available_time}
                          </p>
                        )}
                      </div>

                      {reservation.status ===
                        "confirmed" && (
                        <button
                          onClick={() =>
                            cancelReservation(
                              reservation.id
                            )
                          }
                          disabled={
                            cancelling ===
                            reservation.id
                          }
                          className="flex items-center justify-center gap-2 rounded-2xl border border-red-400/30 px-4 py-3 text-sm font-black text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                        >
                          <XCircle size={17} />

                          {cancelling ===
                          reservation.id
                            ? "Cancelling…"
                            : "Cancel reservation"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* AVAILABILITY */}

        <div className="space-y-5">
          {Object.entries(
            grouped as Record<string, Slot[]>
          ).map(([d, items]) => (
            <section
              key={d}
              className="rounded-3xl border border-white/10 bg-white/[.04] p-5"
            >
              <h2 className="mb-4 text-lg font-black">
                {new Date(
                  d + "T12:00:00"
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h2>

              <div className="space-y-2">
                {items.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarPlus
                        size={18}
                        className="text-pink-400"
                      />

                      <span className="font-bold">
                        {s.available_time}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          s.status === "available"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-purple-500/15 text-purple-300"
                        }`}
                      >
                        {s.status === "available"
                          ? "AVAILABLE"
                          : "RESERVED"}
                      </span>

                      {s.status === "reserved" ? (
                        <LockKeyhole
                          size={18}
                          className="text-white/30"
                        />
                      ) : (
                        <button
                          onClick={() =>
                            remove(s.id)
                          }
                          title="Delete slot"
                          className="rounded-full p-2 text-white/40 hover:bg-red-500/10 hover:text-red-300"
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="py-8 text-center text-xs text-white/30">
          powered by{" "}
          <span className="font-bold text-pink-400">
            NZK_App
          </span>
        </footer>
      </div>
    </main>
  );
}