# Adapters

This directory contains thin wrappers that adapt infrastructure implementations to match application-defined ports.

## Purpose

Adapters:

- Bridge infrastructure implementations to application ports
- Handle any necessary data transformations
- Provide consistent interfaces for use-cases
- Enable easy mocking in tests

## Usage

```typescript
// Example adapter
export function useDataAdapter(infrastructure: DataInfrastructure): DataPort {
  return {
    fetchData: async () => {
      const rawData = await infrastructure.getData();
      return transformData(rawData);
    },
    saveData: async (data: Data) => {
      const rawData = transformDataForStorage(data);
      await infrastructure.storeData(rawData);
    },
  };
}
```

## Guidelines

- Keep adapters thin and focused
- Handle only data transformation
- Never implement business logic
- Match port interfaces exactly
- Include tests for transformation logic
- Document any assumptions about data shape
