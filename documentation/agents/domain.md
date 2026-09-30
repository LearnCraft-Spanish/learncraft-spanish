# Domain Docs

How the engineering skills should read and update this repo's domain documentation. This repo keeps domain docs in its own locations; wherever a skill says `GLOSSARY.md` or "ADR", use this mapping:

| Skill says          | In this repo                                                                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GLOSSARY.md`       | `documentation/DOMAIN_GLOSSARY.md`                                                                                                                                               |
| `docs/adr/`, an ADR | The `DECISIONS.md` of the layer the decision touches: `src/hexagon/<layer>/DECISIONS.md` (or `application/<sublayer>/`), or `src/hexagon/DECISIONS.md` for cross-layer decisions |

## Before exploring, read these

- `documentation/DOMAIN_GLOSSARY.md`
- `src/hexagon/DECISIONS.md`, plus the `DECISIONS.md` of every layer you're about to touch. Each sits beside a `BOUNDARIES.md`, which stays authoritative for the rules themselves.

## Writing

Write all glossary and decision changes into the existing files above; this repo keeps no root `GLOSSARY.md`, `GLOSSARY-MAP.md`, or `docs/adr/`.

- **Glossary**: add or edit entries in `DOMAIN_GLOSSARY.md` under the matching `##` section, using the `/domain-modeling` glossary format: `**Term**:`, a one-or-two-sentence definition, and an `_Avoid_:` line for rejected synonyms. Where the entity has a schema in `@learncraft-spanish/shared`, add a `_Schema_:` line naming its `src/domain/` folder instead of listing fields.
- **Decisions**: append a `## Why …` section to the relevant `DECISIONS.md` with **Context** / **Decision** / **Consequences** paragraphs, matching the existing entries. Write one only after the codebase owner approves it in the session.
- **Boundaries**: `BOUNDARIES.md` files are owner-edited only; a decision entry never rewrites a boundary rule.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `DOMAIN_GLOSSARY.md`. Stick to the glossary's term rather than drifting to synonyms.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag decision conflicts

If your output contradicts an existing decision, surface it explicitly rather than silently overriding:

> _Contradicts `src/hexagon/infrastructure/DECISIONS.md` ("Why …"), but worth reopening because…_
