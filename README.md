# Atelier Detail — Mobile Car Detailing

A complete static demonstration website for a fictional automotive detailing business in Austin, Texas.

- Vercel: https://mobile-car-detailing-xi.vercel.app/
- GitHub Pages: https://vabdulhai-maker.github.io/mobile-car-detailing/

## Hosting

This repository contains ready-to-serve HTML, CSS, JavaScript, and images. It needs no Node server, package installation, build command, or serverless functions.

The included `vercel.json` explicitly configures static hosting:

| Setting | Value |
| --- | --- |
| Framework Preset | Other (`framework: null`) |
| Root Directory | Repository root |
| Build Command | Empty; skipped |
| Install Command | Empty; skipped |
| Output Directory | `.` |

Deploy the latest `main` commit. If an existing Vercel project does not automatically redeploy, select **Redeploy** for the latest commit in its dashboard. An older deployment retains the old server error until the replacement is deployed. Ensure the connected repository is `vabdulhai-maker/mobile-car-detailing` and the root directory is not set to a subfolder.

For GitHub Pages, use **Deploy from a branch → main → / (root)**. `.nojekyll` tells GitHub to serve the files directly.

For other hosts, upload the complete repository contents into the website's public folder. Keep the `assets/` folder alongside `index.html`.

## Open locally

Download and unzip the repository, then open `index.html` in your browser. Keep all files and the `assets/` folder together.

## Files

- `index.html`: homepage, sections, and booking dialogs.
- `style.css`: mobile-first styles.
- `assets/site.js`: browser-only navigation, pricing, gallery, contact form, and booking logic.
- `assets/*.webp`: optimized vehicle and service images.
- `assets/mark.svg`: favicon.
- `vercel.json`: static Vercel configuration.
- `ASSET-PROMPTS.md`: image provenance and prompts.

## Demo behavior

The business, prices, service areas, and contact details are fictional. Imagery is AI-created, and the finish comparison is simulated. No customer reviews have been fabricated.

Booking and contact forms save the latest submission in the visitor's browser only. Nothing is sent to a business, no appointment is confirmed, and no payment is collected. Saved information can be deleted from **Demo & privacy** in the footer.

## Validation

The website previously passed browser checks at 320, 360, 375, 390, 393, 412, 430, 768, and 1440 pixel widths. Real iOS and Android devices were not available. This static replacement preserves the website's design and interactions while removing the preview server and development tools from the deployed repository.
