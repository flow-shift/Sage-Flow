# Deployment Guide

## Backend on Render (with PostgreSQL)

### 1. Create PostgreSQL Database on Render
- Go to [render.com](https://render.com) → New → PostgreSQL
- Name: `sageflow-db`
- Copy the **Internal Database URL** (starts with `postgresql://`)

### 2. Deploy Backend on Render
- Go to Render → New → Web Service
- Connect your GitHub repo
- Settings:
  - **Name**: `sageflow-backend`
  - **Root Directory**: `backend`
  - **Build Command**: `npm install`
  - **Start Command**: `npm start`

### 3. Add Environment Variables in Render
```
DATABASE_URL=<paste-internal-database-url>
JWT_SECRET=your-random-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

### 4. Deploy
- Click "Create Web Service"
- Backend will be live at: `https://sageflow-backend.onrender.com`

---

## Frontend on Vercel

### 1. Deploy Frontend
- Go to [vercel.com](https://vercel.com) → New Project
- Import your GitHub repo
- Framework: Detect automatically (React/Vite)
- Root Directory: `./` or `src` (wherever your frontend is)

### 2. Add Environment Variable
```
VITE_API_URL=https://sageflow-backend.onrender.com/api/auth
```

### 3. Deploy
- Click "Deploy"
- Frontend will be live at: `https://your-project.vercel.app`

### 4. Update Backend FRONTEND_URL
- Go back to Render → sageflow-backend → Environment
- Update `FRONTEND_URL` to your Vercel URL
- Save and redeploy

---

## Local Development

1. Copy `.env.example` to `.env`
2. Update with your local PostgreSQL credentials
3. Run:
```bash
npm install
npm run dev
```
