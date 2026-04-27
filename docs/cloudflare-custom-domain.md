# Connect your Cloudflare app to your domain

This app is deployed as a **Cloudflare Worker with static assets** (Vite `dist/`), not as a separate “Pages” project. Your domain **`atheca.org`** is already on Cloudflare, which makes DNS simple.

## What you are connecting

- **Worker name:** e.g. `atheca` (what you see under **Workers & Pages**).
- **Default URL:** `https://<worker-name>.<subdomain>.workers.dev` (for quick testing only).
- **Custom hostname:** e.g. `app.atheca.org`, `home.atheca.org`, or `atheca.org` (apex).

If you already see a **route** like `home.atheca.org` on the Worker’s **Settings → Domains & routes**, that hostname is already bound to this deployment. Open that URL in a browser to confirm it loads the app.

## Add or change a custom domain

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Go to **Workers & Pages** and open your worker (e.g. **atheca**).
3. Open the **Settings** tab.
4. Under **Domains & routes**:
   - Use **Add** to attach another hostname, **or** edit the existing `home.atheca.org` (or add `www` / root) depending on what you want users to type.

Cloudflare will guide you to create the right **DNS** record in the `atheca.org` zone (often a **CNAME** to the workers target, or an **A/AAAA** + proxy for the apex, depending on the product flow shown in the UI).

**Important:** For a **static-assets-only** Worker, the dashboard may show that **variables and triggers** are not available on that worker. That is expected; it does not block custom domains.

### Critical: Worker “Variables” do not apply to this app

If you see **“Variables cannot be added to a Worker that only has static assets”**, that is the full story for **this** deployment: Cloudflare is **not** going to inject secrets or env into your Vite bundle at **runtime**. There is no place in the Worker UI to set `VITE_CONVEX_URL` for a static-assets worker.

**You must supply those values at `vite build` time**, then deploy the built `dist/`:

| Where to set `VITE_CONVEX_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, etc. | Works? |
|--------------------------------------------------------------------|--------|
| Cloudflare **Worker → Variables** (this project) | **No** (disabled for static-only) |
| **Git-connected build** (same place your `pnpm run build` runs) | **Yes** |
| **Local** `.env` / `.env.production` when you run `pnpm run build` + `wrangler deploy` | **Yes** |

Until the **built** JS contains those values, the app can sit on a **spinner forever** (Clerk never finishes loading, or Convex never returns data).

### Why this feels wrong but is how Vite works

Your app is **static files** (HTML + JS) uploaded to the edge. The browser downloads `index-*.js`; there is **no server** that fills in `VITE_CONVEX_URL` on each request. Vite has already **replaced** `import.meta.env.VITE_…` with **literal strings** when `vite build` ran. So “runtime” for those values really means **the last time you ran a production build**—not “when a user opens the page.”

Cloudflare **can** run code on the edge (a real Worker with a `main` script) that reads `env.MY_VAR` per request—but **this** project is **static assets only**, so that path does not apply to the React bundle. That is why Worker **Variables** are disabled and why dashboard “runtime” config does not patch your prebuilt JS.

### GitHub + Cloudflare: where the variables must go

- **For deployments that run `pnpm run build` on Cloudflare (automatic Git deploys):** set **`VITE_*` / `CONVEX_*` in the project’s [build] environment. In the dashboard, look for **Build** / **Settings → Environment variables** (or “Variables and secrets” scoped to **Build**, not only runtime)—wording changes, but the rule is: the variables must be **available in the same step that runs `vite build`**.

- **If the dashboard says “Manually deployed” (as when you use `wrangler deploy` from your PC):** Cloudflare did **not** run a cloud build. Whatever you set only for “Git builds” is **irrelevant** to that deploy. You must run `pnpm run build` on a machine that sees the vars (e.g. **`.env.production`** in the repo **locally**—**do not commit secrets**; use local file or CI secrets) and then deploy. To use Cloudflare’s build pipeline + env, trigger a **Git** deployment and avoid relying on manual wrangler for production unless you script env there too.

- **Optional — GitHub Actions instead:** if the build runs in GitHub, set **Repository secrets** and pass them into the `vite build` step (e.g. `env:` in the workflow, or a generated `.env` for the job only).

### `atheca.org` “not working” vs the domain

Buying the domain and attaching it in **Workers & Pages** is usually enough for DNS; **a week of propagation** is not the gating factor when both the zone and the worker live in the same Cloudflare account. If `atheca.org` **opens a page** but the app is stuck, it is the **app / bundle / Clerk**, not propagation. If the browser **cannot connect** (timeout, 52x), use **SSL/TLS** and **DNS** for that hostname in the `atheca.org` zone and the Worker’s **Custom domains** flow; avoid assuming “DNS propagation” when the custom domain is already **Active** in the dashboard.

## Troubleshooting: endless spinner (black page, loading ring)

In this codebase, the main route shows a spinner while **Clerk** is loading **or** (when signed in) while the **Convex** `profile` query is still `undefined` (`App.tsx`).

1. **Confirm the bundle has your keys** — In DevTools → **Network**, open the main `index-*.js` file → search for `clerk` / `convex.cloud` / your deployment name. If `VITE_*` were missing at build, the app misbehaves or never leaves loading.
2. **Clerk** — In the [Clerk dashboard](https://dashboard.clerk.com), add every public URL you use: `https://atheca.org`, `https://www.atheca.org` (if used), and `https://atheca.dev-jam0211.workers.dev` under **Allowed origins** / **Redirect URLs** as required by your setup.
3. **Convex** — Use the same production deployment URL you use locally (`https://….convex.cloud`).

