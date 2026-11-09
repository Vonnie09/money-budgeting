# Money Manager (Demo)

Track expenses in seconds. See where your money goes, set budgets, organise bills, and get personal insights. All of it runs in the browser.

This is a **demo**: there is no database and no login. On the first visit the app creates sample data and saves it in that visitor's browser (localStorage). Each visitor gets their own copy, and nothing is sent to a server.

## Features

| Screen | What it does |
| --- | --- |
| **Home** | First-visit welcome guide, total balance, big "Add expense" / "Add income" buttons, how much is left to spend, where your money went, bills due soon (pay in one tap), a tip, recent activity, your wallets |
| **History** | Day / Week / Month views, previous and next buttons, search, money in/out filter. Tap an entry to edit or delete it (with Undo) |
| **Budgets** | Monthly limit per category, green/amber/red progress, "you can spend ₱X a day", and alerts when you pass 80% or 100% |
| **Bills** | Bills shown as tickets with due dates, Paid / Due soon / Overdue labels. "Mark paid" records the expense for you |
| **Insights** | Personal tips, money in vs. out for 6 months, emergency fund, spending calendar, what changed vs. the previous 30 days |
| **Add entry** | Type the amount, pick a category, done. Date (today) and wallet are filled in for you; tap "Change" to edit them |
| **Calculator** | Built-in calculator (top bar, or the calculator button inside the amount field). The amount field also accepts math like `120+85` |
| **Settings** | Currency (₱ by default), light/dark theme, show the welcome guide again, bring back sample data, start empty |

Keyboard shortcuts on desktop: **N** = new record, **C** = calculator, **Esc** = close.

## Files

```
index.html   page structure
styles.css   all the design (colours, layout, dark mode)
app.js       all the logic and sample data
favicon.svg  browser tab icon
README.md    this guide
```

No build step and no `npm install`. It is plain HTML, CSS, and JavaScript.

## Run it on your computer

Double-click `index.html` to open it in your browser. That's it.

---

# Step-by-step: upload to GitHub (no terminal)

### 1. Create a GitHub account
1. Go to **https://github.com** and click **Sign up**.
2. Follow the steps and verify your email.

### 2. Create a new repository
1. Once logged in, click the **+** in the top-right corner, then **New repository**.
2. **Repository name:** `money-budgeting` (any name works, no spaces).
3. Choose **Public**. Vercel's free plan works with private repos too, so either is fine.
4. **Do not** tick "Add a README file". We already have one.
5. Click **Create repository**.

### 3. Upload the files
1. On the new empty repository page, find the link **"uploading an existing file"** and click it.
   (Or go to the **Add file ▾** button, then **Upload files**.)
2. Open the `moneybudegeting` folder in Finder.
3. Select these 5 files: `index.html`, `styles.css`, `app.js`, `favicon.svg`, `README.md`.
4. **Drag them into the GitHub upload box.**
   ⚠️ Drag the **files**, not the folder. `index.html` must sit at the top level of the repository, or Vercel will show a 404.
5. Scroll down. In **Commit changes**, type a message like `First upload`.
6. Click **Commit changes**.

You should now see the 5 files listed in your repository. ✅

---

# Step-by-step: deploy on Vercel

### 1. Create a Vercel account
1. Go to **https://vercel.com** and click **Sign Up**.
2. Choose **Hobby** (free).
3. Choose **Continue with GitHub**, then allow Vercel to access your GitHub account.

### 2. Import your repository
1. On the Vercel dashboard click **Add New… ▾**, then **Project**.
2. Under **Import Git Repository**, find `money-budgeting` and click **Import**.
   - Don't see it? Click **Adjust GitHub App Permissions**, give Vercel access to that repository, and come back.

### 3. Configure and deploy
1. **Project Name:** keep it, or change it. This becomes your link, e.g. `money-budgeting-yourname.vercel.app`.
2. **Framework Preset:** choose **Other**.
3. **Root Directory:** leave as `./`.
4. **Build and Output Settings:** leave everything empty or default. No build command is needed.
5. Click **Deploy**.
6. Wait about 20–60 seconds. When you see the confetti 🎉, click **Continue to Dashboard**, then click the **Domains** link (`something.vercel.app`).

Your demo is live. Share that link with anyone.

---

# Updating the site later

Every time you change a file on GitHub, Vercel redeploys automatically.

1. Edit the file on your computer (for example `styles.css`).
2. In your GitHub repository click **Add file ▾**, then **Upload files**.
3. Drag the changed file in. GitHub replaces the old one with the same name.
4. Click **Commit changes**.
5. Wait about 30 seconds, then refresh your Vercel link.

You can also edit directly on GitHub: open a file, click the ✏️ pencil icon, make the change, then **Commit changes**.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Vercel shows **404: NOT_FOUND** | `index.html` is inside a sub-folder in your repo. Re-upload the files themselves (not the folder), or in Vercel go to **Settings**, then **General**, and set **Root Directory** to that folder. |
| Page loads with no styling | Make sure `styles.css` and `app.js` were uploaded with exactly those names (lower-case). |
| I want the sample data back | Open the app, click **Settings** (sliders icon), then **Reset sample data**. |
| Changes don't show | Wait a minute, then hard-refresh (**Cmd + Shift + R** on Mac, **Ctrl + F5** on Windows). |
