import { NextResponse } from "next/server";
import { adminCookie, adminToken } from "@/lib/admin-auth";
export async function POST(req:Request){
  const {password}=await req.json();
  if(!process.env.ADMIN_PASSWORD) return NextResponse.json({error:"ADMIN_PASSWORD is not configured."},{status:500});
  if(password!==process.env.ADMIN_PASSWORD) return NextResponse.json({error:"Wrong password."},{status:401});
  const res=NextResponse.json({ok:true});
  res.cookies.set(adminCookie,adminToken(),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:60*60*24*7});
  return res;
}
