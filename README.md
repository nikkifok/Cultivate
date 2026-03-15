# 🍃 CultivATE

A minimal food journal built around the idea that tracking what you eat shouldn't feel like a second job.

Most food tracking apps demand nutritional precision - macros, micros, portion weights down to the gram. CultivATE strips that back to the essentials: what you ate, roughly how much, and how many calories. That's it. No barcode scanner required, no guilt-tripping dashboards, no information overload.

---

## What it does

- Log meals across the day — breakfast, lunch, dinner, snacks, or breaking a fast
- Add food items with a name, rough amount, and calorie estimate
- Edit or delete individual items after logging
- Track your daily calories against a personal goal
- Flip between past days to review your history
- Data lives in your browser - private by default, no account needed

---

## What it deliberately doesn't do

- No macro tracking
- No barcode scanning or food databases
- No streaks, scores, or gamification
- No notifications
- No syncing across devices

---

## Running locally
```bash
npm install
npm run dev
# Open http://localhost:5173
```

---

## Deploying to Vercel

### Via terminal
```bash
npm install
npm install -g vercel
vercel
# Follow the prompts — accept all defaults
# You'll get a live URL at the end
```

### Via GitHub

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and log in with GitHub
3. Click **Add New Project** → select your repository
4. Vercel auto-detects Vite — click **Deploy**
5. Any future push to `main` automatically redeploys

---

## Data & privacy

All data is stored in your browser's `localStorage`. Nothing is sent to a server. There are no accounts, no tracking, no ads.

The trade-off is that data is tied to the browser and device you use. Clearing your browser's site data will wipe the journal. If you want to back up your entries, export is on the roadmap.

---

## Stack

- React 18
- Vite
- No UI library — all styles are hand-written
- localStorage for persistence