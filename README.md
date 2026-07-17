# StudySphere AI — powered by Goose 🪿

An AI-powered learning platform — instant explanations, notes, flashcards, MCQs, quizzes, a
voice-enabled chatbot with photo understanding and persistent history, marks-weighted exam paper
generation, real-world mock exams, a coin economy, W3Schools-style interactive courses with
coding assessments, and a faculty workspace. Plus a study planner, Pomodoro timer, CGPA
calculator, and attendance tracker.

## Stack
- **Frontend (`client/`)**: React + Vite + Tailwind CSS + React Router
- **Backend (`server/`)**: Node.js + Express
- **Database**: PostgreSQL via Neon, managed with Prisma ORM
- **Auth**: JWT + bcrypt, separate Student/Faculty registration, email OTP verification
- **AI**: Google Gemini (`gemini-2.5-flash` by default) — the only AI provider. Free,
  rate-limited tier, no billing required to start.

## Quick start

### 1. Get a Gemini API key
Get a free key (no billing required) at
[aistudio.google.com/apikey](https://aistudio.google.com/apikey), then set `GEMINI_API_KEY` in
`server/.env`.

### 2. Database
If you've been running SQL manually in Neon's editor, run:
```powershell
cd server
npx prisma db push
```
This syncs Prisma to your actual database schema without needing migration history — the
right command for a database that's been hand-edited, which is the state yours is in now.

### 3. Server
```bash
npm install
npm run dev
```
Runs at `http://localhost:5000`. Check `http://localhost:5000/api/health`.

### 4. Client
```bash
cd client
npm install
npm run dev
```
Runs at `http://localhost:5173`.

## Feature overview & honest limitations
- **Courses**: W3Schools-style layout — picking a course loads its full AI-generated chapter
  list (like a real curriculum: Introduction, Data Types, Loops, OOP, etc.), and picking a
  chapter loads that chapter's own focused lesson, cached per student. Quiz and (for programming
  sectors) a "Try it Yourself" code editor per chapter.
- **Coding assessments are AI-reviewed, not executed** — no safe sandboxed multi-language
  runner is available here. JavaScript is the exception: it actually runs, live, in your browser.
- **Chat with Goose**: persistent history sidebar, voice input/output (Chrome/Edge), photo
  upload analyzed by Gemini directly (no separate vision model needed).
- **No AI image generation** — Gemini's text/vision models don't generate images.
- **Mock exams**: first one free, then coin-gated. IT-placement exams (TCS, Accenture,
  Cognizant, Amazon, Google) run as a real two-round test — MCQs then a coding round — inside
  full-screen proctoring with camera/microphone monitoring. Always labeled as AI-generated
  practice, never real/leaked questions.
- **Email OTP verification** on registration, and OTP-based "Forgot password?" — both need real
  SMTP credentials in `server/.env` to actually send email (see below); until then, codes print
  to the server console so you can still test the flow.
- Assignments are visible to all students platform-wide (no per-class rosters yet).
- Live class links are shared URLs (Google Meet/Zoom/etc.) — no built-in video calling.

## Email OTP setup (registration + forgot password)
Fill in `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` in `server/.env`.
For Gmail: turn on 2FA on the account, then create an
[App Password](https://myaccount.google.com/apppasswords) — your normal Gmail password won't
work as `SMTP_PASS`. Until this is set, OTPs are printed to the server console (and returned as
`devOtp` in the API response) so registration and password reset still work for testing.

## Deployment
Since Gemini is a cloud API (not something running on your own machine), deployment is
straightforward — no special tunneling or self-hosting needed.

1. Push this repo to GitHub.
2. **Server**: deploy to [Render](https://render.com) (free tier available) or
   [Railway](https://railway.app). Root directory `server`, build command
   `npm install && npx prisma generate`, start command `npm start`. Add every var from
   `server/.env` in the platform's environment variable settings (never commit `.env` itself) —
   including a fresh `GEMINI_API_KEY`.
3. **Client**: deploy to [Vercel](https://vercel.com) or [Netlify](https://netlify.com). Root
   directory `client`, build command `npm run build`, output directory `dist`. Set `VITE_API_URL`
   to your deployed server's URL plus `/api` (e.g. `https://your-server.onrender.com/api`) —
   `client/src/services/api.js` already reads this at build time, no code change needed.
4. Your Neon database already lives in the cloud, so no change needed there. Run
   `npx prisma db push` once (from your local machine, pointed at the same `DATABASE_URL`) to
   make sure the schema is fully synced.

Gemini's free tier is rate-limited but plenty for a class project's traffic; enable billing on
the same Google Cloud project if you ever need higher limits.

## Project structure

```
studysphere-ai/
├── server/
│   ├── prisma/schema.prisma
│   └── src/
│       ├── routes/          # auth, ai, courses, chat, vision, coins, mockExams,
│       │                    # faculty, planner, pomodoro, cgpa, attendance, pdf
│       ├── middleware/auth.js
│       └── utils/           # aiClient (Gemini + callAIJson retry helper), promptTemplates
├── client/
│   └── src/
│       ├── data/courseCatalog.js
│       ├── pages/
│       │   ├── auth/        # StudentLogin, StudentRegister, FacultyLogin, FacultyRegister,
│       │   │                # ForgotPassword
│       │   ├── student/     # Dashboard, AIAssistant, Courses, ExamPaperGenerator,
│       │   │                # MockExams, Coins, Scores, AssignedQuizzes, Planner,
│       │   │                # Pomodoro, Cgpa, Attendance
│       │   ├── faculty/     # FacultyDashboard, Materials, Assignments, LiveClasses, Analytics
│       │   └── Landing.jsx
│       ├── components/
│       │   ├── auth/        # OtpStep
│       │   ├── courses/     # CodeSandbox, CodingAssessment, W3TryIt
│       │   ├── proctor/     # ProctorGuard (fullscreen + camera/mic monitoring)
│       │   ├── exam/        # RealExamRunner (MCQ palette + coding round)
│       │   ├── common/ layout/ landing/ ai/ flashcards/ quiz/
│       ├── routes/AppRoutes.jsx
│       └── services/api.js
└── docs/
```

## Troubleshooting
- **"Couldn't create your account"**: check `DATABASE_URL` in `server/.env`, and that
  `npx prisma db push` ran successfully.
- **"Goose couldn't generate that" / GEMINI_API_KEY errors**: make sure `GEMINI_API_KEY` is set
  in `server/.env` and is a current key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
  The error message now shows the real cause (invalid key, rate limit, etc.) instead of a
  generic failure.
- **404 on a page that should exist**: stop and restart `npm run dev` in `client`, then
  hard-refresh the browser (Ctrl+Shift+R).
- **PDF won't upload**: use "Paste text instead" — this appears automatically whenever PDF
  extraction fails.
- **OTP emails aren't arriving**: see "Email OTP setup" above — until SMTP is configured, codes
  only print to the server console.

## Security note
`server/.env` contains real database credentials and your Gemini API key. Don't commit it to a
public repo (already excluded via `.gitignore`), and rotate credentials if this project — or
its `.env` contents — is ever shared further.
