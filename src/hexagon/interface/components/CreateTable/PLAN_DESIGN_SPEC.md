# CreateTable & Table System Refactor - Plan, Design & Spec

## Plan

### Phase 1: Refactor Unit Hooks (Remove Entanglement)

**Goal**: Remove mapping and validation from unit hooks, make them focused on state management only.

**Tasks**:

1. **Split `useEditTable`**:
   - Extract `useEditTableState` - state management only (diffs, rows, cell updates)
   - Takes `TableRow[]` (not domain entities)
   - Returns state operations only

2. **Split `useCreateTable`**:
   - Extract `useCreateTableState` - state management only (rows, ghost row, cell updates)
   - Takes `TableRow[]` (not domain entities)
   - Returns state operations only

3. **Expose necessary operations**:
   - `setRows` / `setRowsViaDiffs` for use case to set rows after mapping
   - `getRows` / `getDirtyRows` for use case to get rows for mapping

**Scope**: ~200 lines refactored, ~150 lines new

### Phase 2: Split Mappers and Validation

**Goal**: Make mapping and validation separate, composable units.

**Tasks**:

1. **Mapping utilities** (already exist, just document):
   - `mapDomainToTableRows` - domain → table
   - `mapTableRowsToDomain` - table → domain
   - `normalizeRowCells` - normalize strings

2. **Validation utilities** (refactor):
   - Keep `validateEntity` (domain-side validation) - already exists
   - Remove mapping from `createCombinedValidateRow`
   - Use case composes: normalize → map → validate

**Scope**: ~50 lines refactored (remove mapping from validation functions)

### Phase 3: Update EditTable Use Case

**Goal**: Update `useExampleEditor` to use corrected API (composition pattern).

**Tasks**:

1. Map domain → table before calling `useEditTableState`
2. Compose validation separately (normalize → map → validate)
3. Compose `tableProps` to satisfy interface contract

**Scope**: ~100 lines changed

### Phase 4: Build CreateTable

**Goal**: Build CreateTable component and use case with proper composition pattern.

**Tasks**:

1. Create `CreateTableUseCaseProps` interface
2. Create `CreateTableProps` interface
3. Update `useNonVerbCreation` to compose properly
4. Create `CreateTable` component
5. Update `NonVerbCreator` to use new component

**Scope**: ~400 lines new

## Design

### Core Principles

1. **Interface Contract is Stable**: `EditableTableUseCaseProps` / `CreateTableUseCaseProps` define what interface needs
2. **Composition Over Interception**: Use case composes focused units, doesn't intercept/modify
3. **Focused Units**: Each unit has single responsibility (state, validation, mapping are separate)
4. **Use Case Owns Composition**: Use case composes units to satisfy interface contract
5. **Domain-Side Validation**: Validation happens on domain entities (typed), not table rows (strings)

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Interface Component (CreateTable / EditableTable)       │
│ - Receives tableProps: UseCaseProps (stable contract)   │
│ - Adds displayConfig, renderCell (presentation)         │
└────────────────────┬──────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Use Case (useNonVerbCreation / useExampleEditor)        │
│ - Composes focused units                                 │
│ - Maps domain ↔ table                                    │
│ - Composes validation                                    │
│ - Composes tableProps: UseCaseProps                     │
└─────┬───────────────────┬───────────────────┬──────────┘
      │                   │                   │
      ▼                   ▼                   ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│ Table State │  │  Validation  │  │   Mapping    │
│   (hooks)   │  │  (functions) │  │  (functions) │
│             │  │              │  │              │
│ - useEdit   │  │ - validate   │  │ - mapDomain  │
│   TableState│  │   Entity     │  │ - mapTable   │
│ - useCreate │  │ - normalize  │  │ - normalize  │
│   TableState│  │              │  │              │
└─────────────┘  └──────────────┘  └──────────────┘
```

### Composition Pattern

**Use case composes** (not intercepts):

```typescript
// 1. Map domain → table
const sourceRows = mapDomainToTableRows(sourceData, columns, idColumnId);

// 2. State management (focused unit)
const tableState = useEditTableState({ sourceRows, columns });

// 3. Compose validation: normalize → map → validate (domain-side)
const validateRow = useMemo(() => {
  return (row: TableRow) => {
    const normalized = normalizeRowCells(row.cells, columns);
    const domainEntity = mapTableRowToDomain(
      { ...row, cells: normalized },
      columns,
    );
    const result = validateEntity(domainEntity, rowSchema);
    return result.errors;
  };
}, [columns, rowSchema]);

// 4. Validation (focused unit)
const validation = useTableValidation({
  rows: tableState.data.rows,
  validateRow,
});

// 5. Compose tableProps to satisfy interface contract
const tableProps = {
  rows: tableState.data.rows,
  validationErrors: validation.validationState.errors,
  isValid: validation.validationState.isValid,
  // ... compose all required props
};
```

## Spec

### Interfaces

#### CreateTableUseCaseProps

**Contract for use case layer** - what use case must provide to CreateTable:

```typescript
interface CreateTableUseCaseProps {
  // Data
  rows: TableRow[];
  columns: ColumnDefinition[];

  // State
  validationErrors: Record<string, Record<string, string>>;
  isValid: boolean;
  isSaving: boolean;
  hasData: boolean; // rows.filter(r => r.id !== GHOST_ROW_ID).length > 0

