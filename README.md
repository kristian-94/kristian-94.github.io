# Kristian's Portfolio Website

Personal portfolio website, hand-crafted with raw HTML/CSS.

Live at: https://kristian-94.github.io

## Stack

Raw static HTML/CSS — no build step, no framework, no dependencies to install.

## Local Development

```bash
python3 -m http.server
```

Then open http://localhost:8000.

## Structure

- `index.html` — main single-page site
- `css/style.css` — all styles
- `images/` — image assets
- `projects/<name>/index.html` — individual project pages

## Testing

```bash
npm test
```

Runs Playwright tests that check all pages load with no 404s or console errors.

## Deployment

Push to `main` → GitHub Actions deploys to GitHub Pages automatically.
