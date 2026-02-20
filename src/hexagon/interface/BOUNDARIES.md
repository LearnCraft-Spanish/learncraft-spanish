# Interface Layer Boundaries

## What is This?

The interface layer contains **all React UI components and rendering logic**. This is the outermost user-facing layer that renders the application state and handles user interactions.

## Responsibility

React UI components and rendering:

- React components (presentational and container)
- Pages that compose components
- Route definitions and navigation
- UI-specific hooks (modals, popups, theme - strictly visual/UI)
- Event handlers that call application layer hooks
- Styling (SCSS files)
- Accessibility concerns
- User interaction handling

## Structure

```
interface/
├── components/  - Reusable UI components
├── pages/       - Route-level page components
├── hooks/       - UI-specific hooks (visual only, no business logic)
└── styles/      - Shared stylesheets
```

## ⚠️ Critical Rules

### ✅ DO

- Use React components for rendering
- Call **no more than ONE hook** per component (define a use-case in application if complex)
- **Only destructure** the hook result (no business logic, no transformations)
- **Reference explicit return types for application hooks** - Application-defined interfaces, never use inferred types or `typeof`
- Pass values directly to child components (no logical combination with props)
- Handle UI events and call application hooks
- Use composition layer providers via React context

### ❌ DON'T

- **NO multiple hooks** in a single component (ONE hook only)
- **NO business logic, transformations, or orchestration** (application layer handles this)

## Dependency Rules

**Interface depends on:**

- ✅ `application/` (primarily use cases - strictly no more than ONE hook per component)
- ✅ `domain/` (types and schemas - can import freely)
- ✅ React and React Router
- ✅ Composition layer providers via context
- ❌ Cannot import directly from `infrastructure/`
- ❌ Cannot be imported by `domain/` or `application/`

