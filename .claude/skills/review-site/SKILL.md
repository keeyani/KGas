---
name: review-site
description: Reviews KGas site changes by dispatching the code-reviewer and content-reviewer subagents in parallel, then consolidating their findings into one report. Use this whenever the user asks to review a pull request on this repo — by number, by URL, or just "review the PR" — and also for reviewing uncommitted work before a commit, or for a full-site sweep before publishing. Prefer it over a generic code review here, because the generic one does not know this repo's build contract, contrast rule, or the rule against inventing regulated gas-safety facts.
---

# Review the site

Two reviewers, run together: one for the code and build, one for the words.
They are separate agents because they fail differently — a broken build is
caught by running it, an invented Gas Safe number is caught only by someone
looking for it — and splitting them keeps the second from becoming item nine
on a code checklist, which is where it would be ignored.

## Modes

Read the arguments first; they decide the scope.

| Invocation | Scope |
| --- | --- |
| `/review-site 12` | PR #12 |
| `/review-site https://github.com/keeyani/KGas/pull/12` | PR #12 |
| `/review-site` | The open PR for the current branch, else uncommitted work |
| `/review-site --full` | Every page and asset in the repo |

Options, combinable with any mode:

| Option | Effect |
| --- | --- |
| `--focus code` / `--focus content` | Run one reviewer instead of both |
| `--paths <glob>` | Restrict to matching files, e.g. `--paths 'src/pages/services/**'` |
| `--publish` | Treat every unresolved `TODO-` placeholder as a blocker |

`--publish` exists because the bar before going live is different from the
bar before merging: a PR full of placeholders is fine, a live site with them
is not. Outside that mode placeholders are reported as outstanding work, not
failures.

## PR mode

The point of reviewing a PR rather than the working tree is that you review
what is actually proposed, independent of whatever is checked out locally.
So do not read the local files and hope they match.

1. **Resolve the number.** From a bare number, or the trailing `/pull/<n>`
   of a URL. If neither is present and the current branch has an open PR,
   use that — `list_pull_requests` filtered by `head`.

2. **Fetch metadata** with `pull_request_read` (`method: "get"`): head SHA,
   base ref, title, state. Tell the user if the PR is closed, merged or a
   draft before reviewing it — it changes whether the review is worth acting
   on, and they may have given you the wrong number.

3. **Get the changed files** with `method: "get_files"`. This is the scope
   list, and it decides which reviewers to run.

4. **Check out the PR in an isolated worktree** so the build can actually be
   run against the proposed code without disturbing the user's checkout:

   ```
   git fetch origin pull/<n>/head
   git worktree add <scratchpad>/pr-<n> FETCH_HEAD
   ```

   This matters more than it looks. The code reviewer's single most valuable
   check is `node build.mjs --check`, which catches a PR whose generated HTML
   does not match its `src/` — and that check cannot be done by reading a
   diff. A worktree gets it without touching the working tree or the branch
   the user is on.

   Remove it when the review is finished: `git worktree remove <path>`.

5. **Compute the diff base** as `git merge-base <base sha> FETCH_HEAD`, so
   the review covers what the PR changes and not what `main` moved on to.

If the fetch fails — no network, or the token cannot reach the ref — fall
back to `pull_request_read` with `method: "get_diff"` and review the diff
alone. Say explicitly in the report that the build check did not run, because
a clean review that silently skipped the most important check is worse than
an honest partial one.

## Local mode

With no PR and no `--full`: `git diff` against upstream if the branch has
one, otherwise `git status --porcelain` plus `git diff HEAD` for uncommitted
work. Resolve to a concrete file list before dispatching.

## Full mode

`--full` reviews the repository as it stands rather than a change to it.
There is no diff, so say so in the agent prompts — otherwise an agent will
hunt for one and report its absence as a finding.

This mode is slower and noisier, and most useful before a publish or after a
long gap. Narrow it with `--paths` when the user has a specific area in mind.

## Dispatching

Send both Agent calls in a single message so they run concurrently. Each
prompt must stand alone — the subagents cannot see this conversation, so a
description of the scope is not a substitute for the scope itself:

- the working directory (the PR worktree path, or the repo root);
- the changed files, by path;
- the diff command to run, with the base already resolved to a SHA;
- for `--full`, that there is no diff and the whole tree is in scope;
- whether `--publish` is in effect;
- any specific worry the user raised.

**Anchor every read to that directory, in so many words.** An agent given a
worktree path will still reach for `CLAUDE.md`, `src/data/site.json` or
`.claude/rules/templating.md` at the repository root out of habit, because
that is where those files normally live. On most PRs the two copies are
identical and the mistake is invisible — but on a PR that changes the rules
themselves, the agent would check the proposal against the old rules and
report agreement. Say explicitly that every file, reference documents
included, must be read from the given directory and nowhere else.

Use `subagent_type: "code-reviewer"` and `subagent_type: "content-reviewer"`.
Run both unless `--focus` says otherwise, or the changed files clearly
exclude one: `build.mjs` and `assets/**` are code alone, `src/data/site.json`
is content alone, and anything under `src/pages/**` is both, because markup
and wording live in the same file.

**Changes confined to `.claude/**` are a different kind of review.** Neither
reviewer's checklist — styling, contrast, templating, business facts,
testimonials — has anything to say about the prose inside an agent or skill
file, so dispatching both out of caution produces two thin reports. Send the
code reviewer, and ask it for the question that actually matters: are the
rules these files state true of this repository, do they contradict CLAUDE.md
or `.claude/rules/templating.md`, and would an agent following them do the
right thing. Add the content reviewer only when the change touches the
domain-facts rules, since those govern every future content review. Then say
plainly in the report that this was a tooling change and the reviewers'
normal checklists did not apply — a human still has to judge whether the
instructions are good ones.

## Consolidating

Do not relay the two reports end to end. The user wants to know what to fix,
not which agent said what. Merge into one list:

1. **Blockers** — build stale, a CLAUDE.md convention broken, an invented or
   unverified business fact, a fabricated review, a contrast pair failing AA,
   and under `--publish`, any unresolved placeholder.
2. **Worth fixing** — real but not urgent.
3. **Noted** — minor.

Within each, most severe first, each with `file:line`. Where both agents
flagged the same line, say it once.

Two things to carry through rather than smooth over:

**Facts the reviewers could not check.** Neither agent can confirm that a
phone number or registration number is the real one — they can only spot
values that look invented and placeholders that have quietly become
plausible. When the content reviewer flags a value for confirmation, put it
to the user as a question rather than letting it dissolve into a summary.

**What did not run.** If the build check was skipped, or a reviewer was
skipped via `--focus`, say so next to the verdict. The reader is deciding
whether to merge, and needs to know what the review did not cover.

End with a clear verdict — clean, or N blockers — and state the PR number
and head SHA reviewed, so the verdict is attached to a specific commit rather
than to a branch that may move. Say plainly when nothing was found; padding a
clean review with minor observations buries the real findings on the day
there are some.
