import type { JSX, ReactNode } from 'react';
import { useEnableFilteringParam } from '@interface/hooks/useEnableFilteringParam';
import { renderHook } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

interface ParamProbe {
  /** What the hook reported on the first render, before any stripping. */
  initialValue: boolean;
  /** What it reports now, after the effect has run. */
  currentValue: boolean;
  /** The url the address bar would show now. */
  url: string;
}

/**
 * Renders the hook inside a real router and records both its value and the
 * location on every render, so the assertions read what the page and the
 * address bar actually see.
 */
function renderParam(initialEntry: string): ParamProbe {
  const values: boolean[] = [];
  const urls: string[] = [];

  renderHook(
    () => {
      const location = useLocation();
      const enableFiltering = useEnableFilteringParam();
      values.push(enableFiltering);
      urls.push(`${location.pathname}${location.search}`);
    },
    {
      wrapper: ({ children }: { children: ReactNode }): JSX.Element => (
        <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
      ),
    },
  );

  return {
    initialValue: values[0]!,
    currentValue: values[values.length - 1]!,
    url: urls[urls.length - 1]!,
  };
}

describe('useEnableFilteringParam', () => {
  it('reports the parameter and strips it from the url', () => {
    const probe = renderParam('/manage-flashcards?enableFiltering=true');

    expect(probe.initialValue).toBe(true);
    expect(probe.url).toBe('/manage-flashcards');
  });

  it('reports the parameter as gone once it has been stripped', () => {
    const probe = renderParam('/manage-flashcards?enableFiltering=true');

    // The page seeds its use case from the first render; the use case keeps
    // filtering on from there, so going back to false here is expected.
    expect(probe.currentValue).toBe(false);
  });

  it('keeps the other query parameters when stripping', () => {
    const probe = renderParam('/manage-flashcards?enableFiltering=true&page=2');

    expect(probe.initialValue).toBe(true);
    expect(probe.url).toBe('/manage-flashcards?page=2');
  });

  it('leaves the url alone when the parameter is absent', () => {
    const probe = renderParam('/manage-flashcards?page=2');

    expect(probe.initialValue).toBe(false);
    expect(probe.currentValue).toBe(false);
    expect(probe.url).toBe('/manage-flashcards?page=2');
  });

  it('treats any value other than true as off', () => {
    const probe = renderParam('/manage-flashcards?enableFiltering=false');

    expect(probe.currentValue).toBe(false);
    expect(probe.url).toBe('/manage-flashcards?enableFiltering=false');
  });
});
