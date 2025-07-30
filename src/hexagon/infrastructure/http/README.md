# HTTP Infrastructure

This directory contains HTTP client implementations used to communicate with external services.

Always use endpoint definitions from the shared package:

```typescript
// CORRECT ✅
import { Endpoints } from '@learncraft-spanish/shared';
const response = await httpClient.get(Endpoints.resource.path);

// WRONG ❌ - DO NOT DO THIS!
const response = await httpClient.get('/api/resource');
```

## Client Implementation

The HTTP client is responsible for:

1. Making authenticated requests to the API
2. Handling common error cases
3. Managing request/response serialization

### Usage Example

```typescript
import { createAuthenticatedHttpClient } from '../http/client';

// Create client with authentication
const httpClient = createAuthenticatedHttpClient(apiUrl, auth);

// Use with endpoint from shared package
const response = await httpClient.get(Endpoints.resource.path);
```

## Testing

Mock the HTTP client in tests to avoid making real network requests.
