# Shermbites Deployment Guide

Follow this step-by-step guide to host your application on Vercel and set up the Supabase backend.

## Phase 1: Supabase Setup (Backend)

1.  **Create Account/Project**:
    *   Go to [supabase.com](https://supabase.com/) and sign up/log in.
    *   Click "New Project".
    *   Select your organization, give it a name (e.g., "Shermbites"), and set a database password (save this!).
    *   Choose a region close to you.
    *   Click "Create new project".

2.  **Database Schema**:
    *   Once the project is ready, go to the **SQL Editor** (icon on the left sidebar).
    *   Click "New query".
    *   Paste the following SQL code:
        ```sql
        create table clips (
          id uuid default uuid_generate_v4() primary key,
          created_at timestamp with time zone default timezone('utc'::text, now()) not null,
          label text not null,
          filename text not null,
          category text
        );

        alter table clips enable row level security;

        create policy "Enable read access for all users"
        on clips for select
        to anon
        using (true);
        ```
    *   Click **Run**.

3.  **Storage Setup**:
    *   Go to **Storage** (folder icon on the left).
    *   Click "New Bucket".
    *   Name it `audio-clips`.
    *   **IMPORTANT**: Toggle "Public bucket" to **ON**.
    *   Click "Save".
    *   Upload your audio files (mp3, wav) into this bucket.

4.  **Get Credentials**:
    *   Go to **Project Settings** (gear icon) -> **API**.
    *   Copy the **Project URL**.
    *   Copy the **anon** / **public** key.
    *   *Keep these handy for Phase 3.*

## Phase 2: Git Setup (Version Control)

Since this project isn't a git repository yet, we need to initialize it.

1.  Open your terminal in the project folder (`Sherman Audio Clips`).
2.  Run these commands:
    ```bash
    git init
    git add .
    git commit -m "Initial commit: Shermbites app"
    ```
3.  **Push to GitHub**:
    *   Go to [github.com/new](https://github.com/new) and create a new repository (e.g., "shermbites").
    *   Follow the instructions to push an existing repository:
        ```bash
        git remote add origin https://github.com/YOUR_USERNAME/shermbites.git
        git branch -M main
        git push -u origin main
        ```

## Phase 3: Vercel Setup (Hosting)

1.  **Import Project**:
    *   Go to [vercel.com](https://vercel.com/) and sign up/log in.
    *   Click "Add New..." -> "Project".
    *   Select "Import" next to your GitHub repository `shermbites`.

2.  **Configure Project**:
    *   **Framework Preset**: It should auto-detect "Vite".
    *   **Root Directory**: `./` (default).
    *   **Environment Variables**: Expand this section. Add the keys you got from Supabase:
        *   `VITE_SUPABASE_URL`: Paste your Project URL.
        *   `VITE_SUPABASE_ANON_KEY`: Paste your `anon` key.

3.  **Deploy**:
    *   Click **Deploy**.
    *   Wait for the build to complete.
    *   Once finished, you'll get a live URL (e.g., `shermbites.vercel.app`).

## Phase 4: Final Polish

1.  **Add Data**:
    *   Go back to Supabase **Table Editor**.
    *   Insert rows into the `clips` table.
    *   **Label**: The text on the button (e.g., "Wow").
    *   **Filename**: The exact name of the file in your storage bucket (e.g., `wow.mp3`).
2.  **Test**:
    *   Visit your Vercel URL.
    *   Click the buttons and ensure sound plays!
