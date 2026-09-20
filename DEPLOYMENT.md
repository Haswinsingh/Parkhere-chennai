# PARKHERE — Vercel Deployment Guide

This guide details the exact steps to deploy both the **Frontend** and **Backend** of ParkHere on **Vercel**.

---

## 🏗️ Architecture Overview on Vercel

```
[ Your Users' Browsers ]
       │
       ├───► FRONTEND: https://parkhere-app.vercel.app (Vite React SPA)
       │
       └───► BACKEND:  https://parkhere-api.vercel.app (Express Serverless Function)
                             │
                             └───► DATABASE: MongoDB Atlas Cluster (Connected)
```

Because ParkHere is organized as a clean monorepo (`frontend/` and `backend/`), the recommended and standard Vercel approach is to create **two separate projects in your Vercel Dashboard** from the same GitHub repository:
1. **`parkhere-api`** (Root directory: `backend`)
2. **`parkhere-web`** (Root directory: `frontend`)

---

## 📋 Pre-Deployment Checklist

1. Push your project to a GitHub repository (e.g. `github.com/your-username/parkhere`).
2. Have your MongoDB Atlas connection string ready (already configured in `backend/.env`).
3. Have a free [Vercel Account](https://vercel.com).

---

## 🚀 STEP 1: Deploy the Backend API on Vercel

1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **"Add New..."** ➔ **"Project"**.
3. Import your **`parkhere`** GitHub repository.
4. In the configuration screen:
   - **Project Name**: `parkhere-api` (or any name you choose)
   - **Framework Preset**: Choose **Other**
   - **Root Directory**: Click *Edit* and select **`backend`**
5. Expand **Environment Variables** and add the following:

   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Production environment flag |
   | `MONGODB_URI` | `mongodb://haswinsinghak_db_user:WSp8ykOFZMiE2HEs@ac-1etuyhd-shard-00-00.lbvdrxv.mongodb.net:27017,ac-1etuyhd-shard-00-01.lbvdrxv.mongodb.net:27017,ac-1etuyhd-shard-00-02.lbvdrxv.mongodb.net:27017/parkhere?ssl=true&replicaSet=atlas-6nlcw3-shard-0&authSource=admin&appName=Cluster0` | Your live Atlas cluster |
   | `JWT_SECRET` | `super_secret_jwt_key_parkhere_production_2026_secure` | Any random 32+ character secure secret |
   | `JWT_EXPIRES_IN` | `30d` | Token session duration |
   | `FRONTEND_URL` | `*` (or your frontend Vercel URL once deployed) | Allowed CORS origin |

6. Click **Deploy**.
7. Once deployed, note down your Backend URL (e.g. `https://parkhere-api.vercel.app`).
8. Test the health endpoint in your browser:
   ```
   https://parkhere-api.vercel.app/api/health
   ```
   It should return: `{"status":"healthy", "service":"ParkHere Backend Production API"}`.

---

## 🎨 STEP 2: Deploy the Frontend on Vercel

1. Return to your [Vercel Dashboard](https://vercel.com).
2. Click **"Add New..."** ➔ **"Project"**.
3. Select the **same `parkhere` repository** again.
4. In the configuration screen:
   - **Project Name**: `parkhere-web` (or any name you choose)
   - **Framework Preset**: Vercel will automatically detect **Vite**
   - **Root Directory**: Click *Edit* and select **`frontend`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:

   | Key | Value | Description |
   |---|---|---|
   | `VITE_API_URL` | `https://parkhere-api.vercel.app/api` | Point to your deployed Backend API URL from Step 1 with `/api` suffix |
   | `VITE_MAPTILER_API_KEY` | *(Optional)* | MapTiler key if using custom MapTiler satellite tiles |

6. Click **Deploy**.
7. Once deployment finishes, click on your live production URL (e.g. `https://parkhere-web.vercel.app`).

---

## 🔄 STEP 3: Link Backend CORS to Frontend

1. Go back to your **`parkhere-api`** project in the Vercel Dashboard.
2. Go to **Settings** ➔ **Environment Variables**.
3. Update `FRONTEND_URL` to your exact frontend domain:
   ```
   FRONTEND_URL = https://parkhere-web.vercel.app
   ```
4. Click **Redeploy** on the latest backend deployment to apply the updated environment variable.

---

## ⚙️ How Everything Works in Production

### 1. SPA Route Rewrites (`frontend/vercel.json`)
The `frontend/vercel.json` ensures that deep URLs (like `/parking-needed/map`, `/signin`, `/parking-holder/create`) resolve to `index.html` without showing a `404: NOT_FOUND` error on page refresh.

### 2. Serverless Express Runtime (`backend/vercel.json`)
The `backend/vercel.json` tells Vercel to route all incoming HTTP traffic through `@vercel/node` to your compiled Express serverless entrypoint.

### 3. Database Connection Pooling
`backend/src/config/db.ts` reuses existing Mongoose connections across serverless warm invocations, preventing duplicate connection overhead to MongoDB Atlas.

### 4. File Uploads in Serverless
On Vercel, the local filesystem is read-only except `/tmp`. The app automatically routes uploads to `/tmp/uploads` on Vercel (`process.env.VERCEL === '1'`). For long-term permanent storage of vehicle inspection and ID photos across serverless cold boots, configuring S3 or Cloudinary is recommended.
