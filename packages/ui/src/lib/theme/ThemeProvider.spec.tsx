import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from './ThemeProvider';

describe('ThemeProvider', () => {
  it('should render children', () => {
    render(
      <ThemeProvider>
        <span>hello theme</span>
      </ThemeProvider>,
    );

    expect(screen.getByText('hello theme')).toBeInTheDocument();
  });
});
