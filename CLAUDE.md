# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Raw static HTML/CSS — no build step, no framework, no dependencies to install.

Open `index.html` directly in a browser, or serve with any static file server:

```bash
python3 -m http.server
```

## Structure

- `index.html` — main single-page site (navbar, hero, about, projects, skills sections)
- `css/style.css` — all styles
- `images/` — image assets
- `projects/<name>/index.html` — individual project pages

## Deployment

Push to `main` → GitHub Actions deploys to GitHub Pages automatically.
