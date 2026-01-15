# CreateTable Composition Pattern Design

## Philosophy & Principles

Based on the EditableTable composition pattern, CreateTable should follow the same layered architecture with explicit contracts. The key principles are:

1. **Explicit Contracts**: Each layer has a clear contract defining what it must provide
2. **Separation of Concerns**: Unit hook → Use Case → Interface Component
3. **Compose Before Returning**: Use cases compose `tableProps` before returning
4. **Interface Customization**: Interface layer only adds presentation concerns
5. **Reusable Hooks**: Extract keyboard navigation and focus management (SHARED with EditableTable)
6. **Semantic HTML**: Use proper table elements for accessibility
7. **Generalization**: Contracts must work for ANY create table use case, not vocabulary-specific

## Key Differences: Create vs Edit

| Concern | Edit Mode | Create Mode |
|---------|-----------|-------------|
| **Source Data** | Has source data from server | No source data (all new) |
| **State Model** | Diffs-only (tracks changes) | Full state (all rows are new) |
| **Dirty Tracking** | `dirtyRowIds: Set<string>` | Not applicable (all rows are "new") |
| **Save Operation** | `applyChanges()` → saves to server | `saveData()` → returns data for external save |
| **Reset/Discard** | `discardChanges()` → clears diffs | `resetTable()` → clears all rows |
| **Loading State** | `isLoading` (loading source data) | Not needed (no initial load) |
| **Validation** | Merges source + diffs | Validates current rows directly |
| **Has Changes** | `hasUnsavedChanges` (based on diffs) | `hasData` (based on row count) |

## The Contracts

### CreateTableUseCaseProps

**Contract for the use case layer** - defines what a use case must provide:

- **Data**: `rows`, `columns` (from unit hook)
- **State**: `validationErrors`, `isValid` (from unit hook validation)
- **State**: `isSaving` (from use case - React Query mutation state)
- **State**: `hasData` (derived - indicates if table has any non-ghost rows)
- **Actions**: `onCellChange`, `onPaste` (from unit hook)
- **Actions**: `onSave` (use case wrapper - calls `saveData()` then persists)
- **Actions**: `onReset` (use case wrapper - calls `resetTable()`)
- **Focus Management**: `setActiveCellInfo`, `clearActiveCellInfo` (from unit hook)

**Key Differences from EditableTable:**
- ❌ No `dirtyRowIds` (all rows are new, no concept of "dirty")
- ❌ No `isLoading` (no source data to load in create mode)
- ❌ No `onDiscard` (use `onReset` instead - clears all data, not just changes)
- ✅ `hasData` instead of `hasUnsavedChanges` (indicates if table has any rows)
- ✅ `onReset` instead of `onDiscard` (clears all data)

**Generalization Principle**: This contract contains ONLY what's needed for ANY create table. Use cases can add their own concerns (e.g., subcategory selection) but those are NOT part of the base contract.

### CreateTableProps

**Complete contract for the interface component** - extends `CreateTableUseCaseProps` with presentation concerns:

- All props from `CreateTableUseCaseProps`
- **Presentation**: `displayConfig` (column labels, widths)
- **Presentation**: `renderCell` (cell renderer function)
- **Presentation**: `className` (optional styling)

## Layer Responsibilities

### 1. Unit Hook (`useCreateTable`)

**Location**: `@application/units/pasteTable/useCreateTable`

**Current State**: ✅ Already exists with `CreateTableHook<T>` interface

**Provides**:
- Core table state management (rows, ghost row)
- Basic validation state
- Cell update operations (with ghost row conversion)
- Paste handling (create mode)
- Focus tracking
- `data.rows`, `data.columns`
- `validationState`
- `updateCell`, `handlePaste`
- `setActiveCellInfo`, `clearActiveCellInfo`
- `saveData()` (returns `T[] | undefined`)
- `resetTable()`

