import {
  mockUseStudentUiVersion,
  overrideMockUseStudentUiVersion,
  resetMockUseStudentUiVersion,
} from '@application/useCases/useStudentUiVersion.mock';
import { UiScope } from '@interface/components/general/UiScope/UiScope';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/useStudentUiVersion', () => ({
  useStudentUiVersion: mockUseStudentUiVersion,
}));

describe('ui scope', () => {
  afterEach(() => {
    resetMockUseStudentUiVersion();
    cleanup();
  });

  it('sets data-ui to v1 when the flag is off', () => {
    render(
      <UiScope flag="ui.student.help.v2">
        <span>child</span>
      </UiScope>,
    );

    expect(screen.getByText('child').parentElement).toHaveAttribute(
      'data-ui',
      'v1',
    );
  });

  it('sets data-ui to v2 when the flag is on', () => {
    overrideMockUseStudentUiVersion({ version: 'v2' });

    render(
      <UiScope flag="ui.student.help.v2">
        <span>child</span>
      </UiScope>,
    );

    expect(screen.getByText('child').parentElement).toHaveAttribute(
      'data-ui',
      'v2',
    );
  });
});
