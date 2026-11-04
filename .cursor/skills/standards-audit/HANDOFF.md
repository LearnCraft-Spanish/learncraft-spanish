# Handoff: `standards-audit` skill (v1)

Implement this skill. Do not expand scope. Do not run a full hexagon audit as the deliverable. The deliverable is the skill itself.

This brief is the spec. `SKILL.md` does not exist yet. After you finish, this `HANDOFF.md` may stay as implementer notes or be deleted — your call, but do not leave contradictory instructions. `SKILL.md` is the runtime source of truth.

---

## Task

Create a Cursor Agent Skill that an AI agent can invoke to scan `src/hexagon/` for **semantic** practices that violate our documented architecture and patterns — especially ones that have become common — and report them. It must **not** auto-fix.

Repo: LearnCraft Spanish frontend. Hexagonal architecture. `BOUNDARIES.md` files are authoritative; ESLint is not.

---

## Why a skill (already decided — do not reopen)

| Option | Verdict |
| --- | --- |
| Project skill at `.cursor/skills/standards-audit/` | **Do this.** Repeatable workflow, git-versioned, invoked on demand. |
| Dedicated `.cursor/agents/*.md` | **Not v1.** Optional later as a `readonly: true` shard worker. |
| Always-on rule | **No.** Audit is expensive; `CLAUDE.md` already points at BOUNDARIES. |
| Snippet / slash-command text only | **No.** This is a procedure (load docs, shard, count, report). |

Match the in-repo precedent: `.cursor/skills/visual-gauntlet/SKILL.md` (main orchestrates; specialists do isolated work; structured return). Do not copy gauntlet capture/critic rules.

Cursor product constraints to honor:

- Folder name must match frontmatter `name`.
- Frontmatter needs `name` + `description`. `description` is how the agent decides relevance; list the phrases humans will actually type.
- Keep `SKILL.md` short. Put long material in `references/` and tell the agent when to open which file.
- Do **not** copy `BOUNDARIES.md` (or any other standard) into the skill. Point at the live files. Copied rules drift. BOUNDARIES stay authoritative.

---

## Files to create

```text
.cursor/skills/standards-audit/
  SKILL.md                      # required; procedure only
  references/axes.md            # hunt list + pointers to live docs
  references/report-template.md # output format the agent must fill
```

Do **not** create in v1:

- `.cursor/agents/standards-auditor.md`
- A `/test-gap` skill
- A PR-review skill
- Scripts that auto-rewrite application code
- Always-on Cursor rules
- Changes to `BOUNDARIES.md`, `DECISIONS.md`, or `ENGINEERING_DOCTRINE.md`

You may keep or delete this `HANDOFF.md` after implementation. If you keep it, add a one-line note at the top that the skill is implemented and `SKILL.md` wins on conflict.

---

## Frontmatter (required)

```yaml
---
name: standards-audit
description: >-
  Audit src/hexagon for semantic architecture smells and documented-practice
  drift: logic in the wrong layer, pages calling more than one use case,
  fat adapters, pattern drift that has become common. Use when the user
  asks for a standards audit, architecture smell scan, boundary-violation
  hunt, hexagon audit, or whether a shortcut has become how we do X.
  Report only; do not fix. Missing tests are a short appendix, not the hunt.
disable-model-invocation: true
---
```

`disable-model-invocation: true` is required. A full-tree scan must not fire because someone asked “does this page follow our patterns?”

Do **not** set `paths`. This is a whole-tree (or scoped-folder) audit, not a “when you edit a `.tsx`” helper.

Optional: `icon` / `color` if you want a Custom Mode badge. Not required.

---

## Non-negotiables