**Does NOT provide**:
- `displayConfig` (presentation concern)
- `renderCell` (presentation concern)
- `isSaving` (use case concern - from React Query mutation)
- `hasData` (derived state - use case concern)
- `onSave` wrapper (use case concern - calls `saveData()` then persists)
- `onReset` wrapper (use case concern - calls `resetTable()`)

### 2. Use Case (e.g., `useNonVerbCreation`, `useVerbCreation`, etc.)

**Location**: `@application/useCases/*`

**Current State**: ⚠️ Partially follows pattern - exposes `tableHook` directly instead of composing `tableProps`

**Responsibilities**:
- Orchestrates unit hooks and business logic
- Adds use-case-specific validation (if needed)
- Manages saving state from React Query mutations
- Provides error handling
- Wraps `saveData()` with external persistence
- Derives `hasData` from row count (excluding ghost row)
- Composes `tableProps` before returning

**Should Provide**:
- `tableProps` - Pre-composed object that satisfies `CreateTableUseCaseProps` contract
  - Composes data from `createTable` (unit hook)
  - Adds `isSaving` (from React Query mutation)
  - Adds `hasData` (derived: `rows.filter(r => r.id !== GHOST_ROW_ID).length > 0`)
  - Wraps `saveData()` → `onSave()` (calls `saveData()` then persists via mutation)
  - Wraps `resetTable()` → `onReset()` (calls `resetTable()`)
  - Maps `validationState.errors` → `validationErrors` format
  - Maps `validationState.isValid` → `isValid`
- Use-case-specific concerns (e.g., `subcategories`, `selectedSubcategoryId` for vocabulary)
- Error handling (e.g., `saveError`)

**Contract**: Returns `tableProps: CreateTableUseCaseProps` - explicitly defines what the use case provides

**Generalization**: Use cases can add their own concerns beyond `tableProps`, but `tableProps` itself must satisfy the contract for reuse.

**Does NOT provide**:
- `displayConfig` (interface layer concern)
- `renderCell` (interface layer concern)

### 3. Interface Component (`CreateTable`)

**Location**: `@interface/components/CreateTable/CreateTable` (to be created)

**Responsibilities**:
- Defines presentation configuration (`displayConfig`)
- Defines cell rendering logic (`renderCell`)
- Composes all props to satisfy `CreateTableProps` contract
- Handles interface-specific concerns
- Uses extracted hooks for keyboard/focus management
- Renders semantic HTML table structure

**Should Provide**:
- `displayConfig` (column labels, widths, placeholders)
- `renderCell` (which component to render for each cell type)
- Spreads `tableProps` from use case to complete `CreateTableProps` contract
- Save button (calls `onSave`)
- Reset button (calls `onReset`)
- Loading state for save operation (`isSaving`)

## Composition Flow

```
┌─────────────────────────────────────────────────────────┐
│ Interface Component (NonVerbCreator)                    │
│ - displayConfig (presentation)                          │
│ - renderCell (presentation)                              │
│ - Composes all props → CreateTable                      │
└────────────────────┬──────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Use Case (useNonVerbCreation)                          │
│ - Business logic                                         │
│ - Save operation (React Query)                         │
│ - Composes tableProps: CreateTableUseCaseProps         │
│ - Returns: { tableProps, saveError, ... }              │
└────────────────────┬──────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Unit Hook (useCreateTable)                              │
│ - Core table state (rows, ghost row)                    │
│ - Basic validation                                      │
│ - Cell operations                                       │
│ - Returns: data, updateCell, handlePaste, saveData, etc.│
└─────────────────────────────────────────────────────────┘
```

## Example: NonVerbCreator Migration

### Current (Legacy Pattern):
```typescript
// Use case exposes tableHook directly
const { tableHook, saveVocabulary } = useNonVerbCreation();

// Interface uses PasteTable with raw hook
<PasteTable hook={tableHook} displayConfig={config} />
```

