# Report template and schemas

## Shard return schema

Shards return one block per instance and leave `class` to Main.

```text
file: src/hexagon/...
lines: <range>
pattern: <pattern tag>
axis: A | B | C | D | E | F
rule: <doc path> — <rule>   (pin: P<n> if applicable)
severity: Blocking | Suggestion | Question
evidence: <one line or short snippet>
```

For axis F, shards also return one line per business rule seen outside `domain/`:

```text
rule-seen: <plain description> — <file>:<lines>
```

## Report

Main fills this in chat. Keep the section order; write "None" for empty sections.

```markdown
# Standards audit

- Scope:
- Branch / HEAD / clean tree:
- Docs loaded:
- Pins applied:
- Lint self-check: boundaries enforcing (yes/no); categories excluded as lint-owned:
- Folders governed by a parent BOUNDARIES.md only:
- Working tree unchanged after run (yes/no):

## Systemic (slipped through)

For each:

- Pattern (one sentence) + pattern tag
- Count / where (feature folders; list files only if few)
- Rule cited (doc path + rule; pin id if any)
- Severity (Blocking / Suggestion)
- Rule date; instances after it / before it
- Why it is systemic
- Suggested pay-down (one cluster; do not implement)

## Predates the rule (migration backlog)

Same fields. Call out recent rule or decision changes that left many files out of compliance ("rule X changed on DATE; N of M files predate it").

## Isolated

Max 10, Blocking first. File + rule + severity. "N more omitted" if capped.

## Docs are ambiguous

Unpinned contradictions between docs or decisions, and slipped-through patterns that are the majority practice in their folder. For each: the two sides, the counts, and the choice the owner must make (enforce, or update the doc).

## Recommended next PRs

Ordered list, one systemic cluster per PR. Suggestions only; no patches.
```

## Individual finding format

Use when listing findings one by one inside a section:

```text
file: src/hexagon/...
rule: <doc path> — <rule>   (pin: P<n>)
severity: Blocking | Suggestion | Question
class: systemic | isolated | predates-rule
```
