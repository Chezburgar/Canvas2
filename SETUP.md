# Canvas2 — Setup Guide

Canvas2 is a static website (HTML/CSS/JS) that syncs your real Canvas data.
Because Canvas blocks websites from reading its API directly in the browser,
you set up one small free relay (a "Cloudflare Worker") **once**. After that,
just paste your Canvas token and everything works.

---

## Part 1 — Deploy the free proxy (one time, ~5 minutes)

You only do this once. It's free and needs no credit card.

1. Go to **https://dash.cloudflare.com** and sign up or log in.
2. In the left sidebar click **Workers & Pages** → **Create application** →
   **Create Worker**.
3. Name it something like `canvas2-proxy`, then click **Deploy**.
4. Click **Edit code**. Delete the sample code that's there.
5. Open **`cloudflare-worker.js`** from this project, copy the whole file,
   and paste it into the Cloudflare editor.
6. Click **Deploy**.
7. Copy your Worker URL at the top — it looks like:

   ```
   https://canvas2-proxy.YOUR-NAME.workers.dev
   ```

Keep that URL handy — you'll paste it into Canvas2 in Part 3.

---

## Part 2 — Get your Canvas Access Token

1. Open Canvas: **https://mcps.instructure.com**
2. Click your profile picture → **Account** → **Settings**.
3. Scroll to **Approved Integrations**.
4. Click **+ New Access Token**.
5. Purpose: type `Canvas2`. Leave the expiry blank (or set one if you prefer).
6. Click **Generate Token**.
7. **Copy the token now** — Canvas only shows it once.

---

## Part 3 — Connect Canvas2

On the Canvas2 login screen, fill in:

| Field          | What to enter                                            |
| -------------- | -------------------------------------------------------- |
| Canvas Domain  | `mcps.instructure.com` (already filled in)               |
| Access Token   | the token you copied in Part 2                           |
| Proxy URL      | your Worker URL from Part 1                              |

Click **Connect to Canvas**. Canvas2 will sync your courses, assignments,
grades, announcements, modules, and discussions.

---

## Frequently asked

**Is my token safe?**
Your token and proxy URL are stored only in your browser (localStorage) on
your own device. When syncing, the token travels to *your* Cloudflare Worker
and then to Canvas — nowhere else. The Worker never logs or saves it.

**Do I have to redo this on another computer?**
The token and proxy URL live in the browser, so on a new device you re-enter
them once. The proxy itself (Part 1) is done only a single time ever.

**The token expired or I regenerated it.**
Go to **Settings → Canvas Sync → Change Account / Token** in Canvas2 and
paste the new one. Your domain and proxy URL are remembered for you.

**I don't want to set up a proxy.**
Click **Try Demo Mode** on the login screen to explore Canvas2 with sample
data, themes, the agenda book, and the Grades button — no token needed.

---

## Hosting Canvas2 itself (GitHub Pages)

This repo is already a static site. To publish it:

1. Push to GitHub (already done on the working branch).
2. In the repo: **Settings → Pages**.
3. Source: **Deploy from a branch**, pick your branch, folder `/ (root)`.
4. Save. Your site appears at `https://YOUR-USERNAME.github.io/REPO-NAME/`.
