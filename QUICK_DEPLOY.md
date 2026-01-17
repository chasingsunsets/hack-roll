# Quick Deployment Guide

## TL;DR

1. Deploy backend to Render
2. Deploy frontend to Vercel
3. Update environment variables with each other's URLs

---

## 1. Deploy Backend (Render) - 5 minutes

### Sign up and deploy
1. Go to [render.com](https://render.com) → Sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Select your repository: `hack-roll`
4. Settings:
   - Name: `gofish-server`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**

### Add environment variables
5. Go to **"Environment"** tab
6. Add these variables:
   ```
   NODE_ENV = production
   PORT = 10000
   CLIENT_URL = (leave blank for now)
   ```

7. Click **"Create Web Service"**
8. Wait 2-3 minutes for deployment
9. **Copy your backend URL** (e.g., `https://gofish-server.onrender.com`)

---

## 2. Deploy Frontend (Vercel) - 3 minutes

### Sign up and deploy
1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your repository
4. Settings:
   - Framework: **Vite**
   - Root Directory: **./goFish2** (or leave as default if vercel.json is set)
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Add environment variable
5. Click **"Environment Variables"**
6. Add variable:
   ```
   Name: VITE_SERVER_URL
   Value: https://gofish-server.onrender.com (your Render URL from step 1.9)
   ```
7. Check all environments: Production, Preview, Development

8. Click **"Deploy"**
9. Wait 1-2 minutes
10. **Copy your frontend URL** (e.g., `https://your-app.vercel.app`)

---

## 3. Connect Frontend & Backend - 1 minute

### Update backend with frontend URL
1. Go back to **Render dashboard**
2. Click your `gofish-server` service
3. Go to **"Environment"** tab
4. Update `CLIENT_URL`:
   ```
   CLIENT_URL = https://your-app.vercel.app (your Vercel URL from step 2.10)
   ```
5. Click **"Save Changes"** - This will redeploy (30 seconds)

---

## 4. Test Your Deployment ✅

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. You should see the Go Fish game!
3. Create a room
4. Open another browser tab/device and join the room
5. Play the game!

---

## Troubleshooting

### Can't connect to server?
- Check that `VITE_SERVER_URL` in Vercel matches your Render URL **exactly**
- Make sure Render service is **running** (check dashboard)
- Visit `https://your-render-url.onrender.com/health` - should show `{"status":"ok"}`

### CORS errors?
- Ensure `CLIENT_URL` in Render matches your Vercel URL **exactly**
- Include `https://` and **no trailing slash**
- Redeploy backend after updating

### Camera not working?
- Make sure you're using **HTTPS** (Vercel/Render provide this automatically)
- Allow camera permissions in browser
- Use **Chrome or Edge** for best MediaPipe support

### Backend is slow?
- Free Render services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- This is normal for free tier!

---

## Your Deployment URLs

Save these for future reference:

```
Frontend: https://your-app.vercel.app
Backend: https://gofish-server.onrender.com
Health Check: https://gofish-server.onrender.com/health
```

---

## Future Updates

### Update frontend:
```bash
git add .
git commit -m "Update frontend"
git push
```
Vercel auto-deploys from `main` branch ✅

### Update backend:
```bash
git add .
git commit -m "Update backend"
git push
```
Render auto-deploys from `main` branch ✅

---

## Need more details?

See the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide for advanced configuration and troubleshooting.
