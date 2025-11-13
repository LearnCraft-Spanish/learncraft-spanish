import Loading from '@interface/components/Loading/Loading';
import { render, screen } from '@testing-library/react';

describe('component Loading', () => {
  it('should render with message', () => {
    render(<Loading message="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
