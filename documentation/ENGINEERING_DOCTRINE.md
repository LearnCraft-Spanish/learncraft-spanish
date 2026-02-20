# Engineering Doctrine for the Continuity of This System

This system exists to survive time, people, and change. Speed matters only insofar as it does not destroy that ability. These principles are structural, not stylistic.

---

## Core Principles

### 0. Explicit Dependency Direction

All code must have a traceable direction of causality. No module may depend on something that semantically depends on it. Circular authority produces hidden control flow, race conditions, and untestable behavior. If cause and effect cannot be drawn as a directed graph, the system is already decaying.

### 1. Explicit Boundaries and Interfaces

The system is divided into modules with defined responsibility. Every boundary is crossed only through declared interfaces. Domain logic does not live in UI or infrastructure. Frameworks are not authorities. If something must be repeated or cannot be isolated, its boundary is wrong.

### 2. Composition Over Inheritance

Behavior is built by composing small, focused pieces — not by inheriting from deep hierarchies. Dependencies are explicit and visible at the call site, never hidden behind base classes or implicit state. No action at a distance.

### 3. Testability

Every module must have verifiable behavioral expectations. Tests are not about coverage; they are proof of contract. They give future developers permission to change things safely. If something cannot be tested in isolation, it is not owned.

### 4. Maintainability

The cost of understanding and modifying behavior must remain low. This requires tests for safety, boundaries for structure, documentation for meaning, and correct naming for truth. Renaming is cheaper than confusion. Documentation is cheaper than archaeology.

### 5. Extensibility

New features can be added without destabilizing what exists. If adding something requires modifying unrelated code, the boundaries are wrong.

### 6. Portability = Ownership

The system owns its core logic and the abstractions at the boundaries. External dependencies — frameworks, vendors, platforms — are confined to the edges so they can be replaced without rewriting the things that matter. The difference between using a library and being captured by a platform is whether you can walk away.

### 7. Never Bypass the System

When the system does not accommodate what you need, you do not work around it. You either enrich the system to handle the new case or divide it into smaller, correct pieces. Bypasses become invisible load-bearing walls that no one knows exist until they collapse.

### 8. Sustainability

Sustainability is not engineered directly. It emerges when everything above remains intact.

---

## Operational Constraints

Each piece of state has a single authority and explicit concurrency rules. State transitions are ordered, atomic at boundaries, and idempotent where required. The system must be observable: logs, metrics, and traces are part of the product. Security is architectural: trust boundaries, validation, and least privilege are enforced at every edge. Data integrity is non-negotiable: schemas, constraints, and migrations are versioned and reviewed.

---

## Change Discipline

Changes are small and reviewable. "Done" includes tests, documentation, and instrumentation. Tooling and CI enforce these rules when no one is watching. Shortcuts today are taxes on every future change.
