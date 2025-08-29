import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import React from 'react';
import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { SRSButtons } from './SRSButtons';

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
        />
      </MockAllProviders>,
    );
    await waitFor(() => {
      expect(screen.getByText('This was easy')).toBeTruthy();
      expect(screen.getByText('This was hard')).toBeTruthy();
    });
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
