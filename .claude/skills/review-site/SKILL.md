---
name: review-site
description: Reviews pending KGas site changes by dispatching the code-reviewer and content-reviewer subagents in parallel, then consolidating their findings into one report. Use this whenever the user asks to review, check or sanity-check changes to this site — before a commit, before a publish, after editing src/, assets/ or build.mjs, or any time they ask "does this look right". Prefer it over a generic code review here, because the generic one does not know this repo's build contract, contrast rule, or the rule against inventing regulated gas-safety facts.
---

# Review the site

Two reviewers, run together: one for the code and build, one for the words.
They are separate agents because they fail differently — a broken build is
caught by running it, an invented Gas Safe number is caught only by someone
looking for it — and splitting them keeps the second from becoming item nine
on a code checklist, which is where it would be ignored.

## 1. Establish scope

Work out what is being reviewed before dispatching anything. In order of
preference:

- What the user named, if they named something.
- `git diff` against the upstream branch, if the branch has one.
- `git status --porcelain` plus `git diff HEAD` for uncommitted work.
- The whole of `src/` and `assets/`, if the tree is clean and the user
  asked for a general review.

Then resolve it to a concrete list of changed files. The subagents start
with no knowledge of this conversation, so a vague scope produces a vague
review — they need the file list, not a description of it.

## 2. Decide which reviewers to run

Both, by default. Run one alone only when the scope clearly excludes the
other:

| Changed | Reviewers |
| --- | --- |
| `build.mjs`, `assets/**`, `src/layouts/**` | code |
| `src/data/site.json`, page copy | content |
| `src/pages/**` | both — markup and wording live in the same file |
| Anything mixed, or unsure | both |

When in doubt run both. A reviewer that finds nothing costs a little time;
a review that skipped the one that mattered costs more.

## 3. Dispatch in parallel

Send both Agent calls in a single message so they run concurrently. Each
prompt needs to stand alone:

- the changed files, by path;
- the base ref the diff is against, so they can run `git diff` themselves;
- any specific worry the user raised;
- for a general review of a clean tree, say so — otherwise the agent will
  look for a diff that is not there and report confusion as a finding.

Use `subagent_type: "code-reviewer"` and `subagent_type: "content-reviewer"`.

## 4. Consolidate

Do not relay the two reports end to end. The user wants to know what to fix,
not which agent said what. Merge into one list:

1. **Blockers** — the build is stale, a CLAUDE.md convention is broken, an
   invented or unverified business fact, a fabricated review, a contrast
   pair that fails AA. These stop a commit or a publish.
2. **Worth fixing** — real but not urgent.
3. **Noted** — minor, take it or leave it.

Within each, most severe first, each with its `file:line`. Where both agents
flagged the same line, say it once.

Two things to carry through rather than smooth over:

**Facts the reviewers could not check.** Neither agent can confirm that a
phone number or registration number is the real one — they can only spot
values that look invented and placeholders that have quietly become
plausible. When the content reviewer flags a value for confirmation, pass
that to the user as a question, and do not let it disappear into a tidy
summary.

**Unresolved placeholders.** `node build.mjs` lists every outstanding
`TODO-` key. That list must be empty before any publish. If the user is
reviewing ahead of going live, state what is still outstanding even when
neither reviewer raised it, because an empty findings list and a
publish-ready site are not the same thing.

End with a clear verdict — clean, or N blockers — and say plainly when
nothing was found. Padding a clean review with minor observations buries the
real findings on the day there are some.
