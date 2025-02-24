import { beforeEach, describe, expect, it } from 'vitest';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import React, { act } from 'react';

import type { DisplayOrder, Flashcard } from 'src/types/interfaceDefinitions';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import serverlikeData from 'mocks/data/serverlike/serverlikeData';
import { useStudentFlashcards } from 'src/hooks/UserData/useStudentFlashcards';
import { setupMockAuth } from 'tests/setupMockAuth';
import ExamplesTable from './ExamplesTable';
const verifiedExamplesTable = serverlikeData().api.verifiedExamplesTable;

// Helper Functions
const mockDataSource = verifiedExamplesTable.slice(0, 15);

function makeDisplayOrder(examples: Flashcard[]): DisplayOrder[] {
  const newDisplayOrder = examples.map((example) => {
    const displayOrder: DisplayOrder = { recordId: example.recordId };
    return displayOrder;
  });
  return newDisplayOrder;
}

const fullDisplayOrder = makeDisplayOrder(mockDataSource);

async function getUnknownExample() {
  const { result } = renderHook(() => useStudentFlashcards(), {
    wrapper: MockAllProviders,
  });
  await waitFor(() =>
    expect(result.current.flashcardDataQuery.isSuccess).toBe(true),
  );
  const unknownExample = verifiedExamplesTable.find(
    (example) => result.current.exampleIsCollected(example.recordId) === false,
  );
  if (!unknownExample) {
    throw new Error('No unknown examples found');
  }
  return unknownExample;
}

async function getKnownExample() {
  const { result } = renderHook(() => useStudentFlashcards(), {
    wrapper: MockAllProviders,
  });
  await waitFor(() =>
    expect(result.current.flashcardDataQuery.isSuccess).toBe(true),
  );
  const knownExample = verifiedExamplesTable.find(
    (example) =>
      result.current.exampleIsCollected(example.recordId) === true &&
      !result.current.exampleIsCustom(example.recordId),
  );
  if (!knownExample) {
    throw new Error('No known examples found');
  }
  return knownExample;
}
describe('renders without crashing', () => {
  it('renders without crashing', async () => {
    const examplesToDisplay = verifiedExamplesTable.slice(0, 1);
    render(
      <ExamplesTable
        dataSource={verifiedExamplesTable}
        displayOrder={fullDisplayOrder}
      />,
      { wrapper: MockAllProviders },
    );
    await waitFor(
      () => {
        expect(
          screen.getByText(examplesToDisplay[0].englishTranslation),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});

describe('user is not a student', () => {
  it('student buttons: Add/Adding.../Remove are not displayed', async () => {
    setupMockAuth({ userName: 'admin-empty-role' });
    render(
      <MockAllProviders>
        <ExamplesTable
          dataSource={mockDataSource}
          displayOrder={fullDisplayOrder}
        />
        ,
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(
        screen.getByText(mockDataSource[3].englishTranslation),
      ).toBeInTheDocument();
    });

    expect(screen.queryByText('Add')).not.toBeInTheDocument();
    expect(screen.queryByText('Adding...')).not.toBeInTheDocument();
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });
});

describe('user is a student', () => {
  describe('example is unknown', () => {
    beforeEach(async () => {
      const unknownExample = await getUnknownExample();
      render(
        <ExamplesTable
          dataSource={[unknownExample]}
          displayOrder={[{ recordId: unknownExample.recordId }]}
        />,
        { wrapper: MockAllProviders },
      );
      await waitFor(() => {
        expect(
          screen.getByText(unknownExample.englishTranslation),
        ).toBeInTheDocument();
      });
    });

    it('"Add" button is displayed', async () => {
      await waitFor(() => {
        expect(screen.getByText('Add')).toBeInTheDocument();
        expect(screen.queryByText('Adding...')).not.toBeInTheDocument();
        expect(screen.queryByText('Remove')).not.toBeInTheDocument();
      });
    });
    it.skip('on click, "Adding..." is displayed', async () => {
      // believed to be a limitation of the mock server
      // becuase we are adding, but the server is not actually adding
      // so the status gets reverted? after the optomistic update
      await waitFor(() => {
        expect(screen.getByText('Add')).toBeInTheDocument();
      });
      act(() => {
        screen.getByText('Add').click();
      });
      await waitFor(() => {
        expect(screen.queryByText('Add')).not.toBeInTheDocument();
        expect(screen.getByText('Adding...')).toBeInTheDocument();
      });
    });
  });

  describe('example is known', () => {
    beforeEach(async () => {
      const knownExample = await getKnownExample();
      render(
        <ExamplesTable
          dataSource={[knownExample]}
          displayOrder={[{ recordId: knownExample.recordId }]}
        />,
        { wrapper: MockAllProviders },
      );
      await waitFor(() => {
        expect(
          screen.getByText(knownExample.englishTranslation),
        ).toBeInTheDocument();
      });
    });

    it('example is known, Remove button is displayed', async () => {
      await waitFor(() => {
        expect(screen.getByText('Remove')).toBeInTheDocument();
        expect(screen.queryByText('Add')).not.toBeInTheDocument();
        expect(screen.queryByText('Adding...')).not.toBeInTheDocument();
      });
    });
    it('on click, "Add" is displayed (optomistic inteface update', async () => {
      await waitFor(() => {
        expect(screen.getByText('Remove')).toBeInTheDocument();
      });
      act(() => {
        screen.getByText('Remove').click();
      });
      await waitFor(() => {
        expect(screen.queryByText('Remove')).not.toBeInTheDocument();
        expect(screen.getByText('Add')).toBeInTheDocument();
      });
    });
  });
});
