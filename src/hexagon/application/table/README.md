# Table Application Layer

This module provides core table functionality for handling tabular data with validation and save operations.

## Core Concepts

- `TableData`: Core data structure for tabular data
- `TableColumn`: Column definition with field identifier and display properties
- `TableHook`: Core hook interface providing data management and validation

## Key Features

- Paste handling for tabular data
- Cell value updates
- Row-level validation
- Save operations with validation
- Clear table functionality

## Usage

The table module is designed to be extended by domain-specific implementations (like vocabulary). Example:

```typescript
const tableHook = useTableData<YourDataType>({
  columns: yourColumns,
  validateRow: (row) => {
    // Your validation logic
    return errors;
  },
});
```

## Layer Responsibilities

- Data structure definition
- Core table operations
- Validation logic
- Save operations
- No UI concerns
