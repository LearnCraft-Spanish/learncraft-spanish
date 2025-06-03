import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import React, { act } from 'react';
import { useVocabulary } from 'src/hooks/CourseData/useVocabulary';
import { describe, expect, it, vi } from 'vitest';
import Filter from './Filter';

const toggleIncludeSpanglish = vi.fn();
const addTagToRequiredTags = vi.fn();
const removeTagFromRequiredTags = vi.fn();
describe('component Filter', () => {
  it('renders without crashing', async () => {
    render(
      <Filter
        includeSpanglish={false}
        toggleIncludeSpanglish={toggleIncludeSpanglish}
        requiredTags={[]}
        addTagToRequiredTags={addTagToRequiredTags}
        removeTagFromRequiredTags={removeTagFromRequiredTags}
      />,
      { wrapper: MockAllProviders },
    );
    await waitFor(() => {
      expect(screen.getByText('Selected Tags:')).toBeInTheDocument();
    });
  });

  //This test is flaky, and I'm not sure why.
  it.skip('on input change, calls filters suggestedTags and displays', async () => {
    render(
      <Filter
        includeSpanglish={false}
        toggleIncludeSpanglish={toggleIncludeSpanglish}
        requiredTags={[]}
        addTagToRequiredTags={addTagToRequiredTags}
        removeTagFromRequiredTags={removeTagFromRequiredTags}
      />,
      { wrapper: MockAllProviders },
    );
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Search tags');
      fireEvent.change(input, { target: { value: 'a' } });
      act(() => {
        // input.value = 'a';
        // input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
    await waitFor(() => {
      expect(screen.getAllByText('a').length).toBeGreaterThan(2);
    });
  });
  // failing on CI, not locally. unsure why.
  it.skip('clicking a tag from suggestedTags, calls addTagToRequiredTags', async () => {
    render(
      <Filter
        includeSpanglish={false}
        toggleIncludeSpanglish={toggleIncludeSpanglish}
        requiredTags={[]}
        addTagToRequiredTags={addTagToRequiredTags}
        removeTagFromRequiredTags={removeTagFromRequiredTags}
      />,
      { wrapper: MockAllProviders },
    );
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Search tags');
      fireEvent.change(input, { target: { value: 'Hablar' } });
    });
    await waitFor(() => {
      const tag = screen.getByText('Hablar');
      fireEvent.click(tag);
    });
    await waitFor(() => {
      expect(addTagToRequiredTags).toHaveBeenCalledTimes(1);
    });
  });

  it('if requiredTags has length, render it', async () => {
    const result = renderHook(() => useVocabulary(), {
      wrapper: MockAllProviders,
    });
    await waitFor(() => {
      expect(result.result.current.tagTable.length).toBeGreaterThan(0);
    });
    const requiredTags = result.result.current.tagTable.slice(0, 1);
    render(
      <Filter
        includeSpanglish={false}
        toggleIncludeSpanglish={toggleIncludeSpanglish}
        requiredTags={requiredTags}
        addTagToRequiredTags={addTagToRequiredTags}
        removeTagFromRequiredTags={removeTagFromRequiredTags}
      />,
      { wrapper: MockAllProviders },
    );
    await waitFor(() => {
      expect(screen.getByText(requiredTags[0].tag)).toBeInTheDocument();
    });
  });
  // failing on CI, not locally. unsure why.
  it.skip('clicking a tag from requiredTags, calls removeTagFromRequiredTags', async () => {
    const result = renderHook(() => useVocabulary(), {
      wrapper: MockAllProviders,
    });
    await waitFor(() => {
      expect(result.result.current.tagTable.length).toBeGreaterThan(0);
    });
    const requiredTags = result.result.current.tagTable.slice(0, 1);
    render(
      <Filter
        includeSpanglish={false}
        toggleIncludeSpanglish={toggleIncludeSpanglish}
        requiredTags={requiredTags}
        addTagToRequiredTags={addTagToRequiredTags}
        removeTagFromRequiredTags={removeTagFromRequiredTags}
      />,
      { wrapper: MockAllProviders },
    );
    await waitFor(() => {
      const tag = screen.getByText(requiredTags[0].tag);
      fireEvent.click(tag);
    });
    await waitFor(() => {
      expect(removeTagFromRequiredTags).toHaveBeenCalledTimes(1);
    });
  });
  it('clicking includeSpanglish, calls toggleIncludeSpanglish', async () => {
    render(
      <Filter
        includeSpanglish={false}
        toggleIncludeSpanglish={toggleIncludeSpanglish}
        requiredTags={[]}
        addTagToRequiredTags={addTagToRequiredTags}
        removeTagFromRequiredTags={removeTagFromRequiredTags}
      />,
      { wrapper: MockAllProviders },
    );
    await waitFor(() => {
      const checkbox = screen.getByLabelText('noSpanglish');
      fireEvent.click(checkbox);
    });
    await waitFor(() => {
      expect(toggleIncludeSpanglish).toHaveBeenCalledTimes(1);
    });
  });
});
