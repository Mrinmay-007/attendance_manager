# attendX - College Attendance Manager

A role-based attendance system for colleges. Admins set up the academic structure, teachers mark attendance for the classes they teach, and students see their attendance per subject.

- **Frontend:** React 19 + Vite, deployed on Vercel
- **Backend:** FastAPI + SQLAlchemy 2 + Pydantic, JWT auth
- **Database:** MySQL (via PyMySQL)

---

## Table of contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Project structure](#project-structure)
4. [Run it locally](#run-it-locally)
5. [First-time data setup](#first-time-data-setup)
6. [Environment variables](#environment-variables)
7. [API reference](#api-reference)
8. [Business rules](#business-rules)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)
11. [Known limitations and roadmap](#known-limitations-and-roadmap)

---

## Features

| Role | What they can do |
|---|---|
| Admin | Manage departments, teachers, students, subjects, subject-to-teacher assignments, time slots and weekly routines for their own college |
| Teacher | See assigned subjects and routine, mark attendance (Present / Absent / Late) for assigned classes, review and correct past attendance |
| Student | See attendance percentage per subject, full attendance history and the weekly routine for their department |

---

## Architecture

### System overview

```mermaid
flowchart LR
    U[Browser<br/>Admin / Teacher / Student] -->|HTTPS + JWT| FE[React + Vite app<br/>Vercel]
    FE -->|REST JSON<br/>Authorization: Bearer| API[FastAPI backend<br/>uvicorn]
    API -->|SQLAlchemy + PyMySQL<br/>SSL| DB[(MySQL)]
```

The frontend is a static single-page app. It talks to the backend only through the REST API, and the backend is the only component that touches the database.

### Backend request flow

```mermaid
flowchart TD
    R[Incoming request] --> C[CORSMiddleware]
    C --> M[RequestMetadataMiddleware<br/>adds X-Process-Time-Ms]
    M --> RT[Router<br/>auth / admin / teacher / student]
    RT --> G[require_role guard]
    G --> A[get_current_user<br/>decode JWT, load User, check is_active]
    A --> H[Endpoint handler]
    H --> O[SQLAlchemy ORM<br/>models.py]
    O --> DB[(MySQL)]
    H --> S[Pydantic schemas<br/>response_model]
    S --> RES[JSON response]
```

Every role router declares its guard once at router level, for example `/admin/*` requires the `admin` role. Handlers receive the database session through the `get_db` dependency.

### Authentication flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant API as FastAPI
    participant DB as MySQL
    B->>API: POST /auth/login (email, password)
    API->>DB: find user by email
    API->>API: bcrypt verify, create JWT (8h)
    API-->>B: access_token
    B->>API: GET /auth/me (Bearer token)
    API-->>B: user with role
    B->>B: store token + role in localStorage
    B->>API: later requests with Authorization header
    API->>API: decode JWT, load user, check role
    Note over B,API: A 401 response clears the token and sends the user to the login page
```

### Marking attendance

```mermaid
sequenceDiagram
    participant T as Teacher UI
    participant API as FastAPI
    participant DB as MySQL
    T->>API: GET /teacher/my-subjects
    T->>API: GET /teacher/assigned-students?st_id=...
    T->>T: choose Present / Absent / Late per student
    T->>API: POST /teacher/attendance (one request per student)
    API->>DB: verify the class belongs to this teacher
    API->>DB: insert, or update status if the row already exists
    API-->>T: saved record
```

### Database schema

```mermaid
erDiagram
    COLLEGE ||--o{ DEPARTMENT : has
    COLLEGE ||--o{ USER : has
    USER ||--o| TEACHER : "profile"
    USER ||--o| STUDENT : "profile"
    DEPARTMENT ||--o{ TEACHER : employs
    DEPARTMENT ||--o{ STUDENT : enrolls
    DEPARTMENT ||--o{ SUBJECT : offers
    SUBJECT ||--o{ SUBJECT_TEACHER : "assigned in"
    TEACHER ||--o{ SUBJECT_TEACHER : teaches
    SUBJECT_TEACHER ||--o{ ROUTINE : scheduled
    SLOT ||--o{ ROUTINE : "time of"
    SUBJECT_TEACHER ||--o{ ATTENDANCE : "recorded for"
    STUDENT ||--o{ ATTENDANCE : has

    USER {
        int user_id PK
        int college_id FK
        string email
        string password_hash
        enum role
        bool is_active
    }
    TEACHER {
        int teacher_id PK
        int user_id FK
        int dept_id FK
        string teacher_code
    }
    STUDENT {
        int student_id PK
        int user_id FK
        int dept_id FK
        string roll_no
        int year
        int sem
        string section
    }
    SUBJECT {
        int subject_id PK
        int dept_id FK
        string subject_code
        int year
        int sem
    }
    SUBJECT_TEACHER {
        int st_id PK
        int subject_id FK
        int teacher_id FK
        int dept_id FK
    }
    SLOT {
        int slot_id PK
        time start_time
        time end_time
    }
    ROUTINE {
        int routine_id PK
        int st_id FK
        int slot_id FK
        int dept_id FK
        enum day
    }
    ATTENDANCE {
        int attendance_id PK
        int st_id FK
        int student_id FK
        date date
        enum status
        datetime marked_at
    }
```

Key constraints:

- `attendance` is unique on `(st_id, student_id, date)`, so one status per student per class per day.
- `subject_teacher` is unique on `(subject_id, teacher_id)`.
- `routine` is unique on `(st_id, slot_id, day)`.

### Frontend structure

```mermaid
flowchart TD
    APP["App.jsx<br/>React Router"] --> LOGIN["Login page<br/>route: /"]
    APP --> PR["ProtectedRoute<br/>checks token + role"]
    PR --> ADMIN["Admin page<br/>route: /admin/*"]
    PR --> TEACH["Faculty page<br/>route: /teacher/*"]
    PR --> STUD["Student page<br/>route: /student/*"]
    ADMIN --> RP["RolePortal<br/>role prop"]
    TEACH --> RP
    STUD --> RP
    RP --> DT["DataTable<br/>list, edit, delete"]
    RP --> CF["CreateForm<br/>admin create forms"]
    RP --> AF["AttendanceForm<br/>teacher marks attendance"]
    RP --> TH["TeacherAttendanceHistory"]
    RP --> SD["StudentAttendanceDetails"]
    RP --> API["api.jsx<br/>apiFetch wrapper"]
```

One `RolePortal` component renders all three dashboards. The sidebar items, endpoints and form fields for each role come from `RolePortal/constants.js`, so adding a new admin resource is mostly a config change.

---

## Project structure

```
attendance_manager/
├── backend/
│   ├── main.py                  # app, CORS, middleware, router registration, startup table setup
│   ├── middleware.py            # adds X-Process-Time-Ms header
│   ├── dependency.py            # get_db session dependency
│   ├── database/db.py           # engine, SessionLocal, Base
│   ├── models/models.py         # SQLAlchemy models and enums
│   ├── schemas/schemas.py       # Pydantic request/response models
│   ├── authentication/auth.py   # bcrypt, JWT, get_current_user, require_role
│   ├── routers/
│   │   ├── auth_routers/        # register, login, me
│   │   ├── admin_routers/       # create / read / update / delete
│   │   ├── teacher_routers/     # read / create / update
│   │   └── student_routers/     # read
│   ├── requirements.txt
│   └── .env.example
├── attendance-app/              # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx              # routes
│   │   ├── auth/ProtectedRoute.jsx
│   │   ├── pages/               # Login, Admin, Faculty, Student, manual
│   │   └── components/
│   │       ├── api.jsx          # fetch wrapper
│   │       └── RolePortal/      # shared dashboard (tables, forms, constants)
│   ├── vercel.json              # SPA rewrite
│   └── package.json
└── ER-Diagram.png
```

---

## Run it locally

### Prerequisites

- Python 3.10 or newer
- Node.js 20.19 or newer
- MySQL 8 running locally (or a reachable MySQL server)

### 1. Create the database

```sql
CREATE DATABASE attendance CHARACTER SET utf8mb4;
```

Tables are created automatically the first time the backend starts.

### 2. Start the backend

Run these from the **repository root**, not from inside `backend/`. The backend uses package-relative imports, so it must be started as `backend.main`.

```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt

cp backend/.env.example backend/.env
# edit backend/.env: set DATABASE_URL and SECRET_KEY (see Environment variables)

uvicorn backend.main:app --reload --port 8000
```

Check it works:

- Health check: <http://localhost:8000/health> returns `{"status": "ok"}`
- Interactive API docs: <http://localhost:8000/docs>

### 3. Start the frontend

In a second terminal:

```bash
cd attendance-app
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

Open <http://localhost:5173>.

---

## First-time data setup

A fresh database has no users, and `/auth/register` needs an existing college, so seed in this order.

**1. Create a college** (SQL, since there is no endpoint for it):

```sql
INSERT INTO college (college_name) VALUES ('My College');
```

**2. Create the admin account** in <http://localhost:8000/docs> with `POST /auth/register`:

```json
{
  "college_id": 1,
  "name": "Admin",
  "email": "admin@example.com",
  "password": "choose-a-strong-password",
  "role": "admin"
}
```

**3. Sign in** at <http://localhost:5173> with that account, then set up the college in this order:

1. Departments
2. Register login accounts for teachers and students (`POST /auth/register` with role `teacher` or `student`)
3. Create the teacher and student profiles, linked to those accounts by `user_id`
4. Subjects
5. Subject-to-teacher assignments
6. Time slots
7. Weekly routines

After that, teachers can sign in and mark attendance, and students can see their results.

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Example | Notes |
|---|---|---|---|
| `DATABASE_URL` | yes | `mysql+pymysql://user:password@localhost:3306/attendance` | SQLAlchemy URL |
| `SECRET_KEY` | yes | long random string | Signs JWTs. Generate one with `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `CORS_ORIGINS` | no | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated list of allowed frontend origins. Defaults to the two shown |

### Frontend (`attendance-app/.env`)

| Variable | Required | Example | Notes |
|---|---|---|---|
| `VITE_API_URL` | no | `http://localhost:8000` | Backend base URL. Defaults to `http://localhost:8000` |

Never commit real `.env` files.

---

## API reference

All routes except `/auth/register`, `/auth/login` and `/health` need `Authorization: Bearer <token>`. Full request and response shapes are in the interactive docs at `/docs`.

### Auth

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/register` | Create a login account |
| POST | `/auth/login` | Sign in (form fields `username` = email, `password`) |
| GET | `/auth/me` | Current user and role |
| GET | `/health` | Liveness check |

### Admin (`/admin`, role `admin`, scoped to the admin's college)

| Resource | Create | Read | Update | Delete |
|---|---|---|---|---|
| Departments | POST `/departments` | GET `/departments` | PATCH `/departments/{id}` | DELETE `/departments/{id}` |
| Teachers | POST `/teachers` | GET `/teachers` | PATCH `/teachers/{id}` | DELETE `/teachers/{id}` |
| Students | POST `/students` | GET `/students?dept_id=` | PATCH `/students/{id}` | DELETE `/students/{id}` |
| Subjects | POST `/subjects` | GET `/subjects?dept_id=` | PATCH `/subjects/{id}` | DELETE `/subjects/{id}` |
| Subject-teachers | POST `/subject-teachers` | GET `/subject-teachers?dept_id=` | PATCH `/subject-teachers/{id}` | DELETE `/subject-teachers/{id}` |
| Slots | POST `/slots` | GET `/slots` | PATCH `/slots/{id}` | DELETE `/slots/{id}` |
| Routines | POST `/routines` | GET `/routines?dept_id=` | - | - |

### Teacher (`/teacher`, role `teacher`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/teacher/my-subjects` | Classes assigned to this teacher |
| GET | `/teacher/my-routine` | This teacher's weekly routine |
| GET | `/teacher/assigned-students?st_id=` | Students of one assigned class |
| POST | `/teacher/attendance` | Mark attendance for one student (upsert) |
| GET | `/teacher/attendance?st_id=` | Records marked in the last hour |
| GET | `/teacher/attendance/history?date=&dept_code=` | Older records |
| PATCH | `/teacher/attendance/{attendance_id}` | Correct a status |

### Student (`/student`, role `student`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/student/my-attendance` | Raw attendance rows |
| GET | `/student/attendance-summary` | Percentage per subject |
| GET | `/student/attendance-history` | Date-ordered history with subject names |
| GET | `/student/my-routine` | Weekly routine for the student's department |

---

## Business rules

- Attendance status is `Present`, `Absent` or `Late`.
- A **Late** mark counts as half a present when the percentage is calculated.
- Attendance cannot be marked for a future date.
- A teacher can only mark attendance for classes assigned to them.
- Marking an already-marked student on the same day updates the existing status instead of creating a duplicate.
- Admins only see and change data from their own college.
- Tokens are valid for 8 hours. Passwords are hashed with bcrypt.
- Routine days run Monday to Saturday.

---

## Deployment

**Frontend (Vercel):**

1. Import the repo and set the root directory to `attendance-app`.
2. Set `VITE_API_URL` to the public backend URL.
3. `vercel.json` already rewrites every path to `index.html` so client-side routes work on refresh.

**Backend (any host that can run Python, such as Railway or Render):**

1. Install from `backend/requirements.txt`.
2. Set `DATABASE_URL`, `SECRET_KEY` and `CORS_ORIGINS` (include the Vercel domain).
3. Start command, from the repository root:
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port $PORT
   ```
4. Put the database and the backend in the same region. Every request makes several queries, so network distance to MySQL is the largest part of response time.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `ModuleNotFoundError: No module named 'backend'` | Start uvicorn from the repository root with `backend.main:app` |
| `KeyError: 'DATABASE_URL'` or `'SECRET_KEY'` | Create `backend/.env` (the file must live inside `backend/`) |
| Browser shows a CORS error | Add the exact frontend origin, including port, to `CORS_ORIGINS` and restart the backend |
| Database connection fails with an SSL error on local MySQL | `database/db.py` always requests SSL. Local MySQL often has none. For local use, pass `connect_args={}` when `DATABASE_URL` points to localhost, or enable TLS on your MySQL server |
| Immediately sent back to the login page | The token expired or the backend returned 401. Sign in again |
| `Foreign key constraint` error when registering | The `college_id` does not exist yet. Insert a college first |
| Blank page after refresh on a deployed route | Confirm `vercel.json` is deployed with the frontend |

---

## Known limitations and roadmap

These are known and planned, not yet done:

**Performance**

- Marking attendance sends one request per student. Plan: a single bulk endpoint that saves a whole class in one transaction.
- List endpoints load related rows one at a time (N+1 queries). Plan: eager loading.
- Every authenticated request looks up the user, then the teacher or student profile. Plan: carry `teacher_id` and `student_id` in the JWT.
- Reference data (departments, slots, subjects) is re-read on every request. Plan: a small in-process TTL cache cleared on writes.
- Lists are not paginated, and the frontend refetches on every tab change. Plan: pagination and a small client-side fetch cache.
- Table creation and column checks run on every startup. Plan: move them to a one-off setup script.

**Security**

- `POST /auth/register` is public and accepts a `role`, so anyone can create an admin account. It should be restricted to admins.
- Keep `.env` files, default-password files and database dumps out of version control, and rotate any credential that was ever committed.
- The token is stored in `localStorage`. This is acceptable for this project's scope, but an httpOnly cookie is safer if the app grows.

---

## Tech stack

**Backend:** FastAPI, Uvicorn, SQLAlchemy 2, PyMySQL, Pydantic 2, python-jose (JWT), bcrypt, python-dotenv

**Frontend:** React 19, Vite 7, React Router 7, Tailwind CSS 4, lucide-react, Heroicons, react-typed