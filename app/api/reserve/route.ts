import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { slotId, firstName } = await request.json();

    if (!slotId) {
      return NextResponse.json(
        { error: "Missing slot." },
        { status: 400 }
      );
    }

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

    const { data: slot, error: slotError } = await supabase
      .from("availability")
      .select("id, status, available_date, available_time")
      .eq("id", slotId)
      .single();

    if (slotError || !slot) {
      return NextResponse.json(
        { error: "Slot not found." },
        { status: 404 }
      );
    }

    if (slot.status !== "available") {
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
      return NextResponse.json(
        { error: reservationError.message },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabase
      .from("availability")
      .update({ status: "reserved" })
      .eq("id", slotId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reservation: {
        firstName: cleanFirstName,
        date: slot.available_date,
        time: slot.available_time,
      },
    });
  } catch (error) {
    console.error("Reservation error:", error);

    return NextResponse.json(
      { error: "Could not create reservation." },
      { status: 500 }
    );
  }
}