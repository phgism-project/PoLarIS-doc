# PoLarIS Documentation Website

This repository contains a MkDocs Material documentation website prototype for PoLarIS.

## Local preview

```bash
pip install -r requirements.txt
mkdocs serve
```

Open the local URL printed by MkDocs.

## Build

```bash
mkdocs build
```

## Publish with GitHub Pages

1. Push this repository to GitHub.
2. Open repository settings.
3. Go to Pages.
4. Set the source to GitHub Actions.
5. Push to the `main` branch.

The workflow in `.github/workflows/deploy-docs.yml` will build and publish the site.
