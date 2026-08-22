import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 500 }
    );
  }

  // Pour afficher TOUS les créneaux 'available' (sans filtre de date bloquant) :
  const { data, error } = await supabase
    .from("availability")
    .select("id, available_date, available_time, status")
    .eq("status", "available")
    .order("available_date", { ascending: true })
    .order("available_time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ slots: data || [] });
}