# Ketryx Projects overview (board O prototype)

React + TypeScript + Vite rebuild of `board-O.dc.html` from Claude Design, following `HANDOFF.md`.

```bash
npm install
npm run dev   # http://localhost:5173
```

- `src/data.ts`: the 14 sample projects, status and folder metadata, status/readiness rules
- `src/model.ts`: filtering (status tab, search), sorting and grouping (status or folder)
- `src/components/`: sidebar, toolbar, project table, readiness rings, status glyph, AI panel
- `src/styles.css`: design tokens as CSS variables on `:root`, plus all component styles

Interactive: status tabs, search, sort, Group by, collapsible groups, project phase accordions, favorites, row actions menu (delete, archive, copy link),
New folder and Create project modals, folder pages (`#/projects/folders/<id>`), collapsible sidebar, AI assistant panel.
Placeholders: other nav links, Manage connections, Learn & Assist. Nothing is saved; a refresh resets the data.

## Publishing (GitHub Pages)

`.github/workflows/deploy.yml` builds the site and publishes it to GitHub Pages on every push to `main`.
One-time setup in the GitHub repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
The site is then served at `https://<username>.github.io/<repo-name>/`.
