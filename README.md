initial feature commit

# LearnCraft Spanish

This is a web application for learning Spanish vocabulary.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Testing

This project uses Vitest for testing. There are two separate test configurations:

### Main Tests

```bash
# Run all tests with the default configuration
npm test

# Run specific tests
npm test -- path/to/test.ts
```

### Hexagon Tests

Hexagon tests use a special configuration that sets up the proper test environment with mocks.

```bash
# Run all hexagon tests
npm test -- src/hexagon/**/*.test.ts --config vitest.config-hexagon.ts

# Run specific hexagon tests
npm test -- src/hexagon/path/to/test.ts --config vitest.config-hexagon.ts
```

> **Important:** When running hexagon tests, always specify the hexagon config file using `--config vitest.config-hexagon.ts`. This ensures the proper test setup and mock initialization.

## Architecture

This project uses a hexagonal architecture approach with:

- Interface layer: Components and UI logic
- Application layer: Use cases and business logic
- Domain layer: Core business entities and rules
- Adapter layer: External services integration

## Contributing

Please make sure to write tests for new features and ensure all tests pass before submitting pull requests.
