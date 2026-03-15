# 🍃 CultivATE — food journal

A minimal, beautiful calorie & food journal. Data is stored in your browser's localStorage — private to you, no account needed.

---

## Deploy to Vercel (5 minutes)

### Option A — GitHub (recommended, easiest updates)

1. **Create a GitHub account** at github.com if you don't have one

2. **Create a new repository** — click the `+` in the top right → "New repository"
   - Name it `cultivate` (or anything you like)
   - Keep it Public or Private, your choice
   - Click "Create repository"

3. **Upload the files** — on the new repo page, click "uploading an existing file"
   - Drag the entire `nourish` folder contents in (all files and the `src` folder)
   - Click "Commit changes"

4. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com) and sign up / log in with GitHub
   - Click "Add New Project"
   - Select your `cultivate` repository
   - Vercel will auto-detect Vite — just click **Deploy**
   - Done! You'll get a live URL like `nourish.vercel.app`

---

### Option B — Terminal (faster if you're comfortable)

```bash
# 1. Install dependencies
cd nourish
npm install

# 2. Test locally (optional)
npm run dev
# → open http://localhost:5173

# 3. Install Vercel CLI and deploy
npm install -g vercel
vercel
# Follow the prompts — accept all defaults
# You'll get a live URL at the end
```

---

## Local use only (no hosting)

```bash
npm install
npm run dev
# Open http://localhost:5173 in your browser
```

---

## About

- Data is saved in **localStorage** — it stays in your browser on the device you use
- No server, no account, no tracking
- To use on multiple devices, you'd need to export/import data (future feature)
