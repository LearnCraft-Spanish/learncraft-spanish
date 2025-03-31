# PasteTable Component

A flexible, accessible table component that handles pasting tabular data and cell-by-cell editing, built with a clean separation between application and interface concerns.

## Features

- Paste tab-separated data directly into the table
- Cell-by-cell editing with textarea fields
- Accessible keyboard navigation
- Type-safe data structure with generics
- Built-in validation support
- Clear and save functionality
- Ghost row for continuous pasting
- Error boundary for graceful error handling

## Basic Usage

```tsx
import { useVocabularyTable } from '../../application/vocabulary/useVocabularyTable';
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

The PasteTable system uses a clean two-layer architecture:

1. **Application Layer** (`useTableData`): Handles the fundamental table operations

   - Data management
   - Validation
   - Business rules
   - No UI concerns

2. **Interface Layer** (`PasteTable`): Manages all UI concerns
   - Display logic
   - User interactions
   - Accessibility
   - Error handling

This separation allows for maximum reusability while maintaining type safety and clean code.

## Hook Interface

The component expects a hook that implements the `TableHook` interface:

```typescript
interface TableHook<T> {
  data: TableData;
  columns: TableColumn[];
  handlePaste: (event: React.ClipboardEvent<Element>) => void;
  handleCellChange: (rowId: string, columnId: string, value: string) => void;
  handleSave: () => Promise<T[] | undefined>;
  clearTable: () => void;
  isSaveEnabled: boolean;
}
```

## Component API

```typescript
interface PasteTableProps<T> {
  /** Hook instance that manages the table's data and behavior */
  hook: TableHook<T>;

  /** @default "Save" */
  saveButtonText?: string;

  /** @default "Clear" */
  clearButtonText?: string;

  /** @default "Paste data directly into the table (tab-separated)" */
  pasteHint?: string;
}
```

## Styling

The component uses BEM-style CSS classes for easy customization:

- `.paste-table` - Main container
- `.paste-table__header` - Table header
- `.paste-table__column-header` - Individual column headers
- `.paste-table__body` - Table body
- `.paste-table__row` - Table rows
- `.paste-table__cell` - Individual cells (textareas)
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
- Focus management for the ghost row
- Clear error states and validation feedback

## Best Practices

1. **Type Safety**

   - Use generics to ensure type safety between your data and the table
   - Define clear interfaces for your data structures

2. **Error Handling**

   - The component includes an error boundary for runtime errors
   - Validation errors are displayed inline
   - Clear error messages for accessibility

3. **Performance**

   - Memoized calculations for grid layout
   - Efficient re-renders with proper state management
   - Optimized event handlers

4. **Accessibility**
   - All interactive elements are keyboard accessible
   - ARIA labels and roles are properly set
   - Focus management is handled correctly
