import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DashboardEmptyState } from './DashboardEmptyState.js';

describe('DashboardEmptyState', () => {
  it('renders the empty state message', () => {
    render(<DashboardEmptyState />);

    expect(screen.getByText('No games scheduled')).toBeInTheDocument();
  });

  it('renders helpful subtext', () => {
    render(<DashboardEmptyState />);

    expect(
      screen.getByText(/Try a different date to find games/i),
    ).toBeInTheDocument();
  });

  it('renders basketball icon', () => {
    render(<DashboardEmptyState />);

    const icon = screen.getByText('🏀');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});
