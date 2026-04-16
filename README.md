# Sage Flow - Smart Study Companion

**Your smart study companion**

Sage Flow is a comprehensive study management application designed to help students stay organized and productive. Built with React, TypeScript, Tailwind CSS, and powered by Firebase and Google Gemini AI. Whether you're juggling multiple subjects, preparing for exams, or trying to maintain a consistent study routine, Sage Flow has the tools you need to succeed.

## 🚀 Live Demo

**[View Live Demo](https://sage-flow-gamma.vercel.app)**

### Login Page
![Login](screenshots/loginpage.png)

### Dashboard Overview
![Dashboard](screenshots/overview.png)

## Features

### 🔐 Authentication
- Email/password signup with email verification
- Google OAuth sign-in popup
- Device-aware login — same account works across all devices
- Password reset via email

### ✅ Task Management
Create tasks with priority levels (Low, Medium, High), mark them complete, filter by status, and stay on top of everything you need to do.

![Tasks](screenshots/tasks.png)

### 📅 Study Planner
Add subjects with exam dates, break them into topics, and generate a smart study schedule. Powered by **Google Gemini AI** to suggest study hours per topic based on complexity and urgency.

- AI-powered schedule generation
- Manual schedule generation with round-robin distribution
- Drag and drop sessions between days
- Reschedule missed sessions automatically
- Print schedule for offline reference

![Study Planner](screenshots/studyplanner.png)

### 📝 MCQ Test Generator
Paste any study material and **Google Gemini AI** generates real multiple-choice questions with 4 options, correct answers, and explanations.

- AI-generated questions from any text
- Instant scoring and feedback
- Explanation for each answer
- Test history tracked in analytics

![Test Generator](screenshots/testgenerator.png)

### 🧠 Daily Aptitude Challenge
Every day a new AI-generated aptitude question appears as a popup when you open the app. Topics rotate daily (number series, probability, logical reasoning, etc.). Results are tracked in analytics.

- One question per day, same for all users
- 4 options with explanation after submission
- Persistent reminder banner until answered
- Performance tracked over time

### ⏱️ Pomodoro Timer
Stay focused with customizable work and break intervals. Tracks completed sessions and supports auto-start for the next session.

### 🎴 Flashcards
Create decks for different subjects, add question/answer cards, flip to review, and shuffle for varied practice.

![Flashcards](screenshots/flashcards.png)

### 📊 Analytics Dashboard
Visual charts showing task completion, priority breakdown, study hours by subject, test scores, and daily aptitude performance.

![Analytics](screenshots/analytics.png)

### ⚙️ Settings
Dark mode toggle, data export/import backup, and account deletion.

![Settings](screenshots/settings.png)

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18 + TypeScript |
| **Styling** | Tailwind CSS (no UI component library) |
| **Font** | Aparajita (self-hosted), Poppins (fallback) |
| **Routing** | React Router v6 |
| **Auth** | Firebase Authentication (Email + Google OAuth) |
| **Database** | Firebase Firestore |
| **AI** | Firebase AI Logic — Google Gemini 2.5 Flash |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Build Tool** | Vite |
| **State Management** | React Context API |
| **Data Persistence** | LocalStorage + Firestore |
| **Deployment** | Vercel (frontend) |
| **Notifications** | react-hot-toast |

## If you found this useful, please leave a ⭐
