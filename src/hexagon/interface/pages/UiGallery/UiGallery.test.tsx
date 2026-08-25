import {
  mockUseUiFlag,
  overrideMockUseUiFlag,
  resetMockUseUiFlag,
} from '@application/useCases/useUiFlag.mock';
import UiGallery from '@interface/pages/UiGallery/UiGallery';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/useCases/useUiFlag', () => ({
  useUiFlag: mockUseUiFlag,
}));

describe('ui gallery', () => {
  afterEach(() => {
    resetMockUseUiFlag();
    cleanup();
  });

  it('renders nothing when the gallery flag is off', () => {
    const { container } = render(<UiGallery />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the gallery when the flag is on', () => {
    overrideMockUseUiFlag({ enabled: true });

    render(<UiGallery />);

    expect(
      screen.getByRole('heading', { name: 'Design system v2' }),
    ).toBeInTheDocument();
  });

  it('lists the token sections', () => {
    overrideMockUseUiFlag({ enabled: true });

    render(<UiGallery />);

    expect(screen.getByRole('heading', { name: 'Color' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Space' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Radius' })).toBeInTheDocument();
  });

  it('has a section for each family of primitives', () => {
    overrideMockUseUiFlag({ enabled: true });

    render(<UiGallery />);

    for (const title of [
      'Icons — registered set',
      'Icon button',
      'Icon tile',
      'Eyebrow',
      'Badge',
      'Button — variants at size md',
      'Card',
      'Field and Select',
      'Text input',
      'Checkbox',
      'Toggle',
      'Popover',
      'Menu',
      'Empty state',
      'Notice bar',
      'Skeleton',
      'Chip',
      'Data table',
      'Pagination',
    ]) {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    }
  });

  it('composes live primitives, not just headings', () => {
    overrideMockUseUiFlag({ enabled: true });

    render(<UiGallery />);

    expect(
      screen.getByRole('table', { name: 'Example search results' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Select this example' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: 'Set a starting lesson' }),
    ).toBeInTheDocument();
  });
});
