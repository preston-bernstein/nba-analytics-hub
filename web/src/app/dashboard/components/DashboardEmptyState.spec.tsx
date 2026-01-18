import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardEmptyState } from './DashboardEmptyState.js';

describe('DashboardEmptyState', () => {
  const defaultProps = {
    selectedDate: '2025-01-15',
    onPreviousDay: vi.fn(),
    onNextDay: vi.fn(),
    onToday: vi.fn(),
  };

  it('renders the empty state message', () => {
    render(<DashboardEmptyState {...defaultProps} />);

    expect(screen.getByText('No games scheduled')).toBeInTheDocument();
  });

  it('renders the section with correct aria label', () => {
    render(<DashboardEmptyState {...defaultProps} />);

    expect(screen.getByLabelText('Dashboard empty state')).toBeInTheDocument();
  });

  it('renders helpful subtext', () => {
    render(<DashboardEmptyState {...defaultProps} />);

    expect(
      screen.getByText(/Try a different date to find games/i),
    ).toBeInTheDocument();
  });

  it('renders date navigation buttons', () => {
    render(<DashboardEmptyState {...defaultProps} />);

    expect(screen.getByLabelText('Previous day')).toBeInTheDocument();
    expect(screen.getByLabelText('Next day')).toBeInTheDocument();
  });

  it('calls navigation handlers when buttons clicked', () => {
    const onPreviousDay = vi.fn();
    const onNextDay = vi.fn();

    render(
      <DashboardEmptyState
        {...defaultProps}
        onPreviousDay={onPreviousDay}
        onNextDay={onNextDay}
      />,
    );

    fireEvent.click(screen.getByLabelText('Previous day'));
    expect(onPreviousDay).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Next day'));
    expect(onNextDay).toHaveBeenCalled();
  });
});
