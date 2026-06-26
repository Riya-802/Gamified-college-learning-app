# Gamified College Learning App

This folder contains the React + Vite frontend for the Gamified College Learning App.

## What this app does

The frontend provides the student-facing experience for:
- authentication and profile access
- learning roadmap and XP/task completion
- leaderboard and badges
- mentorship requests and peer discovery
- real-time chat with Socket.IO

## Tech stack

- React 19
- Vite
- Socket.IO client
- Lucide React

## Run locally

1. Install dependencies
   ```bash
   npm install
   ```
2. Create a `.env` file in this folder with:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```
3. Start the development server
   ```bash
   npm run dev
   ```

The app will open on http://localhost:5173 by default.

## Useful scripts

- `npm run dev` — start the Vite development server
- `npm run build` — create a production build
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint

## Notes

- This frontend depends on the backend API running at `http://localhost:5000`.
- Real-time chat and live updates require the Socket.IO backend to be running as well.