Fix config, then run a **new** `pnpm run build` with env set and **redeploy** (Git or Wrangler), not a Worker “Variables” change.

## Troubleshooting: `atheca.org` does not open but `.workers.dev` does (or both fail)

- **DNS** (Cloudflare **DNS** for `atheca.org`): The hostname you attached to the worker must have the record Cloudflare expects (often **proxied** / orange cloud). Apex vs `www` need their own records or redirects.
- **SSL**: After adding a custom host, wait a few minutes for certificates; **525/526** often means origin/cert issues—follow Cloudflare’s status and docs for **Custom domains** on Workers.
- Prefer **Custom domains** / the guided **Add** flow for `atheca.org` so DNS + SSL are created together, rather than only a manual “route” if the UI offers both.

If `*.workers.dev` also spins forever, fix **build-time env and Clerk/Convex** first; the custom domain is secondary.

## After you change environment variables (how to “rebuild”)

Vite **bakes** `VITE_*` and `CONVEX_*` values into the JavaScript at **`vite build` time**. Changing variables in a dashboard does **not** change the site until you run a **new build** that includes those values, then deploy the new `dist/`.

### You can ignore “Upload static files to update your Worker”

The screen that says **“Upload static files to update your Worker”** (drag-and-drop folder upload) is only for **manually** replacing asset files. If you deploy from **Git** (or from your machine with Wrangler), you do **not** need to put anything there—and it is **not** the way to “rebuild after env changes” for a normal pipeline.

### If the project is connected to GitHub (recommended)

1. Set **`VITE_CONVEX_URL`**, **`CONVEX_URL`**, **`VITE_CLERK_PUBLISHABLE_KEY`**, etc. under the project’s **build** / **environment** settings (names must match what the build step sees).
2. Trigger a new deployment in one of these ways:
   - **Deployments** tab → open the latest deployment → **Retry deployment** (wording may vary), **or**
   - Push any commit to the connected branch (e.g. `main`), **or**
   - Use **Create deployment** if the UI offers a “deploy from branch” action.

The build log should show `pnpm run build` (or your build command) running with the updated variables.

### If you deploy from your computer

From the repo, with a `.env` or exported vars:

```bash
pnpm run build
pnpm exec wrangler deploy
```

(Use the same flow you used for the first successful deploy.)

## DNS (zone `atheca.org` is on Cloudflare)

- **Subdomain (recommended):** e.g. `app.atheca.org`  
  - In **DNS** for `atheca.org`, you usually add a **CNAME** (or use the record Cloudflare creates when you “Add custom domain” from the Worker). **Proxy** (orange cloud) should be **on** for HTTPS and edge routing.

- **Apex** `atheca.org`:  
  - Use the **Add custom domain** flow from the Worker; Cloudflare can set up the correct records (often CNAME flattening or the records they document for Workers custom domains). Avoid guessing A records unless the wizard tells you the values.

After DNS propagates (often minutes), the site should load on your custom URL.

## Optional: use a single canonical host

If you have both `home.atheca.org` and `app.atheca.org`, pick one as canonical and add redirects in Cloudflare (Redirect Rules) or in your app so users and SEO are not split.

## App config after you pick a public URL

Update any place that expects your site’s **origin**:

| Where | What to set |
|--------|-------------|
| **Clerk** | Allowed origins, redirect URLs, and sign-in URLs for `https://your-chosen-hostname` |
| **Convex** (if you use site URL in config) | Production URL to match the same hostname |
| **UploadThing** / other callbacks | Callback / app URL to the same hostname |

Redeploy the frontend if you only changed **build-time** `VITE_*` variables; changing dashboard URLs for Clerk does not require a new build by itself.

## Quick checks

- **Visit** the custom URL from the Worker’s **Visit** action or type it in the browser.
- If you see **525/526** or SSL errors, wait for certificate provisioning (can take a few minutes after adding the domain) or confirm the hostname is **proxied** through Cloudflare as instructed.
- If the app loads but auth fails, the production URL in **Clerk** (and any OAuth apps) is almost always the missing piece.

---

*Last aligned with: Worker + static assets on `atheca.org` and routes like `home.atheca.org`.*
