import { act } from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import serverlikeData from '../../mocks/data/serverlike/serverlikeData';
import type { QuizExamplesTable, QuizUnparsed } from '../interfaceDefinitions';
import MockAllProviders from '../../mocks/Providers/MockAllProviders';
import { setupMockAuth } from '../../tests/setupMockAuth';
import useCoaching from './useCoaching';

describe('hook useCoaching', () => {
  it('renders without crashing', async () => {
    const { result } = renderHook(() => useCoaching(), {
      wrapper: MockAllProviders,
    });
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
  });
});
