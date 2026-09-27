# AGENTS.md — adrianbonpin/www

Project-specific instructions for AI agents working in this repository.

## What this is

Personal portfolio site for Adrian Bonpin. Astro 7 + Tailwind CSS v4, deployed on
Cloudflare. The resume PDF is generated at build time from the `src/data/*` modules.

## Git hosting: Gitea is canonical, GitHub is a mirror

This repo lives on a self-hosted **Gitea** instance and is **also mirrored to GitHub**.
Gitea is the primary home (review, PRs, issues); GitHub is kept in sync so it always
reflects the latest `prod`.

- **`origin`** → `https://git.ranio.xyz/adrianbonpin/www.git` (Gitea — canonical)
- **`github`** → `git@github.com:AdrianBonpin/www.git` (GitHub — mirror)

The default branch is **`prod`** on both remotes.

### Push workflow

Never commit directly to `prod`. Branch off `prod`, commit, push the branch, open a PR
on Gitea, squash-merge, then push `prod` to **both** remotes:

```sh
git checkout -b feat/my-change
# ... commit ...
git push -u origin feat/my-change
tea pr create --title "..." --description "..." --head feat/my-change --base prod
tea pr merge <index> -s squash
git checkout prod && git pull
git push origin prod        # Gitea (canonical)
git push github prod        # GitHub (mirror) — do NOT skip this
```

> **Always push to BOTH remotes.** A merge that only reaches Gitea leaves the GitHub
> mirror stale. Running `git push github prod` after the Gitea merge is part of the
> definition of done — do not report the change as shipped until both remotes have it.
> There is no CI/deploy watcher on GitHub here; the mirror is purely for visibility.

## Build & test

- `bun install`
- `bun run build` — generates the OG image + resume PDF, then builds the site
- `bun test` — full test suite (build smoke test + unit tests)
- `bun run dev` — local dev server

## Content data

Most site content is data-driven — edit these modules instead of the templates:

- `src/data/projects.ts`, `src/data/side-projects.ts`
- `src/data/certificates.ts` — hosted certificate PDFs live in `public/certificates/`
- `src/data/experience.ts`, `src/data/education.ts`, `src/data/skills.ts`
- `src/data/site-config.ts` — profile, email, and social links

## Link conventions

- Code links should point to **GitHub** (`https://github.com/AdrianBonpin/<repo>`),
  including the profile link in socials, footer, contact page, JSON-LD, and the resume.
- The **only** Gitea URL intentionally kept on the site is this repository's own clone
  URL in `README.md` (Gitea is the canonical home). The README also notes the GitHub mirror.
