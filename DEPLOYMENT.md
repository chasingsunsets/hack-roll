# Deployment Guide

This guide will help you deploy your Go Fish game to production.

## Architecture

- **Frontend (goFish2)**: Vue.js app - Deploy to Vercel
- **Backend (server)**: Socket.IO server - Deploy to Render/Railway (requires persistent connections)

## Step 1: Deploy Backend to Render

Since Socket.IO requires persistent WebSocket connections, we'll deploy the backend to Render (free tier available).

### Option A: Deploy via Render Dashboard

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `gofish-server` (or your preferred name)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add environment variables:
   - Click "Environment" tab
   - Add: `CLIENT_URL` = `https://your-app.vercel.app` (you'll update this after deploying frontend)

6. Click "Create Web Service"
7. Wait for deployment to complete
8. Copy the service URL (e.g., `https://gofish-server.onrender.com`)

### Option B: Deploy via Render Blueprint (render.yaml)

1. Create `render.yaml` in project root (instructions below)
2. Push to GitHub
3. Go to Render Dashboard → "New +" → "Blueprint"
4. Connect repository and deploy

## Step 2: Deploy Frontend to Vercel

### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? `gofish` (or your preferred name)
   - In which directory is your code located? `./`
   - Want to override settings? **N**

5. Add environment variable:
   ```bash
   vercel env add VITE_SERVER_URL
   ```
   - Value: `https://gofish-server.onrender.com` (your Render backend URL)
   - Environment: Production

6. Redeploy to apply environment variable:
   ```bash
   vercel --prod
   ```

### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: Leave default (uses vercel.json)
   - **Output Directory**: Leave default (uses vercel.json)

5. Add environment variable:
   - Click "Environment Variables"
   - Add: `VITE_SERVER_URL` = `https://gofish-server.onrender.com` (your Render backend URL)

6. Click "Deploy"
7. Wait for deployment to complete
8. Copy the deployment URL (e.g., `https://gofish.vercel.app`)

## Step 3: Update Backend CORS

1. Go back to Render dashboard
2. Open your backend service
3. Go to "Environment" tab
4. Update `CLIENT_URL` to your Vercel URL (e.g., `https://gofish.vercel.app`)
5. Save changes (service will automatically redeploy)

## Alternative: Deploy Backend to Railway

If you prefer Railway over Render:

1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure:
   - **Root Directory**: `server`
   - **Start Command**: `npm start`
5. Add environment variable `CLIENT_URL` with your Vercel URL
6. Copy the generated domain
7. Use this domain as `VITE_SERVER_URL` in Vercel

## Troubleshooting

### Frontend can't connect to backend
- Verify `VITE_SERVER_URL` is set correctly in Vercel
- Check browser console for errors
- Ensure backend is running (check Render/Railway logs)

### CORS errors
- Verify `CLIENT_URL` matches your Vercel deployment URL exactly
- Make sure to include `https://` in the URL
- Check backend logs for CORS-related errors

### Socket.IO connection fails
- Ensure backend supports WebSocket connections (Render/Railway do, Vercel doesn't for persistent connections)
- Check firewall/network settings
- Verify Socket.IO versions match between client and server

## Local Development

1. Start backend:
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. Start frontend:
   ```bash
   cd goFish2
   npm install
   npm run dev
   ```

3. Open http://localhost:5173

## Production URLs

After deployment, update these URLs in your environment:

- **Frontend**: Your Vercel URL
- **Backend**: Your Render/Railway URL

Make sure both services have the correct environment variables pointing to each other!
