// tests/sum.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';

const HelloWorld = () => <div>Hello, world!</div>;

describe('HelloWorld Component', () => {
  test('renders correctly', () => {
    render(<HelloWorld />);
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
  });
});
