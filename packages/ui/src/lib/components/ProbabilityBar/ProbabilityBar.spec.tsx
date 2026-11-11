import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProbabilityBar } from './ProbabilityBar';

describe('ProbabilityBar', () => {
  it('shows both percentages, labels, and a progress bar', () => {
    render(<ProbabilityBar awayPct={38} homePct={62} awayLabel="Away" homeLabel="Home" />);
    expect(screen.getByText('38%')).toHaveAttribute('title', 'Away');
    expect(screen.getByText('62%')).toHaveAttribute('title', 'Home');
    expect(screen.getByLabelText('Away win probability')).toBeInTheDocument();
  });
});
