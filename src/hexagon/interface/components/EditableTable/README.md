# EditableTable Composition Pattern

## Overview

`EditableTable` uses a layered composition pattern where different concerns are provided by different layers. The pattern uses **explicit contracts** to define what each layer must provide.

## The Contracts

### EditableTableUseCaseProps

**Contract for the use case layer** - defines what a use case must provide:

- **Data**: `rows`, `columns`
- **State**: `dirtyRowIds`, `validationErrors`, `isLoading`, `isSaving`, `isValid`
- **Actions**: `onCellChange`, `onPaste`, `onSave`, `onDiscard`
- **Focus Management**: `setActiveCellInfo`, `clearActiveCellInfo`
- **UI State**: `hasUnsavedChanges`

### EditableTableProps

**Complete contract for the interface component** - extends `EditableTableUseCaseProps` with presentation concerns:

- All props from `EditableTableUseCaseProps`
- **Presentation**: `displayConfig` (column labels, widths)
- **Presentation**: `renderCell` (cell renderer function)
- **Presentation**: `className` (optional styling)

## Layer Responsibilities

### 1. Unit Hook (`useEditTable`)

**Location**: `@application/units/pasteTable/useEditTable`

**Provides**:

- Core table state management (diffs, dirty tracking)
- Basic validation state
- Cell update operations
- Paste handling
- Focus tracking
- `data.rows`, `data.columns`
- `dirtyRowIds`
- `hasUnsavedChanges`
- `updateCell`, `handlePaste`
- `setActiveCellInfo`, `clearActiveCellInfo`
- `applyChanges`, `discardChanges`

**Does NOT provide**:

- `displayConfig` (presentation concern)
- `renderCell` (presentation concern)
- `isLoading`, `isSaving` (use case concern)
- Extended validation (use case concern)

### 2. Use Case (`useExampleEditor`)

**Location**: `@application/useCases/useExampleEditor`

**Responsibilities**:

- Orchestrates unit hooks and business logic
- Adds use-case-specific validation (e.g., audio errors, custom field validation)
- Merges validation states from multiple sources
- Manages loading/saving state from React Query mutations
- Provides error handling
- Wraps `onApplyChanges` with validation checks

**Provides**:

- `tableProps` - Pre-composed object that satisfies `EditableTableUseCaseProps` contract
  - Composes data from `editTable` (unit hook)
  - Adds `isLoading`, `isSaving` (from React Query)
  - Merges validation states (unit hook + use case validations)
- `saveError` - Error from save operation
- `audioErrorHandlers` - Handlers for audio-specific concerns

**Contract**: Returns `tableProps: EditableTableUseCaseProps` - explicitly defines what the use case provides

**Does NOT provide**:

- `displayConfig` (interface layer concern)
- `renderCell` (interface layer concern)

### 3. Interface Component (`ExampleEditor`)

**Location**: `@interface/components/ExampleEditorInterface/ExampleEditor`

**Responsibilities**:

- Defines presentation configuration (`displayConfig`)
- Defines cell rendering logic (`renderCell`)
- Composes all props to satisfy `EditableTableProps` contract
- Handles interface-specific concerns (e.g., vocabulary list for custom cells)

**Provides**:

- `displayConfig` (column labels, widths, placeholders)
- `renderCell` (which component to render for each cell type)
- Spreads `tableProps` from use case to complete `EditableTableProps` contract

## Composition Flow

```
┌─────────────────────────────────────────────────────────┐
│ Interface Component (ExampleEditor)                      │
│ - displayConfig (presentation)                           │
│ - renderCell (presentation)                               │
│ - Composes all props → EditableTable                     │
└────────────────────┬──────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Use Case (useExampleEditor)                              │
│ - Business logic                                          │
│ - Extended validation                                    │
│ - Loading/saving state                                   │
│ - Composes tableProps: EditableTableUseCaseProps        │
│ - Returns: { tableProps, saveError, audioErrorHandlers }│
└────────────────────┬──────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Unit Hook (useEditTable)                                 │
│ - Core table state (diffs, dirty tracking)              │
│ - Basic validation                                       │
│ - Cell operations                                        │
│ - Returns: data, updateCell, handlePaste, etc.           │
└─────────────────────────────────────────────────────────┘
```

## Example: ExampleEditor

```typescript
// Interface layer - presentation concerns
const exampleDisplayConfig: ColumnDisplayConfig[] = [
  { id: 'id', label: 'ID', width: '80px' },
  { id: 'spanish', label: 'Spanish', width: '2fr' },
  // ...
];

const renderCellWithSpecialHandlers = (props: CellRenderProps) => {
  const { column } = props;
  // Custom cell rendering logic
  if (column.id === 'spanishAudio') {
    return <AudioPlaybackCell {...props} />;
  }
  return <StandardCell {...props} />;
};

// Use case provides pre-composed tableProps (satisfies EditableTableUseCaseProps)
const { tableProps, saveError, audioErrorHandlers } = useExampleEditor();

// Interface layer adds presentation concerns to complete EditableTableProps
<EditableTable
  {...tableProps}                        // ← All use case props (satisfies EditableTableUseCaseProps)
  displayConfig={exampleDisplayConfig}   // ← Interface layer adds presentation
  renderCell={renderCellWithSpecialHandlers} // ← Interface layer adds presentation
/>
```

**Key Point**: The use case composes `tableProps` before returning, following the codebase pattern. The interface layer only needs to add presentation concerns (`displayConfig`, `renderCell`) to complete the contract.

## Key Principles

1. **Explicit Contracts**: `EditableTableUseCaseProps` explicitly defines what the use case must provide
2. **Contract Composition**: `EditableTableProps` extends the use case contract with interface-layer concerns
3. **Compose Before Returning**: Use cases compose props before returning (following codebase pattern)
4. **Layered Responsibilities**: Each layer owns specific concerns
5. **Use Case Orchestration**: The use case coordinates between unit hooks and interface needs
6. **Interface Customization**: Interface layer controls presentation (`displayConfig`, `renderCell`)

## Why This Pattern?

- **Separation of Concerns**: State management, business logic, and presentation are clearly separated
- **Reusability**: Unit hooks can be reused across different use cases
- **Testability**: Each layer can be tested independently
- **Flexibility**: Interface layer can customize rendering without modifying core logic
- **Composability**: Different use cases can provide different validations while using the same unit hook
