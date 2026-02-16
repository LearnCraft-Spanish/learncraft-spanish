# 🏗️ Feature Development Workflow

_Step-by-step guide to building new features in LearnCraft Spanish_

---

## Overview

This guide walks you through the complete process of adding a new feature to the LearnCraft Spanish application using our hexagonal architecture.

---

## Before You Start

### Prerequisites

1. ✅ Read [`ONBOARDING.md`](./ONBOARDING.md) and have your environment set up
2. ✅ Understand [`ARCHITECTURE.md`](../src/hexagon/ARCHITECTURE.md) - hexagonal architecture
3. ✅ Review [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md) - coding conventions
4. ✅ Read [`DOMAIN_GLOSSARY.md`](./DOMAIN_GLOSSARY.md) - business terminology

### Gather Requirements

Before writing code, clearly understand:

- **What**: What is the feature? What does it do?
- **Who**: Which users will use it? (Students, Coaches, Admins)
- **Why**: What problem does it solve?
- **How**: How should it work? Any special logic or rules?
- **Where**: Where does it fit in the existing system?

**Example**:
> **Feature**: Vocabulary tagging system
> **What**: Allow admins to add tags to vocabulary items
> **Who**: Admins can create/edit tags, all users can filter by tags
> **Why**: Better organization and targeted practice
> **How**: Tags are many-to-many with vocabulary, filterable in quizzes
> **Where**: Extends existing vocabulary management system

---

## The Feature Development Process

### Phase 1: Planning (Before Coding)

#### 1.1 Break Down the Feature

Identify the layers you'll need to touch:

```
Feature: Vocabulary Tagging
├── Domain Layer
│   ├── Tag entity type
│   ├── Validation logic (tag name requirements)
│   └── Pure functions (filterByTag, etc.)
├── Application Layer
│   ├── Port: TagPort (interface for tag operations)
│   ├── Queries: useTagsQuery, useVocabularyByTagQuery
│   ├── Mutations: useCreateTagMutation, useAssignTagMutation
│   └── Use Case: useVocabularyTagManager
├── Infrastructure Layer
│   └── HTTP adapter for tag API endpoints
├── Interface Layer
│   ├── Components: TagList, TagEditor, TagFilter
│   └── Page: VocabularyTagsPage
└── Composition Layer
    └── (Usually no changes needed)
```

#### 1.2 Identify Dependencies

- **External APIs**: What backend endpoints do you need?
- **Existing code**: What existing features does this build on?
- **Shared types**: Are types defined in `@learncraft-spanish/shared`?

#### 1.3 Create a Task List

Break the feature into implementable tasks:

```
## Vocabulary Tagging Implementation Tasks

### Domain
- [ ] Define Tag type/interface
- [ ] Create tag validation function
- [ ] Create filterVocabularyByTag function
- [ ] Write tests for domain functions

### Infrastructure
- [ ] Create TagPort interface
- [ ] Implement tag infrastructure adapter
- [ ] Create mock adapter for testing

### Application
- [ ] Create useTagsQuery
- [ ] Create useCreateTagMutation
- [ ] Create useAssignTagMutation
- [ ] Create useVocabularyTagManager use case
- [ ] Write tests for queries and use case

### Interface
- [ ] Create TagList component
- [ ] Create TagEditor component
- [ ] Create TagFilter component
- [ ] Create VocabularyTagsPage
- [ ] Write component tests

### Integration
- [ ] Test feature end-to-end manually
- [ ] Update documentation
- [ ] Create PR
```

---

### Phase 2: Implementation (The Coding)

#### Step 1: Domain Layer (Pure Logic)

Start from the inside out. Define types and pure business logic.

```typescript
// src/hexagon/domain/vocabulary/tag.types.ts

/**
 * A tag for categorizing vocabulary
 */
export interface VocabularyTag {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
}

/**
 * Input for creating a new tag
 */
export interface CreateTagInput {
  name: string;
  description: string;
  color: string;
}
```

