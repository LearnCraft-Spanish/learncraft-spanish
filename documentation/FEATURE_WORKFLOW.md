# Feature Development Workflow

_How to plan and implement new features._

For code patterns, see [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md). For architecture, see [`ARCHITECTURE.md`](../src/hexagon/ARCHITECTURE.md). For data flow, see [`DATA_FLOW.md`](./DATA_FLOW.md).

---

## Before You Start

1. Understand the feature: What, who, why, how, where
2. Check [`DOMAIN_GLOSSARY.md`](./DOMAIN_GLOSSARY.md) for business terminology
3. Review the relevant `BOUNDARIES.md` files for layers you'll touch

---

## Phase 1: Planning

### Break Down by Layer

Identify what goes where:

```
Feature: [Name]
├── Domain:         Types, validation, pure business functions
├── Application:    Port, queries, mutations, use case
├── Infrastructure: HTTP adapter implementing the port
├── Interface:      Components, page
└── Composition:    (Usually no changes)
```

### Create a Task List

```
Domain
- [ ] Define types/interfaces
- [ ] Write pure business functions
- [ ] Write domain tests

Infrastructure
- [ ] Define port interface
- [ ] Implement infrastructure adapter
- [ ] Create mock adapter

Application
- [ ] Create queries/mutations
- [ ] Create use case hook
- [ ] Write use case tests

Interface
- [ ] Create components
- [ ] Create page (calls one use case)
- [ ] Write component tests
```

---

## Phase 2: Implementation

**Build inside-out**: Domain → Infrastructure → Application → Interface.

1. **Domain**: Define types, write pure functions, test them
2. **Infrastructure**: Define port, implement adapter, create mock
3. **Application**: Create queries/mutations, build use case, test it
4. **Interface**: Build components, create page, test UI

Follow patterns in [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md) for code structure. Follow [`TESTING_STANDARDS.md`](./TESTING_STANDARDS.md) for test requirements.

---

## Phase 3: Validate

```bash
pnpm validate    # lint + format + typecheck
pnpm test:hexagon
```

Manual test the feature in the browser.

---

## Phase 4: Submit

1. Self-review every change
2. Follow [`PR_STANDARDS.md`](./PR_STANDARDS.md)
3. Write a clear PR description (what changed, why, how to test)

---

## Feature Size Guidelines

| Size   | Scope                           | Timeline |
| ------ | ------------------------------- | -------- |
| Small  | 1 use case, 2-3 components     | 1-2 days |
| Medium | 2-3 use cases, 5-8 components  | 3-5 days |
| Large  | Multiple use cases, 10+ comps  | 1-2 weeks |
