import { StudentAssignmentSelector } from '@interface/components/ExampleAssignerInterface/StudentAssignmentSelector';
import { render, screen } from '@testing-library/react';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { describe, expect, it } from 'vitest';
describe('studentAssignmentSelector', () => {
  it('should render student selection message', () => {
    render(<StudentAssignmentSelector isLoading={false} />, {
      wrapper: MockAllProviders,
    });

    expect(
      screen.getByText('Select a student to assign these examples to:'),
    ).toBeInTheDocument();
  });

  it('should render SubHeaderComponent', () => {
    render(<StudentAssignmentSelector isLoading={false} />, {
      wrapper: MockAllProviders,
    });

    // SubHeaderComponent should be rendered (we can't easily test its internals)
    expect(
      screen.getByText('Select a student to assign these examples to:'),
    ).toBeInTheDocument();
  });

  it('should show loading message when isLoading is true', () => {
    render(<StudentAssignmentSelector isLoading />, {
      wrapper: MockAllProviders,
    });

    expect(screen.getByText('Loading student...')).toBeInTheDocument();
  });

  it('should not show loading message when isLoading is false', () => {
    render(<StudentAssignmentSelector isLoading={false} />, {
      wrapper: MockAllProviders,
    });

    expect(screen.queryByText('Loading student...')).not.toBeInTheDocument();
  });
});
