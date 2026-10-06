# Pinned interpretations

Where two docs contradict, the codebase owner has chosen one reading. Shards apply these exactly as written. Pins are temporary: each retires when the owner fixes the docs it names. Only the owner adds, changes, or removes a pin; an unpinned contradiction goes under **Docs are ambiguous**.

Pinned 2026-09-30.

## P1: Application hook budget in interface

- **Areas:** interface
- **Conflict:** `CLAUDE.md` "One use case per page"; `documentation/COMMON_PATTERNS.md` "Pages call exactly one use case hook"; `src/hexagon/ARCHITECTURE.md` "`interface/` imports only `application/use-cases/`" and components "receive props only" — vs — `src/hexagon/interface/BOUNDARIES.md` "ONE application hook only".
- **Reading:** Every page and component calls **at most one application hook, of any kind** (use case, unit, query, coordinator, adapter). No use-case requirement. Interface hooks are unlimited. React, router, and composition-context hooks do not count.
- **Effective date:** `git blame` of the "NO multiple hooks" line in `src/hexagon/interface/BOUNDARIES.md`.
- **Retire when:** `CLAUDE.md`, `COMMON_PATTERNS.md`, and `ARCHITECTURE.md` state the same budget.

## P2: Interface hooks never call application

- **Areas:** interface
- **Conflict:** `src/hexagon/interface/DECISIONS.md` limits interface hooks to "strictly visual concerns"; `src/hexagon/interface/BOUNDARIES.md` allows interface hooks alongside the one application hook but is silent on what they may call.
- **Reading:** An interface hook **must not call any application hook**. Its purpose is logic that may not live in a page or component file but sits between the application hook's result (passed in as arguments) and what is presented. Business rules still belong in application or domain: apply the removal test in `src/hexagon/interface/DECISIONS.md`.
- **Effective date:** 2026-09-30.
- **Retire when:** `interface/BOUNDARIES.md` / `interface/DECISIONS.md` define interface hooks this way.

## P3: Interface imports from domain

- **Areas:** interface
- **Conflict:** `src/hexagon/ARCHITECTURE.md` "`interface/` imports only `application/use-cases/`" — vs — `src/hexagon/interface/BOUNDARIES.md` "`domain/` (types and schemas - can import freely)".
- **Reading:** Interface may import domain **types, schemas, and constants**. Calling a domain **function** from interface is a transformation in interface (axis A).
- **Effective date:** `git blame` of the `domain/` dependency line in `src/hexagon/interface/BOUNDARIES.md`.
- **Retire when:** `ARCHITECTURE.md` Import Rules match.

## P4: Units may import coordinators

- **Areas:** units, coordinators
- **Conflict:** `src/hexagon/application/units/BOUNDARIES.md` "Cannot import from `application/coordinators/`" — vs — `src/hexagon/application/coordinators/BOUNDARIES.md` "Can be imported by `application/useCases/` and `application/units`".
- **Reading:** Units **may** import coordinators. Not a finding.
- **Effective date:** n/a.
- **Retire when:** `units/BOUNDARIES.md` drops the rule.

## P5: Queries must not import units

- **Areas:** queries
- **Conflict:** `src/hexagon/application/queries/BOUNDARIES.md` "Cannot import from `application/units/` directly (use sparingly)".
- **Reading:** Queries **must not** import units. "Use sparingly" is leftover wording.
- **Effective date:** `git blame` of that line.
- **Retire when:** the line drops "(use sparingly)".

## P6: Interface hook location

- **Areas:** interface
- **Conflict:** `src/hexagon/ARCHITECTURE.md` "inline hooks within `pages/` or `components/` … create a dedicated folder like `interactions/`" — vs — `src/hexagon/interface/BOUNDARIES.md` structure lists `hooks/`.
- **Reading:** Interface hooks shared across components live in `interface/hooks/`. Single-use hooks sit next to their component. `interactions/` is dead wording.
- **Effective date:** `git blame` of the `hooks/` structure line in `src/hexagon/interface/BOUNDARIES.md`.
- **Retire when:** `ARCHITECTURE.md` matches.
