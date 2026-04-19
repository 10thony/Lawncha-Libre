# Transparent Image Loading Guide

Use this approach for logos and brand marks with transparent backgrounds.

## 1) Use a file with real alpha transparency
- Preferred formats: `SVG`, `PNG-32`, `WebP` with alpha, or `AVIF` with alpha.
- Do **not** use `JPG` for transparency.
- Validate the file has an alpha channel before shipping.

## 2) Keep transparent assets in `public/`
- Store final files in `public/` for stable URLs.
- Example: `public/atheca-logo-transparent.png`.
- Reference with root-relative URLs in UI: `src="/atheca-logo-transparent.png"`.

## 3) Do not try to fix transparency in CSS
- CSS cannot create transparency if the source image has no alpha channel.
- `background: transparent` only affects container backgrounds, not image pixels.

## 4) Recommended rendering settings for logos
- Use `object-contain` to preserve aspect ratio.
- Keep natural image edges and avoid forced crops/stretching.
- Add explicit `alt` text and size classes for predictable layout.

## 5) Quick verification checklist
- Place the logo over light and dark backgrounds.
- Confirm there is no checkerboard or matte halo.
- Confirm file type and alpha support before commit.
