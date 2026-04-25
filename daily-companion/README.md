# Daily Companion

Your personal daily thinking partner. Five modes (Vision Board, Mind Clear, Routines/Priorities/Rituals, Tasks & Reminders, Brainstorm) plus a conversational search across everything you've ever captured. Powered by Claude.

---

## Stack

- **Next.js 14** (App Router) — the web framework
- **Vercel** — hosting (free tier)
- **Supabase** — Postgres database for entries (free tier)
- **Anthropic Claude API** — the intelligence
- **Single-password auth** — just you, on any device

---

## Deployment Walkthrough (~10–15 min)

### Step 1 — Set up the Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it `daily-companion`, pick a region close to you (London for UK), generate a strong DB password
3. Wait ~1 min for it to spin up
4. Once ready, go to **SQL Editor** → New Query
5. Open `supabase-schema.sql` from this project, paste the contents, click **Run**
6. You should see `Success. No rows returned.`
7. Go to **Settings → API** and copy these two values:
   - `Project URL` (looks like `https://xxxxx.supabase.co`)
   - `service_role` key under "Project API keys" (the long one — keep this secret)

### Step 2 — Push the project to GitHub

1. Create a new repo on GitHub called `daily-companion` (private)
2. From your terminal in this project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/daily-companion.git
   git push -u origin main
   ```

### Step 3 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Add New → Project
2. Import the `daily-companion` GitHub repo
3. Framework preset will auto-detect as Next.js — leave defaults
4. **Before clicking Deploy**, add these Environment Variables:

   | Name | Value |
   |---|---|
   | `ANTHROPIC_API_KEY` | Your existing Anthropic API key (starts with `sk-ant-`) |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL from Step 1.7 |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key from Step 1.7 |
   | `APP_PASSWORD` | Pick any strong password you'll remember |
   | `AUTH_SECRET` | Any long random string (at least 32 chars). Generate one with `openssl rand -hex 32` if you have a terminal handy |

5. Click **Deploy**. Wait ~90 seconds.
6. You'll get a URL like `daily-companion-xyz.vercel.app`. Open it.
7. Enter your `APP_PASSWORD`. You're in.

### Step 4 — Install on your phone

**iPhone:**
1. Open the Vercel URL in Safari
2. Tap the Share button → "Add to Home Screen"
3. Name it "Companion" → Add
4. Now it lives on your home screen and opens fullscreen like a native app

**Android:**
1. Open the Vercel URL in Chrome
2. Tap the three-dot menu → "Install app" or "Add to Home screen"

### Step 5 — Test it

1. Tap "Mind Clear", type or speak a brain dump, hit Process with Claude
2. You should see a structured response with tables and headings
3. Tap "Save as PDF" — your browser print dialog opens, save to Files/Drive
4. Go back home, tap "View past entries" — your entry is there
5. Tap "Search past entries", search for a word from your dump, watch Claude respond conversationally

If all of that works, you're live.

---

## Local Development (optional)

If you want to run it on your laptop while iterating:

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your real values
npm run dev
```

Open `http://localhost:3000`.

---

## Architecture

```
daily-companion/
├── app/
│   ├── layout.js              # Root HTML layout, PWA setup
│   ├── page.js                # Auth gate → renders Login or App
│   ├── api/
│   │   ├── auth/route.js      # Password check, cookie management
│   │   ├── claude/route.js    # Server-side Claude API calls (keeps key safe)
│   │   └── entries/
│   │       ├── route.js       # GET all entries, POST new entry
│   │       └── [id]/route.js  # DELETE entry
│   └── components/
│       ├── LoginScreen.js     # Password entry screen
│       └── DailyCompanion.js  # The whole app — modes, voice, search, etc.
├── lib/
│   ├── auth.js                # Cookie signing/verification
│   └── supabase.js            # Supabase client with service role
├── public/
│   ├── manifest.json          # PWA manifest for installability
│   └── icon-*.png             # App icons
├── supabase-schema.sql        # Database setup — run in Supabase SQL Editor
└── .env.example               # Template for environment variables
```

**Data flow:**
- User taps a mode → enters input → app sends prompt to `/api/claude`
- `/api/claude` calls Anthropic with your server-side API key, returns response
- Response is shown to user AND saved via `/api/entries` POST → Supabase
- History list is loaded from `/api/entries` GET on app load
- Search filters history client-side, sends top matches to `/api/claude` for conversational response

---

## Coming Next (v2)

- **Google Drive auto-upload** for PDFs (one-time Google Cloud OAuth setup)
- **7 figure brain MCP integration** server-side (so coaching context flows in)
- **Cross-app linking** between entries (e.g. "this brainstorm relates to that vision")

---

## Costs

- Vercel: free
- Supabase: free (under 500MB DB, more than you'll ever need)
- Anthropic: pay-as-you-go — typical daily usage = a few pennies

---

Ship it.
