import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it} from 'vitest';
import MockAllProviders from '../mocks/Providers/MockAllProviders';

import FrequenSay from './FrequenSay';
import { act } from 'react';


describe('initial render', () => {
  beforeEach(async () => {
    render(<FrequenSay />, { wrapper: MockAllProviders });
    // Wait for all hooks used to resolve
    // using lesson Selector as our benchmark
    await waitFor(() => {
      expect(screen.getByText('From:')).toBeTruthy();
    });
  });
  it('renders the title', () => {
    expect(screen.getByText('FrequenSay')).toBeTruthy();
  });
  it('by default, add extra vocabulary button is displayed', () => {
    expect(screen.getByText('Add Extra Vocabulary')).toBeTruthy();
  });
  it('word count is 0, words known is 100%', () => {
    expect(screen.getByText('Word Count:0')).toBeTruthy();
    expect(screen.getByText('Words Known:100%')).toBeTruthy();
  });
});

describe('add extra vocabulary', () => {
  beforeEach(async () => {
    render(<FrequenSay />, { wrapper: MockAllProviders });
    // Wait for all hooks used to resolve
    // using lesson Selector as our benchmark
    await waitFor(() => {
      expect(screen.getByText('From:')).toBeTruthy();
    });
    // Click the add extra vocabulary button
    act(() => {
    screen.getByText('Add Extra Vocabulary').click();
    });
  });
  it('displays the extra vocabulary input', () => {
    expect(screen.getByText('Extra Vocabulary:')).toBeTruthy();
  });
  it('displays the cancel extra vocabulary button', () => {
    expect(screen.getByText('Cancel Extra Vocabulary')).toBeTruthy();
  });
});