```typescript
// src/hexagon/domain/vocabulary/tagValidation.ts

/**
 * Validates a tag name
 * @returns Error message if invalid, null if valid
 */
export function validateTagName(name: string): string | null {
  if (name.trim().length === 0) {
    return 'Tag name cannot be empty';
  }
  
  if (name.length > 50) {
    return 'Tag name must be 50 characters or less';
  }
  
  if (!/^[a-zA-Z0-9\s-]+$/.test(name)) {
    return 'Tag name can only contain letters, numbers, spaces, and hyphens';
  }
  
  return null;
}
```

```typescript
// src/hexagon/domain/vocabulary/tagValidation.test.ts

import { describe, it, expect } from 'vitest';
import { validateTagName } from './tagValidation';

describe('validateTagName', () => {
  it('should return null for valid tag name', () => {
    expect(validateTagName('Transportation')).toBeNull();
    expect(validateTagName('Past-Tense')).toBeNull();
  });
  
  it('should reject empty names', () => {
    expect(validateTagName('')).toBe('Tag name cannot be empty');
    expect(validateTagName('   ')).toBe('Tag name cannot be empty');
  });
  
  it('should reject names over 50 characters', () => {
    const longName = 'a'.repeat(51);
    expect(validateTagName(longName)).toBe('Tag name must be 50 characters or less');
  });
  
  it('should reject invalid characters', () => {
    expect(validateTagName('Tag@Name')).toMatch(/can only contain/);
  });
});
```

---

#### Step 2: Infrastructure Layer (External Services)

Define the port (interface) and implement the adapter.

```typescript
// src/hexagon/application/ports/tagPort.ts

import type { VocabularyTag, CreateTagInput } from '@domain/vocabulary/tag.types';

/**
 * Port for vocabulary tag operations
 */
export interface TagPort {
  /**
   * Fetch all tags
   */
  getAllTags: () => Promise<VocabularyTag[]>;
  
  /**
   * Create a new tag
   */
  createTag: (input: CreateTagInput) => Promise<VocabularyTag>;
  
  /**
   * Assign a tag to vocabulary
   */
  assignTag: (vocabularyId: string, tagId: string) => Promise<void>;
  
  /**
   * Remove a tag from vocabulary
   */
  removeTag: (vocabularyId: string, tagId: string) => Promise<void>;
}
```

```typescript
// src/hexagon/infrastructure/tags/tagInfrastructure.ts

import type { TagPort } from '@application/ports/tagPort';

export function useTagInfrastructure(): TagPort {
  const httpClient = useHttpClient();
  
  return {
    getAllTags: () => 
      httpClient.get('/tags'),
    
    createTag: (input) => 
      httpClient.post('/tags', input),
    
    assignTag: (vocabularyId, tagId) => 
      httpClient.post(`/vocabulary/${vocabularyId}/tags/${tagId}`),
    
    removeTag: (vocabularyId, tagId) => 
      httpClient.delete(`/vocabulary/${vocabularyId}/tags/${tagId}`),
  };
}
```

```typescript
// src/hexagon/application/adapters/tagAdapter.ts

import type { TagPort } from '@application/ports/tagPort';
import { useTagInfrastructure } from '@infrastructure/tags/tagInfrastructure';

export function useTagAdapter(): TagPort {
  return useTagInfrastructure();
}
```

```typescript
// src/hexagon/application/adapters/tagAdapter.mock.ts

import { vi } from 'vitest';
import { createTypedMock } from '@testing/utils/typedMock';
import type { TagPort } from '@application/ports/tagPort';

export const tagAdapterMock = createTypedMock<TagPort>({
  getAllTags: vi.fn(() => Promise.resolve([])),
  createTag: vi.fn(() => Promise.resolve(mockTag)),
  assignTag: vi.fn(() => Promise.resolve()),
  removeTag: vi.fn(() => Promise.resolve()),
});
```

---

#### Step 3: Application Layer (Orchestration)

Create queries, mutations, and use cases.

