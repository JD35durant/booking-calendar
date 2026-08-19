import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getAdminSupabase } from "@/lib/supabase-server";

export async function GET(){
  if(!(await isAdmin())) return NextResponse.json({error:"Unauthorized"},{status:401});
  const {data,error}=await getAdminSupabase().from("availability").select("id,available_date,available_time,status,created_at").order("available_date").order("available_time");
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({slots:data||[]});
}
export async function POST(req:Request){
  if(!(await isAdmin())) return NextResponse.json({error:"Unauthorized"},{status:401});
  const {date,time}=await req.json();
  if(!date||!time)return NextResponse.json({error:"Date and time are required."},{status:400});
  const {data,error}=await getAdminSupabase().from("availability").insert({available_date:date,available_time:time,status:"available"}).select().single();
  if(error)return NextResponse.json({error:error.code==="23505"?"That slot already exists.":error.message},{status:409});
  return NextResponse.json({slot:data});
}
export async function DELETE(req:Request){
  if(!(await isAdmin())) return NextResponse.json({error:"Unauthorized"},{status:401});
  const id=new URL(req.url).searchParams.get("id");
  if(!id)return NextResponse.json({error:"Missing id."},{status:400});
  const db=getAdminSupabase();
  const {data:slot,error:findError}=await db.from("availability").select("status").eq("id",id).single();
  if(findError)return NextResponse.json({error:findError.message},{status:404});
  if(slot.status==="reserved")return NextResponse.json({error:"A reserved slot cannot be deleted."},{status:409});
  const {error}=await db.from("availability").delete().eq("id",id);
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
}
