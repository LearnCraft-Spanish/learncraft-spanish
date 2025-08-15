import { render, screen } from '@testing-library/react';
import Loading from './Loading';

describe('component Loading', () => {
  it('should render with message', () => {
    render(<Loading message="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
