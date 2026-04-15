# Scheduling App — Cal.com Clone

A full-stack scheduling platform built as a SDE Intern assignment. Inspired by [Cal.com](https://cal.com), it lets users create event types, set availability, share public booking links, and manage bookings — all connected to a real PostgreSQL database.

---

## Features

- **Event Types** — Create, edit, delete, and toggle enable/disable for events
- **Public Booking Page** — `/book/[slug]` for each event; calendar + time slot picker
- **Availability Settings** — Weekday toggles with start/end times, persisted to DB
- **Bookings Dashboard** — Upcoming / Past / Cancelled tabs with cancel action
- **Double Booking Prevention** — Slot API checks existing bookings before returning available times
- **Dark Mode UI** — Cal.com-inspired design with Tailwind CSS + shadcn/ui
- **Seed Data** — Default event, availability, and booking on first run

---

## Tech Stack

| Layer     | Technology                                 |
|-----------|--------------------------------------------|
| Frontend  | Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Lucide Icons |
| Backend   | FastAPI, SQLAlchemy, Pydantic, Uvicorn     |
| Database  | PostgreSQL via Supabase                    |
| ORM       | SQLAlchemy 2.0                             |
| Hosting   | Vercel (frontend) + Render (backend)       |

---

## Folder Structure

```
scheduler-app/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, routers
│   │   ├── database.py      # SQLAlchemy engine + session
│   │   ├── models.py        # ORM models
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── routers/
│   │       ├── event_types.py
│   │       ├── bookings.py
│   │       └── availabilities.py
│   ├── seed.py              # Seeds initial data
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── dashboard/
    │   │   │   ├── event-types/page.tsx
    │   │   │   ├── availability/page.tsx
    │   │   │   ├── bookings/page.tsx
    │   │   │   └── settings/page.tsx
    │   │   ├── book/[slug]/page.tsx   # Public booking page
    │   │   └── layout.tsx
    │   ├── components/ui/             # shadcn/ui components
    │   └── lib/api.ts                 # API client (reads NEXT_PUBLIC_API_URL)
    ├── .env.example
    └── package.json
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- A PostgreSQL database (Supabase free tier works)

---

### 1. Clone the repo

```bash
git clone https://github.com/your-username/scheduler-app.git
cd scheduler-app
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env from example
cp .env.example .env
# → Edit .env and set DATABASE_URL and FRONTEND_URL

# Seed initial data
python seed.py

# Start development server
uvicorn app.main:app --reload
```

Backend runs at: **http://127.0.0.1:8000**
Interactive API docs: **http://127.0.0.1:8000/docs**

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local from example
cp .env.example .env.local
# → Edit .env.local and set NEXT_PUBLIC_API_URL

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## Environment Variables

### Backend — `backend/.env`

| Variable       | Description                                              | Example                                      |
|----------------|----------------------------------------------------------|----------------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string                             | `postgresql://user:pass@host:5432/dbname`   |
| `FRONTEND_URL` | Frontend URL for CORS (comma-separated for multiple)     | `https://your-app.vercel.app`               |

### Frontend — `frontend/.env.local`

| Variable              | Description                           | Example                                      |
|-----------------------|---------------------------------------|----------------------------------------------|
| `NEXT_PUBLIC_API_URL` | Full base URL of the backend + `/api` | `https://your-backend.onrender.com/api`      |

---

## Database Schema

### `event_types`
| Column      | Type      | Notes               |
|-------------|-----------|---------------------|
| id          | UUID (PK) | Auto-generated      |
| title       | text      |                     |
| description | text      |                     |
| duration    | int       | In minutes          |
| slug        | text      | Unique, URL-safe    |
| is_active   | boolean   | Default true        |
| created_at  | timestamp | Auto UTC            |

### `availability`
| Column     | Type      | Notes                        |
|------------|-----------|------------------------------|
| id         | UUID (PK) | Auto-generated               |
| weekday    | int       | 0=Monday … 6=Sunday          |
| enabled    | boolean   | Default true                 |
| start_time | time      | e.g. 09:00:00                |
| end_time   | time      | e.g. 17:00:00                |
| timezone   | text      | e.g. UTC                     |

### `bookings`
| Column        | Type      | Notes                              |
|---------------|-----------|------------------------------------|
| id            | UUID (PK) | Auto-generated                     |
| event_type_id | UUID (FK) | References event_types.id          |
| name          | text      | Booker name                        |
| email         | text      | Booker email                       |
| booking_date  | date      |                                    |
| start_time    | timestamp |                                    |
| end_time      | timestamp |                                    |
| status        | text      | `booked` or `cancelled`            |
| notes         | text      | Optional booker notes              |
| created_at    | timestamp | Auto UTC                           |

---

## API Endpoints

| Method | Endpoint                                 | Description                        |
|--------|------------------------------------------|------------------------------------|
| GET    | `/api/event-types/`                      | List all event types               |
| POST   | `/api/event-types/`                      | Create event type                  |
| GET    | `/api/event-types/{slug}`                | Get event type by slug             |
| PUT    | `/api/event-types/{id}`                  | Update event type                  |
| DELETE | `/api/event-types/{id}`                  | Delete event type                  |
| GET    | `/api/event-types/{slug}/slots?date=...` | Get available slots for a date     |
| GET    | `/api/availabilities/`                   | List all availability rows         |
| POST   | `/api/availabilities/`                   | Create availability row            |
| PUT    | `/api/availabilities/{id}`               | Update availability row            |
| GET    | `/api/bookings/`                         | List all bookings                  |
| POST   | `/api/bookings/`                         | Create a booking                   |
| PATCH  | `/api/bookings/{id}/cancel`              | Cancel a booking                   |

---

## Deployment

### Database — Supabase

1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy the **Connection String** from Settings → Database
3. Use this as `DATABASE_URL` in both backend `.env` and Render environment

---

### Backend — Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo, set **Root Directory** to `backend`
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - `DATABASE_URL` = your Supabase connection string
   - `FRONTEND_URL` = your Vercel deployment URL
7. Deploy — note your backend URL (e.g. `https://scheduler-api.onrender.com`)

---

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → Import Project from GitHub
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://scheduler-api.onrender.com/api`
4. Deploy — backend and frontend will be linked

---

## Assumptions

- No authentication is implemented. A default host user is assumed to be logged in.
- All events belong to a single default user (no multi-tenancy).
- Timezone handling is stored as a string label; actual timezone conversion is not implemented client-side.
- Slot generation uses 30-minute intervals regardless of event duration (durations shorter than 30 min show fewer slots per hour).
- Email notifications are not sent; a placeholder confirmation message is shown.
- The public booking page is accessible to anyone with the event slug link.

---

## Future Improvements

- [ ] User authentication (NextAuth.js or Supabase Auth)
- [ ] Multi-user support with team scheduling
- [ ] Email confirmation via Resend or SendGrid
- [ ] Reschedule booking flow
- [ ] Buffer time before/after meetings
- [ ] Custom booking questions per event
- [ ] Recurring availability exceptions / date overrides
- [ ] Google Calendar / Outlook integration
- [ ] Mobile-responsive improvements
- [ ] Rate limiting on booking endpoints
