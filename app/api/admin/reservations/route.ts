import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createClient(url, key);
}

export async function GET() {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("reservations")
      .select(`
        id,
        first_name,
        status,
        created_at,
        availability:availability_id (
          id,
          available_date,
          available_time
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reservations: data ?? [],
    });
  } catch (error) {
    console.error("Reservations GET error:", error);

    return NextResponse.json(
      { error: "Could not load reservations." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = getSupabase();

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing reservation id." },
        { status: 400 }
      );
    }

    const { data: reservation, error: findError } = await supabase
      .from("reservations")
      .select("id, availability_id, status")
      .eq("id", id)
      .single();

    if (findError || !reservation) {
      return NextResponse.json(
        { error: "Reservation not found." },
        { status: 404 }
      );
    }

    const { error: reservationError } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (reservationError) {
      return NextResponse.json(
        { error: reservationError.message },
        { status: 500 }
      );
    }

    const { error: availabilityError } = await supabase
      .from("availability")
      .update({ status: "available" })
      .eq("id", reservation.availability_id);

    if (availabilityError) {
      return NextResponse.json(
        { error: availabilityError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Reservation DELETE error:", error);

    return NextResponse.json(
      { error: "Could not cancel reservation." },
      { status: 500 }
    );
  }
}