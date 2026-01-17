# Vercel Configuration Guide

## Quick Fix for "Command exited with 1" Error

The error happens because Vercel needs to know which directory contains your frontend code.

## Step-by-Step Vercel Setup

### 1. Import Project
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Select your GitHub repository: `hack-roll`

### 2. Configure Root Directory (CRITICAL!)
**This is the most important step!**

On the project configuration page:

1. Look for **"Root Directory"** field
2. Click **"Edit"** button next to it
3. Type: `goFish2`
4. Click **"Continue"**

```
Root Directory: goFish2
               ^^^^^^^^
               This tells Vercel where your Vue app is!
```

### 3. Verify Auto-Detected Settings
After setting the root directory, Vercel should auto-detect:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**DO NOT change these!** They are auto-detected correctly.

### 4. Add Environment Variable
Scroll down to **"Environment Variables"** section:

1. Click **"Add"**
2. Enter:
   ```
   Key: VITE_SERVER_URL
   Value: https://your-render-url.onrender.com
   ```
3. Select: ✓ Production  ✓ Preview  ✓ Development
4. Click **"Add"**

### 5. Deploy
1. Click the **"Deploy"** button
2. Wait 1-2 minutes
3. Your app will be live!

---

## If You Already Deployed and Got Error

### Option 1: Redeploy with Correct Settings
1. Go to your project in Vercel dashboard
2. Click **"Settings"** tab
3. Click **"General"** in left sidebar
4. Scroll to **"Root Directory"**
5. Click **"Edit"**
6. Enter: `goFish2`
7. Click **"Save"**
8. Go to **"Deployments"** tab
9. Click **"Redeploy"** on latest deployment

### Option 2: Delete and Re-import
1. Settings → General → scroll to bottom
2. Click **"Delete Project"**
3. Confirm deletion
4. Start over with correct root directory

---

## Common Mistakes to Avoid

❌ **Wrong:**
- Leaving Root Directory blank
- Setting Root Directory to `.` or `./`
- Trying to use `cd goFish2` in build commands

✅ **Correct:**
- Root Directory: `goFish2` (exactly like this)
- Let Vercel auto-detect the framework
- Don't override build commands

---

## Your vercel.json File

Your `vercel.json` is now simple:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This only handles SPA routing. All other config is done in the Vercel dashboard!

---

## Visual Checklist

When configuring in Vercel, you should see:

```
┌─────────────────────────────────────────┐
│ Configure Project                        │
├─────────────────────────────────────────┤
│                                          │
│ Root Directory: goFish2        [Edit]   │
│                                          │
│ Framework Preset: Vite                   │
│ Build Command: npm run build             │
│ Output Directory: dist                   │
│ Install Command: npm install             │
│                                          │
│ Environment Variables:                   │
│ ┌────────────────────────────────────┐  │
│ │ VITE_SERVER_URL                     │  │
│ │ https://gofish-server.onrender.com  │  │
│ │ ✓ Production ✓ Preview ✓ Development│  │
│ └────────────────────────────────────┘  │
│                                          │
│                    [Deploy]              │
└─────────────────────────────────────────┘
```

---

## Need Help?

If you're still getting errors:

1. **Check the deployment logs:**
   - Vercel Dashboard → Your Project → Deployments
   - Click on the failed deployment
   - Read the build logs

2. **Common error messages:**
   - "Cannot find module" → Wrong root directory
   - "Command exited with 1" → Wrong root directory or missing dependencies
   - "ENOENT: no such file" → Wrong root directory

3. **The fix is almost always:**
   - Set Root Directory to `goFish2`
   - Let Vercel auto-detect everything else

---

## Success!

When deployment succeeds, you'll see:

```
✓ Build completed
✓ Deployment ready
🎉 https://your-app.vercel.app
```

Visit your URL and your Go Fish game should load!
