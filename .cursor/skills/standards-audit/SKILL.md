---
name: standards-audit
description: >-
  Audit src/hexagon on a long-lived branch (development/staging) for semantic
  drift from documented architecture that slipped through PR review: logic in
  the wrong layer, components calling more than one application hook, fat
  adapters or queries, lint-blind import rules, bypasses, duplicated business
  rules. Use when the user asks for a standards audit, architecture smell scan,
  boundary-violation hunt, hexagon audit, drift check, or whether a shortcut
  has become how we do X. Report only; never fixes.
disable-model-invocation: true
---

# Standards Audit

Find semantic drift in `src/hexagon/` that got past PR review and has become practice. Produce a report; change nothing.

## Non-negotiables

- **Report only.** Every participant reads and searches; nobody edits code, docs, or config. Main proves it with a `git status` snapshot before and after.
- **Hexagon only.** Scope is `src/hexagon/` or a folder inside it. Legacy folders have no `BOUNDARIES.md`, so there is nothing to audit against.
- **Long-lived branch, not a PR.** Runs against `development` or `staging`. PR review owns changesets; there is no diff mode.
- **Architecture, not tests.** Test and mock coverage belong to a future `/test-gap` skill.
- **BOUNDARIES.md is authoritative.** Lint owns only what the step 4 self-check proves it enforces.
- **Every finding cites a live rule:** file, doc path + rule, and pin id when a pin decided it.
- **Systemic over isolated.** The product is "this has become how we do X".
- **One rubric: the docs.** Hunt only what the docs say, read through the pins in `references/interpretations.md`. Where the docs are silent, stay silent. Point at live docs; never paste their rules into prompts or the report beyond a short quote.

## Use, refuse, narrow

| Request                                     | Response                                                                                                               |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `/standards-audit`                          | Audit all of `src/hexagon/`.                                                                                           |
| `/standards-audit <layer or folder>`        | Audit that folder, resolved under `src/hexagon/` (e.g. `interface`, `application/units`, `application/useCases/quiz`). |
| Text that maps to no hexagon folder         | Ask once which folder, then proceed.                                                                                   |
| A legacy folder or anything outside hexagon | Decline; explain no `BOUNDARIES.md` governs it.                                                                        |
| "Fix what you find"                         | Offer the audit only; wait.                                                                                            |
| "Change BOUNDARIES to match the code"       | Decline; that case belongs under **Docs are ambiguous** for the owner.                                                 |
| Missing tests as the goal                   | Out of scope; point at the future `/test-gap` skill.                                                                   |

## Vocabulary

- **Instance**: one occurrence of a pattern in one file, as a shard returns it.
- **Pattern tag**: short normalized label (e.g. `unit-imports-adapter`) Main uses to merge instances across shards.
- **Feature folder**: the immediate child folder of a layer or application subfolder (`interface/components/CoachingRecords/`, `application/units/quiz/`). Loose files directly in a layer or subfolder form one group.
- **Systemic**: a pattern tag with 3+ instances across 2+ feature folders, or present in most files of one feature folder.
- **Isolated**: not systemic.
- **Lint-owned**: a category lint verifiably enforces this run (step 4).
- **Pin**: an owner-chosen reading in `references/interpretations.md` resolving a doc contradiction.
- **Rule date**: when the cited rule line entered its doc (`git blame`), or the pin's effective date.
- **Slipped through**: instances written after the rule date. The main target.
- **Predates the rule**: instances older than the rule date. Migration backlog.

## Roles

```
Main ──scope, docs, pins, axes, schema──► Shard workers (parallel, read-only)
Main ◄──────────── instances ──────────── Shard workers
Main: merge → count → date split → classify → report
```

| Role             | Owns                                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Main**         | Run context, scope, lint self-check, shard prompts, merging, counting, dating, report.                                                            |
| **Shard worker** | Built-in Explore subagent. Reads the docs it is handed, searches its paths, returns instances in the shard schema. Leaves classification to Main. |

Shard workers see none of this chat. Main pastes everything they need into each prompt.

## Procedure

### 1. Run context

Record the branch, `git rev-parse HEAD`, and `git status --porcelain`. If the branch is not `development` or `staging`, or the tree is dirty, warn and ask once whether to continue.

Done when: branch, HEAD, and status snapshot are recorded, and the user has confirmed any warning.

### 2. Scope

Resolve the scope from the text after `/standards-audit` using the table above. List the areas from step 5 that fall inside it.

Done when: scope is a concrete path set under `src/hexagon/`, or the request is declined.

### 3. Load authority

Read, for the scope only:

1. `documentation/ENGINEERING_DOCTRINE.md` (principles 0, 1, 7)
2. `src/hexagon/ARCHITECTURE.md`
3. The `BOUNDARIES.md` governing each scoped folder. A folder without one is governed by its nearest ancestor's; note each such folder for the report header.
4. The sibling `DECISIONS.md` of each `BOUNDARIES.md`. Decisions explain rules and record exceptions, so they prevent false positives. When a decision appears to permit what a boundary forbids, that is a **Docs are ambiguous** entry; the boundary still stands.
5. `documentation/COMMON_PATTERNS.md`
6. `references/interpretations.md` and `references/axes.md`

Done when: every scoped folder maps to a governing `BOUNDARIES.md`.

### 4. Lint self-check, then subtract

Lint may own two categories in `src/hexagon/`:

