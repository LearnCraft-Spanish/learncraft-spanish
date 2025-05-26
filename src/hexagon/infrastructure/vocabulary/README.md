# Vocabulary Infrastructure

This directory contains implementations of vocabulary-related ports defined in the application layer.

## ⚠️ CRITICAL: API Path Usage Policy ⚠️

**HARDCODING API PATHS IS STRICTLY PROHIBITED.**

All API paths MUST come from the shared package endpoint definitions:

```typescript
// CORRECT - Using shared package endpoints
import { SubcategoryEndpoints } from '@LearnCraft-Spanish/shared';

// Then in your code:
const path = SubcategoryEndpoints.getById.path.replace(':id', id);
```

## Implementations

### `subcategoryInfrastructure.ts`

Implements the `SubcategoryPort` which provides methods for fetching subcategories from the API.

### `vocabularyInfrastructure.ts`

Implements the `VocabularyPort` which provides methods for fetching and managing vocabulary items.

## Testing

Each implementation must have corresponding tests that mock external API calls to ensure fast and reliable testing.
