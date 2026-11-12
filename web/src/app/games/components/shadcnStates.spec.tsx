import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardEmptyState } from './DashboardEmptyState';
import { DashboardErrorState } from './DashboardErrorState';
import { DashboardLoadingState } from './DashboardLoadingState';

// Dashboard states are built on shadcn/ui primitives (data-slot marks them).
describe('dashboard states use shadcn/ui', () => {
  it('loading state renders shadcn Skeletons', () => {
    const { container } = render(<DashboardLoadingState />);
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
  });

  it('error state renders a destructive shadcn Alert', () => {
    render(<DashboardErrorState message="boom" />);
    expect(screen.getByRole('alert')).toHaveAttribute('data-slot', 'alert');
  });

  it('empty state renders a shadcn Card', () => {
    const { container } = render(<DashboardEmptyState />);
    expect(container.querySelector('[data-slot="card"]')).not.toBeNull();
  });
});
