# Money Budgeting (Demo)

Track expenses in seconds. See where your money goes, set budgets, organise bills, and get personal insights. All of it runs in the browser.

This is a **demo**: there is no database and no login. On the first visit the app creates sample data and saves it in that visitor's browser (localStorage). Each visitor gets their own copy, and nothing is sent to a server.

## Features

| Screen | What it does |
| --- | --- |
| **Home** | First-visit welcome guide, total balance, big "Add expense" / "Add income" buttons, how much is left to spend, where your money went, bills due soon (pay in one tap), a tip, recent activity, your wallets |
| **History** | Day / Week / Month views, previous and next buttons, search, money in/out filter. Tap an entry to edit or delete it (with Undo). When adding an entry (expense or income), pick **Others** and type a name such as "Allowance": it becomes its own category for next time. |
| **Money List** | One list per pot of money (On hand cash, bank, GCash…). Type `10000` to add, `-200` to spend (e.g. a T-shirt): every line shows the running balance after it, and each line also counts in History, totals and budgets. Shows **Balance**, **Set aside for budgets** and **Free to spend**. |
| **Budgets** | Monthly limit per category, green/amber/red progress, "you can spend ₱X a day", and alerts when you pass 80% or 100%. Pick **Others** to type your own name (e.g. "Pet food"); it becomes a category you can also use when adding entries. **Take the money from** a money list to set the budget amount aside from it. |
| **Bills** | Bills shown as tickets with due dates, Paid / Due soon / Overdue labels. "Mark paid" records the expense for you |
| **Insights** | Personal tips, money in vs. out for 6 months, emergency fund, spending calendar, what changed vs. the previous 30 days |
| **Add entry** | Type the amount, pick a category, done. Date (today) and wallet are filled in for you; tap "Change" to edit them |
| **Calculator** | Built-in calculator (top bar, or the calculator button inside the amount field). The amount field also accepts math like `120+85` |
| **Demo Mode / Empty State** | A switch at the bottom of the sidebar (top of the page on phones). Demo Mode shows sample data; Empty State is a clean start for your own entries. Each keeps its own data. Demo Mode has **Small** (1 month, 3 bills, 4 budgets), **Medium** (3 months, 5 bills, 6 budgets) and **Full** (6 months, 7 bills, 8 budgets) sample data. Questions like "Load Small?" open inside the app, so they also work in Messenger and Facebook browsers. **Reset demo** brings back fresh sample data; **Reset empty state** clears your entries. The sun/moon button switches light and dark mode. |
| **Settings** | Currency (₱ by default), light/dark theme, show the welcome guide again, and the same Demo / Empty switch |

Keyboard shortcuts on desktop: **N** = new record, **C** = calculator, **Esc** = close.

## Files

```
index.html            page structure; loads the css and js below
favicon.svg           browser tab icon
README.md             this guide

css/                  the design, loaded in this order
  tokens.css          colours, fonts, shadows (light + dark mode)
  base.css            page defaults and phone basics
  layout.css          sidebar, top bar, bottom tabs, card grid
  components.css      cards, buttons, forms, lists, charts, dialogs
  screens.css         Home, Budgets, Bills, Insights specifics
  responsive.css      tablet and phone layouts (keep last)

js/                   the logic, as small modules
  main.js             starts the app; handles clicks, forms, keys
  render.js           switches screens and redraws after changes
  config.js           categories, wallet types, currencies, menu
  store.js            sample data and saving to this browser
  queries.js          totals, budgets, bills, insights
  money.js            money formatting, math in amount fields, commas while typing
  utils.js            small helpers and dates
  icons.js            the drawn icon set
  components.js       shared pieces: charts, list rows, empty states
  theme.js            light / dark / system
  views/              one file per screen: home, history, money, budgets, bills, insights
  forms/              entry, moneylist, calculator, budget, bill, wallet, settings
  ui/                 dialogs (modal.js) and pop-up messages (toast.js)
```

No build step and no `npm install`. It is plain HTML, CSS, and JavaScript.
Amount fields add commas as you type (`1250000` becomes `1,250,000`), and still accept math like `1,200+850`.

## Run it on your computer

The code is split into JavaScript modules, which browsers only load from a web address
(double-clicking `index.html` shows a blank page). Start a tiny local server instead:

```bash
cd ~/moneybudegeting
python3 -m http.server 5173
```

Then open **http://localhost:5173**. Press **Ctrl + C** in Terminal to stop it.

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
3. Select `index.html`, `favicon.svg`, `README.md` **and** the `css` and `js` folders.
4. **Drag them into the GitHub upload box.**
   ⚠️ Drag what is *inside* `moneybudegeting`, not the `moneybudegeting` folder itself. `index.html` must sit at the top level of the repository, or Vercel will show a 404. The `css` and `js` folders keep their names and contents when you drag them in (use Chrome or Edge for folder uploads).
5. Scroll down. In **Commit changes**, type a message like `First upload`.
6. Click **Commit changes**.

You should now see `index.html`, `favicon.svg`, `README.md`, `css` and `js` in your repository. ✅

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

1. Edit the file on your computer (for example `css/tokens.css` to change a colour).
2. In your GitHub repository click **Add file ▾**, then **Upload files**.
3. Drag the changed file in. GitHub replaces the old one with the same name.
4. Click **Commit changes**.
5. Wait about 30 seconds, then refresh your Vercel link.

You can also edit directly on GitHub: open a file, click the ✏️ pencil icon, make the change, then **Commit changes**.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Vercel shows **404: NOT_FOUND** | `index.html` is inside a sub-folder in your repo. Re-upload the files themselves (not the folder), or in Vercel go to **Settings**, then **General**, and set **Root Directory** to that folder. |
| Page loads with no styling, or is blank | Make sure the `css` and `js` **folders** were uploaded with all their files, and that old `styles.css` / `app.js` files are no longer needed. |
| I want the sample data back | Switch to **Demo Mode**, then click **Reset demo**. |
| Changes don't show | Wait a minute, then hard-refresh (**Cmd + Shift + R** on Mac, **Ctrl + F5** on Windows). |
