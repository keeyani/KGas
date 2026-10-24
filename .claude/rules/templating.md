---
paths:
  - "src/**"
  - "build.mjs"
---

# KGas templating

Loads only when working on the site sources or the build script.

## Pipeline

`build.mjs` renders `src/pages/**.html` into the repository root, wrapping
each page in `src/layouts/page.html` and substituting values from
`src/data/site.json`. No npm dependencies. Generated HTML is committed.

```
src/data/site.json      every business fact, once
src/layouts/page.html   the shared shell (header, footer, head)
src/pages/**.html       JSON front matter + the <main> body only
```

Edit `src/`. Never edit generated HTML — it is overwritten on next build.

## Tokens

| Token | Behaviour |
| --- | --- |
| `{{site.x}}` | Value from `site.json`, HTML-escaped. A `TODO-` value is auto-wrapped in a visible `.todo` chip. |
| `{{raw:site.x}}` | Same, minus the chip. For attributes and URLs. **Still escaped** — nothing may inject markup. |
| `{{root}}` | `../` repeated to the page's depth. Use on every internal link. |
| `{{page.title}}`, `{{page.description}}`, `{{page.url}}` | From front matter; `url` drops a trailing `index.html`. |

Layout-only tokens, substituted before the page is rendered: `{{content}}`,
`{{nav}}`, `{{breadcrumb}}`, `{{jsonld}}`, `{{footerServices}}`,
`{{footerCompany}}`.

An unknown token is a **build error**, not a silent blank. So is a token
resolving to a non-string.

## Front matter

Opens and closes with `---` on its own line; the block between is JSON,
not YAML.

- Required: `title`, `description`, `section` (matches a `nav[].section`
  in `site.json`, which drives `aria-current`).
- Optional: `breadcrumb` — array of `{label, href}`, last entry omits
  `href` and renders as the current page.
- Optional: `jsonld` — array of schema.org objects, each emitted as its
  own `<script type="application/ld+json">`. Tokens resolve inside it and
  render raw (no chips) because it is machine-read; the build parses each
  block and fails rather than emit broken structured data.

Only mark up FAQ questions in `jsonld` that the page actually answers. A
question whose answer is still a `TODO-` placeholder must be left out —
marking up an unanswered question misrepresents the page.

## Rules

- Business facts live only in `src/data/site.json`. Typing a phone number,
  registration number, price or service area into a page means it belongs
  in the data file.
- Shared markup lives only in `src/layouts/page.html`. Never duplicate
  header, footer or nav into a page body.
- A page body contains the contents of `<main>` only — no `<html>`,
  `<head>`, `<header>` or `<footer>`.
- Every internal link is prefixed `{{root}}`.
- `build.mjs` stays dependency-free. No bundler, transpiler, preprocessor,
  off-the-shelf SSG, or `package.json` dependency without asking first.
- After changing `src/`, run `node build.mjs` and commit the output too.
  `node build.mjs --check` exits 1 if the committed HTML is stale.

## Adding a page

1. Create `src/pages/<path>.html` with front matter and a `<main>` body.
2. Add it to `nav`, `services` or `company` in `site.json` if it should
   appear in navigation.
3. Run `node build.mjs`.
