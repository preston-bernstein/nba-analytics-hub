import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from './card.js';

describe('Card components', () => {
  it('renders with merged class names and forwards props', () => {
    const { getByText } = render(
      <Card data-testid="card" className="custom">
        <CardHeader className="header">
          <CardTitle className="title">Title</CardTitle>
          <CardDescription className="description">Description</CardDescription>
        </CardHeader>
        <CardContent className="content">Content</CardContent>
        <CardFooter className="footer">Footer</CardFooter>
      </Card>,
    );

    const card = getByText('Title').closest('[data-testid="card"]');
    expect(card?.className).toContain('custom');
    expect(getByText('Title').className).toContain('title');
    expect(getByText('Description').className).toContain('description');
    expect(getByText('Content').className).toContain('content');
    expect(getByText('Footer').className).toContain('footer');
  });

  it('has default styling when no className is provided', () => {
    const { getByTestId } = render(<Card data-testid="card" />);
    const card = getByTestId('card');
    expect(card.className).toMatch(/rounded-xl/);
    expect(card.className).toMatch(/border/);
  });

  it('forwards refs', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Card ref={(node) => (ref.current = node)} />);
    expect(ref.current).not.toBeNull();
  });
});
