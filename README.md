# CreatorOS — Business Management Suite for Content Creators

CreatorOS is a premium, dark-themed business dashboard designed specifically for YouTubers, influencers, and independent content creators. It unifies content scheduling, pipeline management, automated invoicing, growth insights, and AI assistance into a single professional operating system.

Recreated pixel-perfect from the Google Stitch specifications (`9666066555963227008`).

---

## Architecture Overview

CreatorOS is split into three main modules:
1. **Frontend (`/frontend`)**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Recharts, Zustand, and Framer Motion. Handles direct Supabase database CRUD, state synchronization, and live previews.
2. **Backend (`/backend`)**: FastAPI (Python 3.13+) service that coordinates LLM streaming calls (via Groq API), PDF document compiling (using ReportLab), and complex business logic.
3. **Database (`/supabase`)**: PostgreSQL schema migrations and seed scripts for profiles, brand deals, invoices, assets, calendar events, notifications, and AI histories.

```
CreatorOS (Monorepo)
├── backend/                  # FastAPI Application
│   ├── services/             # AI (Groq) & PDF compilation services
│   ├── routers/              # API endpoints
│   ├── main.py               # Entrypoint
│   └── requirements.txt      # Python dependencies
├── frontend/                 # Next.js Application
│   ├── src/
│   │   ├── app/              # App Router Pages
│   │   ├── components/       # Custom Recharts, Kanban, Calendar components
│   │   ├── store/            # Zustand global state management
│   │   ├── lib/              # Supabase & API connections
│   │   └── context/          # Session Context Guards
│   ├── package.json
│   └── next.config.ts
└── supabase/                 # Database Schema & Seed Data
    ├── schema.sql            # Table structures & RLS policies
    └── seed.sql              # High-fidelity mock developer data
```

---

## Getting Started

### 1. Database Setup (Supabase)

1. Create a new project on [Supabase](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Copy and run the contents of [`supabase/schema.sql`](./supabase/schema.sql) to initialize the tables, indexes, and Row-Level Security (RLS) policies.
4. Copy and run the contents of [`supabase/seed.sql`](./supabase/seed.sql) to populate the database with developer-niche mockup data.

### 2. Backend Setup (FastAPI)

Ensure you have Python 3.13+ installed.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On MacOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in `/backend`:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   PORT=8000
   ```
5. Start the FastAPI server:
   ```bash
   python main.py
   ```
   The API documentation will be available at `http://localhost:8000/docs`.

### 3. Frontend Setup (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.
5. Click **🔑 Continue as Guest** on the login page to immediately interact with the seeded mock data (no signup required).

---

## Features Implemented

- **Dynamic Landing Page**: Modern dark aesthetic with interactive bento mockup and pricing tiers.
- **Dashboard Home**: Summary KPI cards, Recharts Area chart plotting trailing-year sponsorships vs AdSense, and recent activity logs.
- **Content Calendar**: Interactive Month & Week layouts color-coded by channel (YouTube, Instagram, TikTok) with cell-level scheduling dialogs.
- **Brand Deals Kanban**: Drag-and-drop pipeline stages (Lead → Negotiating → Contract Sent → Active → Paid) leveraging HTML5 drag APIs.
- **AI Caption Generator**: Multi-variant social captions with tone selection and streaming logs, utilizing Llama 3.3/3.1, Qwen, and DeepSeek via Groq.
- **Media Kit Builder**: Form-driven bio & rate inputs on the left feeding an A4 page-styled Live Preview canvas on the right with PDF exports.
- **Invoices Manager**: Grid table highlighting billing statuses (Draft, Sent, Paid, Overdue) with direct status modifier selects and PDF compiler downloads.
- **Growth Analytics**: Cross-channel follower growth area charts and bar chart engagement audits by content type.

---

## Deployment Guidelines

### Frontend (Vercel)
1. Push the `/frontend` sub-directory to GitHub.
2. Link the repository to [Vercel](https://vercel.com).
3. Set the Root Directory to `frontend`.
4. Configure environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL` pointing to your deployed backend).
5. Deploy.

### Backend (Render / Railway)
1. Push the `/backend` sub-directory or monorepo to GitHub.
2. Deploy a web service on [Render](https://render.com).
3. Set Build Command to `pip install -r requirements.txt` and Start Command to `python main.py` or `uvicorn main:app --host 0.0.0.0 --port $PORT`.
4. Configure your `GROQ_API_KEY` env var.
5. Deploy.