```typescript
// src/hexagon/application/queries/useTagsQuery.ts

import { useQuery } from '@tanstack/react-query';
import { useTagAdapter } from '@application/adapters/tagAdapter';

export function useTagsQuery() {
  const adapter = useTagAdapter();
  
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => adapter.getAllTags(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

```typescript
// src/hexagon/application/queries/useTagsQuery.mock.ts

import { createOverrideableMock } from '@testing/utils';
import type { useTagsQuery } from './useTagsQuery';

export const useTagsQueryMock = createOverrideableMock<typeof useTagsQuery>({
  defaultImplementation: () => ({
    data: [],
    isLoading: false,
    error: null,
    isError: false,
    isSuccess: true,
    refetch: vi.fn(),
  }),
});
```

```typescript
// src/hexagon/application/useCases/useVocabularyTagManager/index.ts

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTagsQuery } from '@application/queries/useTagsQuery';
import { useTagAdapter } from '@application/adapters/tagAdapter';
import { validateTagName } from '@domain/vocabulary/tagValidation';
import { toast } from 'react-toastify';

/**
 * Result from the vocabulary tag manager use case
 */
export interface VocabularyTagManagerResult {
  tags: VocabularyTag[];
  isLoading: boolean;
  error: Error | null;
  createTag: (input: CreateTagInput) => Promise<void>;
  assignTag: (vocabularyId: string, tagId: string) => Promise<void>;
  removeTag: (vocabularyId: string, tagId: string) => Promise<void>;
}

/**
 * Use case for managing vocabulary tags
 */
export function useVocabularyTagManager(): VocabularyTagManagerResult {
  const tagsQuery = useTagsQuery();
  const adapter = useTagAdapter();
  const queryClient = useQueryClient();
  
  const createMutation = useMutation({
    mutationFn: (input: CreateTagInput) => adapter.createTag(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast.success('Tag created successfully');
    },
    onError: () => {
      toast.error('Failed to create tag');
    },
  });
  
  const assignMutation = useMutation({
    mutationFn: ({ vocabularyId, tagId }: { vocabularyId: string; tagId: string }) =>
      adapter.assignTag(vocabularyId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
      toast.success('Tag assigned');
    },
  });
  
  const removeMutation = useMutation({
    mutationFn: ({ vocabularyId, tagId }: { vocabularyId: string; tagId: string }) =>
      adapter.removeTag(vocabularyId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary'] });
      toast.success('Tag removed');
    },
  });
  
  const createTag = useCallback(async (input: CreateTagInput) => {
    // Validate using domain function
    const error = validateTagName(input.name);
    if (error) {
      toast.error(error);
      return;
    }
    
    await createMutation.mutateAsync(input);
  }, [createMutation]);
  
  const assignTag = useCallback(async (vocabularyId: string, tagId: string) => {
    await assignMutation.mutateAsync({ vocabularyId, tagId });
  }, [assignMutation]);
  
  const removeTag = useCallback(async (vocabularyId: string, tagId: string) => {
    await removeMutation.mutateAsync({ vocabularyId, tagId });
  }, [removeMutation]);
  
  return {
    tags: tagsQuery.data ?? [],
    isLoading: tagsQuery.isLoading,
    error: tagsQuery.error,
    createTag,
    assignTag,
    removeTag,
  };
}
```

```typescript
// src/hexagon/application/useCases/useVocabularyTagManager/index.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVocabularyTagManager } from './index';
import { useTagsQueryMock } from '../../queries/useTagsQuery.mock';

vi.mock('../../queries/useTagsQuery', () => ({
  useTagsQuery: vi.fn(() => useTagsQueryMock.defaultImplementation()),
}));