### Target (Composition Pattern):
```typescript
// Interface layer - presentation concerns
const vocabularyDisplayConfig: ColumnDisplayConfig[] = [
  { id: 'word', label: 'Word', width: '1fr' },
  { id: 'descriptor', label: 'Descriptor', width: '2fr' },
  // ...
];

const renderCell = (props: CellRenderProps) => {
  return <StandardCell {...props} />;
};

// Use case provides pre-composed tableProps (satisfies CreateTableUseCaseProps)
const { tableProps, saveError } = useNonVerbCreation();

// Interface layer adds presentation concerns to complete CreateTableProps
<CreateTable
  {...tableProps}                        // ← All use case props
  displayConfig={vocabularyDisplayConfig} // ← Interface layer adds presentation
  renderCell={renderCell}                 // ← Interface layer adds presentation
/>
```

## Benefits of This Pattern for CreateTable

1. **Consistency**: Same pattern as EditableTable makes codebase easier to understand
2. **Separation**: Clear boundaries between unit, use case, and interface layers
3. **Reusability**: Unit hook can be reused across different create use cases
4. **Testability**: Each layer can be tested independently
5. **Flexibility**: Interface layer can customize rendering without modifying core logic
6. **Type Safety**: Explicit contracts ensure type safety across layers
7. **Maintainability**: Changes to one layer don't affect others

## Implementation Checklist

### Phase 1: Define Contracts
- [ ] Create `CreateTableUseCaseProps` interface
- [ ] Create `CreateTableProps` interface (extends use case props)
- [ ] Update `CellRenderProps` if needed (remove `isDirty` for create mode?)

### Phase 2: Update Use Case
- [ ] Refactor `useNonVerbCreation` to compose `tableProps`
- [ ] Add `hasData` derived state
- [ ] Wrap `saveData()` → `onSave()`
- [ ] Wrap `resetTable()` → `onReset()`
- [ ] Map `validationState` to `validationErrors` format
- [ ] Add `isSaving` from React Query mutation

### Phase 3: Create Component
- [ ] Create `CreateTable` component
- [ ] **REUSE** keyboard navigation hook from `@interface/components/EditableTable/hooks/useTableKeyboardNavigation`
- [ ] **REUSE** focus management hook from `@interface/components/EditableTable/hooks/useTableFocus`
- [ ] Use semantic HTML table structure (same as EditableTable)
- [ ] Implement `renderCell` prop support (same pattern as EditableTable)
- [ ] Add Save and Reset buttons (generic, not use-case-specific)
- [ ] Handle `isSaving` loading state
- [ ] Share styles with EditableTable where possible

### Phase 4: Migration
- [ ] Update `NonVerbCreator` to use new `CreateTable`
- [ ] Remove `PasteTable` usage
- [ ] Test thoroughly

### Phase 5: Cleanup
- [ ] Deprecate `usePasteTable` (if still exists)
- [ ] Remove `PasteTable` component (after all migrations)
- [ ] Update documentation

## Reusability Analysis

### What's Already Reusable ✅

1. **Unit Hook**: `useCreateTable<T>` - Generic, works for any domain type
2. **Keyboard Navigation**: `useTableKeyboardNavigation` - Already extracted, works for any table
3. **Focus Management**: `useTableFocus` - Already extracted, works for any table
4. **Cell Components**: All cell types (StandardCell, TextCell, etc.) - Already reusable
5. **Table Header**: `EditableTableHeader` - Generic, only needs `columns` and `getDisplay`

### What Needs Adaptation 🔄

1. **Table Footer**: `EditableTableFooter` has `hasUnsavedChanges` (edit-specific)
   - **Solution**: Create `CreateTableFooter` with `hasData` instead, or make footer generic with optional props
2. **Table Row**: `EditableTableRow` has `dirtyRowIds` (edit-specific)
   - **Solution**: Create `CreateTableRow` without dirty tracking, or make it optional

### What's Truly Shared vs Separate

