# Fix Database Permissions

The "Sync" feature is failing because the database is blocking new entries. You need to run this SQL command in your Supabase SQL Editor to allow the app to save the clips.

1. Go to your Supabase Dashboard.
2. Click on the **SQL Editor** (icon on the left).
3. Click **New Query**.
4. Paste the code below and click **Run**.

```sql
-- Allow anyone (anon) to insert new clips
create policy "Enable insert access for all users"
on clips for insert
to anon
with check (true);

-- Allow anyone (anon) to update clips (optional, but good for fixes)
create policy "Enable update access for all users"
on clips for update
to anon
using (true);
```

After running this, go back to your app and click **Sync Storage** again.