1. **Report only.** No application refactors. No drive-by lint fixes. No rewriting docs to match the code.
2. **Do not edit `BOUNDARIES.md` or `DECISIONS.md`.** If a forbidden pattern is everywhere, file it under **Docs are ambiguous** so a human can enforce the rule or update the doc.
3. **Default scope is `src/hexagon/`.** Legacy `src/components/`, `src/hooks/`, `src/sections/`, `src/types/`, `src/functions/` are out of scope unless the user explicitly names them.
4. **Skip what ESLint already catches.** Import-direction / layer-import violations are owned by `eslint-plugin-boundaries` in `eslint.config.js`. The skill hunts the semantic remainder.
5. **Cite the live rule.** Every finding needs a file path and the doc path + rule (e.g. `src/hexagon/interface/BOUNDARIES.md` — “NO multiple hooks”).
6. **Systemic over isolated.** The product is “this has become how we do X,” not a laundry list of one-offs.
7. **Missing tests are appendix-only.** Do not mix “no colocated `*.test.ts`” into the architecture list.
8. **Do not invent a second rubric.** Hunt axes below point at existing docs. If a doc is silent, do not flag Fowler-generic smells.

---

## Procedure the skill must encode

The agent that *runs* the skill follows this. Write it as numbered steps in `SKILL.md`.

### 1. Confirm scope

Accepted scopes:

| Invocation | Scope |
| --- | --- |
| `/standards-audit` (no args) | All of `src/hexagon/` |
| `/standards-audit interface` (or any layer / subfolder) | That folder only |
| `/standards-audit --since main` (or another ref) | Files changed vs that ref, still hexagon-only unless asked |

If the user names a feature folder (`application/useCases/quiz`, etc.), use that.

### 2. Load authority (read, do not paste into the skill)

In this order, only what the scope needs:

1. `documentation/ENGINEERING_DOCTRINE.md` (especially 0, 1, 7)
2. `src/hexagon/ARCHITECTURE.md`
3. `BOUNDARIES.md` in each scoped layer / subdirectory
4. `documentation/COMMON_PATTERNS.md`
5. `documentation/TESTING_STANDARDS.md` **only** if producing the test appendix

Sibling `DECISIONS.md` files explain *why*. They are not new rules. Do not treat them as override authority.

### 3. Subtract tooling

Run or recall hexagon lint (`eslint-plugin-boundaries` + `@typescript-eslint/no-restricted-imports` for aliases). Drop any finding that is already an ESLint error. State in the report that lint-owned issues were excluded.

What lint **does** catch (do not re-report):

- Importing the wrong layer (domain → application, interface → infrastructure, etc.)
- Relative / `src/hexagon/...` imports instead of aliases inside hexagon

What lint **does not** catch (primary hunt — from `documentation/PR_REVIEW_GUIDE.md` §4.1):

- Business logic in components instead of domain
- Orchestration in components instead of use cases
- Branching / transformation in infrastructure or adapters
- Semantic violations that still pass import rules

### 4. Shard

Do not hold the whole hexagon in one context and then judge frequency.

Fan out **read-only** explore/review subagents (built-in Explore is fine in v1; do not add a custom `.cursor/agents` file). One shard per layer or per axis, for example:

- `interface/` (pages, components, UI hooks)
- `application/useCases/`
- `application/units/`
- `application/queries/`
- `application/adapters/` + `infrastructure/`
- `application/coordinators/`
- `domain/`
- `composition/`

Each shard prompt must include: scope paths, which `BOUNDARIES.md` to read, the hunt axis list from `references/axes.md`, “report only,” and the finding schema. Subagents do not see prior chat — paste what they need.

### 5. Count, then classify

A finding is **systemic** when it appears in **3+** distinct places **or** is clearly the default in a folder (e.g. most pages call two hooks). Systemic findings are the main report. Isolated findings are a short list (cap them; suggest ≤10).

### 6. Emit the report

Fill `references/report-template.md`. Do not fix. Offer a recommended pay-down order (one systemic cluster per future PR) only as suggestions.

---

## Hunt axes (v1)

Put this in `references/axes.md` as a checklist with **pointers**, not copied rule text.

### A. Semantic layer placement (primary)

Sources: `src/hexagon/ARCHITECTURE.md`; each layer `BOUNDARIES.md`; `documentation/PR_REVIEW_GUIDE.md` §4.1.

- Domain-shaped rules / transforms living in interface or use cases
- Use cases holding pure business logic that belongs in `domain/`
- Infrastructure or adapters with branching, filtering, sorting, calculations
- Composition with conditionals, effects, or logic (`src/hexagon/composition/BOUNDARIES.md`)

