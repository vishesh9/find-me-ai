# Find AI

Measure how your brand ranks when people ask AI assistants for recommendations. Add your brand and competitors, run real prompts (e.g. “What are the best project management tools?”), and see who the model mentions—with a leaderboard, share of voice, and per-prompt breakdown.

## What it does

- **Run prompts** through Gemini with your brand and competitors in mind
- **Analyze responses** for mentions, position, and first-paragraph presence
- **Leaderboard** — aggregated visibility score and share of voice across all runs
- **Prompt breakdown** — how each brand scores for each query
- **Raw log** — full model responses for inspection

## Prerequisites

- **Node.js** (v18+)
- **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey)

## Run locally

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env`
   - Set `GEMINI_API_KEY` to your Gemini API key
   - Optionally set `GEMINI_MODEL` (default: `gemini-2.5-flash`), `TEMPERATURE`, and `RUNS_PER_PROMPT`

3. **Start the app**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Start dev server (Express + Vite) |
| `npm run build`| Production build (Vite)        |
| `npm run preview` | Preview production build   |
| `npm run clean`| Remove `dist/`                 |
| `npm run lint` | TypeScript check (`tsc --noEmit`) |

## Tech

- **Frontend:** React, Vite, Tailwind CSS, Motion
- **Backend:** Express, SQLite (better-sqlite3), Google Gemini API
- **Data:** Responses and analysis stored in `visibility.db` (gitignored)
