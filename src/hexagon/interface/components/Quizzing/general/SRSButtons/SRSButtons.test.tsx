import { SRSButtons } from '@interface/components/Quizzing/general/SRSButtons/SRSButtons';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

let incrementExampleNumber = vi.fn();
const handleReviewExample = vi.fn();

describe('component SRSButtons', () => {
  beforeAll(() => {
    incrementExampleNumber = vi.fn(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('example difficulty is labeled easy, displays Labeled: easy', () => {
    render(
      <MockAllProviders>
        <SRSButtons
          hasExampleBeenReviewed="easy"
          answerShowing={false}
          incrementExampleNumber={incrementExampleNumber}
          handleReviewExample={handleReviewExample}
          isExampleReviewPending={false}
        />
      </MockAllProviders>,
    );
    expect(screen.getByText('Labeled: Easy')).toBeTruthy();
  });
  it('example difficulty is labeled hard, displays Labeled: Hard', async () => {
    render(
      <MockAllProviders>
        <SRSButtons
          hasExampleBeenReviewed="hard"
          answerShowing={false}
          incrementExampleNumber={incrementExampleNumber}
          handleReviewExample={handleReviewExample}
          isExampleReviewPending={false}
        />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText('Labeled: Hard')).toBeTruthy();
    });
  });

  it('answer showing and no difficulty set, shows setting buttons', async () => {
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
        isStudent: true,
      },
      {
        isOwnUser: true,
      },
    );
    render(
      <MockAllProviders>
        <SRSButtons
          hasExampleBeenReviewed={null}
          answerShowing
          incrementExampleNumber={incrementExampleNumber}
          handleReviewExample={handleReviewExample}
          isExampleReviewPending={false}
        />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText('This was easy')).toBeTruthy();
      expect(screen.getByText('This was hard')).toBeTruthy();
    });
  });

  it('when review is pending, shows labeled state instead of buttons', async () => {
    render(
      <MockAllProviders>
        <SRSButtons
          hasExampleBeenReviewed="easy"
          answerShowing
          incrementExampleNumber={incrementExampleNumber}
          handleReviewExample={handleReviewExample}
          isExampleReviewPending={true}
        />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText('Labeled: Easy')).toBeTruthy();
    });
    expect(screen.queryByText('This was easy')).toBeNull();
    expect(screen.queryByText('This was hard')).toBeNull();
  });

  it('when review is pending but no difficulty set, shows hard labeled state', async () => {
    render(
      <MockAllProviders>
        <SRSButtons
          hasExampleBeenReviewed="hard"
          answerShowing
          incrementExampleNumber={incrementExampleNumber}
          handleReviewExample={handleReviewExample}
          isExampleReviewPending={true}
        />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText('Labeled: Hard')).toBeTruthy();
    });
    expect(screen.queryByText('This was easy')).toBeNull();
    expect(screen.queryByText('This was hard')).toBeNull();
  });

  it('when answer not showing, does not show buttons regardless of pending state', () => {
    render(
      <MockAllProviders>
        <SRSButtons
          hasExampleBeenReviewed={null}
          answerShowing={false}
          incrementExampleNumber={incrementExampleNumber}
          handleReviewExample={handleReviewExample}
          isExampleReviewPending={false}
        />
      </MockAllProviders>,
    );
    expect(screen.queryByText('This was easy')).toBeNull();
    expect(screen.queryByText('This was hard')).toBeNull();
  });

  describe('onClick functions', () => {
    it('increaseDifficulty', async () => {
      overrideAuthAndAppUser(
        {
          authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
          isStudent: true,
        },
        {
          isOwnUser: true,
        },
      );
      render(
        <MockAllProviders>
          <SRSButtons
            hasExampleBeenReviewed={null}
            answerShowing
            incrementExampleNumber={incrementExampleNumber}
            handleReviewExample={handleReviewExample}
            isExampleReviewPending={false}
          />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText('This was easy')).toBeTruthy();
      });
      screen.getByText('This was easy').click();
      expect(incrementExampleNumber).toHaveBeenCalled();
      expect(handleReviewExample).toHaveBeenCalledWith('easy');
    });
    it('decreaseDifficulty', async () => {
      overrideAuthAndAppUser(
        {
          authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
          isStudent: true,
        },
        {
          isOwnUser: true,
        },
      );
      render(
        <MockAllProviders>
          <SRSButtons
            hasExampleBeenReviewed={null}
            answerShowing
            incrementExampleNumber={incrementExampleNumber}
            handleReviewExample={handleReviewExample}
            isExampleReviewPending={false}
          />
        </MockAllProviders>,
      );
      await waitFor(() => {
        expect(screen.getByText('This was hard')).toBeTruthy();
      });
      screen.getByText('This was hard').click();
      expect(incrementExampleNumber).toHaveBeenCalled();
      expect(handleReviewExample).toHaveBeenCalledWith('hard');
    });
  });
});
