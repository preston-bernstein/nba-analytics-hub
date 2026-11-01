import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Progress,
  Skeleton,
} from './index';

describe('shadcn primitives', () => {
  it('Card renders every part with its data-slot', () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    for (const slot of [
      'card',
      'card-header',
      'card-title',
      'card-description',
      'card-action',
      'card-content',
      'card-footer',
    ]) {
      expect(container.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
    }
  });

  it('Alert renders title and description', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Details</AlertDescription>
      </Alert>,
    );
    expect(screen.getByRole('alert')).toHaveAttribute('data-slot', 'alert');
    expect(screen.getByText('Details')).toHaveAttribute(
      'data-slot',
      'alert-description',
    );
  });

  it('Skeleton renders a pulsing placeholder', () => {
    const { container } = render(<Skeleton className="h-4" />);
    const el = container.querySelector('[data-slot="skeleton"]');
    expect(el?.className).toMatch(/animate-pulse/);
    expect(el?.className).toMatch(/h-4/);
  });

  it('Button and Badge render as their child with asChild', () => {
    render(
      <>
        <Button asChild>
          <a href="/x">Link button</a>
        </Button>
        <Badge asChild>
          <a href="/y">Link badge</a>
        </Badge>
      </>,
    );
    expect(screen.getByText('Link button').tagName).toBe('A');
    expect(screen.getByText('Link button')).toHaveAttribute('data-slot', 'button');
    expect(screen.getByText('Link badge').tagName).toBe('A');
  });

  it('Progress with no value shows an empty bar', () => {
    const { container } = render(<Progress />);
    const indicator = container.querySelector(
      '[data-slot="progress-indicator"]',
    ) as HTMLElement;
    expect(indicator.style.transform).toBe('translateX(-100%)');
  });
});
