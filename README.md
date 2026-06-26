# Gamified College Learning App

A full-stack learning platform designed to make college study more engaging through quests, XP, badges, mentorship, and real-time chat.

## Overview

This project combines:
- a React + Vite frontend for the student dashboard and gamified experience
- an Express + MongoDB backend for authentication, tasks, leaderboard, mentorship, and user progress
- Socket.IO for real-time chat and live updates

## Key Features

- Student authentication and profile management
- Learning roadmap with XP and task completion
- Badge and level progression system
- Leaderboard for motivation and competition
- Mentorship request flow for senior guidance
- Real-time chat and notifications

## Tech Stack

### Frontend
- React 19
- Vite
- Socket.IO client
- Lucide icons

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Redis
- Socket.IO
- JWT authentication
- Cloudinary / file handling support

## Project Structure

```text
backend/
  server.js
  src/
    app.js
    config/
    middleware/
    models/
    modules/
    socket/
frontend/
  src/
    components/
    App.jsx
```

## Prerequisites

Install the following before running the app:
- Node.js (v18 or newer)
- npm
- MongoDB instance
- Redis instance (optional for caching / real-time features)

## Environment Variables

Create a `.env` file in the `backend/` folder with values similar to:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/gamified-learning
JWT_SECRET=replace_with_a_secure_secret
REDIS_URL=redis://127.0.0.1:6379
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create a `.env` file in the `frontend/` folder with:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Getting Started

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Start the backend server

```bash
npm run dev
```

The API will run on:
- http://localhost:5000

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Start the frontend app

```bash
npm run dev
```

The UI will run on:
- http://localhost:5173

## Useful Commands

### Backend
- `npm run dev` — start development server with nodemon
- `npm start` — start production server

### Frontend
- `npm run dev` — start Vite development server
- `npm run build` — create production build
- `npm run preview` — preview the production build

## Notes

- The backend seeds default learning tasks automatically when the database is empty.
- The frontend relies on the backend API and Socket.IO connection to provide the full experience.

## License

This project is for educational and demo purposes.
