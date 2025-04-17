# PasteTable Component

A flexible, accessible table component that handles pasting tabular data and cell-by-cell editing, built with a clean separation between application and interface concerns.

## Features

- Paste tab-separated data directly into the table
- Cell-by-cell editing with appropriate input fields (text, number, select)
- Accessible keyboard navigation
- Type-safe data structure with generics
- Built-in validation support
- Clear and save functionality
- Ghost row for continuous data entry
- Error boundary for graceful error handling

## Basic Usage

```tsx
import { useVocabularyTable } from '../../../application/units/useVocabularyTable';
import { PasteTable } from './PasteTable';

interface VocabularyEntry {
  spanish: string;
  english: string;
  usage: string;
  rank?: number;
}

const MyComponent = () => {
  const tableHook = useVocabularyTable();

  return (
    <PasteTable
      hook={tableHook}
      saveButtonText="Save Vocabulary"
      clearButtonText="Start Over"
      pasteHint="Paste your vocabulary list here"
    />
  );
};
```

## Architecture

The PasteTable system uses a clean three-layer architecture:

1. **Application Layer** (`useTableData`): Handles the core business logic

   - Data management and transformation
   - Validation
   - Business rules
   - No UI concerns

2. **Interface Adapter Layer** (`usePasteTableInterface`): Bridges application and UI

   - Adapts application hook for UI needs
   - Encapsulates UI-specific state management
   - Manages DOM references and focus behavior
   - Groups related UI handlers
   - Transforms business data for presentation

3. **UI Components Layer** (`PasteTable`, `TableRow`, `CellRenderer`): Manages rendering
   - Small, focused components with single responsibilities
   - Declarative rendering without business logic
   - Accessibility and UI interactions
   - Visual styling and layout

This separation creates a maintainable system that:

- Keeps business logic isolated from UI concerns
- Makes testing easier with clear boundaries
- Allows independent evolution of each layer
- Simplifies component structure through composition

## Component Structure

```
PasteTable
├── usePasteTableInterface (adapter hook)
├── TableRow (for each row in the data)
│   └── TableCellInput (for each cell in the row)
└── PasteTableErrorBoundary (for error handling)
```

## Hook Interface

The application layer provides a hook that implements the `TableHook` interface:

```typescript
interface TableHook<T> {
  data: {
    rows: TableRow[];
    columns: TableColumn[];
  };
  updateCell: (rowId: string, columnId: string, value: string) => string | null;
  saveData: () => Promise<T[] | undefined>;
  resetTable: () => void;
  importData: (data: T[]) => void;
  handlePaste: (e: ClipboardEvent<Element>) => void;
  setActiveCellInfo: (rowId: string, columnId: string) => void;
  clearActiveCellInfo: () => void;
  isSaveEnabled: boolean;
}
```

## Interface Adapter Hook

The `usePasteTableInterface` hook serves as an adapter between the application hook and UI components:

```typescript
// Example usage
const {
  rows, // Table data rows
  columns, // Table columns configuration
  activeCell, // Currently focused cell
  tableStyle, // CSS variables for layout
  cellHandlers, // Grouped event handlers for cells
  registerCellRef, // Function to register DOM refs
  getAriaLabel, // Accessibility helper
  handlePaste, // Paste event handler
  resetTable, // Clear table function
  saveData, // Save function
  isSaveEnabled, // Whether save is enabled
} = usePasteTableInterface(tableHook);
```

## Component API

```typescript
interface PasteTableProps<T> {
  /** Hook instance from application layer that manages the table's data and behavior */
  hook: TableHook<T>;

  /** @default "Save" */
  saveButtonText?: string;

  /** @default "Clear" */
  clearButtonText?: string;

  /** @default "Paste tab-separated values" */
  pasteHint?: string;
}
```

## Styling

The component uses CSS Grid for layout with CSS variables for column widths:

```css
.paste-table {
  --grid-template-columns: 1fr 2fr 1fr; /* Dynamically set from column config */
}
```

The component uses BEM-style CSS classes for easy customization:

- `.paste-table` - Main container
- `.paste-table__table-grid` - Grid container
- `.paste-table__header` - Table header
- `.paste-table__column-header` - Individual column headers
- `.paste-table__body` - Table body
- `.paste-table__row` - Table rows
- `.paste-table__cell-container` - Cell wrapper
- `.paste-table__cell` - Individual input fields
- `.paste-table__cell-error` - Error message display
- `.paste-table__footer` - Footer with actions
- `.paste-table__hint` - Paste instructions
- `.paste-table__actions` - Action buttons container
- `.paste-table__action-button` - Action buttons
  - `--primary` modifier for save button
  - `--secondary` modifier for clear button

## Accessibility

The component includes:

- ARIA roles and labels for all interactive elements
- Keyboard navigation between cells
- Screen reader support with descriptive labels
- Focus management with proper ref handling
- Clear error states and validation feedback

## Best Practices

1. **Clean Architecture**

   - Separation of concerns between application logic and UI
   - Adapter pattern via interface hook
   - Small, focused components with single responsibilities

2. **Type Safety**

   - Use generics to ensure type safety between your data and the table
   - Define clear interfaces for your data structures

3. **Error Handling**

   - Component includes an error boundary for runtime errors
   - Validation errors are displayed inline
   - Clear error messages for accessibility

4. **Performance**

   - Memoized calculations for grid layout
   - Efficient re-renders with proper state management
   - Optimized event handlers with useCallback

5. **Accessibility**
   - All interactive elements are keyboard accessible
   - ARIA labels and roles are properly set
   - Focus management is handled correctly
