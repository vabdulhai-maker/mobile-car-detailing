# Atelier Detail — Mobile Car Detailing

A complete, mobile-first detailing demo for a fictional Austin, Texas business.

**Website:** https://vabdulhai-maker.github.io/mobile-car-detailing/

## Open the website

Use the website link above to see the actual website. The GitHub repository displays source files, not a rendered website.

To open a downloaded copy, unzip the complete repository and open `index.html`. Keep `style.css`, `app.js`, and the entire `assets/` folder alongside it. For a local web server, install Node.js 20 or later and run:

```sh
npm start
```

Then visit http://127.0.0.1:4173. No dependency installation or build step is needed to view or host the site.

## Hosting

The homepage is at the repository root. All asset references are relative, so the website supports GitHub Pages project URLs such as `/mobile-car-detailing/`.

GitHub Pages settings: **Deploy from a branch → main → / (root)**. The `.nojekyll` file allows GitHub Pages to serve the static files directly.

For other static hosting providers, select this repository's root directory as the publish directory and leave the build command empty. Upload `index.html`, `style.css`, `app.js`, and `assets/` together.

## Included

- Cinematic portrait hero and optimized WebP images.
- Mobile navigation and persistent booking controls.
- Service details and vehicle-sensitive package pricing.
- Seven-step booking flow with validation, add-ons, estimates, and downloadable summaries.
- Interactive finish comparison, expandable gallery, service areas, FAQs, and contact form.
- Keyboard accessibility, reduced-motion support, and mobile safe-area spacing.

## Demo limitations

Atelier Detail is fictional. Prices, contact details, and service areas are illustrative. Photos are AI-created; the finish comparison is simulated. There are no fabricated customer reviews.

Booking and contact forms save the latest submission in this browser only. No requests, appointments, calls, or payments are sent to a business. The footer's **Demo & privacy** dialog can delete saved demo information.

## Optional tests

```sh
npm install
npx playwright install chromium
npm start
```

With the server running, use another terminal:

```sh
npm run check
npm test
```

The browser tests cover 320, 360, 375, 390, 393, 412, 430, 768, and 1440 pixel widths, navigation, image loading, package pricing, every booking step, validation, back navigation, downloads, contact messages, and saved-data deletion. Reports and screenshots are saved under `qa/` and are excluded from Git.

To test a hosted copy, set `QA_URL` to its full URL. To use an existing Chrome installation, set `PLAYWRIGHT_CHROME_EXECUTABLE` to its executable path. Physical iOS/Android device testing is not included.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Website homepage, sections, and dialogs |
| `style.css` | Mobile-first styles |
| `app.js` | Navigation, pricing, forms, and booking flow |
| `assets/` | All website images and the favicon |
| `server.mjs` | Optional dependency-free local preview server |
| `package.json` | Preview and optional test commands |
| `qa.cjs` | Browser tests |
| `prepare-assets.cjs` | Optional image optimization helper |
| `ASSET-PROMPTS.md` | Image provenance and prompts |

The optimized images are already included. To regenerate them from replacement source images, install the optional dependencies and run `npm run prepare:assets -- path/to/hero.png path/to/services.png`.
