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
