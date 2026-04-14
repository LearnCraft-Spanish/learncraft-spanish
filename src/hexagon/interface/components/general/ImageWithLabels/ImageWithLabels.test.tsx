import { ImageWithLabels } from '@interface/components/general/ImageWithLabels/ImageWithLabels';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const defaultProps = {
  imageSrc: '/test-image.jpg',
  imageAlt: 'A scene illustrating Spanish pronouns',
  topLabel: 'te',
  bottomLabel: 'me',
  topLeftLabel: 'la',
  bottomLeftLabel: 'las',
  topRightLabel: 'lo',
  bottomRightLabel: 'los',
};

describe('ImageWithLabels', () => {
  it('renders the image with the provided src and alt text', () => {
    render(<ImageWithLabels {...defaultProps} />);

    const img = screen.getByRole('img', {
      name: 'A scene illustrating Spanish pronouns',
    });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test-image.jpg');
  });

  it('renders all six labels', () => {
    render(<ImageWithLabels {...defaultProps} />);

    expect(screen.getByText('te')).toBeInTheDocument();
    expect(screen.getByText('me')).toBeInTheDocument();
    expect(screen.getByText('la')).toBeInTheDocument();
    expect(screen.getByText('las')).toBeInTheDocument();
    expect(screen.getByText('lo')).toBeInTheDocument();
    expect(screen.getByText('los')).toBeInTheDocument();
  });

  it('applies correct position classes to each label', () => {
    const { container } = render(<ImageWithLabels {...defaultProps} />);

    expect(
      container.querySelector('.imageWithLabels__label--top'),
    ).toHaveTextContent('te');
    expect(
      container.querySelector('.imageWithLabels__label--bottom'),
    ).toHaveTextContent('me');
    expect(
      container.querySelector('.imageWithLabels__label--topLeft'),
    ).toHaveTextContent('la');
    expect(
      container.querySelector('.imageWithLabels__label--bottomLeft'),
    ).toHaveTextContent('las');
    expect(
      container.querySelector('.imageWithLabels__label--topRight'),
    ).toHaveTextContent('lo');
    expect(
      container.querySelector('.imageWithLabels__label--bottomRight'),
    ).toHaveTextContent('los');
  });
});
