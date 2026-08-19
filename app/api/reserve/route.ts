import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      slotId: selected.id,
      firstName: firstName.trim()
    })
  });

  const j = await r.json();

  if (!r.ok) {
    setError(j.error);
    await load();
  } else {
    setConfirmed(true);
  }

  setBooking(false);
}
export async function POST(request: Request) {
  try {
   const { slotId, firstName } = await request.json();

const cleanFirstName =
  typeof firstName === "string"
    ? firstName.trim().slice(0, 40)
    : "";
if (!cleanFirstName) {
  return NextResponse.json(
    { error: "Please enter your first name." },
    { status: 400 }
  );
}
    if (!slotId) {
      return NextResponse.json(
        { error: "Missing slotId." },
        { status: 400 }
      );
    }

    const { data: slot, error: slotError } = await supabase
      .from("availability")
      .select("id, available_date, available_time, status")
      .eq("id", slotId)
      .eq("status", "available")
      .single();

    if (slotError || !slot) {
      return NextResponse.json(
        { error: "This slot is no longer available." },
        { status: 409 }
      );
    }

    const { error: reservationError } = await supabase
      .from("reservations")
     .insert({
      availability_id: slotId,
      first_name: cleanFirstName,
      status: "confirmed",
    });

    if (reservationError) {
      if (reservationError.code === "23505") {
        return NextResponse.json(
          { error: "Sorry, this slot was just taken." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: reservationError.message },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabase
      .from("availability")
      .update({ status: "reserved" })
      .eq("id", slotId)
      .eq("status", "available");

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      slot,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create reservation.",
      },
      { status: 500 }
    );
  }
}