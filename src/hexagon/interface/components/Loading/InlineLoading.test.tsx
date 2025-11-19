import InlineLoading from '@interface/components/Loading/InlineLoading';
import { render, screen } from '@testing-library/react';
import wheelIcon from 'src/assets/Icon_Blue.svg';
import wheelIconWhite from 'src/assets/Icon_White.svg';

describe('component InlineLoading', () => {
  it('should render with message', () => {
    render(<InlineLoading message="Loading Test..." />);
    expect(screen.getByText('Loading Test...')).toBeInTheDocument();
  });
  it('should render with default message', () => {
    render(<InlineLoading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByAltText('loading')).toHaveAttribute('src', wheelIcon);
  });
  // should render with white
  it('should render with white', () => {
    render(<InlineLoading white />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByAltText('loading')).toHaveAttribute(
      'src',
      wheelIconWhite,
    );
  });
});
