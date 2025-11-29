# Supabase Setup Instructions

To make the Shermbites app work, you need to configure your Supabase project.

## 1. Database Schema

Run the following SQL in your Supabase SQL Editor to create the `clips` table:

```sql
create table clips (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  label text not null,
  filename text not null,
  category text
);

-- Enable Row Level Security (RLS)
alter table clips enable row level security;

-- Create a policy to allow public read access
create policy "Enable read access for all users"
on clips for select
to anon
using (true);
```

## 2. Storage Bucket

1. Go to **Storage** in your Supabase dashboard.
2. Create a new bucket named `audio-clips`.
3. Make sure the bucket is **Public**.
4. Upload your audio files (mp3, wav, etc.) to this bucket.
5. Add entries to the `clips` table where `filename` matches the name of the file in the bucket (e.g., `wow.mp3`).

## 3. Environment Variables

1. Copy `.env.example` to `.env.local` (if running locally) or set these in Vercel.
2. Fill in your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
