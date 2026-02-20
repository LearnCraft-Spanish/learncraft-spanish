# Decisions: Domain Layer

## Why Domain Is Split Between Shared Package and Hexagon

**Context**: The organization has both a frontend SPA and a backend. Core business entity types (Vocabulary, Lesson, Course, etc.) and their Zod validation schemas need to be consistent across both.

**Decision**: Core domain types and schemas live in `@learncraft-spanish/shared` (cross-platform). `src/hexagon/domain/` contains only frontend SPA-specific domain functions — pure logic, transformations, and algorithms that operate on those shared types but are only relevant to the frontend.

**Consequences**: `@learncraft-spanish/shared` is the canonical definition of business entities. This domain layer is not the organization-wide domain — it's the frontend's domain layer. Changes to shared types must be coordinated across repos. Frontend-specific business logic (UI interaction rules, frontend-only transformations) lives here rather than being pushed into the shared package.
