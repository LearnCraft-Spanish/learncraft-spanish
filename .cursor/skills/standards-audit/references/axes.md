# Hunt axes

Pointers, not rules. Each item names where the rule lives; shard workers read the rule there. Brackets tag the shard areas that hunt the item. Pins (`P<n>`) are in `interpretations.md`.

Area tags: `interface`, `useCases`, `units`, `queries`, `adapters` (adapters + ports + infrastructure), `coordinators`, `app-misc` (implementations, types, utils), `domain`, `composition`, `all`.

## A. Semantic layer placement (primary)

Sources: `src/hexagon/ARCHITECTURE.md` (Directory Breakdown, Strict Dos and Don'ts); each layer's `BOUNDARIES.md`; `documentation/PR_REVIEW_GUIDE.md` §4.1.

- [ ] Domain-shaped rules or transforms living outside `domain/` [interface, useCases, units, app-misc]
- [ ] Interface calling domain functions (P3) [interface]
- [ ] Use cases or units holding pure business logic ("NO pure business logic" / "NO pure logic") [useCases, units]
- [ ] Infrastructure or adapters with branching, filtering, sorting, calculations [adapters]
- [ ] Composition with conditionals, effects, `useMemo`, or logic in provider-accessing hooks [composition]
- [ ] Layer import direction, **only when the step 4 self-check failed** [all]

## B. Interface contract

Sources: `src/hexagon/interface/BOUNDARIES.md`; `src/hexagon/interface/DECISIONS.md`; `src/hexagon/ARCHITECTURE.md` (Strict Dos and Don'ts).

- [ ] Page or component calling more than one application hook (P1) [interface]
- [ ] Interface hook calling any application hook (P2) [interface]
- [ ] Page or component doing more than destructure its application hook result and pass values on: transforms, orchestration, combining with props ("Only destructure", "Pass values directly") [interface]
- [ ] Application hook without an exported explicit return type: inferred, `typeof`, or `ReturnType<>` [useCases, units, queries, coordinators, app-misc]
- [ ] Interface hook in the wrong place (P6) [interface]

## C. Application subfolder contracts

Sources: `src/hexagon/application/BOUNDARIES.md` and the `BOUNDARIES.md` in each `src/hexagon/application/<sub>/`.

- [ ] Use case that is a single unit ("NO single-unit functionality") [useCases]
- [ ] Unit running a complete workflow ("NO complete workflows") [units]
- [ ] Query that filters, sorts, processes, or orchestrates [queries]
- [ ] Adapter that is no longer thin [adapters]
- [ ] Coordinator holding feature-specific state or business logic [coordinators]
- [ ] Import rules within `application/` that lint cannot see, as each subfolder's Dependency Rules list them. Examples: unit → use case or adapter; query → use case or unit (P5); coordinator → use case or unit; adapter → use case or unit; port → another application subfolder. Unit → coordinator is allowed (P4). [useCases, units, queries, adapters, coordinators]

## D. Documented pattern drift

Sources: `documentation/COMMON_PATTERNS.md` (Barrel Exports, Naming Conventions, File Organization, Styling); `src/hexagon/interface/BOUNDARIES.md` (Styling, DON'T list).

- [ ] `export *` barrels, or barrels exporting internal helpers [all]
- [ ] Global class names, unlayered author CSS, or `!important` added after the rule date (SKILL step 7) [interface]
- [ ] Naming or colocation drift that is clearly the default in a feature folder [all]

Relative and `src/hexagon/...` imports are lint-owned; leave them out.

## E. Doctrine 7 bypasses

Source: `documentation/ENGINEERING_DOCTRINE.md` principle 7.

- [ ] `eslint-disable` comments targeting `boundaries/*` or `no-restricted-imports` [all]
- [ ] `@ts-ignore`, `as any`, or `as unknown as` used to get around a port or return type [all]
- [ ] Direct `fetch`, `localStorage`, `sessionStorage`, or `window` IO outside `infrastructure/` [all; the adapters shard checks adapters and ports only]
- [ ] Exports that exist only so tests can reach internals [all]
- [ ] Duplicated "just this once" paths that sidestep an existing unit, query, or coordinator [all]

## F. Duplicated business rules

Source: `src/hexagon/ARCHITECTURE.md`, "Longevity Warning" and "Decision Criteria for Moving to Domain".

- [ ] The same business rule implemented in 3+ use cases or units with no domain function. Report as systemic duplication, not "rewrite the domain model". Shards list rules; Main matches them (SKILL step 6). [useCases, units, app-misc]

## Out of hunt

Security, performance, tests and mocks, PR or spec requirements, generic smells the docs do not name, legacy code outside `src/hexagon/`.
