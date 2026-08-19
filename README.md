# Booking Calendar — Second Round v2

This version adds:
- database-driven availability (no fixed dates in the UI)
- secure reservation API with duplicate-slot protection
- password-protected admin dashboard at `/admin`
- add/delete availability from the admin dashboard
- favicon/app icon
- `powered by NZK_App` footer
- no payment collection

## 1. Install
`npm install`

## 2. Environment
Copy `.env.example` to `.env.local` and fill in:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ADMIN_PASSWORD

## 3. Supabase
Run `supabase/schema.sql` in Supabase SQL Editor.

## 4. Local run
`npm run dev`
Then open `http://localhost:3000`.
Admin: `http://localhost:3000/admin`

## 5. Vercel
Add the same four environment variables in Vercel. The service role key is server-only and must never be prefixed with `NEXT_PUBLIC_`.
