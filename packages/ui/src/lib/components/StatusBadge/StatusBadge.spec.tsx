import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it.each([
    ['scheduled', 'Scheduled'],
    ['live', 'Live'],
    ['final', 'Final'],
    ['postponed', 'Postponed'],
    ['canceled', 'Canceled'],
  ] as const)('uses the default label for %s', (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('shows custom children and the status color', () => {
    render(<StatusBadge status="live">Q3 4:12</StatusBadge>);
    expect(screen.getByText('Q3 4:12')).toHaveClass('bg-live');
  });
});