| Component | Status | Notes |
|-----------|--------|-------|
| `useTableKeyboardNavigation` | ✅ Shared | Works for both edit and create |
| `useTableFocus` | ✅ Shared | Works for both edit and create |
| `EditableTableHeader` | ✅ Shared | Generic header rendering |
| Cell components | ✅ Shared | All cell types work for both |
| `EditableTableRow` | 🔄 Needs variant | Has `dirtyRowIds` - create doesn't need this |
| `EditableTableFooter` | 🔄 Needs variant | Has `hasUnsavedChanges` - create uses `hasData` |
| `EditableTable` | ❌ Separate | Edit-specific logic (diffs, dirty tracking) |
| `CreateTable` | ❌ Separate | Create-specific logic (ghost row, reset) |

### Generalization Checklist

To ensure this pattern is truly reusable:

- [x] **Unit Hook is Generic**: `useCreateTable<T>` works for any domain type
- [x] **Contracts are Minimal**: Only include what's needed for ANY create table
- [x] **Hooks are Shared**: Keyboard/focus hooks already exist and are reusable
- [x] **Cell Components are Shared**: All cell types work for both edit and create
- [x] **Header is Shared**: Generic header component
- [ ] **Component is Generic**: `CreateTable` works for any use case without modification
- [ ] **Use Cases are Independent**: Each use case can add its own concerns without affecting the contract
- [ ] **No Vocabulary-Specific Logic**: No hardcoded vocabulary concerns in shared code
- [ ] **Footer/Row Variants**: Create variants that work for create mode without edit-specific props

## Open Questions

1. **CellRenderProps.isDirty**: Should this be removed for create mode, or set to `false` always?
   - **Recommendation**: Keep it for consistency with EditableTable, always `false` in create mode
   - **Rationale**: Allows `renderCell` functions to be shared between edit and create modes

2. **Shared Hooks**: Should keyboard/focus hooks be shared between EditableTable and CreateTable?
   - **Recommendation**: ✅ YES - Already extracted in `@interface/components/EditableTable/hooks`
   - **Action**: Import and reuse `useTableKeyboardNavigation` and `useTableFocus`

3. **Ghost Row Handling**: How should ghost row be handled in `hasData`?
   - **Recommendation**: `hasData = rows.filter(r => r.id !== GHOST_ROW_ID).length > 0`
   - **Rationale**: Ghost row is UI-only, not actual data

4. **Validation Errors Format**: Should we use same format as EditableTable?
   - **Recommendation**: ✅ YES - `Record<string, Record<string, string>>` for consistency
   - **Rationale**: Allows shared validation error display components

5. **Save Button Placement**: Should save be in CreateTable or external?
   - **Recommendation**: In CreateTable (via `onSave` prop), but use case controls the actual save logic
   - **Rationale**: Consistent with EditableTable pattern, but flexible enough for different save flows

6. **Shared Components**: Can we share table structure components with EditableTable?
   - **Recommendation**: ✅ Share header, create variants for row/footer
   - **Action**: Reuse `EditableTableHeader`, create `CreateTableRow` and `CreateTableFooter` variants

## Key Principle: Minimal Contracts

**The contracts should contain ONLY what's needed for ANY create table use case.**

### ✅ Include in Contract:
- Core table operations (cell changes, paste, save, reset)
- Validation state (errors, isValid)
- Loading state (isSaving)
- Data presence (hasData)
- Focus management (for paste operations)

### ❌ Do NOT Include in Contract:
- Use-case-specific concerns (e.g., subcategory selection)
- Domain-specific validation (beyond basic schema validation)
- Custom save logic (contract just needs `onSave` callback)
- UI-specific concerns (displayConfig, renderCell)

### Example: Use Case Can Add Its Own Concerns

```typescript
// ✅ Good: Use case adds its own concerns beyond tableProps
const { tableProps, subcategories, selectedSubcategoryId, ... } = useNonVerbCreation();

// ❌ Bad: Don't put vocabulary-specific concerns in CreateTableUseCaseProps
// (e.g., don't add subcategories to the base contract)
```

**The pattern is reusable because the contract is minimal. Use cases compose the contract and add their own concerns separately.**
