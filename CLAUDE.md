# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Local development
hugo serve          # Start dev server at http://localhost:1313
hugo serve -D       # Include draft content

# Production build
hugo --minify       # Output to ./public/

# Theme setup (first time or after clone)
git submodule update --init --recursive
```

**Hugo version**: Must use v0.110.0. Newer versions break compatibility.

## Architecture

This is a Hugo static site (personal portfolio/blog) using the [Toha](https://github.com/hugo-toha/toha) theme as a git submodule.

**Content model**: Most visible content is data-driven via YAML files in `data/sections/` (skills, experiences, education, projects, etc.), not markdown files. The `content/` directory holds markdown for pages like individual project writeups.

**Key directories**:
- `data/sections/` — YAML files powering homepage sections (about, skills, experiences, projects, etc.)
- `data/author.yaml` — Author profile info
- `content/projects/` — Individual project pages (markdown with YAML frontmatter)
- `assets/images/` — Image assets referenced in content
- `layouts/` — Custom Hugo template overrides (extends Toha theme)
- `static/` — Static files served as-is
- `themes/toha/` — Theme (git submodule, do not edit directly)

**Features configured in `config.yaml`**: Blog and notes sections are disabled (`enableBlogPost: false`, `enableNotes: false`). Portfolio is enabled. Dark mode uses `darkreader` provider.

**Deployment**: Push to `main` → GitHub Actions builds with Hugo v0.110.0 → deploys `./public/` to `gh-pages` branch. The workflow is in `.github/workflows/gh-pages.yml`.

**Mermaid diagrams**: Custom layout overrides in `layouts/` enable Mermaid rendering (not default in Toha).
