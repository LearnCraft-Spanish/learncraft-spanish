import { beforeEach, describe, expect, it } from 'vitest';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import React, { act } from 'react';
import MockAllProviders from '../../../mocks/Providers/MockAllProviders';

import serverlikeData from '../../../mocks/data/serverlike/serverlikeData';
import { useStudentFlashcards } from '../../hooks/useStudentFlashcards';

import ExamplesTable from './ExamplesTable';
const verifiedExamplesTable = serverlikeData().api.verifiedExamplesTable;

describe('renders without crashing', () => {
  it('renders without crashing', async () => {
    render(
      <ExamplesTable
        examplesToDisplay={[verifiedExamplesTable[0]]}
        getExampleById={() => verifiedExamplesTable[0]}
        flashcardsFound={1}
        flashcardsFoundWithAudio={1}
        copyTable={() => {}}
      />,
      { wrapper: MockAllProviders },
    );
    await waitFor(
      () => {
        expect(
          screen.getByText(verifiedExamplesTable[0].englishTranslation),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});

describe('user is not a student', () => {
  it('student buttons: Add/Adding.../Remove are not displayed', async () => {
    render(
      <ExamplesTable
        examplesToDisplay={[verifiedExamplesTable[0]]}
        getExampleById={() => verifiedExamplesTable[0]}
        flashcardsFound={1}
        flashcardsFoundWithAudio={1}
        copyTable={() => {}}
      />,
      { wrapper: MockAllProviders },
    );
    await waitFor(() => {
      expect(
        screen.getByText(verifiedExamplesTable[0].englishTranslation),
      ).toBeInTheDocument();
    });

    expect(screen.queryByText('Add')).not.toBeInTheDocument();
    expect(screen.queryByText('Adding...')).not.toBeInTheDocument();
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });
});
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
    (example) => result.current.exampleIsCollected(example.recordId) === true,
  );
  return knownExample;
}

describe('user is a student', () => {
  describe('example is unknown', () => {
    beforeEach(async () => {
      const unknownExample = await getUnknownExample();
      if (!unknownExample) {
        throw new Error('No unknown examples found');
      }
      render(
        <ExamplesTable
          examplesToDisplay={[unknownExample]}
          getExampleById={() => unknownExample}
          flashcardsFound={1}
          flashcardsFoundWithAudio={1}
          copyTable={() => {}}
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
    it('on click, "Adding..." is displayed', async () => {
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
      if (!knownExample) {
        throw new Error('No known examples found');
      }
      render(
        <ExamplesTable
          examplesToDisplay={[knownExample]}
          getExampleById={() => knownExample}
          flashcardsFound={1}
          flashcardsFoundWithAudio={1}
          copyTable={() => {}}
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
