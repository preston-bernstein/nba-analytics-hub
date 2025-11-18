import { render, screen } from '@testing-library/react';
import { AppShell } from './AppShell';

describe('AppShell', () => {
  it('renders the title and children', () => {
    render(
      <AppShell title="NBA Analytics Hub">
        <div>Inner content</div>
      </AppShell>,
    );

    expect(screen.getByTestId('app-title')).toHaveTextContent('NBA Analytics Hub');
    expect(screen.getByText(/Inner content/i)).toBeInTheDocument();
  });

  it('renders navigation when provided', () => {
    render(
      <AppShell
        title="With Nav"
        nav={
          <>
            <button type="button">Games</button>
            <button type="button">Teams</button>
          </>
        }
      >
        <div>Content</div>
      </AppShell>,
    );

    expect(screen.getByRole('button', { name: /Games/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Teams/i })).toBeInTheDocument();
  });

  it('renders default footer when none is provided', () => {
    render(
      <AppShell title="No footer">
        <div>Content</div>
      </AppShell>,
    );

    expect(
      screen.getByText(/Powered by NBA Analytics Hub/i),
    ).toBeInTheDocument();
  });

  it('renders custom footer when provided', () => {
    render(
      <AppShell title="Custom footer" footer={<span>Custom footer · v0.1</span>}>
        <div>Content</div>
      </AppShell>,
    );

    expect(
      screen.getByText(/Custom footer · v0\.1/i),
    ).toBeInTheDocument();
  });
});