### B. Interface / use-case contract

Sources: `src/hexagon/interface/BOUNDARIES.md`; `src/hexagon/application/useCases/BOUNDARIES.md`; `documentation/COMMON_PATTERNS.md` (page pattern); `CLAUDE.md` (one use case per page).

- Page or component calling more than one application hook
- Interface doing more than destructure a hook result (transforms, orchestration)
- Hook without an exported explicit return type (`typeof`, `ReturnType<>`, inferred)

### C. Application subdirectory contracts

Sources: subdirectory `BOUNDARIES.md` files under `src/hexagon/application/`.

- Use case that is a single unit (belongs in `units/`)
- Unit that orchestrates a full workflow (belongs in `useCases/`)
- Query that filters / sorts / orchestrates
- Adapter that is no longer thin
- Coordinator holding feature-specific or business logic

### D. Documented pattern drift

Source: `documentation/COMMON_PATTERNS.md`.

- Relative imports across layers (if not already lint-failed)
- `export *` barrels / leaking internals
- New global CSS / `!important` / unlayered author CSS vs CSS Modules + tokens
- Naming / colocation drift that is clearly the folder default

### E. Doctrine 7 bypasses

Source: `documentation/ENGINEERING_DOCTRINE.md` principle 7.

- Working around the system instead of extending or dividing it (ad-hoc exceptions, unofficial back doors, duplicated “just this once” paths)

### F. Anemic-domain / duplicated rules

Source: `src/hexagon/ARCHITECTURE.md` longevity warning.

- The same business rule in 3+ use cases / units with no domain function
- Flag as systemic duplication, not “rewrite the domain model”

### G. Missing tests (appendix only)

Sources: `documentation/TESTING_STANDARDS.md`; coverage table in `src/hexagon/ARCHITECTURE.md`.

- New or substantial hexagon modules with no colocated `*.test.ts(x)`
- Data-returning hooks missing `*.mock.ts` / `createOverrideableMock`
- Do not enumerate every uncovered line. Counts + a few examples are enough.

**Out of hunt:** security, performance, PR spec/requirements, generic Fowler smells not named in our docs, legacy-tree “this isn’t hexagon.”

---

## Severity

| Label | When |
| --- | --- |
| **Blocking** | Hard `BOUNDARIES.md` / doctrine rule, especially if systemic |
| **Suggestion** | Judgment call, or isolated |
| **Question** | Docs disagree, exception is undocumented, or the pattern is everywhere *and* the docs forbid it — human must choose enforce vs update the doc |

---

## Report template

Put this structure in `references/report-template.md`. The running agent fills it; it does not invent a new format.

```markdown
# Standards audit

- Scope:
- Docs loaded:
- Lint-owned issues: excluded (yes/no)
- Date / git HEAD:

## Systemic (this has become practice)

For each:
- Pattern (one sentence)
- Count / where (folders, not every file if large)
- Rule cited (path + quote or section)
- Severity (Blocking / Suggestion / Question)
- Why it is systemic
- Suggested pay-down (one cluster; do not implement)

## Isolated

Short list. File + rule + severity. Cap it.

## Docs are ambiguous

Places two docs disagree, or code and docs have diverged so widely a human must update one of them.

## Test gaps (appendix)

Counts + examples only.

## Recommended next PRs

Ordered list of systemic clusters. One cluster per PR. No patches in this run.
```

Each finding, when listed individually, uses:

```text
file: src/hexagon/...
rule: <doc path> — <rule>
severity: Blocking | Suggestion | Question
class: systemic | isolated
```

---

## `SKILL.md` body shape

Keep it under a few hundred lines. Suggested headings:

1. Purpose + non-negotiables
2. When to use / when not to use
3. Roles (Main orchestrates; shard specialists search and return findings; Main aggregates; nobody edits)
4. Procedure (the six steps above)
5. When to open which `references/` file
6. Pointers to live docs (paths only)
7. Stop conditions (report emitted; user asked to stop; scope empty)

Tone: imperative, like `visual-gauntlet` (“Main fans out…”, “Do not…”). No essays.