describe('useVocabularyTagManager', () => {
  beforeEach(() => {
    useTagsQueryMock.resetMock();
  });
  
  it('should return tags from query', () => {
    const mockTags = [{ id: '1', name: 'Transportation', /* ... */ }];
    useTagsQueryMock.overrideMock({ data: mockTags });
    
    const { result } = renderHook(() => useVocabularyTagManager());
    
    expect(result.current.tags).toEqual(mockTags);
  });
  
  it('should handle loading state', () => {
    useTagsQueryMock.overrideMock({ isLoading: true });
    
    const { result } = renderHook(() => useVocabularyTagManager());
    
    expect(result.current.isLoading).toBe(true);
  });
  
  it('should validate tag name before creating', async () => {
    const { result } = renderHook(() => useVocabularyTagManager());
    
    await act(async () => {
      await result.current.createTag({ name: '', description: '', color: '#000' });
    });
    
    // Toast should show error, mutation should not be called
    // (You'd need to mock toast and check it was called with error)
  });
});
```

---

#### Step 4: Interface Layer (UI Components)

Build the user interface.

```typescript
// src/hexagon/interface/components/TagList/index.tsx

import type { VocabularyTag } from '@domain/vocabulary/tag.types';

interface TagListProps {
  tags: VocabularyTag[];
  onTagClick?: (tag: VocabularyTag) => void;
}

/**
 * Displays a list of vocabulary tags
 */