  // Actions
  onCellChange: (rowId: string, columnId: string, value: string) => void;
  onPaste?: (e: ClipboardEvent<Element>) => void;
  onSave?: () => Promise<void>;
  onReset?: () => void;

  // Focus Management
  setActiveCellInfo?: (rowId: string, columnId: string) => void;
  clearActiveCellInfo?: () => void;
}
```

#### CreateTableProps

**Complete contract for interface component** - extends use case props with presentation:

```typescript
interface CreateTableProps extends CreateTableUseCaseProps {
  displayConfig: ColumnDisplayConfig[];
  renderCell: (props: CellRenderProps) => React.ReactNode;
  className?: string;
}
```

### Unit Hooks

#### useEditTableState

**Focused unit**: State management only (diffs, rows, cell updates)

```typescript
interface UseEditTableStateOptions {
  sourceRows: TableRow[]; // Already mapped, not domain entities
  columns: ColumnDefinition[];
  computeDerivedFields?: (row: TableRow) => Record<string, string>;
}

interface EditTableStateHook {
  data: { rows: TableRow[]; columns: ColumnDefinition[] };
  updateCell: (rowId: string, columnId: string, value: string) => null;
  handlePaste: (e: ClipboardEvent<Element>) => void;
  setActiveCellInfo: (rowId: string, columnId: string) => void;
  clearActiveCellInfo: () => void;
  hasUnsavedChanges: boolean;
  dirtyRowIds: Set<string>;
  discardChanges: () => void;
  getDirtyRows: () => TableRow[]; // For use case to map
  setRowsViaDiffs: (rows: TableRow[]) => void; // For use case to set rows
}
```

**Does NOT provide**:

- Domain mapping
- Validation
- Schema knowledge

#### useCreateTableState

**Focused unit**: State management only (rows, ghost row, cell updates)

```typescript
interface UseCreateTableStateOptions {
  initialRows?: TableRow[]; // Already mapped, not domain entities
  columns: ColumnDefinition[];
}

interface CreateTableStateHook {
  data: { rows: TableRow[]; columns: ColumnDefinition[] };
  updateCell: (rowId: string, columnId: string, value: string) => string | null;
  handlePaste: (e: ClipboardEvent<Element>) => void;
  setActiveCellInfo: (rowId: string, columnId: string) => void;
  clearActiveCellInfo: () => void;
  resetTable: () => void;
  getRows: () => TableRow[]; // For use case to map
  setRows: (rows: TableRow[]) => void; // For use case to set rows
}
```

**Does NOT provide**:

- Domain mapping
- Validation
- Schema knowledge

### Validation Pattern

**Domain-side validation** (correct approach):

```typescript
// Use case composes: normalize → map → validate
const validateRow = useMemo(() => {
  return (row: TableRow) => {
    // 1. Normalize strings
    const normalized = normalizeRowCells(row.cells, columns);

    // 2. Map to domain entity (typed)
    const domainEntity = mapTableRowToDomain(
      { ...row, cells: normalized },
      columns,
    );

    // 3. Validate domain entity (typed validation)
    const result = validateEntity(domainEntity, rowSchema);
    return result.errors;
  };
}, [columns, rowSchema]);

// Use with useTableValidation
const validation = useTableValidation({
  rows: tableState.data.rows,
  validateRow,
});
```

**Key**: Mapping and validation are separate, composable steps. Use case composes them.

### Mapping Pattern

**Use case owns mapping**:

```typescript
// Domain → Table (before state)
const sourceRows = mapDomainToTableRows(sourceData, columns, idColumnId);
const tableState = useEditTableState({ sourceRows, columns });

// Table → Domain (for save)
const dirtyRows = tableState.getDirtyRows();
const domainEntities = mapTableRowsToDomain(dirtyRows, columns);
await saveMutation(domainEntities);
```

## Implementation Checklist

### Phase 1: Refactor Unit Hooks

- [ ] Create `useEditTableState` (extract from `useEditTable`)
- [ ] Create `useCreateTableState` (extract from `useCreateTable`)
- [ ] Expose `getRows`, `getDirtyRows`, `setRows`, `setRowsViaDiffs`
- [ ] Remove mapping from unit hooks
- [ ] Remove validation from unit hooks

### Phase 2: Split Mappers and Validation

- [ ] Document mapping utilities (already exist)
- [ ] Refactor `createCombinedValidateRow` to not do mapping internally
- [ ] Create helper: `createValidateRowFromSchemas` (optional, for convenience)
- [ ] Update validation to be composable (use case composes mapping + validation)

### Phase 3: Update EditTable Use Case

- [ ] Update `useExampleEditor` to map domain → table before state
- [ ] Compose validation separately (normalize → map → validate)
- [ ] Compose `tableProps` to satisfy `EditableTableUseCaseProps`
- [ ] Test thoroughly

### Phase 4: Build CreateTable

- [ ] Create `CreateTableUseCaseProps` interface
- [ ] Create `CreateTableProps` interface
- [ ] Update `useNonVerbCreation` to compose properly
- [ ] Create `CreateTable` component
- [ ] Reuse EditableTable hooks (keyboard, focus)
- [ ] Update `NonVerbCreator` to use new component
- [ ] Test thoroughly

## Key Principles Summary

1. **Interface contract is stable** - this is what matters
2. **Composition over interception** - use case composes, doesn't modify
3. **Focused units** - single responsibility
4. **Domain-side validation** - validate typed entities, not strings
5. **Use case owns composition** - clear ownership
