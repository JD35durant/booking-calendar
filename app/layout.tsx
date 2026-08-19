import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title:"Second Round — Booking Calendar", description:"Choose your Second Round." , icons:{icon:"/icon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
