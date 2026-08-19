import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(){
  if(!supabase) return NextResponse.json({error:"Supabase is not configured."},{status:500});
  const {data,error}=await supabase.from("availability").select("id,available_date,available_time,status").eq("status","available").gte("available_date",new Date().toISOString().slice(0,10)).order("available_date").order("available_time");
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({slots:data||[]});
}
