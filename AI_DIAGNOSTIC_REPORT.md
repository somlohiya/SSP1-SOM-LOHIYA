# AI Diagnostic Report — Sleek Syllabus Planner

**Date:** 2026-06-07  
**Status:** Infrastructure fixed; AI blocked by invalid API key format

---

## Root Causes Found

### 1. Environment variables not loaded (CRITICAL)
- `dotenv.config()` in `server/index.js` loaded `.env` from the **project root**, but `GEMINI_API_KEY` lives in **`server/.env`**.
- Server startup logged: `GEMINI_API_KEY is missing` even though the key existed in `server/.env`.
- **Impact:** All AI features silently failed or fell back to regex/non-AI logic.

### 2. Invalid GEMINI_API_KEY format (CRITICAL)
- Current key starts with `AQ.` — this is **not** a Google AI Studio key.
- Valid Gemini keys from [Google AI Studio](https://aistudio.google.com/app/apikey) start with **`AIza`**.
- **Impact:** Even after env fix, AI calls are rejected before reaching Gemini.

### 3. Stale server process
- An old server instance (without `/api/ai/health`) was still bound to port 5000 during testing.
- **Impact:** Route changes appeared missing until stale process was killed.

### 4. Frontend silent failures
- Quiz, notes, revision, and chat pages logged errors to console only — no user-visible feedback.
- `handleResponse()` in `lib/api.ts` ignored `error.message` from the backend.

---

## Fixes Applied

| File | Change |
|------|--------|
| `server/config/env.js` | **NEW** — loads `server/.env` reliably via `import.meta.url` path |
| `server/index.js` | Uses env config, request logging, `/api/ai` routes |
| `server/routes/ai.js` | **NEW** — `GET /api/ai/health` diagnostic endpoint |
| `server/services/aiService.js` | Model fallback, JSON parsing, stack-trace logging, study plan + recommendation AI |
| `server/routes/studyPlans.js` | AI session enrichment with algorithmic fallback |
| `server/routes/courses.js` | AI recommendations with rule-based fallback |
| `server/routes/syllabi.js` | Upload logging, `aiAnalyzed` flag in response |
| `server/routes/chat.js` | Request/response logging |
| `server/routes/quiz.js` | Request logging |
| `server/routes/notes.js` | Request logging |
| `server/routes/revision.js` | Request logging |
| `lib/api.ts` | `NEXT_PUBLIC_API_URL`, better error messages, `aiAPI.health()` |
| `app/chat/page.tsx` | User-visible error banner |
| `app/quiz/page.tsx` | User-visible error banner |
| `app/notes/page.tsx` | User-visible error banner |
| `app/revision/page.tsx` | User-visible error banner |
| `.env.example` | Documents `GEMINI_API_KEY` and `NEXT_PUBLIC_API_URL` |
| `server/scripts/test-ai.js` | **NEW** — `npm run test:ai` diagnostic suite |
| `package.json` | Added `test:ai` script |
| `server/.env` | Comment documenting required key format |

---

## AI Integration Map

| Feature | Frontend | API Route | AI Service Function |
|---------|----------|-----------|---------------------|
| Chat tutor | `app/chat/page.tsx` | `POST /api/chat/:id/messages` | `generateAIResponse` |
| Syllabus analysis | `app/upload/page.tsx` | `POST /api/syllabi/upload` | `extractTopicsWithAI` |
| Quiz generator | `app/quiz/page.tsx` | `POST /api/quiz/generate` | `generateQuiz` |
| Notes generator | `app/notes/page.tsx` | `POST /api/notes/generate` | `generateNotes` |
| Revision flashcards | `app/revision/page.tsx` | `POST /api/revision/generate` | `generateRevisionCards` |
| Study plan enrichment | `app/planner/page.tsx` | `POST /api/study-plans` | `generateStudyPlanSessions` |
| Course recommendations | `app/dashboard/page.tsx` | `GET /api/courses/recommendations` | `generateAIRecommendations` |
| Health check | — | `GET /api/ai/health` | `checkAIHealth` |

**Non-AI (rule-based):** Study plan base schedule (`generateStudySession`), analytics insights, dashboard static tips.

---

## Verification Results

### Infrastructure (PASS)
```
GET /health → { "status": "API is running" }
GET /api/ai/health → { "status": "error", "configured": true, "keyValid": false,
  "message": "GEMINI_API_KEY format is invalid (must start with AIza)" }
```
Server startup:
```
[ENV] Loaded server/.env from .../server/.env
[STARTUP] ❌ GEMINI_API_KEY format looks invalid...
```

### AI Features (BLOCKED — awaiting valid key)
`npm run test:ai` → **0/8 passed** — all fail with:
```
GEMINI_API_KEY is invalid. Get a valid key from https://aistudio.google.com/app/apikey (keys start with "AIza")
```

---

## Required Action to Enable AI

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create an API key (starts with `AIza`)
3. Replace the value in `server/.env`:
   ```
   GEMINI_API_KEY=AIzaSy...your_key_here
   ```
4. Restart the server: `npm run dev:server`
5. Verify: `npm run test:ai` (expect 8/8 pass)

### Expected sample output after valid key

**Chat** — Input: `"What is photosynthesis?"`  
Output: Educational bullet-point explanation about light energy → glucose.

**Syllabus** — Input: `"Unit 1: Algorithms. Unit 2: Sorting."`  
Output: `[{"name":"Algorithms","description":"...","weight":0.9}, ...]`

**Quiz** — Input: topic `"Photosynthesis"`, 3 questions  
Output: JSON array with mcq/tf/short questions + explanations.

---

## Remaining Issues

1. **User must supply a valid `AIza` Gemini API key** — cannot be fixed in code.
2. **Study planner** uses algorithmic scheduling as base; AI only enriches with `aiFocus` / `aiActivities` per session.
3. **Dashboard AI tips** (`AI_TIPS`, `AI_INSIGHTS`) are still static mock data — not wired to live AI.
4. **Profile page** `AI_SCORES` / `AI_INSIGHTS` are static — cosmetic only.