---

## When the skill should refuse or narrow

- User asks to “fix everything you find” → refuse the fix; still offer the audit, then wait.
- User asks to change BOUNDARIES to match the code → refuse. File under **Docs are ambiguous**.
- User asks to include legacy `src/components` without a narrow folder → warn that the report will be “this is legacy” noise; require an explicit folder if they insist.
- User asks for missing-test coverage as the main goal → run appendix only, or tell them that is a future `/test-gap` skill.

---

## Acceptance criteria (for the implementing agent)

You are done when:

1. The three files exist and `SKILL.md` frontmatter matches this brief (`name`, `disable-model-invocation: true`, description covers the trigger phrases).
2. `SKILL.md` does **not** paste BOUNDARIES / doctrine / pattern text; it only points at them.
3. `references/axes.md` covers axes A–G with source paths.
4. `references/report-template.md` matches the template above.
5. No custom subagent file, no app code changes, no doc-authority edits.
6. A **dry run of the procedure on paper** (you do not need a full hexagon scan): walk `SKILL.md` as if invoked with `/standards-audit interface` and confirm a shard agent would know which BOUNDARIES to read and what to return.
7. Skill style is consistent with `.cursor/skills/visual-gauntlet/SKILL.md` (short, role-based, non-negotiables first).

Optional sanity check (not required): invoke the skill mentally against `documentation/PR_REVIEW_GUIDE.md` §4.1 and confirm every “linter CAN’T catch” bullet is in axes A–C.

Do **not** treat “found N real smells in the repo” as acceptance. That is a later use of the skill, not this PR.

---

## Explicitly later (do not build)

- **v1.5** — `.cursor/agents/standards-auditor.md` with `readonly: true` as a named shard worker
- **v2** — `/test-gap` skill for colocated tests/mocks
- PR-review skill — `documentation/PR_REVIEW_GUIDE.md` + `CLAUDE.md` PR Review mode already cover changesets
- Wiring this into always-on `CLAUDE.md` beyond a one-line “invoke `/standards-audit` for repo-wide semantic drift”

---

## Source docs the implementer should read first

Nearby docs for `.cursor/skills/` (read before editing):

- `.cursor/skills/visual-gauntlet/SKILL.md` — skill style precedent
- `CLAUDE.md` — BOUNDARIES authority, one use case per page, hexagon-only new code
- `documentation/ONBOARDING.md` — doc hierarchy
- `documentation/ENGINEERING_DOCTRINE.md`
- `src/hexagon/ARCHITECTURE.md` (dependency flow, longevity warning, BOUNDARIES-are-authoritative section, test table)
- `documentation/PR_REVIEW_GUIDE.md` §4
- `documentation/COMMON_PATTERNS.md`
- `documentation/TESTING_STANDARDS.md`
- Layer BOUNDARIES:
  - `src/hexagon/domain/BOUNDARIES.md`
  - `src/hexagon/application/BOUNDARIES.md`
  - `src/hexagon/application/useCases/BOUNDARIES.md`
  - `src/hexagon/application/units/BOUNDARIES.md`
  - `src/hexagon/application/queries/BOUNDARIES.md`
  - `src/hexagon/application/adapters/BOUNDARIES.md`
  - `src/hexagon/application/coordinators/BOUNDARIES.md`
  - `src/hexagon/application/ports/BOUNDARIES.md`
  - `src/hexagon/infrastructure/BOUNDARIES.md`
  - `src/hexagon/interface/BOUNDARIES.md`
  - `src/hexagon/composition/BOUNDARIES.md`
  - `src/hexagon/testing/BOUNDARIES.md`
- Lint ownership: `eslint.config.js` (`boundaries/element-types`, restricted imports)

---

## Suggested commit / PR

- Branch work is skill files only (plus this handoff if retained).
- Title idea: `docs: add standards-audit skill for hexagon semantic drift`
- PR body: this is an agent workflow, not an app behavior change. No UI. Point reviewers at `SKILL.md` and the two reference files.
- Do not mention this handoff as user-facing documentation in `ONBOARDING.md` unless the human owner asks.