- **Alias-only imports** (`@typescript-eslint/no-restricted-imports` in `eslint.config.js`). Treat as lint-owned.
- **Top-level layer import direction** (`boundaries/element-types`). It cannot see imports among `useCases/`, `units/`, `queries/`, `implementations/`, `types/`, `utils/`: lint treats them as one `application` element, so those rules stay in the hunt (axis C).

Verify the second: run `ESLINT_PLUGIN_BOUNDARIES_DEBUG=1 CI=true pnpm exec eslint <one real file per scoped layer>`.

- Any `is of unknown type` line → boundaries lint is not enforcing. Hunt layer import direction (axis A) and open the report with **"Lint boundaries not enforcing"**. Known broken as of 2026-09-30: [#345](https://github.com/LearnCraft-Spanish/learncraft-spanish/issues/345).
- Every file resolves to a layer type → treat layer import direction as lint-owned.

Skip full-repo lint. Violations silenced by `eslint-disable` are never lint-owned; they are axis E.

Done when: the lint-owned category list for this run is fixed and recorded.

### 5. Shard

Fan out one Explore subagent per area in scope, all in a single message so they run in parallel:

| Area                                                             | Governing docs                                        |
| ---------------------------------------------------------------- | ----------------------------------------------------- |
| `interface/`                                                     | `interface/BOUNDARIES.md`, `interface/DECISIONS.md`   |
| `application/useCases/`                                          | `useCases/BOUNDARIES.md`, `application/BOUNDARIES.md` |
| `application/units/`                                             | `units/BOUNDARIES.md`, `application/BOUNDARIES.md`    |
| `application/queries/`                                           | `queries/BOUNDARIES.md` + `DECISIONS.md`              |
| `application/adapters/`, `application/ports/`, `infrastructure/` | each folder's `BOUNDARIES.md` + `DECISIONS.md`        |
| `application/coordinators/`                                      | `coordinators/BOUNDARIES.md` + `DECISIONS.md`         |
| `application/implementations/`, `types/`, `utils/`               | `application/BOUNDARIES.md`                           |
| `domain/`                                                        | `domain/BOUNDARIES.md` + `DECISIONS.md`               |
| `composition/`                                                   | `composition/BOUNDARIES.md` + `DECISIONS.md`          |

All paths above are under `src/hexagon/`. Each shard prompt contains:

- the area paths, and "production files only; skip `*.test.*` and `*.mock.*`";
- the exact `BOUNDARIES.md` / `DECISIONS.md` paths to read first;
- the full text of every pin tagged for that area (from `references/interpretations.md`);
- the axis items tagged for that area (from `references/axes.md`);
- the lint-owned categories from step 4, as "do not report";
- "Read and search only. Leave every file and git state untouched.";
- the shard return schema from `references/report-template.md`, and "return every instance; leave systemic/isolated to Main";
- for axis F: "also list, one line each, every business rule you see implemented outside `domain/`".

Done when: every area in scope has returned.

### 6. Merge and count

Merge instances by pattern tag across shards; match axis F rule lines by meaning. Apply the systemic threshold.

Done when: every instance carries a pattern tag with a count and feature-folder spread.

### 7. Date split

For each systemic pattern: take the rule date (`git blame` the cited rule line, or the pin's effective date), `git blame` the violating lines, and split instances into slipped through and predates the rule. When a rule or decision is recent and much of a folder predates it, state it as "rule X changed on DATE; N of M files predate it".

The interface "no new" CSS rules (global class names, unlayered author CSS, `!important`) are judged only this way: instances added after the rule date are findings; older ones are skipped.

Done when: every systemic pattern has a rule date and an after/before count.

### 8. Classify

Severity measures only how hard the rule is:

| Label          | When                                                                                   |
| -------------- | -------------------------------------------------------------------------------------- |
| **Blocking**   | Explicit `NO` / `DON'T` / `Cannot` rule, doctrine principle, or pin. Would block a PR. |
| **Suggestion** | Judgment wording: "consider", "sparingly", "prefer", "primarily".                      |
| **Question**   | A human must choose between enforcing the rule and updating the doc.                   |

Place each finding in exactly one section, first match wins:

1. Two docs or a decision disagree and no pin covers it → **Docs are ambiguous** (Question).
2. Slipped through and the majority practice in its feature folder → **Docs are ambiguous** (Question).
3. Systemic and mostly predates its rule → **Predates the rule**.
4. Systemic → **Systemic**.
5. Otherwise → **Isolated** (max 10, Blocking first, then "N more omitted").

Done when: every finding has a severity and one section.

### 9. Verify untouched

Compare `git status --porcelain` with the step 1 snapshot. Any difference goes at the top of the report.

### 10. Report

Fill `references/report-template.md` in chat. Then offer, and act only on a yes, to open one GitHub issue per systemic cluster (labels per `documentation/agents/triage-labels.md`).

## References

| File                            | Open at                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `references/axes.md`            | Step 3; paste tagged items into shard prompts at step 5.                      |
| `references/interpretations.md` | Step 3; paste tagged pins into shard prompts at step 5; rule dates at step 7. |
| `references/report-template.md` | Step 5 for the shard schema; step 10 for the report.                          |

## Live docs (read, never copy)

- `documentation/ENGINEERING_DOCTRINE.md`
- `src/hexagon/ARCHITECTURE.md`
- `src/hexagon/**/BOUNDARIES.md` and sibling `DECISIONS.md`
- `documentation/COMMON_PATTERNS.md`
- `documentation/PR_REVIEW_GUIDE.md` §4.1
- `eslint.config.js`

## Stop

Stop when the report is emitted, the user asks to stop, or the scope contains no files.
