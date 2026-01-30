import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DateNavigation } from './DateNavigation';

describe('DateNavigation', () => {
  const defaultProps = {
    displayDate: 'Today',
    showTodayButton: false,
    onPreviousDay: vi.fn(),
    onNextDay: vi.fn(),
    onToday: vi.fn(),
  };

  it('renders the display date', () => {
    render(<DateNavigation {...defaultProps} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders previous and next buttons', () => {
    render(<DateNavigation {...defaultProps} />);
    expect(screen.getByLabelText('Previous day')).toBeInTheDocument();
    expect(screen.getByLabelText('Next day')).toBeInTheDocument();
  });

  it('calls onPreviousDay when previous button clicked', () => {
    const onPreviousDay = vi.fn();
    render(<DateNavigation {...defaultProps} onPreviousDay={onPreviousDay} />);

    fireEvent.click(screen.getByLabelText('Previous day'));
    expect(onPreviousDay).toHaveBeenCalled();
  });

  it('calls onNextDay when next button clicked', () => {
    const onNextDay = vi.fn();
    render(<DateNavigation {...defaultProps} onNextDay={onNextDay} />);

    fireEvent.click(screen.getByLabelText('Next day'));
    expect(onNextDay).toHaveBeenCalled();
  });

  it('shows Today button when showTodayButton is true', () => {
    render(<DateNavigation {...defaultProps} displayDate="Yesterday" showTodayButton={true} />);
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
  });

  it('hides Today button when showTodayButton is false', () => {
    render(
      <DateNavigation {...defaultProps} displayDate="Yesterday" showTodayButton={false} />,
    );
    expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument();
  });

  it('calls onToday when Today button clicked', () => {
    const onToday = vi.fn();
    render(
      <DateNavigation {...defaultProps} showTodayButton={true} onToday={onToday} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    expect(onToday).toHaveBeenCalled();
  });

  it('disables previous button when disablePrevious is true', () => {
    render(<DateNavigation {...defaultProps} disablePrevious={true} />);

    const prevButton = screen.getByLabelText('Previous day');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button when disableNext is true', () => {
    render(<DateNavigation {...defaultProps} disableNext={true} />);

    const nextButton = screen.getByLabelText('Next day');
    expect(nextButton).toBeDisabled();
  });

  it('does not call onPreviousDay when previous button is disabled', () => {
    const onPreviousDay = vi.fn();
    render(
      <DateNavigation
        {...defaultProps}
        disablePrevious={true}
        onPreviousDay={onPreviousDay}
      />,
    );

    fireEvent.click(screen.getByLabelText('Previous day'));
    expect(onPreviousDay).not.toHaveBeenCalled();
  });

  it('does not call onNextDay when next button is disabled', () => {
    const onNextDay = vi.fn();
    render(
      <DateNavigation {...defaultProps} disableNext={true} onNextDay={onNextDay} />,
    );

    fireEvent.click(screen.getByLabelText('Next day'));
    expect(onNextDay).not.toHaveBeenCalled();
  });
});