export function TagList({ tags, onTagClick }: TagListProps) {
  if (tags.length === 0) {
    return <div className="empty-state">No tags yet</div>;
  }
  
  return (
    <ul className="tag-list">
      {tags.map(tag => (
        <li key={tag.id}>
          <button
            className="tag-button"
            style={{ backgroundColor: tag.color }}
            onClick={() => onTagClick?.(tag)}
          >
            {tag.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

```typescript
// src/hexagon/interface/components/TagList/index.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TagList } from './index';

const mockTags = [
  { id: '1', name: 'Transportation', description: '', color: '#ff0000', createdAt: new Date() },
  { id: '2', name: 'Food', description: '', color: '#00ff00', createdAt: new Date() },
];

describe('TagList', () => {
  it('should render list of tags', () => {
    render(<TagList tags={mockTags} />);
    
    expect(screen.getByText('Transportation')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
  });
  
  it('should show empty state when no tags', () => {
    render(<TagList tags={[]} />);
    
    expect(screen.getByText('No tags yet')).toBeInTheDocument();
  });
  
  it('should call onTagClick when tag is clicked', async () => {
    const onTagClick = vi.fn();
    render(<TagList tags={mockTags} onTagClick={onTagClick} />);
    
    const button = screen.getByText('Transportation');
    await userEvent.click(button);
    
    expect(onTagClick).toHaveBeenCalledWith(mockTags[0]);
  });
});
```

```typescript
// src/hexagon/interface/pages/VocabularyTagsPage/index.tsx

import { useVocabularyTagManager } from '@application/useCases/useVocabularyTagManager';
import { TagList } from '@interface/components/TagList';
import { CreateTagButton } from '@interface/components/CreateTagButton';
import { Loading } from '@interface/components/Loading';
import { ErrorMessage } from '@interface/components/ErrorMessage';

/**
 * Page for managing vocabulary tags (admin only)
 */
export function VocabularyTagsPage() {
  const useCase = useVocabularyTagManager();
  
  if (useCase.isLoading) {
    return <Loading />;
  }
  
  if (useCase.error) {
    return <ErrorMessage error={useCase.error} />;
  }
  
  return (
    <div className="vocabulary-tags-page">
      <header>
        <h1>Vocabulary Tags</h1>
        <CreateTagButton onCreate={useCase.createTag} />
      </header>
      
      <TagList 
        tags={useCase.tags}
        onTagClick={(tag) => console.log('Selected:', tag)}
      />
    </div>
  );
}
```

---

### Phase 3: Testing & Refinement

#### 3.1 Run Tests

```bash
# Run all hexagon tests
pnpm test:hexagon

# Run specific tests
pnpm test:hexagon src/hexagon/application/useCases/useVocabularyTagManager

# Run with coverage
pnpm test:hexagon -- --coverage
```

#### 3.2 Manual Testing

1. **Start dev server**: `pnpm start`
2. **Test happy path**: Create tags, assign to vocabulary, filter
3. **Test error cases**: Invalid input, network errors, edge cases
4. **Test UI**: Check responsiveness, accessibility, loading states

#### 3.3 Code Quality

```bash
# Lint and fix issues
pnpm lint:fix

# Format code
pnpm format

# Type check
pnpm typecheck

# Run all validations
pnpm validate
```

---

### Phase 4: Documentation & Review

#### 4.1 Update Documentation

- Add JSDoc comments to functions and types
- Update `DOMAIN_GLOSSARY.md` if introducing new concepts
- Update README if adding major feature

#### 4.2 Create Pull Request

1. **Self-review your code**: Go through every change
2. **Run the PR checklist**: See [`PR_STANDARDS.md`](./PR_STANDARDS.md)
3. **Write clear PR description**:

```markdown
## What Changed
Added vocabulary tagging system allowing admins to categorize vocabulary items.

## Why
Students requested better ways to organize and filter vocabulary for targeted practice.

## How to Test
1. Log in as admin
2. Navigate to Vocabulary Tags page
3. Create a new tag (e.g., "Transportation")
4. Assign tag to vocabulary items
5. Filter quiz by tag

## Checklist
- [x] All tests passing
- [x] Added tests for new code
- [x] Followed hexagonal architecture
- [x] Updated documentation
- [x] Manual testing completed
```

4. **Request reviews** from team members

---

## Tips for Success

### Do's ✅

- **Start with types**: Define interfaces before implementing
- **Test as you go**: Don't save testing for the end
- **Follow patterns**: Look at similar features for reference
- **Keep it simple**: Start with MVP, add complexity later
- **Ask questions**: Get feedback early if unsure

### Don'ts ❌

- **Don't skip domain layer**: Even if logic seems simple
- **Don't mix concerns**: Keep layers separate
- **Don't skip tests**: Tests are not optional
- **Don't forget error handling**: Handle failures gracefully
- **Don't forget accessibility**: Use semantic HTML, ARIA labels

---

## Common Pitfalls

### Pitfall 1: Skipping the Planning Phase

**Problem**: Jumping straight into coding without understanding the full scope.

**Solution**: Always start with requirements and a task breakdown.

---

### Pitfall 2: Putting Business Logic in UI

**Problem**: Complex calculations or rules in components.

**Solution**: Extract to domain layer, call from use case.

---

### Pitfall 3: Not Mocking Dependencies

**Problem**: Tests failing because they try to make real API calls.

**Solution**: Create mocks for all queries and adapters.

---

### Pitfall 4: God Components or Use Cases

**Problem**: One component/use case doing too much.

**Solution**: Break into smaller, focused pieces. Create units for reusable logic.

---

## Feature Size Guidelines

### Small Feature (1-2 days)
- Single use case
- 2-3 components
- Minimal new API endpoints
- Example: Add "favorite" button to flashcards

### Medium Feature (3-5 days)
- 2-3 use cases
- 5-8 components
- Several API endpoints
- Example: Vocabulary tagging system

### Large Feature (1-2 weeks)
- Multiple use cases and coordinators
- 10+ components
- New infrastructure adapters
- Example: Complete quiz builder interface

---

## Related Documentation

- [`ARCHITECTURE.md`](../src/hexagon/ARCHITECTURE.md) - Hexagonal architecture guide
- [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md) - Code patterns and conventions
- [`DATA_FLOW.md`](./DATA_FLOW.md) - State management patterns
- [`TESTING_STANDARDS.md`](./TESTING_STANDARDS.md) - Testing requirements
- [`PR_STANDARDS.md`](./PR_STANDARDS.md) - Pull request guidelines
- [`DOMAIN_GLOSSARY.md`](./DOMAIN_GLOSSARY.md) - Business terminology

---

**Remember**: Building features is an iterative process. Don't aim for perfection on the first try. Get something working, get feedback, and improve!
