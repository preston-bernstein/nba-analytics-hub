import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DashboardEmptyState } from './DashboardEmptyState.js';

describe('DashboardEmptyState', () => {
  it('renders the empty state message', () => {
    render(<DashboardEmptyState />);

    expect(screen.getByLabelText('Dashboard empty state')).toHaveTextContent(
      'No upcoming games found.',
    );
  });
});
