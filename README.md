# Capstone Project Marketplace

The Capstone Project Marketplace is an interactive list of MEng Projects hosted by UCB-affiliated advisors and External Organizations. This list component is curated and produced by the Fung Institute.

**Live site:** [jamesvdinh.github.io/capstone-marketplace-viz](https://jamesvdinh.github.io/capstone-marketplace-viz/)

---

## 📖 Table of Contents

1. [Quick Edits (No Coding Experience Needed)](#quick-edits)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Accounts & Access You'll Need](#accounts-access)
5. [Local Development Setup](#local-dev)
6. [How the Data Pipeline Works](#data-pipeline)
7. [Onboarding a New Sheet or Cohort](#onboarding-new-sheet)
8. [Editing Filters & Fields](#editing-filters-fields)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

<a id="quick-edits"></a>

## ✏️ Quick Edits (No Coding Experience Needed)

This section is for the two changes a non-technical intern is most likely to be asked for. Both are plain text/link edits in one file each — no understanding of the data pipeline required. Open the file, find the line described, edit the text between the quotes, save, and commit.

> [!WARNING]
> This is **not** where you change which Google Sheet the site pulls its *data* from — that's a bigger change covered in [Onboarding a New Sheet or Cohort](#onboarding-new-sheet). This section only covers the *visible* link/text shown to students on the page.

### Changing the "view the sheet" link shown to students

File: [`src/components/Hero.tsx`](src/components/Hero.tsx)

Near the bottom of the intro text, you'll see this block:

<details>
<summary>Show the current code</summary>

```tsx
<p>
  Jump in below or go here for the Google Sheets version:{" "}
  <Link
    href="https://docs.google.com/spreadsheets/d/1Nh4dJ6ZEqWIScWII1PBAqCHVhhOLEJPzbG8grpoBFag/edit?usp=sharing"
    target="_blank"
  >
    AY26-27 Project Marketplace Overview.
  </Link>
</p>
```

</details>

To point this at a new sheet (e.g. next year's cohort), replace the `href="..."` value with the new sheet's **share link** (Google Sheets → Share → Copy link), and update the visible label text ("AY26-27 Project Marketplace Overview.") to match the new cohort name.

> [!TIP]
> This only changes the *link shown to students* on the page. It does **not** change where the site's project data comes from — that's the Apps Script/Worker setup covered in [Onboarding a New Sheet or Cohort](#onboarding-new-sheet).

### Changing the welcome text / instructions (Hero section)

File: [`src/components/Hero.tsx`](src/components/Hero.tsx)

All of the paragraph text students see at the top of the page (the `<h1>` and the `<p>` tags inside the `TextContent` block) can be edited directly — it's just plain text/HTML, no logic involved. Keep the `<span className="font-bold">...</span>` wrappers if you want a phrase to stay bold.

### Changing the footer text/year

File: [`src/components/Footer.tsx`](src/components/Footer.tsx)

The line `UC Berkeley | Fung Institute for Engineering Leadership | College of Engineering | 2026-27` is plain text inside `<span>...</span>` — edit the year/text directly.

### After making any Quick Edit

1. Save the file.
2. Commit and push to `main` (or open a PR if your workflow requires review).
3. GitHub Actions automatically builds and deploys the site — see [Deployment](#deployment). No manual "publish" step needed.

---

<a id="key-features"></a>

## 💡 Key Features

- **Condensed project list** — clickable, optimized loading, title, advisor, keywords
- **Interactive bubble chart** — clickable, updates on project refresh
- **Search & filter options** — instant load, updates on project refresh

<a id="tech-stack"></a>

## 🔧 Tech Stack

- Language: **TypeScript**
- Runtime: **React + Vite**
  - **d3.js** — the keyword bubble chart
  - **styled-components** — all component styling
  - **react-hot-toast** — the "Projects up to date!" / error toasts
- Linting: **ESLint**
- CI/CD: **GitHub Actions**
- Hosting: **GitHub Pages** (via `gh-pages`)
- Data proxy/cache: **Cloudflare Workers**
- Data source: **Google Sheets + Google Apps Script**

---

<a id="accounts-access"></a>

## 🔑 Accounts & Access You'll Need

To fully maintain this project (not just edit text), get access to all four of these before you start:

| System | What it's for | What to ask for |
|---|---|---|
| **Google Workspace / Sheets** | The two source-of-truth spreadsheets and their bound Apps Script | Editor access to the "Project Marketplace" sheet and the Form Responses sheet, from the current maintainer or Fung Institute admin. You'll need editor (not just viewer) access to open **Extensions → Apps Script** and create deployments. |
| **GitHub** (`jamesvdinh/capstone-marketplace-viz`) | Source code, CI/CD | Write access (or fork + PR rights) to push to `main`, which auto-deploys |
| **Cloudflare** | The `capstone-marketplace-proxy` Worker that caches sheet data | Be added as a member of the Cloudflare account/dashboard that owns this Worker, so you can view logs and redeploy it when the Apps Script URLs change |
| **Node.js** (local dev only) | Running the app on your own machine | Install Node **22.x** (matches the version CI uses in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) |

You'll also want the [`wrangler`](https://developers.cloudflare.com/workers/wrangler/) CLI installed (`npm install -g wrangler`) if you'll ever need to redeploy the Cloudflare Worker — see [Onboarding a New Sheet or Cohort](#onboarding-new-sheet).

---

<a id="local-dev"></a>

## 💻 Local Development Setup

```bash
git clone git@github.com:jamesvdinh/capstone-marketplace-viz.git
cd capstone-marketplace-viz
npm install
npm run dev       # starts a local dev server on http://localhost:5174
```

Other useful scripts (see [`package.json`](package.json)):

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Type-checks (`tsc -b`) and builds the production bundle into `dist/` |
| `npm run lint` | Runs ESLint |
| `npm run preview` | Serves the production build locally, for a final sanity check |
| `npm run deploy` | Builds, then publishes `dist/` to the `gh-pages` branch — normally you don't need to run this yourself; see [Deployment](#deployment) |

> [!IMPORTANT]
> The local dev server still talks to the **live** production data endpoints (the Cloudflare Worker in front of the real Google Sheets) — there's no local mock data. Refreshing data locally hits the same shared cache everyone else does, so be mindful when testing.

---

<a id="data-pipeline"></a>

## 🔄 How the Data Pipeline Works

Before touching any ingestion code, understand the full path data takes, end to end.

<details>
<summary>📊 Full data-flow diagram (click to expand)</summary>

```text
┌─────────────────────┐     ┌─────────────────────┐
│ Project Marketplace  │     │  Form Responses      │
│ Google Sheet         │     │  Google Sheet         │
│ (source of truth for │     │  (source of truth for │
│  which projects      │     │   thumbnail, org type,│
│  exist)               │     │   industry, company   │
│                      │     │   size)               │
└──────────┬───────────┘     └──────────┬───────────┘
           │ bound Apps Script            │ bound Apps Script
           │ (Extensions → Apps Script)   │ (Extensions → Apps Script)
           │ deployed as a Web App        │ deployed as a Web App
           ▼                              ▼
   .../exec (JSON)                 .../exec (JSON)
           │                              │
           └──────────────┬───────────────┘
                          ▼
          Cloudflare Worker (cloudflare-worker/worker.js)
          - routes: GET /marketplace, GET /responses
          - edge-caches each for 5 min (CACHE_TTL_SECONDS)
          - adds CORS headers
                          │
                          ▼
              ProjectList.tsx (React app)
     - fetches both routes, caches raw rows in
       localStorage for 10 min (CACHE_EXPIRATION)
     - calls mergeProjectData() to join + parse
                          │
                          ▼
              dataParser.ts → Project[]
     (typed, camelCase, ready for the UI)
                          │
                          ▼
     FilterOptions.tsx (search/filter) → ProjectCard.tsx (display)
```

</details>

### The two sheets, and why there are two

- **Project Marketplace sheet** — the current source of truth for which projects exist. Deleting a row here removes the project from the site. Most fields come from here.
- **Form Responses sheet** — the original intake form log (append-only, rows are never reordered or deleted). Only four fields are still sourced from here: `thumbnail`, `organizationType`, `industries`, `companySize`. Everything else migrated to the Marketplace sheet.

They're joined by **Project ID** (see `mergeProjectData` in [`src/utils/dataParser.ts`](src/utils/dataParser.ts)):

- On the Marketplace sheet, the join key is the literal **"Project ID"** column value — never a computed row position, because deleting rows there desyncs row position from the real ID.
- On the Responses sheet, the join key is `project_id`, which the Apps Script derives from row position (safe there, since that sheet is append-only and rows are never deleted/reordered).

### Where each piece lives

| Layer | File | What to know |
|---|---|---|
| Apps Script (per sheet) | Lives inside the Google Sheet itself — open the sheet → **Extensions → Apps Script**. Not in this repo. | Exports each sheet's rows as JSON, keyed by the exact column header text in row 1 |
| Endpoint URLs | [`cloudflare-worker/worker.js`](cloudflare-worker/worker.js) → `UPSTREAMS` | Two Apps Script "web app" URLs (one per sheet) that the Worker proxies |
| Caching proxy | [`cloudflare-worker/worker.js`](cloudflare-worker/worker.js), [`cloudflare-worker/wrangler.toml`](cloudflare-worker/wrangler.toml) | Cloudflare Worker `capstone-marketplace-proxy`; edge-caches each upstream for `CACHE_TTL_SECONDS` (currently 300s / 5 min), independent of the browser's own cache |
| Fetching + browser cache | [`src/components/ProjectList.tsx`](src/components/ProjectList.tsx) | `WORKER_BASE_URL`, `MARKETPLACE_API_URL`, `RESPONSE_API_URL`; localStorage cache TTL is `CACHE_EXPIRATION` (10 min) |
| Parsing + joining | [`src/utils/dataParser.ts`](src/utils/dataParser.ts) | `mergeProjectData`, `parseProjectData`, `parseResponseJoinFields` |
| Thumbnail fallback images | [`src/utils/assignThumbnail.ts`](src/utils/assignThumbnail.ts) | Maps a UCB department code to a static fallback image if no thumbnail was uploaded |
| Types | [`src/types/project.ts`](src/types/project.ts) | The `Project` shape everything downstream (filters, cards) relies on |

> [!CAUTION]
> Don't remove or shorten the two caching layers without reading this: Apps Script has a low simultaneous-execution quota. A classroom of students all loading the site within the same minute could otherwise each fire their own request straight at Apps Script and trip that quota.
>
> - **Cloudflare Worker cache (5 min):** lets many concurrent visitors share one upstream fetch instead of each triggering their own.
> - **Browser localStorage cache (10 min):** only the **raw sheet rows** are cached, not the parsed `Project[]` — `mergeProjectData` re-runs on every load (even from cache), so a parsing-logic change (new field, a fixed regex, etc.) takes effect immediately without needing to bump the cache key or wait out the TTL.
> - Both caches can be bypassed by a user clicking **"Refresh Projects"** in the UI, which forces a fresh fetch straight from the Worker (still subject to the Worker's own 5-min edge cache).

---

<a id="onboarding-new-sheet"></a>

## 🧩 Onboarding a New Sheet or Cohort

This is the section to use whenever a new cohort's data needs to be wired in — whether it's a **copy of the same sheet with the same columns**, or a **new sheet with a different schema**. Figure out which case you're in first.

### Case A: A copy of the same sheet (same columns/schema)

Typical for "next year's cohort, same intake form." No parsing code changes needed — only the endpoint URLs and the visible sheet link change.

1. **Duplicate the sheet(s)** in Google Sheets (or point to wherever the new cohort's sheet already lives).
2. **Open the new sheet → Extensions → Apps Script.** If it was duplicated from the old sheet, the script usually comes along with it — verify it still has a `doGet()` that serves JSON.
3. **Deploy it as a Web App:** Apps Script editor → **Deploy → New deployment** → type **Web app** → Execute as **Me** → Who has access: **Anyone** → **Deploy**. Copy the generated `.../exec` URL.
   - Do this for **both** the Marketplace sheet and the Responses sheet if both changed.
4. **Update the Worker:** in [`cloudflare-worker/worker.js`](cloudflare-worker/worker.js), replace the old URL(s) in the `UPSTREAMS` object with the new `.../exec` URL(s):

   ```js
   const UPSTREAMS = {
     "/marketplace": "https://script.google.com/macros/s/NEW_ID_HERE/exec",
     "/responses": "https://script.google.com/macros/s/NEW_ID_HERE/exec",
   };
   ```

5. **Redeploy the Worker:**

   ```bash
   cd cloudflare-worker
   wrangler deploy
   ```

6. **Update the visible sheet link** in [`src/components/Hero.tsx`](src/components/Hero.tsx) — see [Quick Edits](#quick-edits).
7. Load the site with a forced refresh (or click "Refresh Projects") and confirm the new data appears correctly.

### Case B: A new/different schema (columns added, renamed, or removed)

Do everything in Case A, plus update the parsing/typing/UI code so the new columns actually reach the page. Work through this checklist in order — each step depends on the previous one:

1. **Confirm the Apps Script output.** Open the new sheet's `.../exec` URL directly in a browser — it should return a JSON array of objects, one per row, with keys matching the sheet's column headers exactly (whitespace and all).
2. **Update the type** in [`src/types/project.ts`](src/types/project.ts) — add/rename/remove a field on the `Project` type.
3. **Update parsing** in [`src/utils/dataParser.ts`](src/utils/dataParser.ts):
   - If the field comes from the **Marketplace sheet** and its header is exact and stable, read it directly: `marketplaceRow["Exact Column Header"]`, inside `parseProjectData`.
   - If the field comes from the **Response sheet** (headers there are long, form-generated, and can get re-wrapped), use `findValue(raw, /^Some Stable Prefix/i)` inside `parseResponseJoinFields` instead of an exact match.
   - If the field is a multi-select/checkbox field exported as a comma-joined string, check whether any of its options themselves contain commas (like the industry list) — if so, you need an explicit option list and greedy-longest-match, following the pattern of `INDUSTRY_OPTIONS` / `splitIndustries`, rather than a naive `.split(",")`. If not, `splitTags()` (splits on `;` or `,`) is enough.
   - Add the new field to the object returned by `parseProjectData` (or `mergeProjectData`'s output).
4. **Expose it as a filter, if it should be filterable** — see [Editing Filters & Fields](#editing-filters-fields) below.
5. **Display it on the card, if it should be visible** — edit [`src/components/ProjectCard.tsx`](src/components/ProjectCard.tsx).
6. **Run `npm run build`** locally — this type-checks everything (`tsc -b`), so a forgotten field or typo'd key will surface as a compile error before you ever deploy.
7. Follow steps 4–7 from Case A (Worker URLs, deploy, sheet link, verify).

> [!TIP]
> Step 6 is the safety net for this whole section — TypeScript will refuse to build if a field you renamed/removed is still referenced somewhere. Run it before you deploy anything, not after.

---

<a id="editing-filters-fields"></a>

## 🎛 Editing Filters & Fields

All filter UI lives in [`src/components/FilterOptions.tsx`](src/components/FilterOptions.tsx). There are two kinds of filter controls already built — reuse them rather than building a new one:

- **`MultiSelectFilter`** — a pill that opens a searchable checkbox panel (used for Advisor Department, Team Size, Industry, etc.). Options are usually derived automatically from the loaded projects (see the `useMemo` block that builds `advisorDepts`, `teamSizes`, `industries`, etc.), so no manual option list is needed unless the choices are fixed regardless of what's in the data (like `ORGANIZATION_TYPES`, which is hardcoded because it's only asked of external orgs on the intake form).
- **`TriStateSlider`** — an All/No/Yes slider (used for "US Citizenship Required").

### Adding a brand-new filter for an existing field

If the field already exists on `Project` (see [`src/types/project.ts`](src/types/project.ts)) and you just want it filterable:

1. Add a state variable for the selected value(s), e.g. `const [myFieldInput, setMyFieldInput] = useState<string[]>([]);`
2. If the options should be derived from the data, add a `Set` for it inside the existing `useMemo` block and populate it from `project.myField`.
3. Add the filtering logic inside the big `displayedProjects` `useMemo` — follow the pattern of the existing `if (someInput.length > 0) { filtered = filtered.filter(...) }` blocks.
4. Add the field to `useMemo`'s dependency array.
5. Render a `<MultiSelectFilter>` (or `<TriStateSlider>`) in the JSX, in either the main `FilterRow` or the `showMoreFilters` row (for secondary/external-org-only filters).
6. Add it to `handleReset()` so the "Reset" button clears it too.

### Adding a filter for a brand-new field

Do the [Onboarding a New Sheet or Cohort → Case B](#onboarding-new-sheet) steps first (type + parsing), then follow the steps above.

### Changing what's shown on a project card

Edit [`src/components/ProjectCard.tsx`](src/components/ProjectCard.tsx). Notable pieces:

- `getAffiliationChip` / `affiliationColors` — the colored department chip; add a new department code + color pair here if a new UCB department is added.
- `KeywordList` — handles wrapping/truncating keyword chips with a "+N" overflow tooltip; you generally don't need to touch this unless changing how many rows of chips are shown (`MAX_KEYWORD_LINES`).

### Changing the bubble chart

[`src/components/KeywordBubbleChart.tsx`](src/components/KeywordBubbleChart.tsx) builds its bubbles from `project.keywords` via `buildFrequencyMap` — it updates automatically as keyword data changes; no changes needed unless you're adding a new chart dimension entirely.

---

<a id="deployment"></a>

## 🚀 Deployment

Deployment is **automatic** — you should rarely need to do this by hand.

- **Site (GitHub Pages):** [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs on every push to `main`: installs dependencies, builds, and runs `npm run deploy` (which builds again via `predeploy` and publishes `dist/` to the `gh-pages` branch via the `gh-pages` npm package). GitHub Pages serves that branch. No secrets/manual steps needed beyond having push access to `main`.
- **Apps Script:** deployments are managed from inside each Google Sheet's Apps Script editor (**Deploy → Manage deployments**) — not from this repo or CI at all.

> [!IMPORTANT]
> The Cloudflare Worker is **not** auto-deployed by CI. Whenever `cloudflare-worker/worker.js` or `wrangler.toml` changes (new Apps Script URLs, cache TTL tweaks), you must run `wrangler deploy` from inside `cloudflare-worker/` yourself. Run `wrangler login` once first to authenticate with the Cloudflare account that owns `capstone-marketplace-proxy`.

---

<a id="troubleshooting"></a>

## 🐞 Troubleshooting

| Symptom | Likely cause | Where to look |
|---|---|---|
| "Failed to refresh projects: ..." toast | Apps Script URL changed/expired, or Apps Script quota tripped | `UPSTREAMS` in [`cloudflare-worker/worker.js`](cloudflare-worker/worker.js) — try opening the `.../exec` URLs directly in a browser |
| New sheet column doesn't show up anywhere | Parsing not updated | [Onboarding a New Sheet or Cohort → Case B](#onboarding-new-sheet) |
| Edited a sheet but the site still shows old data | Both the Worker (5 min) and browser localStorage (10 min) cache data | Click "Refresh Projects" in the UI, and/or wait out both TTLs; hard-refreshing the page does **not** bypass the localStorage cache — the "Refresh Projects" button does |
| A project disappeared from the list | It was deleted from the **Project Marketplace** sheet — this is by design (see [How the Data Pipeline Works](#data-pipeline)) | Check the Marketplace sheet, not the Responses sheet |
| Build fails after adding a field | TypeScript catching a missing/mistyped field | Run `npm run build` locally and read the type error — it'll point to the exact file/line |
| A thumbnail shows broken/blank | The uploaded file's Drive sharing isn't public, or the id couldn't be parsed | See `resolveThumbnail` in [`src/utils/dataParser.ts`](src/utils/dataParser.ts) |
