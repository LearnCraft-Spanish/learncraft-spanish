# Ports

This directory contains type definitions for external dependencies and infrastructure requirements.

## Purpose

Ports define the interfaces that infrastructure must implement. They are pure TypeScript types and interfaces that:

- Define the shape of external dependencies
- Specify required behavior without implementation
- Enable dependency inversion
- Allow for easy mocking in tests

## Usage

```typescript
// Example port definition
export interface DataPort {
  fetchData(): Promise<Data>;
  saveData(data: Data): Promise<void>;
}

// Example port usage in use-case
export function useDataUseCase(port: DataPort) {
  // Use port methods here
}
```

## Guidelines

- Keep ports focused and minimal
- Use TypeScript interfaces for maximum flexibility
- Document any assumptions or requirements
- Never include implementation details
- Never import from infrastructure or other layers
