---
description: How to deploy the Padel Tracker app to Vercel via GitHub
---

# Deploying to Vercel

Follow these steps to make your app public.

## 1. Prepare your Code
First, we need to save all your changes to git.

```bash
# Add all files
git add .

# Commit changes
git commit -m "Ready for deployment: Added Rankings, Dates, and UI improvements"
```

## 2. Create a GitHub Repository
1.  Go to [GitHub.com](https://github.com) and sign in.
2.  Click the **+** icon in the top right and select **New repository**.
3.  Name it `padel-tracker`.
4.  Make it **Public**.
5.  Click **Create repository**.

## 3. Push to GitHub
Copy the commands from the "…or push an existing repository from the command line" section on GitHub, or run this (replace `YOUR_USERNAME`):

```bash
git remote add origin https://github.com/YOUR_USERNAME/padel-tracker.git
git branch -M main
git push -u origin main
```

## 4. Deploy on Vercel
1.  Go to [Vercel.com](https://vercel.com) and sign in (you can use GitHub).
2.  Click **Add New...** -> **Project**.
3.  Select your `padel-tracker` repository and click **Import**.
4.  **Framework Preset**: It should auto-detect "Next.js".
5.  **Environment Variables**: You shouldn't need any for this app unless you added secrets.
6.  Click **Deploy**.

## 5. Done!
Vercel will build your app and give you a public URL (e.g., `padel-tracker.vercel.app`).
