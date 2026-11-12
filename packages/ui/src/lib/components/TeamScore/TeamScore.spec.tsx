import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TeamScore } from './TeamScore';

describe('TeamScore', () => {
  it('shows first and last initials', () => {
    render(<TeamScore name="Los Angeles Lakers" />);
    expect(screen.getByText('LL')).toBeInTheDocument();
  });

  it('shows one initial for a single word and none for an empty name', () => {
    const { rerender, container } = render(<TeamScore name="Heat" />);
    expect(screen.getByText('H')).toBeInTheDocument();
    rerender(<TeamScore name="" />);
    expect(container.querySelector('.rounded-full')?.textContent).toBe('');
  });

  it('shows the score only when asked, and highlights the winner', () => {
    const { rerender } = render(<TeamScore name="Hawks" score={101} />);
    expect(screen.queryByText('101')).not.toBeInTheDocument();
    rerender(<TeamScore name="Hawks" score={101} showScore isWinner />);
    expect(screen.getByText('101')).toHaveClass('text-emerald-700');
  });
});
