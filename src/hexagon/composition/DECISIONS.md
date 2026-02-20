# Decisions: Composition Layer

## Why Provider-Accessing Hooks Exist

**Context**: Coordinators in the application layer need access to global state (audio, auth, active student) managed by React Context providers. But providers live in the composition layer, which is outer to application. Importing directly from composition would violate the inward-only dependency rule.

**Decision**: Composition defines minimal provider-accessing hooks in `composition/context/` that are pure context accessors — they call `useContext()`, null-check, and return the value. Nothing else. Coordinators import these hooks rather than accessing providers directly.

**Consequences**: This creates a narrow, documented exception to the dependency rule. The hooks are constrained to zero business logic. All business logic using context belongs in `application/coordinators/`, not in these hooks. See `application/coordinators/DECISIONS.md` for the coordinator side of this decision.

## Composition as the Assembly Layer

**Context**: Something needs to wire together providers, the root render, and route-level composition. This wiring doesn't belong in any business layer.

**Decision**: Composition is the entry point that assembles the root application. It composes providers and exports provider-accessing hooks. It imports from `interface/` (to compose pages) and from React/routing libraries. It does not import from `domain/`, `infrastructure/`, or `application/`.

**Consequences**: Composition is static — no business logic, no conditionals, no effects. If dynamic behavior is needed, it belongs in a coordinator or use case, not here.
