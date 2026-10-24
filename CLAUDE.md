# KGas

Marketing website for KGas, a gas and plumbing services business.

## Stack

Static site: HTML5, CSS3, vanilla JavaScript, no framework and no runtime
dependencies. Pages are generated from `src/` by `build.mjs` — a ~190-line
Node script with no npm dependencies — and the generated HTML is committed,
so the deployed site is still plain files served as-is.

## Commands

| Task | Command |
| --- | --- |
| Build | `node build.mjs` |
| Verify | `node build.mjs --check` — exits 1 if output is stale |
| Run | `npx serve .` |
| Test | none yet (see Open questions) |

## Layout

**Edit `src/`. Never edit generated HTML — it is overwritten.**

```
src/data/site.json      every business fact, once
src/layouts/page.html   the shared shell (header, footer, head)
src/pages/**.html       JSON front matter + the <main> body only
build.mjs               renders src/pages -> repo root
```

Generated pages mirror `src/pages/` at the root. Assets in `assets/css/`,
`assets/js/`, `assets/img/` are hand-written, not generated.

Templating syntax, front matter and the rules for adding a page live in
`.claude/rules/templating.md`, which loads on demand when working on
`src/**` or `build.mjs`.

## Conventions

These are decided. Anything not listed here is an open question, not a
default to assume.

- `build.mjs` has **no npm dependencies** and must stay that way. No
  bundler, transpiler, preprocessor, off-the-shelf SSG or `package.json`
  dependency without asking first.
- No runtime dependencies — no CSS or JS library from a CDN or committed
  to the repo without asking first.
- Business facts live only in `src/data/site.json`; shared markup only in
  `src/layouts/page.html`. Never duplicate either into a page.
- Re-run `node build.mjs` after changing `src/`; commit the output too.
- One shared stylesheet, `assets/css/styles.css`. Do not add a second
  stylesheet or write inline `style` attributes. Design tokens are CSS
  custom properties on `:root`; use them rather than literal colours.
- One shared script, `assets/js/main.js`, loaded with `defer`.
- Icons are inline SVG with `currentColor` and `aria-hidden="true"`.
  No icon fonts, no image files for icons.
- British English throughout. Plain, direct copy — no superlatives and no
  marketing claims that are not verifiable facts.
- Commit only when asked.

## Brand

| Token | Value | Use |
| --- | --- | --- |
| `--navy` | `#0b2545` | Headers, footer, hero ground, headings |
| `--orange` | `#f26419` | Button and accent **backgrounds only** |
| `--orange-text` | `#c2410c` | Orange **wording** on a white ground |
| `--slate` | `#5e6c7f` | Secondary text |
| `--ink` | `#1f2a37` | Body text |

Typeface is the system font stack — no web fonts.

**Contrast rule.** White text on `--orange` is 3.2:1 and fails WCAG AA.
Orange buttons carry `--navy` text (4.9:1). Never pair white with
`--orange`, and never use `--orange` as a text colour on white.

## Domain facts

KGas sells gas and plumbing services. Content work on this site touches
details that are regulated or business-critical. Do not invent any of the
following — ask for the real value, or leave a clearly marked placeholder:

- Gas Safe registration number
- Phone numbers, email addresses, postal address
- Service area / covered postcodes
- Prices, callout rates, service plan terms
- Engineer names, qualifications, accreditations
- Any claim about response times, guarantees or certifications
- Customer reviews and testimonials. Do not write placeholder reviews even
  temporarily — invented quotes read as real and ship by accident.

A placeholder must be obviously fake (`TODO-GAS-SAFE-NUMBER`), never a
plausible-looking value. The build chips them automatically and lists
every unresolved key; that list must be empty before any publish.

**`site.json` currently holds SAMPLE data, not real values.** Every
placeholder was filled in deliberately so the site could be deployed
somewhere free and used to exercise tooling. Phone and email use reserved
ranges that cannot reach anyone (`07700 900707` is Ofcom's drama range,
`example.com` is RFC 2606). The registration number, company number, VAT
number, address and every price are invented and are *not* in reserved
ranges — they are plausible-looking by design, which is exactly the
failure mode the rule above warns about. Treat the whole file as unverified
until each value is confirmed. The file's own `_comment` says the same.

Facts live in grouped objects: `pricing`, `guarantees`, `response`, `team`,
plus the top-level business fields. A price or claim typed into a page body
rather than referenced as a token is a bug — that is how two contradictory
emergency rates once reached the site undetected.

## Repo status

Remote: `github.com/keeyani/KGas`, branch `main`. A `PostToolUse` hook logs
every Edit/Write to `.claude/logs/file-edits.log`.

One MCP server, project scope in `.mcp.json`: GitHub's remote server at
the **read-only** endpoint, authenticated from `$KGAS_GITHUB_TOKEN`. The
token is never stored in the repo. Do not switch it to a write endpoint,
and do not add another server, without asking.

## Open questions

Ask before deciding any of these — do not pick one and proceed.

- **Hosting target.** GitHub Pages, Cloudflare Pages, WordPress or other.
  Affects redirects and whether paths need a repo prefix. Blocking:
  `site.json`'s `domain` is still `https://kgas-demo.example`, which feeds
  the canonical tag and every JSON-LD `url` on all 14 pages and does not
  resolve.
- **Validation / test tooling.** `html-validate`, Lighthouse: neither adopted.
- **Browser support floor.** The CSS uses `clamp()`, `inset`, logical props.
- **Accessibility target.** WCAG level; pages so far are AA on contrast.
- **Logo.** Still a text wordmark; no image asset supplied. The footer
  carries a credential badge (shield icon, "Gas Safe Register", the
  registration number) built in brand colours — deliberately *not* the
  official Gas Safe mark, which is a trademark licensed only to registered
  businesses displaying their own number. Do not add the real logo while
  the registration number is sample data.
- **`--orange` as a foreground colour.** The brand table scopes it to
  backgrounds, but three places use it for icon strokes on navy
  (`.brand span`, `.hero-points svg`, `.gas-safe svg`). All pass contrast
  comfortably. Either the rule should permit icon use on navy, or all three
  should move to `--orange-text`.
- **Services index.** There is no `services/index.html`; the nav entry and
  every breadcrumb point at `services/boiler-installation.html`. Works, but
  "Services" lands on a specific sibling rather than a neutral index.

## Settled

Decisions already taken. Do not reopen without asking.

- **Contact form backend.** No form. `contact.html` offers phone, email and
  post only, which works on any host and adds no dependency. The homepage
  copy was reconciled to match.
- **Landlord certificates.** Confirmed: KGas does rental work.
  `services/landlord-certificates.html` is built and listed in `site.json`.
