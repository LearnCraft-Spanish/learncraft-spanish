import ExampleManagerNav from '@interface/components/ExampleManager/ExampleManagerNav';
import { render, screen } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock useSelectedExamples
const mockSelectedExamples: any[] = [];
vi.mock(
  '@application/units/ExampleSearchInterface/useSelectedExamples',
  () => ({
    useSelectedExamples: () => ({
      selectedExamples: mockSelectedExamples,
    }),
  }),
);

describe('component ExampleManagerNav', () => {
  beforeEach(() => {
    mockSelectedExamples.length = 0;
  });

  describe('renders all navigation links', () => {
    it('renders all four navigation links', () => {
      render(
        <MockAllProviders route="/example-manager/search">
          <ExampleManagerNav
            hasUnsavedCreatedExamples={false}
            setHasUnsavedCreatedExamples={() => {}}
          />
        </MockAllProviders>,
      );

      expect(screen.getByText('Select Examples')).toBeInTheDocument();
      expect(screen.getByText('Create New Examples')).toBeInTheDocument();
      expect(screen.getByText('Edit Selected Examples')).toBeInTheDocument();
      expect(screen.getByText('Assign Selected Examples')).toBeInTheDocument();
    });
  });

  describe('active segment styling', () => {
    it('marks "search" as active when on /example-manager/search', () => {
      render(
        <MockAllProviders route="/example-manager/search">
          <ExampleManagerNav
            hasUnsavedCreatedExamples={false}
            setHasUnsavedCreatedExamples={() => {}}
          />
        </MockAllProviders>,
      );

      const searchLink = screen.getByText('Select Examples');
      expect(searchLink.className).toContain('isActive');
    });

    it('marks "search" as active when on /example-manager with no segment', () => {
      render(
        <MockAllProviders route="/example-manager">
          <ExampleManagerNav
            hasUnsavedCreatedExamples={false}
            setHasUnsavedCreatedExamples={() => {}}
          />
        </MockAllProviders>,
      );

      const searchLink = screen.getByText('Select Examples');
      expect(searchLink.className).toContain('isActive');
    });

    it('marks "edit" as active when on /example-manager/edit', () => {
      render(
        <MockAllProviders route="/example-manager/edit">
          <ExampleManagerNav
            hasUnsavedCreatedExamples={false}
            setHasUnsavedCreatedExamples={() => {}}
          />
        </MockAllProviders>,
      );

      const editLink = screen.getByText('Edit Selected Examples');
      expect(editLink.className).toContain('isActive');
    });

    it('marks "create" as active when on /example-manager/create', () => {
      render(
        <MockAllProviders route="/example-manager/create">
          <ExampleManagerNav
            hasUnsavedCreatedExamples={false}
            setHasUnsavedCreatedExamples={() => {}}
          />
        </MockAllProviders>,
      );

      const createLink = screen.getByText('Create New Examples');
      expect(createLink.className).toContain('isActive');
    });

    it('marks "assign" as active when on /example-manager/assign', () => {
      render(
        <MockAllProviders route="/example-manager/assign">
          <ExampleManagerNav
            hasUnsavedCreatedExamples={false}
            setHasUnsavedCreatedExamples={() => {}}
          />
        </MockAllProviders>,
      );

      const assignLink = screen.getByText('Assign Selected Examples');
      expect(assignLink.className).toContain('isActive');
    });

    it('handles nested routes correctly', () => {
      render(
        <MockAllProviders route="/some/prefix/example-manager/edit">
          <ExampleManagerNav
            hasUnsavedCreatedExamples={false}
            setHasUnsavedCreatedExamples={() => {}}
          />
        </MockAllProviders>,
      );

      const editLink = screen.getByText('Edit Selected Examples');
      expect(editLink.className).toContain('isActive');
    });

    it('only marks one link as active at a time', () => {
      render(
        <MockAllProviders route="/example-manager/edit">
          <ExampleManagerNav
            hasUnsavedCreatedExamples={false}
            setHasUnsavedCreatedExamples={() => {}}
          />
        </MockAllProviders>,
      );

      const searchLink = screen.getByText('Select Examples');
      const createLink = screen.getByText('Create New Examples');
      const editLink = screen.getByText('Edit Selected Examples');
      const assignLink = screen.getByText('Assign Selected Examples');

      expect(searchLink.className).not.toContain('isActive');
      expect(createLink.className).not.toContain('isActive');
      expect(editLink.className).toContain('isActive');
      expect(assignLink.className).not.toContain('isActive');
    });
  });

  describe('disabled state when no examples selected', () => {
    it('disables "edit" and "assign" links when no examples are selected', () => {
      render(
        <MockAllProviders route="/example-manager/search">
          <ExampleManagerNav
            hasUnsavedCreatedExamples={false}
            setHasUnsavedCreatedExamples={() => {}}
          />
        </MockAllProviders>,
      );

      const editLink = screen.getByText('Edit Selected Examples');
      const assignLink = screen.getByText('Assign Selected Examples');

      expect(editLink.className).toContain('disabled');
      expect(assignLink.className).toContain('disabled');
    });

    it('does not disable "search" and "create" links when no examples are selected', () => {
      render(
        <MockAllProviders route="/example-manager/search">
          <ExampleManagerNav
            hasUnsavedCreatedExamples={false}
            setHasUnsavedCreatedExamples={() => {}}
          />
        </MockAllProviders>,
      );

      const searchLink = screen.getByText('Select Examples');
      const createLink = screen.getByText('Create New Examples');

      expect(searchLink.className).not.toContain('disabled');
      expect(createLink.className).not.toContain('disabled');
    });
  });

  describe('enabled state when examples are selected', () => {
    beforeEach(() => {
      // Add mock examples
      mockSelectedExamples.push(
        { id: 1, exampleText: 'Example 1' },
        { id: 2, exampleText: 'Example 2' },
      );
    });

    it('enables "edit" and "assign" links when examples are selected', () => {
      render(
        <MockAllProviders route="/example-manager/search">
          <ExampleManagerNav
            hasUnsavedCreatedExamples={false}
            setHasUnsavedCreatedExamples={() => {}}
          />
        </MockAllProviders>,
      );

      const editLink = screen.getByText('Edit Selected Examples');
      const assignLink = screen.getByText('Assign Selected Examples');

      expect(editLink.className).not.toContain('disabled');
      expect(assignLink.className).not.toContain('disabled');
    });

    it('keeps "search" and "create" links enabled when examples are selected', () => {
      render(
        <MockAllProviders route="/example-manager/search">
          <ExampleManagerNav
            hasUnsavedCreatedExamples={false}
            setHasUnsavedCreatedExamples={() => {}}
          />
        </MockAllProviders>,
      );

      const searchLink = screen.getByText('Select Examples');
      const createLink = screen.getByText('Create New Examples');

      expect(searchLink.className).not.toContain('disabled');
      expect(createLink.className).not.toContain('disabled');
    });
  });

  describe('combines active and disabled states correctly', () => {
    it('can be both active and disabled on /example-manager/edit with no examples', () => {
      render(
        <MockAllProviders route="/example-manager/edit">
          <ExampleManagerNav
            hasUnsavedCreatedExamples={false}
            setHasUnsavedCreatedExamples={() => {}}
          />
        </MockAllProviders>,
      );

      const editLink = screen.getByText('Edit Selected Examples');

      expect(editLink.className).toContain('isActive');
      expect(editLink.className).toContain('disabled');
    });

    it('is active but not disabled on /example-manager/edit with examples', () => {
      // Add mock examples
      mockSelectedExamples.push({ id: 1, exampleText: 'Example 1' });

      render(
        <MockAllProviders route="/example-manager/edit">
          <ExampleManagerNav
            hasUnsavedCreatedExamples={false}
            setHasUnsavedCreatedExamples={() => {}}
          />
        </MockAllProviders>,
      );

      const editLink = screen.getByText('Edit Selected Examples');

      expect(editLink.className).toContain('isActive');
      expect(editLink.className).not.toContain('disabled');
    });
  });
});
